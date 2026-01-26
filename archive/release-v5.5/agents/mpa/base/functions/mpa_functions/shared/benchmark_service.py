"""
Benchmark Service - Reads ALL benchmark data from Dataverse.
NO HARDCODED BENCHMARKS.
"""

import logging
from typing import Dict, Any, List, Optional
from .dataverse_client import DataverseClient
from .cache_manager import CacheManager
from .odata_sanitization import sanitize_odata_string, join_filters

logger = logging.getLogger(__name__)

# Cache configuration
CACHE_TTL_MINUTES = 60  # Refresh benchmarks every hour


class BenchmarkService:
    """Service for retrieving benchmark data from Dataverse."""

    # Table name in Dataverse
    TABLE_NAME = "mpa_benchmark"

    def __init__(self, dataverse_client: Optional[DataverseClient] = None):
        self.client = dataverse_client or DataverseClient()
        self.cache = CacheManager(default_ttl_minutes=CACHE_TTL_MINUTES)

    def get_benchmark(
        self,
        vertical: str,
        metric_type: str,
        channel: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific benchmark from Dataverse.

        Args:
            vertical: Industry vertical (e.g., 'retail', 'ecommerce', 'general')
            metric_type: Metric type (e.g., 'CPM', 'CTR', 'CVR')
            channel: Optional channel filter (e.g., 'Paid Search')

        Returns:
            Benchmark data with low, median, high, best_in_class values
            or None if not found
        """
        cache_key = f"benchmark:{vertical}:{metric_type}:{channel or 'all'}"

        # Check cache first
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        # Build filter query with sanitized values
        filters = [
            f"mpa_vertical eq '{sanitize_odata_string(vertical)}'",
            f"mpa_metric_type eq '{sanitize_odata_string(metric_type)}'",
            "mpa_isactive eq true"
        ]

        if channel:
            filters.append(f"mpa_channel eq '{sanitize_odata_string(channel)}'")

        filter_query = " and ".join(filters)

        try:
            results = self.client.query_records(
                table_name=self.TABLE_NAME,
                filter_query=filter_query,
                select=[
                    "mpa_verticalbenchmarkid",
                    "mpa_vertical",
                    "mpa_sub_vertical",
                    "mpa_metric_name",
                    "mpa_metric_type",
                    "mpa_channel",
                    "mpa_benchmark_low",
                    "mpa_benchmark_median",
                    "mpa_benchmark_high",
                    "mpa_benchmark_best_in_class",
                    "mpa_confidence",
                    "mpa_data_source",
                    "mpa_data_period",
                    "mpa_last_validated_at",
                    "mpa_trend_notes"
                ],
                top=1
            )

            if results and len(results) > 0:
                benchmark = self._transform_benchmark(results[0])
                self.cache.set(cache_key, benchmark)
                return benchmark

            # Try fallback to 'general' vertical if specific not found
            if vertical != "general":
                logger.warning(f"No benchmark for {vertical}/{metric_type}, trying general")
                return self.get_benchmark("general", metric_type, channel)

            return None

        except Exception as e:
            logger.error(f"Error fetching benchmark: {e}")
            return None

    def get_channel_benchmarks(
        self,
        channel: str,
        vertical: str = "general"
    ) -> Dict[str, Any]:
        """
        Get all benchmarks for a specific channel.

        Args:
            channel: Channel name (e.g., 'Paid Search')
            vertical: Industry vertical

        Returns:
            Dictionary with all metric benchmarks for the channel
        """
        cache_key = f"channel_benchmarks:{channel}:{vertical}"

        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        filters = [
            f"mpa_channel eq '{sanitize_odata_string(channel)}'",
            f"mpa_vertical eq '{sanitize_odata_string(vertical)}'",
            "mpa_isactive eq true"
        ]

        filter_query = join_filters(filters)

        try:
            results = self.client.query_records(
                table_name=self.TABLE_NAME,
                filter_query=filter_query
            )

            benchmarks = {}
            for record in results:
                metric_type = record.get("mpa_metric_type", "").lower()
                benchmarks[metric_type] = {
                    "low": record.get("mpa_benchmark_low"),
                    "median": record.get("mpa_benchmark_median"),
                    "high": record.get("mpa_benchmark_high"),
                    "best_in_class": record.get("mpa_benchmark_best_in_class"),
                    "confidence": record.get("mpa_confidence"),
                    "data_source": record.get("mpa_data_source"),
                    "data_period": record.get("mpa_data_period")
                }

            # If no specific vertical data, try general
            if not benchmarks and vertical != "general":
                return self.get_channel_benchmarks(channel, "general")

            self.cache.set(cache_key, benchmarks)
            return benchmarks

        except Exception as e:
            logger.error(f"Error fetching channel benchmarks: {e}")
            return {}

    def get_vertical_benchmarks(self, vertical: str) -> Dict[str, Any]:
        """
        Get aggregate benchmarks for a vertical across all channels.

        Args:
            vertical: Industry vertical

        Returns:
            Dictionary with aggregate metrics for the vertical
        """
        cache_key = f"vertical_benchmarks:{vertical}"

        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        filters = [
            f"mpa_vertical eq '{sanitize_odata_string(vertical)}'",
            "mpa_isactive eq true",
            "mpa_channel eq null"  # Aggregate records have no channel
        ]

        filter_query = join_filters(filters)

        try:
            results = self.client.query_records(
                table_name=self.TABLE_NAME,
                filter_query=filter_query
            )

            benchmarks = {}
            for record in results:
                metric_type = record.get("mpa_metric_type", "").lower()
                benchmarks[f"avg_{metric_type}"] = record.get("mpa_benchmark_median")

            if benchmarks:
                self.cache.set(cache_key, benchmarks)

            return benchmarks

        except Exception as e:
            logger.error(f"Error fetching vertical benchmarks: {e}")
            return {}

    def search_benchmarks(
        self,
        vertical: Optional[str] = None,
        channel: Optional[str] = None,
        metric_type: Optional[str] = None,
        include_inactive: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Search benchmarks with flexible filters.

        Returns list of all matching benchmarks.
        """
        filters = []

        if vertical:
            filters.append(f"mpa_vertical eq '{sanitize_odata_string(vertical)}'")
        if channel:
            filters.append(f"mpa_channel eq '{sanitize_odata_string(channel)}'")
        if metric_type:
            filters.append(f"mpa_metric_type eq '{sanitize_odata_string(metric_type)}'")
        if not include_inactive:
            filters.append("mpa_isactive eq true")

        filter_query = join_filters(filters) if filters else None

        try:
            results = self.client.query_records(
                table_name=self.TABLE_NAME,
                filter_query=filter_query,
                order_by="mpa_vertical,mpa_channel,mpa_metric_type"
            )

            return [self._transform_benchmark(r) for r in results]

        except Exception as e:
            logger.error(f"Error searching benchmarks: {e}")
            return []

    def get_available_verticals(self) -> List[str]:
        """Get list of all available verticals."""
        cache_key = "available_verticals"

        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        try:
            results = self.client.query_records(
                table_name=self.TABLE_NAME,
                filter_query="mpa_isactive eq true",
                select=["mpa_vertical"]
            )

            verticals = list(set(r.get("mpa_vertical") for r in results if r.get("mpa_vertical")))
            verticals.sort()

            self.cache.set(cache_key, verticals)
            return verticals

        except Exception as e:
            logger.error(f"Error fetching verticals: {e}")
            return ["general"]

    def _transform_benchmark(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Transform Dataverse record to benchmark format."""
        return {
            "id": record.get("mpa_verticalbenchmarkid"),
            "vertical": record.get("mpa_vertical"),
            "sub_vertical": record.get("mpa_sub_vertical"),
            "channel": record.get("mpa_channel"),
            "metric_name": record.get("mpa_metric_name"),
            "metric_type": record.get("mpa_metric_type"),
            "low": record.get("mpa_benchmark_low"),
            "median": record.get("mpa_benchmark_median"),
            "high": record.get("mpa_benchmark_high"),
            "best_in_class": record.get("mpa_benchmark_best_in_class"),
            "confidence": record.get("mpa_confidence"),
            "data_source": record.get("mpa_data_source"),
            "data_period": record.get("mpa_data_period"),
            "last_validated": record.get("mpa_last_validated_at"),
            "trend_notes": record.get("mpa_trend_notes")
        }

    def refresh_cache(self):
        """Force refresh of all cached benchmarks."""
        self.cache.clear()
        logger.info("Benchmark cache cleared")


# Singleton instance for shared use
_benchmark_service: Optional[BenchmarkService] = None


def get_benchmark_service() -> BenchmarkService:
    """Get singleton benchmark service instance."""
    global _benchmark_service
    if _benchmark_service is None:
        _benchmark_service = BenchmarkService()
    return _benchmark_service
