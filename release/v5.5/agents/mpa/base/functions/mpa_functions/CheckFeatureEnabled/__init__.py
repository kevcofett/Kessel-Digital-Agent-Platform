"""
CheckFeatureEnabled Azure Function

Provides feature flag checking for MPA components.

Features:
- Query feature flags from Dataverse mpa_featureflag table
- Support for user-level, client-level, and global flags
- Caching for performance
- Rollout percentage support

Routes:
- GET /features/{flag_name} - Check if feature is enabled
- GET /features - List all feature flags
- POST /features/check - Batch check multiple flags

Version: 5.2
"""

import azure.functions as func
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from ..shared.cache_manager import get_cache, CacheKeys, CacheConfig
from ..shared.dataverse_client import DataverseClient
from ..shared.health import create_health_response, is_health_check_request
from ..shared.pii_redaction import wrap_logger

# Wrap logger with PII redaction
_logger = logging.getLogger(__name__)
logger = wrap_logger(_logger)

# Cache configuration
_config = CacheConfig.from_environment()
FEATURE_FLAG_TTL_MINUTES = 5  # Short TTL for feature flags


def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Check if a feature flag is enabled.

    Routes:
        GET /features/{flag_name} - Check single flag
        GET /features - List all flags
        POST /features/check - Batch check flags

    Query Parameters:
        user_id: Optional user ID for user-level flags
        client_id: Optional client ID for client-level flags

    Returns:
        JSON response with feature flag status
    """
    logger.info("CheckFeatureEnabled function triggered")

    try:
        # Handle health check
        if is_health_check_request(req):
            cache = get_cache()
            return func.HttpResponse(
                json.dumps(create_health_response(
                    function_name="CheckFeatureEnabled",
                    cache_stats=cache.get_stats()
                )),
                status_code=200,
                mimetype="application/json"
            )

        # Get route parameter
        flag_name = req.route_params.get("flag_name")

        # Get context parameters
        user_id = req.params.get("user_id")
        client_id = req.params.get("client_id")

        context = {
            "user_id": user_id,
            "client_id": client_id,
        }

        if req.method == "GET":
            if flag_name:
                # Single flag check
                result = check_feature_flag(flag_name, context)
                return func.HttpResponse(
                    json.dumps(result),
                    status_code=200,
                    mimetype="application/json"
                )
            else:
                # List all flags
                result = list_feature_flags(context)
                return func.HttpResponse(
                    json.dumps(result),
                    status_code=200,
                    mimetype="application/json"
                )

        elif req.method == "POST":
            # Batch check
            try:
                body = req.get_json()
                flag_names = body.get("flags", [])
            except ValueError:
                return func.HttpResponse(
                    json.dumps({"error": "Invalid JSON body"}),
                    status_code=400,
                    mimetype="application/json"
                )

            result = batch_check_flags(flag_names, context)
            return func.HttpResponse(
                json.dumps(result),
                status_code=200,
                mimetype="application/json"
            )

        else:
            return func.HttpResponse(
                json.dumps({"error": "Method not allowed"}),
                status_code=405,
                mimetype="application/json"
            )

    except Exception as e:
        logger.exception(f"Error in CheckFeatureEnabled: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "error": "Internal server error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }),
            status_code=500,
            mimetype="application/json"
        )


def check_feature_flag(
    flag_name: str,
    context: Dict[str, Optional[str]]
) -> Dict[str, Any]:
    """
    Check if a specific feature flag is enabled.

    Args:
        flag_name: Name of the feature flag
        context: Dict with user_id and client_id

    Returns:
        Dict with enabled status and metadata
    """
    cache = get_cache()
    cache_key = _build_cache_key(flag_name, context)

    # Check cache first
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        logger.debug(f"Cache hit for feature flag: {flag_name}")
        cached_result["from_cache"] = True
        return cached_result

    # Fetch from Dataverse
    logger.debug(f"Cache miss for feature flag: {flag_name}")
    client = DataverseClient()

    # Build filter for the specific flag
    filter_query = f"mpa_name eq '{flag_name}'"

    try:
        flags = client.get_records(
            table_name="new_featureflag",
            select="mpa_featureflagid,mpa_name,mpa_description,mpa_isenabled,mpa_rolloutpercentage,mpa_allowedusers,mpa_allowedclients,mpa_startdate,mpa_enddate",
            filter_query=filter_query,
            top=1
        )

        if not flags:
            result = {
                "flag_name": flag_name,
                "enabled": False,
                "reason": "Flag not found",
                "exists": False,
                "timestamp": datetime.utcnow().isoformat(),
                "from_cache": False
            }
        else:
            flag = flags[0]
            enabled, reason = _evaluate_flag(flag, context)
            result = {
                "flag_name": flag_name,
                "enabled": enabled,
                "reason": reason,
                "exists": True,
                "description": flag.get("mpa_description", ""),
                "rollout_percentage": flag.get("mpa_rolloutpercentage", 100),
                "timestamp": datetime.utcnow().isoformat(),
                "from_cache": False
            }

        # Cache the result
        cache.set(cache_key, result, ttl_minutes=FEATURE_FLAG_TTL_MINUTES)
        return result

    except Exception as e:
        logger.error(f"Error fetching feature flag {flag_name}: {e}")
        # Return disabled on error for safety
        return {
            "flag_name": flag_name,
            "enabled": False,
            "reason": f"Error checking flag: {str(e)}",
            "exists": None,
            "timestamp": datetime.utcnow().isoformat(),
            "from_cache": False
        }


def _evaluate_flag(
    flag: Dict[str, Any],
    context: Dict[str, Optional[str]]
) -> tuple[bool, str]:
    """
    Evaluate if a flag should be enabled for the given context.

    Args:
        flag: Flag record from Dataverse
        context: User/client context

    Returns:
        Tuple of (enabled, reason)
    """
    # Check master switch
    if not flag.get("mpa_isenabled", False):
        return False, "Flag is disabled globally"

    # Check date range
    now = datetime.utcnow()

    start_date = flag.get("mpa_startdate")
    if start_date:
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        if now < start_date.replace(tzinfo=None):
            return False, "Flag not yet active (before start date)"

    end_date = flag.get("mpa_enddate")
    if end_date:
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
        if now > end_date.replace(tzinfo=None):
            return False, "Flag expired (after end date)"

    # Check user allowlist
    allowed_users = flag.get("mpa_allowedusers", "")
    if allowed_users:
        user_id = context.get("user_id")
        if user_id:
            allowed_list = [u.strip() for u in allowed_users.split(",")]
            if user_id in allowed_list:
                return True, "User in allowlist"
            else:
                # If allowlist exists and user not in it, check rollout
                pass
        else:
            # No user ID provided, check other criteria
            pass

    # Check client allowlist
    allowed_clients = flag.get("mpa_allowedclients", "")
    if allowed_clients:
        client_id = context.get("client_id")
        if client_id:
            allowed_list = [c.strip() for c in allowed_clients.split(",")]
            if client_id in allowed_list:
                return True, "Client in allowlist"

    # Check rollout percentage
    rollout = flag.get("mpa_rolloutpercentage", 100)
    if rollout >= 100:
        return True, "Full rollout (100%)"
    elif rollout <= 0:
        return False, "Rollout at 0%"
    else:
        # Use consistent hashing based on user_id or client_id
        hash_key = context.get("user_id") or context.get("client_id") or ""
        if hash_key:
            hash_value = hash(hash_key) % 100
            if hash_value < rollout:
                return True, f"Included in {rollout}% rollout"
            else:
                return False, f"Excluded from {rollout}% rollout"
        else:
            # No context for rollout, use random (but this won't be consistent)
            import random
            if random.randint(0, 99) < rollout:
                return True, f"Random selection in {rollout}% rollout"
            else:
                return False, f"Random exclusion from {rollout}% rollout"


def list_feature_flags(
    context: Dict[str, Optional[str]]
) -> Dict[str, Any]:
    """
    List all feature flags with their status.

    Args:
        context: User/client context

    Returns:
        Dict with list of all flags
    """
    cache = get_cache()
    cache_key = CacheKeys.feature_flags_all()

    # Fetch all flags (cached at list level)
    cached_flags = cache.get(cache_key)
    if cached_flags is None:
        client = DataverseClient()

        try:
            flags = client.get_records(
                table_name="new_featureflag",
                select="mpa_featureflagid,mpa_name,mpa_description,mpa_isenabled,mpa_rolloutpercentage,mpa_allowedusers,mpa_allowedclients,mpa_startdate,mpa_enddate",
                order_by="mpa_name"
            )
            cache.set(cache_key, flags, ttl_minutes=FEATURE_FLAG_TTL_MINUTES)
        except Exception as e:
            logger.error(f"Error listing feature flags: {e}")
            return {
                "error": str(e),
                "flags": [],
                "count": 0,
                "timestamp": datetime.utcnow().isoformat()
            }
    else:
        flags = cached_flags

    # Evaluate each flag for the context
    evaluated_flags = []
    for flag in flags:
        enabled, reason = _evaluate_flag(flag, context)
        evaluated_flags.append({
            "flag_name": flag.get("mpa_name", ""),
            "enabled": enabled,
            "reason": reason,
            "description": flag.get("mpa_description", ""),
            "rollout_percentage": flag.get("mpa_rolloutpercentage", 100),
        })

    return {
        "flags": evaluated_flags,
        "count": len(evaluated_flags),
        "timestamp": datetime.utcnow().isoformat()
    }


def batch_check_flags(
    flag_names: List[str],
    context: Dict[str, Optional[str]]
) -> Dict[str, Any]:
    """
    Check multiple feature flags at once.

    Args:
        flag_names: List of flag names to check
        context: User/client context

    Returns:
        Dict with results for each flag
    """
    results = {}

    for flag_name in flag_names:
        result = check_feature_flag(flag_name, context)
        results[flag_name] = {
            "enabled": result["enabled"],
            "reason": result["reason"],
        }

    return {
        "flags": results,
        "count": len(results),
        "timestamp": datetime.utcnow().isoformat()
    }


def _build_cache_key(
    flag_name: str,
    context: Dict[str, Optional[str]]
) -> str:
    """Build a cache key for the flag and context."""
    key_parts = [CacheKeys.feature_flag(flag_name)]

    if context.get("user_id"):
        key_parts.append(f"user:{context['user_id']}")
    if context.get("client_id"):
        key_parts.append(f"client:{context['client_id']}")

    return ":".join(key_parts)
