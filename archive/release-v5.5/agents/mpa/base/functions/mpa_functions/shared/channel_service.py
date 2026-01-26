"""
Channel Service - Reads ALL channel data from Dataverse.
NO HARDCODED CHANNEL INFORMATION.
"""

import logging
import json
from typing import Dict, Any, List, Optional
from .dataverse_client import DataverseClient
from .cache_manager import CacheManager
from .odata_sanitization import sanitize_odata_string, join_filters

logger = logging.getLogger(__name__)

CACHE_TTL_MINUTES = 120


class ChannelService:
    """Service for retrieving channel data from Dataverse."""

    TABLE_NAME = "mpa_channel"

    def __init__(self, dataverse_client: Optional[DataverseClient] = None):
        self.client = dataverse_client or DataverseClient()
        self.cache = CacheManager(default_ttl_minutes=CACHE_TTL_MINUTES)

    def get_channel(self, channel_name: str) -> Optional[Dict[str, Any]]:
        """Get channel definition by name."""
        cache_key = f"channel:{channel_name}"

        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        try:
            safe_channel_name = sanitize_odata_string(channel_name)
            results = self.client.query_records(
                table_name=self.TABLE_NAME,
                filter_query=f"mpa_newcolumn eq '{safe_channel_name}' and mpa_isactive eq true",
                top=1
            )

            if results and len(results) > 0:
                channel = self._transform_channel(results[0])
                self.cache.set(cache_key, channel)
                return channel

            return None

        except Exception as e:
            logger.error(f"Error fetching channel: {e}")
            return None

    def get_channel_by_code(self, channel_code: str) -> Optional[Dict[str, Any]]:
        """Get channel definition by code."""
        cache_key = f"channel_code:{channel_code}"

        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        try:
            safe_channel_code = sanitize_odata_string(channel_code)
            results = self.client.query_records(
                table_name=self.TABLE_NAME,
                filter_query=f"mpa_channelcode eq '{safe_channel_code}' and mpa_isactive eq true",
                top=1
            )

            if results and len(results) > 0:
                channel = self._transform_channel(results[0])
                self.cache.set(cache_key, channel)
                return channel

            return None

        except Exception as e:
            logger.error(f"Error fetching channel by code: {e}")
            return None

    def get_all_channels(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all active channels, optionally filtered by category."""
        cache_key = f"all_channels:{category or 'all'}"

        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        filters = ["mpa_isactive eq true"]
        if category:
            filters.append(f"mpa_category eq '{sanitize_odata_string(category)}'")

        filter_query = " and ".join(filters)

        try:
            results = self.client.query_records(
                table_name=self.TABLE_NAME,
                filter_query=filter_query,
                order_by="mpa_sort_order,mpa_newcolumn"
            )

            channels = [self._transform_channel(r) for r in results]
            self.cache.set(cache_key, channels)
            return channels

        except Exception as e:
            logger.error(f"Error fetching channels: {e}")
            return []

    def get_channels_for_objective(
        self,
        objective: str,
        budget: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Get recommended channels for a campaign objective.

        Args:
            objective: Campaign objective (awareness, consideration, conversions)
            budget: Optional budget to filter by minimum spend requirements

        Returns:
            List of channels sorted by objective fit score
        """
        all_channels = self.get_all_channels()

        scored_channels = []
        for channel in all_channels:
            # Check budget minimum
            min_budget = channel.get("min_budget", 0)
            if budget and budget < min_budget:
                continue

            # Get objective fit score
            objective_fit = channel.get("objective_fit", {})
            score = objective_fit.get(objective.lower(), 50)  # Default to 50

            scored_channels.append({
                **channel,
                "objective_score": score
            })

        # Sort by score descending
        scored_channels.sort(key=lambda x: x["objective_score"], reverse=True)

        return scored_channels

    def get_channels_by_funnel(self, funnel_position: str) -> List[Dict[str, Any]]:
        """Get channels by funnel position."""
        all_channels = self.get_all_channels()

        return [
            ch for ch in all_channels
            if ch.get("funnel_position", "").lower() == funnel_position.lower()
            or ch.get("funnel_position", "").lower() == "full funnel"
        ]

    def get_channel_names(self) -> List[str]:
        """Get list of all active channel names."""
        channels = self.get_all_channels()
        return [ch["name"] for ch in channels]

    def get_channel_codes(self) -> List[str]:
        """Get list of all active channel codes."""
        channels = self.get_all_channels()
        return [ch["code"] for ch in channels]

    def get_channels_by_category(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get all channels grouped by category."""
        all_channels = self.get_all_channels()

        by_category = {}
        for channel in all_channels:
            category = channel.get("category", "Other")
            if category not in by_category:
                by_category[category] = []
            by_category[category].append(channel)

        return by_category

    def validate_channel_list(self, channel_names: List[str]) -> Dict[str, Any]:
        """
        Validate a list of channel names against the registry.

        Returns:
            {
                "valid": [...],
                "invalid": [...],
                "suggestions": {...}
            }
        """
        all_channels = self.get_all_channels()
        valid_names = {ch["name"].lower(): ch["name"] for ch in all_channels}
        valid_codes = {ch["code"].lower(): ch["name"] for ch in all_channels}

        valid = []
        invalid = []
        suggestions = {}

        for name in channel_names:
            name_lower = name.lower()

            if name_lower in valid_names:
                valid.append(valid_names[name_lower])
            elif name_lower in valid_codes:
                valid.append(valid_codes[name_lower])
            else:
                invalid.append(name)
                # Try to find similar names
                for valid_name in valid_names.values():
                    if name_lower in valid_name.lower() or valid_name.lower() in name_lower:
                        suggestions[name] = valid_name
                        break

        return {
            "valid": valid,
            "invalid": invalid,
            "suggestions": suggestions
        }

    def _transform_channel(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Transform Dataverse record to channel format."""
        return {
            "id": record.get("mpa_channelregistryid"),
            "name": record.get("mpa_newcolumn"),
            "code": record.get("mpa_channelcode"),
            "category": record.get("mpa_category"),
            "description": record.get("mpa_description"),
            "capabilities": self._parse_json(record.get("mpa_capabilities", "{}")),
            "targeting_options": self._parse_json(record.get("mpa_targeting_options", "[]")),
            "ad_formats": self._parse_json(record.get("mpa_ad_formats", "[]")),
            "buying_models": self._parse_json(record.get("mpa_buying_models", "[]")),
            "min_budget": record.get("mpa_minbudget", 0),
            "objective_fit": self._parse_json(record.get("mpa_objective_fit", "{}")),
            "funnel_position": record.get("mpa_funnel_position"),
            "primary_kpis": self._parse_json(record.get("mpa_primary_kpis", "[]")),
            "sort_order": record.get("mpa_sort_order", 100)
        }

    def _parse_json(self, value: str) -> Any:
        """Safely parse JSON field."""
        if not value:
            return {} if value == "{}" else []
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return {} if "{" in str(value) else []

    def refresh_cache(self):
        """Force refresh of all cached channel data."""
        self.cache.clear()
        logger.info("Channel cache cleared")


# Singleton instance
_channel_service: Optional[ChannelService] = None


def get_channel_service() -> ChannelService:
    """Get singleton channel service instance."""
    global _channel_service
    if _channel_service is None:
        _channel_service = ChannelService()
    return _channel_service
