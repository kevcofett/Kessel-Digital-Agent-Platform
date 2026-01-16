"""
KPI Service - Reads ALL KPI definitions from Dataverse.
NO HARDCODED KPI FORMULAS.
"""

import logging
import json
from typing import Dict, Any, List, Optional
from .dataverse_client import DataverseClient
from .cache_manager import CacheManager
from .odata_sanitization import sanitize_odata_string, join_filters

logger = logging.getLogger(__name__)

CACHE_TTL_MINUTES = 120  # KPI definitions change less frequently


class KPIService:
    """Service for retrieving and calculating KPIs from Dataverse definitions."""

    TABLE_NAME = "mpa_kpi"

    def __init__(self, dataverse_client: Optional[DataverseClient] = None):
        self.client = dataverse_client or DataverseClient()
        self.cache = CacheManager(default_ttl_minutes=CACHE_TTL_MINUTES)

    def get_kpi_definition(self, kpi_code: str) -> Optional[Dict[str, Any]]:
        """
        Get KPI definition from Dataverse.

        Args:
            kpi_code: KPI code (e.g., 'CPM', 'CTR', 'ROAS')

        Returns:
            KPI definition with formula, description, etc.
        """
        cache_key = f"kpi_def:{kpi_code}"

        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        try:
            safe_kpi_code = sanitize_odata_string(kpi_code)
            results = self.client.query_records(
                table_name=self.TABLE_NAME,
                filter_query=f"mpa_kpicode eq '{safe_kpi_code}' and mpa_isactive eq true",
                top=1
            )

            if results and len(results) > 0:
                kpi = self._transform_kpi(results[0])
                self.cache.set(cache_key, kpi)
                return kpi

            logger.warning(f"KPI definition not found: {kpi_code}")
            return None

        except Exception as e:
            logger.error(f"Error fetching KPI definition: {e}")
            return None

    def get_all_kpis(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all active KPI definitions, optionally filtered by category."""
        cache_key = f"all_kpis:{category or 'all'}"

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

            kpis = [self._transform_kpi(r) for r in results]
            self.cache.set(cache_key, kpis)
            return kpis

        except Exception as e:
            logger.error(f"Error fetching KPI definitions: {e}")
            return []

    def calculate_kpi(
        self,
        kpi_code: str,
        inputs: Dict[str, float]
    ) -> Optional[Dict[str, Any]]:
        """
        Calculate a KPI value using its Dataverse-defined formula.

        Args:
            kpi_code: KPI code (e.g., 'CPM')
            inputs: Dictionary of input values (e.g., {'spend': 1000, 'impressions': 50000})

        Returns:
            Calculated value with metadata, or None if calculation fails
        """
        kpi_def = self.get_kpi_definition(kpi_code)
        if not kpi_def:
            return None

        try:
            # Parse formula inputs from definition
            required_inputs = kpi_def.get("formula_inputs", [])

            # Validate all required inputs are provided
            missing = [inp for inp in required_inputs if inp not in inputs]
            if missing:
                logger.error(f"Missing inputs for {kpi_code}: {missing}")
                return {
                    "kpi_code": kpi_code,
                    "value": None,
                    "error": f"Missing required inputs: {missing}",
                    "formula": kpi_def.get("formula")
                }

            # Execute formula
            formula = kpi_def.get("formula", "")
            value = self._execute_formula(formula, inputs)

            return {
                "kpi_code": kpi_code,
                "kpi_name": kpi_def.get("name"),
                "value": round(value, 6) if value is not None else None,
                "unit": kpi_def.get("unit"),
                "format": kpi_def.get("format_pattern"),
                "direction": kpi_def.get("direction"),
                "formula": formula,
                "inputs_used": inputs
            }

        except Exception as e:
            logger.error(f"Error calculating {kpi_code}: {e}")
            return {
                "kpi_code": kpi_code,
                "value": None,
                "error": str(e)
            }

    def _execute_formula(self, formula: str, inputs: Dict[str, float]) -> Optional[float]:
        """
        Execute a formula string safely.

        Supported formulas:
        - "spend / impressions * 1000" (CPM)
        - "clicks / impressions * 100" (CTR)
        - "conversions / clicks * 100" (CVR)
        - "revenue / spend" (ROAS)
        """
        if not formula:
            return None

        # Replace input variable names with values
        expression = formula.lower()
        for var_name, value in inputs.items():
            expression = expression.replace(var_name.lower(), str(float(value)))

        # Safe evaluation - only allow basic math operations
        allowed_chars = set("0123456789.+-*/() ")
        if not all(c in allowed_chars for c in expression):
            raise ValueError(f"Invalid characters in formula: {formula}")

        try:
            result = eval(expression)
            return float(result)
        except ZeroDivisionError:
            return 0.0
        except Exception as e:
            raise ValueError(f"Formula evaluation failed: {e}")

    def get_kpis_for_channel(self, channel: str) -> List[Dict[str, Any]]:
        """Get KPIs applicable to a specific channel."""
        all_kpis = self.get_all_kpis()

        applicable = []
        for kpi in all_kpis:
            channels = kpi.get("applicable_channels", [])
            if not channels or channel in channels or "All" in channels:
                applicable.append(kpi)

        return applicable

    def get_kpis_for_objective(self, objective: str) -> List[Dict[str, Any]]:
        """Get primary KPIs for a campaign objective."""
        all_kpis = self.get_all_kpis()

        primary = []
        secondary = []

        for kpi in all_kpis:
            objectives = kpi.get("applicable_objectives", [])
            if objective in objectives:
                primary.append(kpi)
            elif not objectives:
                secondary.append(kpi)

        return primary + secondary

    def get_kpi_codes(self) -> List[str]:
        """Get list of all active KPI codes."""
        kpis = self.get_all_kpis()
        return [kpi["code"] for kpi in kpis]

    def _transform_kpi(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Transform Dataverse record to KPI definition format."""
        return {
            "id": record.get("mpa_kpidefinitionid"),
            "code": record.get("mpa_kpicode"),
            "name": record.get("mpa_newcolumn"),
            "category": record.get("mpa_category"),
            "formula": record.get("mpa_formula"),
            "formula_inputs": self._parse_json_field(record.get("mpa_formula_inputs", "[]")),
            "unit": record.get("mpa_unit"),
            "format_pattern": record.get("mpa_format_pattern"),
            "direction": record.get("mpa_direction"),
            "description": record.get("mpa_description"),
            "interpretation_guide": record.get("mpa_interpretation_guide"),
            "applicable_channels": self._parse_json_field(record.get("mpa_applicable_channels", "[]")),
            "applicable_objectives": self._parse_json_field(record.get("mpa_applicable_objectives", "[]")),
            "related_kpis": self._parse_json_field(record.get("mpa_related_kpis", "[]")),
            "sort_order": record.get("mpa_sort_order", 100)
        }

    def _parse_json_field(self, value: str) -> List[str]:
        """Safely parse JSON array field."""
        if not value:
            return []
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return []

    def refresh_cache(self):
        """Force refresh of all cached KPI definitions."""
        self.cache.clear()
        logger.info("KPI cache cleared")


# Singleton instance
_kpi_service: Optional[KPIService] = None


def get_kpi_service() -> KPIService:
    """Get singleton KPI service instance."""
    global _kpi_service
    if _kpi_service is None:
        _kpi_service = KPIService()
    return _kpi_service
