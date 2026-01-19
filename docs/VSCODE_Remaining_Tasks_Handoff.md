# VS Code Handoff: Remaining KDAP Tasks

## Date: January 19, 2026
## Repository: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
## Current Commit: bd749d67

---

## TASK OVERVIEW

| Task | Priority | Effort | Description |
|------|----------|--------|-------------|
| 1. ML Training Data Pipelines | High | Medium | Synthetic data generators + real data ingestion |
| 2. Power Platform Deployment | High | Medium | SharePoint KB upload, Copilot Studio config |
| 3. End-to-End Integration Tests | Medium | Medium | Full workflow validation |

---

## TASK 1: ML TRAINING DATA PIPELINES

### Objective
Create data generation and ingestion pipelines for all 7 ML models.

### Location
`src/ml-training/data/`

### Files to Create

```
src/ml-training/data/
├── __init__.py
├── generators/
│   ├── __init__.py
│   ├── base_generator.py
│   ├── churn_generator.py
│   ├── mmm_generator.py
│   ├── lookalike_generator.py
│   ├── response_curve_generator.py
│   ├── budget_optimizer_generator.py
│   ├── propensity_generator.py
│   └── anomaly_generator.py
├── ingestion/
│   ├── __init__.py
│   ├── dataverse_connector.py
│   ├── csv_loader.py
│   ├── sharepoint_loader.py
│   └── validation.py
├── schemas/
│   ├── churn_schema.json
│   ├── mmm_schema.json
│   ├── lookalike_schema.json
│   ├── response_curve_schema.json
│   ├── budget_optimizer_schema.json
│   ├── propensity_schema.json
│   └── anomaly_schema.json
└── sample_data/
    ├── churn_sample.csv
    ├── mmm_sample.csv
    ├── lookalike_sample.csv
    ├── response_curve_sample.csv
    ├── budget_optimizer_sample.csv
    ├── propensity_sample.csv
    └── anomaly_sample.csv
```

### Generator Specifications

#### base_generator.py
```python
from abc import ABC, abstractmethod
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

class BaseDataGenerator(ABC):
    """Base class for synthetic data generation."""
    
    def __init__(self, seed: int = 42):
        self.seed = seed
        np.random.seed(seed)
    
    @abstractmethod
    def generate(self, n_samples: int, **kwargs) -> pd.DataFrame:
        """Generate synthetic data."""
        pass
    
    @abstractmethod
    def get_schema(self) -> Dict[str, Any]:
        """Return JSON schema for validation."""
        pass
    
    def add_noise(self, data: pd.Series, noise_level: float = 0.1) -> pd.Series:
        """Add realistic noise to data."""
        noise = np.random.normal(0, noise_level * data.std(), len(data))
        return data + noise
    
    def generate_dates(self, n: int, start: str, end: str) -> pd.Series:
        """Generate random dates in range."""
        start_date = pd.to_datetime(start)
        end_date = pd.to_datetime(end)
        delta = (end_date - start_date).days
        random_days = np.random.randint(0, delta, n)
        return pd.Series([start_date + timedelta(days=int(d)) for d in random_days])
    
    def save(self, df: pd.DataFrame, path: str, format: str = 'csv'):
        """Save generated data."""
        if format == 'csv':
            df.to_csv(path, index=False)
        elif format == 'parquet':
            df.to_parquet(path, index=False)
        elif format == 'json':
            df.to_json(path, orient='records', indent=2)
```

#### churn_generator.py
```python
from .base_generator import BaseDataGenerator
import pandas as pd
import numpy as np

class ChurnDataGenerator(BaseDataGenerator):
    """Generate synthetic customer churn data."""
    
    def generate(self, n_samples: int = 10000, churn_rate: float = 0.15, **kwargs) -> pd.DataFrame:
        """
        Generate churn prediction training data.
        
        Features:
        - customer_id: Unique identifier
        - tenure_months: Months as customer
        - monthly_spend: Average monthly spend
        - transaction_count: Number of transactions
        - support_tickets: Support ticket count
        - last_activity_days: Days since last activity
        - email_engagement: Email open rate
        - product_category: Primary product category
        - churned: Target variable (0/1)
        """
        n_churned = int(n_samples * churn_rate)
        n_retained = n_samples - n_churned
        
        # Generate retained customers (lower risk signals)
        retained = pd.DataFrame({
            'customer_id': [f'CUST_{i:06d}' for i in range(n_retained)],
            'tenure_months': np.random.gamma(shape=3, scale=12, size=n_retained).astype(int).clip(1, 120),
            'monthly_spend': np.random.lognormal(mean=5, sigma=0.8, size=n_retained).clip(10, 5000),
            'transaction_count': np.random.poisson(lam=8, size=n_retained).clip(1, 50),
            'support_tickets': np.random.poisson(lam=1, size=n_retained).clip(0, 10),
            'last_activity_days': np.random.exponential(scale=7, size=n_retained).astype(int).clip(0, 90),
            'email_engagement': np.random.beta(a=5, b=2, size=n_retained),
            'product_category': np.random.choice(['Electronics', 'Apparel', 'Home', 'Beauty', 'Food'], n_retained),
            'churned': 0
        })
        
        # Generate churned customers (higher risk signals)
        churned = pd.DataFrame({
            'customer_id': [f'CUST_{i:06d}' for i in range(n_retained, n_samples)],
            'tenure_months': np.random.exponential(scale=6, size=n_churned).astype(int).clip(1, 36),
            'monthly_spend': np.random.lognormal(mean=4, sigma=1.2, size=n_churned).clip(5, 2000),
            'transaction_count': np.random.poisson(lam=3, size=n_churned).clip(0, 20),
            'support_tickets': np.random.poisson(lam=4, size=n_churned).clip(0, 20),
            'last_activity_days': np.random.exponential(scale=30, size=n_churned).astype(int).clip(14, 180),
            'email_engagement': np.random.beta(a=2, b=5, size=n_churned),
            'product_category': np.random.choice(['Electronics', 'Apparel', 'Home', 'Beauty', 'Food'], n_churned),
            'churned': 1
        })
        
        df = pd.concat([retained, churned], ignore_index=True)
        return df.sample(frac=1, random_state=self.seed).reset_index(drop=True)
    
    def get_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "customer_id": {"type": "string"},
                "tenure_months": {"type": "integer", "minimum": 1},
                "monthly_spend": {"type": "number", "minimum": 0},
                "transaction_count": {"type": "integer", "minimum": 0},
                "support_tickets": {"type": "integer", "minimum": 0},
                "last_activity_days": {"type": "integer", "minimum": 0},
                "email_engagement": {"type": "number", "minimum": 0, "maximum": 1},
                "product_category": {"type": "string"},
                "churned": {"type": "integer", "enum": [0, 1]}
            },
            "required": ["customer_id", "churned"]
        }
```

#### mmm_generator.py
```python
from .base_generator import BaseDataGenerator
import pandas as pd
import numpy as np

class MMMDataGenerator(BaseDataGenerator):
    """Generate synthetic Marketing Mix Modeling data."""
    
    def generate(self, n_weeks: int = 156, **kwargs) -> pd.DataFrame:
        """
        Generate MMM training data (3 years weekly).
        
        Features per channel:
        - {channel}_spend: Weekly spend
        - {channel}_impressions: Weekly impressions
        
        Outcome:
        - revenue: Weekly revenue
        - conversions: Weekly conversions
        
        Controls:
        - seasonality: Seasonal index
        - holiday_flag: Holiday week indicator
        - price_index: Relative pricing
        - competitor_activity: Competitor SOV
        """
        dates = pd.date_range(end=pd.Timestamp.today(), periods=n_weeks, freq='W')
        
        # Channel spends with realistic patterns
        channels = ['tv', 'digital', 'social', 'search', 'display', 'radio', 'ooh']
        base_spends = {'tv': 50000, 'digital': 30000, 'social': 20000, 'search': 25000, 
                       'display': 15000, 'radio': 10000, 'ooh': 8000}
        
        df = pd.DataFrame({'date': dates})
        
        # Seasonality (higher in Q4, lower in Q1)
        week_of_year = df['date'].dt.isocalendar().week
        df['seasonality'] = 1 + 0.3 * np.sin(2 * np.pi * (week_of_year - 13) / 52)
        
        # Holiday flags
        df['holiday_flag'] = ((week_of_year >= 47) & (week_of_year <= 52)).astype(int)
        
        # Price index
        df['price_index'] = 1 + np.random.normal(0, 0.05, n_weeks).cumsum() * 0.01
        df['price_index'] = df['price_index'].clip(0.8, 1.2)
        
        # Competitor activity
        df['competitor_activity'] = np.random.beta(a=2, b=2, size=n_weeks)
        
        # Generate channel data
        for channel in channels:
            base = base_spends[channel]
            # Spend varies by seasonality and random fluctuation
            spend = base * df['seasonality'] * (1 + np.random.normal(0, 0.2, n_weeks))
            spend = spend.clip(base * 0.3, base * 2.5)
            df[f'{channel}_spend'] = spend.round(2)
            
            # Impressions based on spend with some efficiency variation
            cpm = np.random.uniform(5, 25)  # Varies by channel
            df[f'{channel}_impressions'] = (spend / cpm * 1000).astype(int)
        
        # Generate outcomes with realistic response curves
        base_revenue = 500000
        
        # Adstock/carryover effect
        def adstock(x, decay=0.7):
            result = np.zeros_like(x)
            result[0] = x[0]
            for i in range(1, len(x)):
                result[i] = x[i] + decay * result[i-1]
            return result
        
        # Revenue model with diminishing returns
        revenue = base_revenue * df['seasonality']
        for channel in channels:
            spend = df[f'{channel}_spend'].values
            adstocked = adstock(spend)
            # Diminishing returns via log transform
            contribution = np.log1p(adstocked / 10000) * np.random.uniform(5000, 20000)
            revenue += contribution
        
        # Add noise and controls impact
        revenue *= (1 - 0.1 * df['competitor_activity'])  # Competitor impact
        revenue *= df['price_index']  # Price impact
        revenue += np.random.normal(0, revenue.std() * 0.1)  # Random noise
        
        df['revenue'] = revenue.round(2)
        df['conversions'] = (revenue / np.random.uniform(80, 120, n_weeks)).astype(int)
        
        return df
    
    def get_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "date": {"type": "string", "format": "date"},
                "revenue": {"type": "number", "minimum": 0},
                "conversions": {"type": "integer", "minimum": 0}
            },
            "required": ["date", "revenue"]
        }
```

#### Similar generators needed for:
- lookalike_generator.py (user profiles with engagement signals)
- response_curve_generator.py (spend vs outcome at various levels)
- budget_optimizer_generator.py (multi-channel budget scenarios)
- propensity_generator.py (user features + conversion outcomes)
- anomaly_generator.py (time series with injected anomalies)

### Ingestion Specifications

#### dataverse_connector.py
```python
import os
import requests
from typing import Dict, List, Optional
import pandas as pd
from datetime import datetime

class DataverseConnector:
    """Connect to Dataverse for training data ingestion."""
    
    def __init__(self, environment_url: str = None, client_id: str = None, client_secret: str = None):
        self.environment_url = environment_url or os.getenv('DATAVERSE_URL')
        self.client_id = client_id or os.getenv('DATAVERSE_CLIENT_ID')
        self.client_secret = client_secret or os.getenv('DATAVERSE_CLIENT_SECRET')
        self.token = None
        self.token_expiry = None
    
    def authenticate(self) -> str:
        """Get OAuth token for Dataverse API."""
        tenant_id = os.getenv('AZURE_TENANT_ID')
        token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        
        data = {
            'grant_type': 'client_credentials',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'scope': f'{self.environment_url}/.default'
        }
        
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        self.token = token_data['access_token']
        self.token_expiry = datetime.now().timestamp() + token_data['expires_in']
        
        return self.token
    
    def get_headers(self) -> Dict[str, str]:
        """Get request headers with valid token."""
        if not self.token or datetime.now().timestamp() > self.token_expiry - 60:
            self.authenticate()
        
        return {
            'Authorization': f'Bearer {self.token}',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    
    def query_table(self, table_name: str, select: List[str] = None, 
                    filter: str = None, top: int = None) -> pd.DataFrame:
        """Query a Dataverse table and return as DataFrame."""
        url = f"{self.environment_url}/api/data/v9.2/{table_name}"
        
        params = {}
        if select:
            params['$select'] = ','.join(select)
        if filter:
            params['$filter'] = filter
        if top:
            params['$top'] = top
        
        all_records = []
        
        while url:
            response = requests.get(url, headers=self.get_headers(), params=params)
            response.raise_for_status()
            data = response.json()
            
            all_records.extend(data.get('value', []))
            url = data.get('@odata.nextLink')
            params = {}  # Next link includes params
        
        return pd.DataFrame(all_records)
    
    def get_campaign_performance(self, start_date: str, end_date: str) -> pd.DataFrame:
        """Get campaign performance data for training."""
        filter_str = f"mpa_date ge {start_date} and mpa_date le {end_date}"
        return self.query_table(
            'mpa_campaignperformances',
            select=['mpa_date', 'mpa_channel', 'mpa_spend', 'mpa_impressions', 
                    'mpa_clicks', 'mpa_conversions', 'mpa_revenue'],
            filter=filter_str
        )
    
    def get_customer_data(self) -> pd.DataFrame:
        """Get customer data for churn/propensity models."""
        return self.query_table(
            'mpa_customers',
            select=['mpa_customerid', 'mpa_tenure', 'mpa_ltv', 'mpa_segment',
                    'mpa_lastactivity', 'mpa_engagementscore']
        )
```

#### csv_loader.py
```python
import pandas as pd
from pathlib import Path
from typing import Optional, Dict, Any
import json
from jsonschema import validate, ValidationError

class CSVLoader:
    """Load and validate CSV training data."""
    
    def __init__(self, schema_dir: str = 'schemas'):
        self.schema_dir = Path(schema_dir)
    
    def load(self, filepath: str, schema_name: Optional[str] = None) -> pd.DataFrame:
        """Load CSV with optional schema validation."""
        df = pd.read_csv(filepath)
        
        if schema_name:
            self.validate(df, schema_name)
        
        return df
    
    def validate(self, df: pd.DataFrame, schema_name: str) -> bool:
        """Validate DataFrame against JSON schema."""
        schema_path = self.schema_dir / f'{schema_name}.json'
        
        if not schema_path.exists():
            raise FileNotFoundError(f"Schema not found: {schema_path}")
        
        with open(schema_path) as f:
            schema = json.load(f)
        
        # Validate each row
        errors = []
        for idx, row in df.iterrows():
            try:
                validate(instance=row.to_dict(), schema=schema)
            except ValidationError as e:
                errors.append(f"Row {idx}: {e.message}")
        
        if errors:
            raise ValueError(f"Validation errors:\n" + "\n".join(errors[:10]))
        
        return True
    
    def load_directory(self, directory: str, pattern: str = '*.csv') -> Dict[str, pd.DataFrame]:
        """Load all CSVs from directory."""
        dir_path = Path(directory)
        result = {}
        
        for filepath in dir_path.glob(pattern):
            name = filepath.stem
            result[name] = pd.read_csv(filepath)
        
        return result
```

### CLI Integration

Add to `train.py`:
```python
@click.group()
def data():
    """Data generation and ingestion commands."""
    pass

@data.command()
@click.option('--model', type=click.Choice(['churn', 'mmm', 'lookalike', 'response', 'budget', 'propensity', 'anomaly', 'all']))
@click.option('--samples', default=10000, help='Number of samples to generate')
@click.option('--output', default='data/sample_data', help='Output directory')
@click.option('--format', type=click.Choice(['csv', 'parquet', 'json']), default='csv')
def generate(model: str, samples: int, output: str, format: str):
    """Generate synthetic training data."""
    from data.generators import get_generator
    
    models = [model] if model != 'all' else ['churn', 'mmm', 'lookalike', 'response', 'budget', 'propensity', 'anomaly']
    
    for m in models:
        generator = get_generator(m)
        df = generator.generate(n_samples=samples)
        
        output_path = Path(output) / f'{m}_sample.{format}'
        generator.save(df, output_path, format)
        click.echo(f"Generated {len(df)} samples for {m} -> {output_path}")

@data.command()
@click.option('--source', type=click.Choice(['dataverse', 'csv', 'sharepoint']))
@click.option('--table', help='Table name for Dataverse')
@click.option('--path', help='File path for CSV/SharePoint')
@click.option('--output', required=True, help='Output path')
def ingest(source: str, table: str, path: str, output: str):
    """Ingest training data from external sources."""
    if source == 'dataverse':
        from data.ingestion import DataverseConnector
        connector = DataverseConnector()
        df = connector.query_table(table)
    elif source == 'csv':
        from data.ingestion import CSVLoader
        loader = CSVLoader()
        df = loader.load(path)
    elif source == 'sharepoint':
        from data.ingestion import SharePointLoader
        loader = SharePointLoader()
        df = loader.load(path)
    
    df.to_csv(output, index=False)
    click.echo(f"Ingested {len(df)} records -> {output}")

cli.add_command(data)
```

### Test Requirements

```python
# tests/test_generators.py
import pytest
from data.generators import ChurnDataGenerator, MMMDataGenerator

def test_churn_generator_shape():
    gen = ChurnDataGenerator()
    df = gen.generate(n_samples=1000)
    assert len(df) == 1000
    assert 'churned' in df.columns
    assert df['churned'].isin([0, 1]).all()

def test_churn_generator_churn_rate():
    gen = ChurnDataGenerator()
    df = gen.generate(n_samples=10000, churn_rate=0.2)
    actual_rate = df['churned'].mean()
    assert 0.18 < actual_rate < 0.22  # Allow some variance

def test_mmm_generator_shape():
    gen = MMMDataGenerator()
    df = gen.generate(n_weeks=52)
    assert len(df) == 52
    assert 'revenue' in df.columns
    assert all(col in df.columns for col in ['tv_spend', 'digital_spend', 'social_spend'])

def test_mmm_generator_no_negative_revenue():
    gen = MMMDataGenerator()
    df = gen.generate(n_weeks=156)
    assert (df['revenue'] >= 0).all()
```

---

## TASK 2: POWER PLATFORM DEPLOYMENT

### Objective
Deploy KDAP v6.0 to Power Platform environments.

### Prerequisites
- pac CLI installed (`npm install -g @microsoft/pac-cli`)
- Azure AD app registration with Dataverse permissions
- Target environments: Aragorn AI (personal), Mastercard (corporate)

### Deployment Scripts

Create `deploy/` directory:
```
deploy/
├── deploy.sh
├── deploy_sharepoint.py
├── deploy_copilot.py
├── deploy_dataverse.py
├── deploy_flows.py
├── config/
│   ├── personal.env
│   └── mastercard.env
└── utils/
    ├── pac_wrapper.py
    └── sharepoint_client.py
```

#### deploy.sh (Main orchestrator)
```bash
#!/bin/bash
set -e

ENV=${1:-personal}
echo "Deploying KDAP v6.0 to $ENV environment..."

# Load environment config
source deploy/config/$ENV.env

# 1. Deploy Dataverse schema
echo "Step 1/5: Deploying Dataverse schema..."
python deploy/deploy_dataverse.py --env $ENV

# 2. Upload KB files to SharePoint
echo "Step 2/5: Uploading KB files to SharePoint..."
python deploy/deploy_sharepoint.py --env $ENV

# 3. Deploy Power Automate flows
echo "Step 3/5: Deploying Power Automate flows..."
python deploy/deploy_flows.py --env $ENV

# 4. Configure Copilot Studio agents
echo "Step 4/5: Configuring Copilot Studio agents..."
python deploy/deploy_copilot.py --env $ENV

# 5. Seed initial data
echo "Step 5/5: Seeding initial data..."
python deploy/deploy_dataverse.py --env $ENV --seed-only

echo "Deployment complete!"
```

#### deploy_sharepoint.py
```python
import os
import click
from pathlib import Path
from office365.runtime.auth.client_credential import ClientCredential
from office365.sharepoint.client_context import ClientContext

@click.command()
@click.option('--env', type=click.Choice(['personal', 'mastercard']), required=True)
@click.option('--kb-path', default='release/v6.0/agents', help='Path to KB files')
@click.option('--dry-run', is_flag=True, help='Show what would be uploaded')
def deploy_sharepoint(env: str, kb_path: str, dry_run: bool):
    """Upload KB files to SharePoint."""
    
    site_url = os.getenv(f'{env.upper()}_SHAREPOINT_SITE')
    client_id = os.getenv('SHAREPOINT_CLIENT_ID')
    client_secret = os.getenv('SHAREPOINT_CLIENT_SECRET')
    
    credentials = ClientCredential(client_id, client_secret)
    ctx = ClientContext(site_url).with_credentials(credentials)
    
    kb_base = Path(kb_path)
    
    # Upload agent KB files
    for agent_dir in kb_base.iterdir():
        if not agent_dir.is_dir():
            continue
        
        kb_dir = agent_dir / 'kb'
        if not kb_dir.exists():
            continue
        
        agent_code = agent_dir.name.upper()
        target_folder = f'MPAKnowledgeBase/Agents/{agent_code}'
        
        for kb_file in kb_dir.glob('*.txt'):
            if dry_run:
                click.echo(f"Would upload: {kb_file} -> {target_folder}/{kb_file.name}")
            else:
                with open(kb_file, 'rb') as f:
                    target = ctx.web.get_folder_by_server_relative_url(target_folder)
                    target.upload_file(kb_file.name, f.read()).execute_query()
                    click.echo(f"Uploaded: {kb_file.name}")
    
    # Upload vertical overlays
    verticals_path = kb_base.parent / 'verticals'
    if verticals_path.exists():
        for vertical_file in verticals_path.glob('*.txt'):
            target_folder = 'MPAKnowledgeBase/Verticals'
            if dry_run:
                click.echo(f"Would upload: {vertical_file} -> {target_folder}/{vertical_file.name}")
            else:
                with open(vertical_file, 'rb') as f:
                    target = ctx.web.get_folder_by_server_relative_url(target_folder)
                    target.upload_file(vertical_file.name, f.read()).execute_query()
                    click.echo(f"Uploaded: {vertical_file.name}")

if __name__ == '__main__':
    deploy_sharepoint()
```

#### deploy_copilot.py
```python
import os
import click
import requests
from pathlib import Path

@click.command()
@click.option('--env', type=click.Choice(['personal', 'mastercard']), required=True)
@click.option('--agent', help='Specific agent to deploy (default: all)')
def deploy_copilot(env: str, agent: str):
    """Configure Copilot Studio agents."""
    
    environment_id = os.getenv(f'{env.upper()}_ENVIRONMENT_ID')
    token = get_power_platform_token()
    
    agents_path = Path('release/v6.0/agents')
    
    agents_to_deploy = [agent] if agent else [d.name for d in agents_path.iterdir() if d.is_dir()]
    
    for agent_code in agents_to_deploy:
        agent_path = agents_path / agent_code
        instructions_file = agent_path / 'instructions' / f'{agent_code.upper()}_Copilot_Instructions_v1.txt'
        
        if not instructions_file.exists():
            click.echo(f"Skipping {agent_code}: No instructions file")
            continue
        
        with open(instructions_file) as f:
            instructions = f.read()
        
        # Update agent via Power Platform API
        # Note: Copilot Studio API is limited - may need manual config
        click.echo(f"Agent {agent_code}: Instructions ready ({len(instructions)} chars)")
        click.echo(f"  -> Manual step: Update agent in Copilot Studio")
        click.echo(f"  -> File: {instructions_file}")

def get_power_platform_token():
    """Get OAuth token for Power Platform API."""
    tenant_id = os.getenv('AZURE_TENANT_ID')
    client_id = os.getenv('POWER_PLATFORM_CLIENT_ID')
    client_secret = os.getenv('POWER_PLATFORM_CLIENT_SECRET')
    
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    
    response = requests.post(token_url, data={
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'https://api.powerplatform.com/.default'
    })
    
    return response.json()['access_token']

if __name__ == '__main__':
    deploy_copilot()
```

#### deploy_dataverse.py
```python
import os
import click
import requests
import pandas as pd
from pathlib import Path

@click.command()
@click.option('--env', type=click.Choice(['personal', 'mastercard']), required=True)
@click.option('--seed-only', is_flag=True, help='Only seed data, skip schema')
def deploy_dataverse(env: str, seed_only: bool):
    """Deploy Dataverse schema and seed data."""
    
    environment_url = os.getenv(f'{env.upper()}_DATAVERSE_URL')
    token = get_dataverse_token(environment_url)
    
    headers = {
        'Authorization': f'Bearer {token}',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    if not seed_only:
        # Deploy schema (tables, columns, relationships)
        schema_path = Path('base/dataverse/schema')
        for schema_file in schema_path.glob('*.json'):
            click.echo(f"Schema deployment: {schema_file.name}")
            # Note: Schema changes typically done via solution import
            click.echo("  -> Use pac solution import for schema changes")
    
    # Seed data
    seed_path = Path('base/dataverse/seed')
    for seed_file in seed_path.glob('*.csv'):
        table_name = seed_file.stem.replace('_seed', 's')  # mpa_benchmark_seed -> mpa_benchmarks
        click.echo(f"Seeding: {seed_file.name} -> {table_name}")
        
        df = pd.read_csv(seed_file)
        for _, row in df.iterrows():
            record = row.to_dict()
            # Remove NaN values
            record = {k: v for k, v in record.items() if pd.notna(v)}
            
            response = requests.post(
                f"{environment_url}/api/data/v9.2/{table_name}",
                headers=headers,
                json=record
            )
            
            if response.status_code == 204:
                click.echo(f"  Created: {record.get('mpa_name', 'record')}")
            else:
                click.echo(f"  Error: {response.status_code} - {response.text[:100]}")

def get_dataverse_token(environment_url: str):
    """Get OAuth token for Dataverse."""
    tenant_id = os.getenv('AZURE_TENANT_ID')
    client_id = os.getenv('DATAVERSE_CLIENT_ID')
    client_secret = os.getenv('DATAVERSE_CLIENT_SECRET')
    
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    
    response = requests.post(token_url, data={
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': f'{environment_url}/.default'
    })
    
    return response.json()['access_token']

if __name__ == '__main__':
    deploy_dataverse()
```

### Environment Config Files

#### config/personal.env
```bash
# Aragorn AI Environment
PERSONAL_DATAVERSE_URL=https://org12345.crm.dynamics.com
PERSONAL_SHAREPOINT_SITE=https://kesseldigital.sharepoint.com/sites/AragornAI
PERSONAL_ENVIRONMENT_ID=12345678-1234-1234-1234-123456789012

# Azure AD App Registration
AZURE_TENANT_ID=your-tenant-id
DATAVERSE_CLIENT_ID=your-client-id
DATAVERSE_CLIENT_SECRET=your-client-secret
SHAREPOINT_CLIENT_ID=your-sharepoint-client-id
SHAREPOINT_CLIENT_SECRET=your-sharepoint-secret
POWER_PLATFORM_CLIENT_ID=your-pp-client-id
POWER_PLATFORM_CLIENT_SECRET=your-pp-secret
```

---

## TASK 3: END-TO-END INTEGRATION TESTS

### Objective
Validate complete workflows from user input through agent responses.

### Location
`tests/e2e/`

### Test Structure
```
tests/e2e/
├── conftest.py
├── test_orchestrator_routing.py
├── test_anl_calculations.py
├── test_aud_segmentation.py
├── test_cha_recommendations.py
├── test_full_workflow.py
├── fixtures/
│   ├── sample_briefs.json
│   ├── expected_responses.json
│   └── benchmark_data.json
└── utils/
    ├── copilot_client.py
    └── assertions.py
```

#### conftest.py
```python
import pytest
import os
from utils.copilot_client import CopilotClient

@pytest.fixture(scope='session')
def copilot_client():
    """Create authenticated Copilot client."""
    return CopilotClient(
        environment_url=os.getenv('TEST_ENVIRONMENT_URL'),
        bot_id=os.getenv('TEST_BOT_ID')
    )

@pytest.fixture
def sample_brief():
    """Load sample brief for testing."""
    return {
        "objective": "Drive brand awareness for new product launch",
        "budget": 500000,
        "timeline": "Q2 2026",
        "vertical": "Technology",
        "target_audience": "IT decision makers at enterprise companies"
    }
```

#### test_orchestrator_routing.py
```python
import pytest

class TestOrchestratorRouting:
    """Test ORC agent routes to correct specialist."""
    
    @pytest.mark.parametrize("query,expected_agent", [
        ("Calculate my expected ROAS", "ANL"),
        ("Who should I target for this campaign?", "AUD"),
        ("What channels should I use?", "CHA"),
        ("Generate a media plan document", "DOC"),
        ("How is my campaign performing?", "PRF"),
        ("Optimize my supply path", "SPO"),
        ("Help me with brand positioning", "MKT"),
    ])
    def test_routing_by_intent(self, copilot_client, query, expected_agent):
        """Verify correct agent routing based on query intent."""
        response = copilot_client.send_message(query)
        
        # Check routing indicator in response
        assert expected_agent in response.metadata.get('routed_to', '')
    
    def test_multi_agent_workflow(self, copilot_client, sample_brief):
        """Test workflow that requires multiple agents."""
        # Start with brief
        response = copilot_client.send_message(
            f"Create a media plan for: {sample_brief['objective']}"
        )
        
        # Should route through ORC -> appropriate agents
        assert response.status == 'success'
        assert len(response.agent_chain) >= 2
```

#### test_anl_calculations.py
```python
import pytest
from decimal import Decimal

class TestANLCalculations:
    """Test ANL agent calculations."""
    
    def test_roas_calculation(self, copilot_client):
        """Verify ROAS formula: (Revenue - Spend) / Spend."""
        response = copilot_client.send_message(
            "Calculate ROAS for: Revenue $150,000, Spend $50,000"
        )
        
        # Expected: (150000 - 50000) / 50000 = 2.0
        assert "2.0" in response.text or "200%" in response.text
    
    def test_cac_calculation(self, copilot_client):
        """Verify CAC calculation."""
        response = copilot_client.send_message(
            "Calculate CAC for: Marketing Spend $100,000, New Customers 500"
        )
        
        # Expected: 100000 / 500 = 200
        assert "$200" in response.text or "200" in response.text
    
    def test_ltv_projection(self, copilot_client):
        """Verify LTV calculation with retention curve."""
        response = copilot_client.send_message(
            "Project 3-year LTV for: AOV $75, Purchase Frequency 4x/year, "
            "Retention Rate 80%, Margin 40%"
        )
        
        # Should return LTV estimate with methodology
        assert "LTV" in response.text
        assert "$" in response.text
```

#### test_full_workflow.py
```python
import pytest

class TestFullWorkflow:
    """Test complete media planning workflow."""
    
    def test_express_pathway(self, copilot_client):
        """Test EXPRESS pathway for simple briefs."""
        # Express: Budget < $100K, single objective
        response = copilot_client.send_message(
            "Quick media plan: $50K budget, drive website traffic, "
            "B2B SaaS, 3-month campaign"
        )
        
        assert response.pathway == 'EXPRESS'
        assert 'channel_recommendation' in response.outputs
        assert 'budget_allocation' in response.outputs
    
    def test_standard_pathway(self, copilot_client):
        """Test STANDARD pathway for typical briefs."""
        response = copilot_client.send_message(
            "Create media plan: $250K budget, brand awareness + lead gen, "
            "Healthcare vertical, Q2-Q3 2026"
        )
        
        assert response.pathway == 'STANDARD'
        assert len(response.steps_completed) >= 5
    
    def test_guided_pathway(self, copilot_client):
        """Test GUIDED pathway for complex/novice users."""
        response = copilot_client.start_workflow(
            pathway='GUIDED',
            brief="I'm new to media planning. Help me create a plan for "
                  "my e-commerce store with $100K budget."
        )
        
        assert response.pathway == 'GUIDED'
        assert 'explanation' in response.text.lower()
    
    def test_vertical_context_applied(self, copilot_client):
        """Verify vertical-specific guidance is applied."""
        response = copilot_client.send_message(
            "Create media plan for healthcare: $500K budget, patient acquisition"
        )
        
        # Should include HIPAA considerations
        assert any(term in response.text.lower() 
                   for term in ['hipaa', 'compliance', 'phi', 'healthcare'])
```

### Copilot Client Utility

#### utils/copilot_client.py
```python
import requests
from dataclasses import dataclass
from typing import Optional, Dict, List, Any

@dataclass
class CopilotResponse:
    text: str
    status: str
    pathway: Optional[str] = None
    routed_to: Optional[str] = None
    agent_chain: List[str] = None
    outputs: Dict[str, Any] = None
    steps_completed: List[str] = None
    metadata: Dict[str, Any] = None

class CopilotClient:
    """Client for testing Copilot Studio agents."""
    
    def __init__(self, environment_url: str, bot_id: str):
        self.environment_url = environment_url
        self.bot_id = bot_id
        self.conversation_id = None
        self.token = None
    
    def send_message(self, message: str) -> CopilotResponse:
        """Send message and get response."""
        if not self.token:
            self._start_conversation()
        
        response = requests.post(
            f"{self.environment_url}/api/messages",
            headers={'Authorization': f'Bearer {self.token}'},
            json={
                'conversationId': self.conversation_id,
                'text': message
            }
        )
        
        data = response.json()
        
        return CopilotResponse(
            text=data.get('text', ''),
            status='success' if response.ok else 'error',
            pathway=data.get('pathway'),
            routed_to=data.get('routedTo'),
            agent_chain=data.get('agentChain', []),
            outputs=data.get('outputs', {}),
            steps_completed=data.get('stepsCompleted', []),
            metadata=data.get('metadata', {})
        )
    
    def start_workflow(self, pathway: str, brief: str) -> CopilotResponse:
        """Start a specific workflow pathway."""
        return self.send_message(f"/pathway {pathway}\n{brief}")
    
    def _start_conversation(self):
        """Initialize conversation with bot."""
        response = requests.post(
            f"{self.environment_url}/api/conversations",
            json={'botId': self.bot_id}
        )
        data = response.json()
        self.conversation_id = data['conversationId']
        self.token = data['token']
```

---

## EXECUTION CHECKLIST

### Task 1: ML Training Data Pipelines
- [ ] Create `src/ml-training/data/` directory structure
- [ ] Implement BaseDataGenerator class
- [ ] Implement all 7 model-specific generators
- [ ] Implement DataverseConnector
- [ ] Implement CSVLoader with schema validation
- [ ] Create JSON schemas for each model
- [ ] Generate sample datasets
- [ ] Add CLI commands (generate, ingest)
- [ ] Write unit tests for generators
- [ ] Commit and push

### Task 2: Power Platform Deployment
- [ ] Create `deploy/` directory structure
- [ ] Implement deploy_sharepoint.py
- [ ] Implement deploy_copilot.py
- [ ] Implement deploy_dataverse.py
- [ ] Create environment config templates
- [ ] Test deployment to personal environment
- [ ] Document manual steps (Copilot Studio config)
- [ ] Commit and push

### Task 3: End-to-End Integration Tests
- [ ] Create `tests/e2e/` directory structure
- [ ] Implement CopilotClient utility
- [ ] Write orchestrator routing tests
- [ ] Write ANL calculation tests
- [ ] Write full workflow tests
- [ ] Create test fixtures
- [ ] Configure CI to run e2e tests
- [ ] Commit and push

---

## GIT COMMANDS

```bash
# After each task
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git add -A
git commit -m "feat: [task description]"
git push origin main
git push origin main:deploy/personal
git push origin main:deploy/mastercard
```

---

## SUCCESS CRITERIA

| Task | Criteria |
|------|----------|
| ML Data Pipelines | All 7 generators work, CLI commands functional, tests pass |
| Power Platform Deployment | Scripts execute without error, KB files uploaded, agents configured |
| E2E Integration Tests | All routing tests pass, calculations verified, workflows complete |

---

## NOTES

- Copilot Studio API has limitations - some config requires manual UI work
- Use dry-run flags for testing before actual deployment
- Keep environment secrets in .env files (not committed)
- Test against personal environment before Mastercard
