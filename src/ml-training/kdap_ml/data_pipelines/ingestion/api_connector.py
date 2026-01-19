"""
API Connector
Generic REST API connector for data ingestion
"""

import logging
import time
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urljoin, urlencode

import pandas as pd

from ..base import DataConnector

logger = logging.getLogger(__name__)


class APIConnector(DataConnector):
    """
    Generic REST API connector for data ingestion.

    Supports:
    - REST APIs with JSON responses
    - Multiple authentication methods (API key, Bearer token, Basic auth, OAuth2)
    - Pagination (offset, cursor, page-based)
    - Rate limiting
    - Retry logic with exponential backoff
    - Response transformation
    """

    def __init__(
        self,
        base_url: str,
        auth_type: str = 'none',
        api_key: Optional[str] = None,
        api_key_header: str = 'X-API-Key',
        bearer_token: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        oauth_config: Optional[Dict[str, str]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: int = 30,
        max_retries: int = 3,
        rate_limit_requests: int = 100,
        rate_limit_period: int = 60,
    ):
        connection_config = {
            'base_url': base_url,
            'auth_type': auth_type,
            'timeout': timeout,
            'max_retries': max_retries,
        }
        super().__init__(connection_config)

        self._base_url = base_url.rstrip('/')
        self._auth_type = auth_type
        self._api_key = api_key
        self._api_key_header = api_key_header
        self._bearer_token = bearer_token
        self._username = username
        self._password = password
        self._oauth_config = oauth_config
        self._custom_headers = headers or {}
        self._timeout = timeout
        self._max_retries = max_retries
        self._rate_limit_requests = rate_limit_requests
        self._rate_limit_period = rate_limit_period

        self._session = None
        self._oauth_token = None
        self._oauth_expires = 0
        self._request_times: List[float] = []

    def connect(self) -> bool:
        """Initialize HTTP session and authenticate."""
        try:
            import requests
            self._session = requests.Session()

            # Set custom headers
            self._session.headers.update(self._custom_headers)

            # Configure authentication
            if self._auth_type == 'api_key':
                self._session.headers[self._api_key_header] = self._api_key
            elif self._auth_type == 'bearer':
                self._session.headers['Authorization'] = f'Bearer {self._bearer_token}'
            elif self._auth_type == 'basic':
                self._session.auth = (self._username, self._password)
            elif self._auth_type == 'oauth2':
                self._refresh_oauth_token()

            # Test connection
            response = self._make_request('GET', '')
            if response is not None:
                self._connected = True
                logger.info(f"Connected to API at {self._base_url}")
                return True
            else:
                self._connected = False
                return False

        except ImportError:
            logger.error("requests package required for API connector")
            self._connected = False
            return False
        except Exception as e:
            logger.error(f"Failed to connect to API: {e}")
            self._connected = False
            return False

    def disconnect(self) -> None:
        """Close HTTP session."""
        if self._session:
            self._session.close()
            self._session = None

        self._connected = False
        self._oauth_token = None
        logger.info("Disconnected from API")

    def read(
        self,
        endpoint: str,
        method: str = 'GET',
        params: Optional[Dict[str, Any]] = None,
        body: Optional[Dict[str, Any]] = None,
        data_path: Optional[str] = None,
        pagination: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
        **kwargs,
    ) -> pd.DataFrame:
        """
        Read data from API endpoint.

        Args:
            endpoint: API endpoint path
            method: HTTP method
            params: Query parameters
            body: Request body (for POST/PUT)
            data_path: JSON path to data array (e.g., 'data.items')
            pagination: Pagination config
            limit: Maximum records to return
            **kwargs: Additional request arguments

        Returns:
            DataFrame with API response data
        """
        if not self._connected:
            raise ConnectionError("Not connected to API")

        all_data = []
        page_params = params.copy() if params else {}

        # Configure pagination
        pagination = pagination or {}
        pagination_type = pagination.get('type', 'none')
        page_size = pagination.get('page_size', 100)
        max_pages = pagination.get('max_pages', 1000)

        current_page = 0
        cursor = None
        offset = 0

        while True:
            # Apply pagination parameters
            if pagination_type == 'offset':
                page_params[pagination.get('offset_param', 'offset')] = offset
                page_params[pagination.get('limit_param', 'limit')] = page_size
            elif pagination_type == 'page':
                page_params[pagination.get('page_param', 'page')] = current_page + 1
                page_params[pagination.get('per_page_param', 'per_page')] = page_size
            elif pagination_type == 'cursor' and cursor:
                page_params[pagination.get('cursor_param', 'cursor')] = cursor

            # Make request
            response = self._make_request(method, endpoint, params=page_params, json=body, **kwargs)

            if response is None:
                break

            # Extract data from response
            data = self._extract_data(response, data_path)

            if not data:
                break

            all_data.extend(data)

            # Check if we've reached the limit
            if limit and len(all_data) >= limit:
                all_data = all_data[:limit]
                break

            # Check for more pages
            current_page += 1
            if current_page >= max_pages:
                logger.warning(f"Reached maximum pages limit ({max_pages})")
                break

            if pagination_type == 'offset':
                offset += page_size
                if len(data) < page_size:
                    break
            elif pagination_type == 'page':
                if len(data) < page_size:
                    break
            elif pagination_type == 'cursor':
                cursor = self._extract_cursor(response, pagination.get('cursor_path', 'next_cursor'))
                if not cursor:
                    break
            else:
                break  # No pagination

        if not all_data:
            return pd.DataFrame()

        df = pd.DataFrame(all_data)
        logger.info(f"Retrieved {len(df)} records from API")
        return df

    def write(
        self,
        data: pd.DataFrame,
        endpoint: str,
        method: str = 'POST',
        batch_size: int = 100,
        data_wrapper: Optional[str] = None,
        **kwargs,
    ) -> bool:
        """
        Write data to API endpoint.

        Args:
            data: DataFrame to write
            endpoint: API endpoint path
            method: HTTP method (POST or PUT)
            batch_size: Records per request
            data_wrapper: Key to wrap data in (e.g., 'items')
            **kwargs: Additional request arguments

        Returns:
            True if all batches succeeded
        """
        if not self._connected:
            raise ConnectionError("Not connected to API")

        records = data.to_dict('records')
        total_batches = (len(records) + batch_size - 1) // batch_size
        success_count = 0

        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]

            if data_wrapper:
                body = {data_wrapper: batch}
            else:
                body = batch

            response = self._make_request(method, endpoint, json=body, **kwargs)

            if response is not None:
                success_count += 1
            else:
                logger.warning(f"Batch {i // batch_size + 1} failed")

        logger.info(f"Wrote {success_count}/{total_batches} batches successfully")
        return success_count == total_batches

    def _make_request(
        self,
        method: str,
        endpoint: str,
        **kwargs,
    ) -> Optional[Dict[str, Any]]:
        """Make HTTP request with retry logic and rate limiting."""
        # Rate limiting
        self._apply_rate_limit()

        # Refresh OAuth token if needed
        if self._auth_type == 'oauth2' and time.time() >= self._oauth_expires - 60:
            self._refresh_oauth_token()

        url = urljoin(self._base_url + '/', endpoint.lstrip('/'))

        for attempt in range(self._max_retries):
            try:
                response = self._session.request(
                    method,
                    url,
                    timeout=self._timeout,
                    **kwargs,
                )

                self._request_times.append(time.time())

                if response.status_code == 429:
                    # Rate limited - wait and retry
                    retry_after = int(response.headers.get('Retry-After', 60))
                    logger.warning(f"Rate limited, waiting {retry_after}s")
                    time.sleep(retry_after)
                    continue

                if response.status_code >= 500:
                    # Server error - retry with backoff
                    wait_time = 2 ** attempt
                    logger.warning(f"Server error {response.status_code}, retrying in {wait_time}s")
                    time.sleep(wait_time)
                    continue

                if response.status_code >= 400:
                    logger.error(f"API error {response.status_code}: {response.text[:500]}")
                    return None

                return response.json()

            except Exception as e:
                logger.warning(f"Request failed (attempt {attempt + 1}): {e}")
                if attempt < self._max_retries - 1:
                    time.sleep(2 ** attempt)

        return None

    def _apply_rate_limit(self) -> None:
        """Apply rate limiting."""
        now = time.time()

        # Remove old request times
        cutoff = now - self._rate_limit_period
        self._request_times = [t for t in self._request_times if t > cutoff]

        # Check if we need to wait
        if len(self._request_times) >= self._rate_limit_requests:
            oldest = min(self._request_times)
            wait_time = oldest + self._rate_limit_period - now
            if wait_time > 0:
                logger.debug(f"Rate limit reached, waiting {wait_time:.1f}s")
                time.sleep(wait_time)

    def _refresh_oauth_token(self) -> None:
        """Refresh OAuth2 token."""
        if not self._oauth_config:
            raise ValueError("OAuth config required for OAuth2 authentication")

        import requests

        token_url = self._oauth_config['token_url']
        client_id = self._oauth_config['client_id']
        client_secret = self._oauth_config['client_secret']
        scope = self._oauth_config.get('scope', '')

        response = requests.post(
            token_url,
            data={
                'grant_type': 'client_credentials',
                'client_id': client_id,
                'client_secret': client_secret,
                'scope': scope,
            },
            timeout=30,
        )

        if response.status_code != 200:
            raise ValueError(f"OAuth token refresh failed: {response.text}")

        token_data = response.json()
        self._oauth_token = token_data['access_token']
        self._oauth_expires = time.time() + token_data.get('expires_in', 3600)

        if self._session:
            self._session.headers['Authorization'] = f'Bearer {self._oauth_token}'

        logger.debug("OAuth token refreshed")

    def _extract_data(
        self,
        response: Dict[str, Any],
        data_path: Optional[str],
    ) -> List[Dict[str, Any]]:
        """Extract data array from response."""
        if data_path:
            data = response
            for key in data_path.split('.'):
                if isinstance(data, dict):
                    data = data.get(key, [])
                else:
                    return []
            return data if isinstance(data, list) else [data]
        elif isinstance(response, list):
            return response
        elif isinstance(response, dict):
            # Try common data keys
            for key in ['data', 'items', 'results', 'records', 'rows']:
                if key in response and isinstance(response[key], list):
                    return response[key]
            # Return as single record
            return [response]
        return []

    def _extract_cursor(
        self,
        response: Dict[str, Any],
        cursor_path: str,
    ) -> Optional[str]:
        """Extract pagination cursor from response."""
        data = response
        for key in cursor_path.split('.'):
            if isinstance(data, dict):
                data = data.get(key)
            else:
                return None
        return str(data) if data else None

    def execute(
        self,
        endpoint: str,
        method: str = 'POST',
        params: Optional[Dict[str, Any]] = None,
        body: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Execute an API call and return raw response.

        Args:
            endpoint: API endpoint
            method: HTTP method
            params: Query parameters
            body: Request body

        Returns:
            Raw API response
        """
        if not self._connected:
            raise ConnectionError("Not connected to API")

        response = self._make_request(method, endpoint, params=params, json=body, **kwargs)
        return response or {}

    def get_schema(self, endpoint: str) -> Dict[str, str]:
        """
        Attempt to discover schema from a sample response.

        Args:
            endpoint: API endpoint

        Returns:
            Dictionary mapping field names to inferred types
        """
        response = self._make_request('GET', endpoint, params={'limit': '1'})
        if not response:
            return {}

        data = self._extract_data(response, None)
        if not data:
            return {}

        schema = {}
        sample = data[0]

        for key, value in sample.items():
            if isinstance(value, bool):
                schema[key] = 'boolean'
            elif isinstance(value, int):
                schema[key] = 'integer'
            elif isinstance(value, float):
                schema[key] = 'float'
            elif isinstance(value, str):
                # Try to detect datetime
                if 'T' in value and ('Z' in value or '+' in value):
                    schema[key] = 'datetime'
                else:
                    schema[key] = 'string'
            elif isinstance(value, list):
                schema[key] = 'array'
            elif isinstance(value, dict):
                schema[key] = 'object'
            else:
                schema[key] = 'unknown'

        return schema

    def health_check(self, health_endpoint: str = '/health') -> bool:
        """
        Check API health.

        Args:
            health_endpoint: Health check endpoint

        Returns:
            True if API is healthy
        """
        try:
            response = self._make_request('GET', health_endpoint)
            return response is not None
        except Exception:
            return False
