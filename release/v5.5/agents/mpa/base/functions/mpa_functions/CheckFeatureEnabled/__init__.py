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

    # Build filter for the specific flag (using eap_flagcode)
    filter_query = f"eap_flagcode eq '{flag_name}'"

    try:
        flags = client.get_records(
            table_name="eap_featureflags",
            select="eap_featureflagid,eap_flagcode,eap_flagname,eap_description,eap_isenabled,eap_category,eap_agentcode,eap_defaultvalue,eap_fallbackmessage",
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
                "description": flag.get("eap_description", ""),
                "fallback_message": flag.get("eap_fallbackmessage", ""),
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

    The eap_featureflag schema uses:
    - eap_isenabled: Master switch for the flag
    - eap_defaultvalue: Default value when not explicitly set
    - eap_agentcode: Agent-specific flag (MPA, CA, or empty for platform-wide)
    - eap_category: Category of the flag (Platform, Agent, Integration, Security, UI)

    Args:
        flag: Flag record from Dataverse
        context: User/client context

    Returns:
        Tuple of (enabled, reason)
    """
    # Check master switch - eap_isenabled is the primary control
    is_enabled = flag.get("eap_isenabled", False)

    # Handle string "true"/"false" values from Dataverse
    if isinstance(is_enabled, str):
        is_enabled = is_enabled.lower() == "true"

    if not is_enabled:
        fallback_msg = flag.get("eap_fallbackmessage", "")
        reason = fallback_msg if fallback_msg else "Flag is disabled"
        return False, reason

    # Check agent-specific flags
    agent_code = flag.get("eap_agentcode", "")
    if agent_code:
        # If this is an agent-specific flag, it's enabled for that agent
        return True, f"Enabled for agent: {agent_code}"

    # Platform-wide flag is enabled
    return True, "Flag is enabled"


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
                table_name="eap_featureflags",
                select="eap_featureflagid,eap_flagcode,eap_flagname,eap_description,eap_isenabled,eap_category,eap_agentcode,eap_defaultvalue,eap_fallbackmessage",
                order_by="eap_flagcode"
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
            "flag_code": flag.get("eap_flagcode", ""),
            "flag_name": flag.get("eap_flagname", ""),
            "enabled": enabled,
            "reason": reason,
            "description": flag.get("eap_description", ""),
            "category": flag.get("eap_category", ""),
            "agent_code": flag.get("eap_agentcode", ""),
            "fallback_message": flag.get("eap_fallbackmessage", ""),
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
