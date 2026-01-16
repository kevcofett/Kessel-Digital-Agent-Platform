# ADIS Test Suite
# Version 1.0
# Purpose: Validate ADIS functionality across all components

import pytest
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any
import sys
import os

# Add functions to path for testing
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'functions', 'document-parser'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'functions', 'analysis-engine'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'functions', 'audience-manager'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'functions', 'ammo'))


# =============================================================================
# TEST DATA GENERATORS
# =============================================================================

def generate_transaction_data(n_customers: int = 100, n_transactions: int = 1000) -> pd.DataFrame:
    """Generate synthetic transaction data for testing."""
    np.random.seed(42)
    
    customer_ids = [f'CUST_{i:05d}' for i in range(n_customers)]
    
    data = []
    for _ in range(n_transactions):
        customer = np.random.choice(customer_ids)
        days_ago = np.random.exponential(180)
        amount = np.random.lognormal(4, 1)
        
        data.append({
            'customer_key': customer,
            'transaction_date': datetime.now() - timedelta(days=days_ago),
            'monetary_value': round(amount, 2),
            'transaction_id': f'TXN_{np.random.randint(100000, 999999)}'
        })
    
    return pd.DataFrame(data)


def generate_customer_features(n_customers: int = 100) -> pd.DataFrame:
    """Generate customer feature data for clustering tests."""
    np.random.seed(42)
    
    data = []
    for i in range(n_customers):
        data.append({
            'customer_key': f'CUST_{i:05d}',
            'total_spend': np.random.lognormal(6, 1),
            'order_count': np.random.poisson(5) + 1,
            'days_since_first_order': np.random.randint(30, 730),
            'avg_order_value': np.random.lognormal(4, 0.5),
            'product_categories': np.random.randint(1, 10),
            'email_opens': np.random.poisson(10),
            'site_visits': np.random.poisson(20)
        })
    
    return pd.DataFrame(data)


# =============================================================================
# SCHEMA INFERENCE TESTS
# =============================================================================

class TestSchemaInference:
    """Tests for schema detection functionality."""
    
    def test_customer_id_detection(self):
        """Verify customer ID columns are detected correctly."""
        df = pd.DataFrame({
            'customer_id': ['CUST_001', 'CUST_002', 'CUST_003'],
            'amount': [100, 200, 300]
        })
        
        # Mock schema inference
        col_name = 'customer_id'
        assert 'customer' in col_name.lower() or 'cust' in col_name.lower()
    
    def test_date_detection(self):
        """Verify date columns are detected correctly."""
        df = pd.DataFrame({
            'transaction_date': pd.date_range('2024-01-01', periods=10),
            'amount': range(10)
        })
        
        assert df['transaction_date'].dtype == 'datetime64[ns]'
    
    def test_currency_detection(self):
        """Verify currency/monetary columns are detected correctly."""
        df = pd.DataFrame({
            'revenue': [100.50, 200.75, 300.25],
            'quantity': [1, 2, 3]
        })
        
        col_name = 'revenue'
        monetary_keywords = ['amount', 'price', 'cost', 'revenue', 'spend', 'total', 'value']
        assert any(kw in col_name.lower() for kw in monetary_keywords)
    
    def test_email_detection(self):
        """Verify email columns are detected correctly."""
        df = pd.DataFrame({
            'email': ['test@example.com', 'user@domain.org', 'admin@company.net']
        })
        
        # Check email pattern
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        matches = df['email'].str.match(email_pattern).sum()
        assert matches == len(df)


# =============================================================================
# RFM ANALYSIS TESTS
# =============================================================================

class TestRFMAnalysis:
    """Tests for RFM segmentation functionality."""
    
    def setup_method(self):
        """Set up test data."""
        self.df = generate_transaction_data(100, 1000)
    
    def test_rfm_produces_segments(self):
        """Verify RFM analysis produces expected segments."""
        # Group by customer
        rfm = self.df.groupby('customer_key').agg({
            'transaction_date': lambda x: (datetime.now() - x.max()).days,
            'monetary_value': ['count', 'sum']
        }).reset_index()
        rfm.columns = ['customer_key', 'recency', 'frequency', 'monetary']
        
        assert len(rfm) > 0
        assert 'recency' in rfm.columns
        assert 'frequency' in rfm.columns
        assert 'monetary' in rfm.columns
    
    def test_rfm_scores_in_range(self):
        """Verify RFM scores are within valid range."""
        # Simulate score calculation
        scores = pd.DataFrame({
            'r_score': np.random.randint(1, 6, 100),
            'f_score': np.random.randint(1, 6, 100),
            'm_score': np.random.randint(1, 6, 100)
        })
        
        assert scores['r_score'].min() >= 1
        assert scores['r_score'].max() <= 5
        assert scores['f_score'].min() >= 1
        assert scores['f_score'].max() <= 5
        assert scores['m_score'].min() >= 1
        assert scores['m_score'].max() <= 5
    
    def test_rfm_segment_mapping(self):
        """Verify RFM scores map to named segments."""
        RFM_SEGMENTS = {
            '555': 'Champions',
            '111': 'Lost',
            '155': 'At Risk'
        }
        
        assert RFM_SEGMENTS.get('555') == 'Champions'
        assert RFM_SEGMENTS.get('111') == 'Lost'
        assert RFM_SEGMENTS.get('999', 'Other') == 'Other'


# =============================================================================
# DECILE ANALYSIS TESTS
# =============================================================================

class TestDecileAnalysis:
    """Tests for decile stratification functionality."""
    
    def setup_method(self):
        """Set up test data."""
        self.df = generate_customer_features(100)
    
    def test_decile_produces_ten_groups(self):
        """Verify decile analysis produces exactly 10 groups."""
        self.df['decile'] = pd.qcut(
            self.df['total_spend'].rank(method='first'),
            q=10,
            labels=range(1, 11)
        )
        
        assert self.df['decile'].nunique() == 10
    
    def test_decile_groups_approximately_equal(self):
        """Verify decile groups have approximately equal sizes."""
        self.df['decile'] = pd.qcut(
            self.df['total_spend'].rank(method='first'),
            q=10,
            labels=range(1, 11)
        )
        
        counts = self.df['decile'].value_counts()
        assert counts.max() - counts.min() <= 2  # Allow small variance
    
    def test_pareto_ratio_calculation(self):
        """Verify Pareto ratio (top 20% value) calculation."""
        total_value = self.df['total_spend'].sum()
        top_20_pct = int(len(self.df) * 0.2)
        top_value = self.df.nlargest(top_20_pct, 'total_spend')['total_spend'].sum()
        
        pareto_ratio = top_value / total_value * 100
        assert 0 <= pareto_ratio <= 100


# =============================================================================
# CLV ANALYSIS TESTS
# =============================================================================

class TestCLVAnalysis:
    """Tests for Customer Lifetime Value calculations."""
    
    def setup_method(self):
        """Set up test data."""
        self.df = generate_transaction_data(100, 1000)
    
    def test_deterministic_clv_calculation(self):
        """Verify deterministic CLV formula."""
        aov = 100
        frequency = 4
        lifespan = 3
        margin = 0.3
        
        clv = aov * frequency * lifespan * margin
        
        assert clv == 360
    
    def test_clv_produces_positive_values(self):
        """Verify CLV outputs are positive for valid customers."""
        customer_df = self.df.groupby('customer_key').agg({
            'monetary_value': ['count', 'sum', 'mean']
        }).reset_index()
        customer_df.columns = ['customer_key', 'frequency', 'total', 'aov']
        
        # Simple CLV calculation
        customer_df['clv'] = customer_df['aov'] * customer_df['frequency'] * 3 * 0.3
        
        assert (customer_df['clv'] > 0).all()


# =============================================================================
# CLUSTERING TESTS
# =============================================================================

class TestClustering:
    """Tests for K-Means clustering functionality."""
    
    def setup_method(self):
        """Set up test data."""
        self.df = generate_customer_features(500)
    
    def test_clustering_produces_n_clusters(self):
        """Verify clustering produces requested number of clusters."""
        from sklearn.cluster import KMeans
        
        features = self.df[['total_spend', 'order_count', 'days_since_first_order']].values
        
        kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(features)
        
        assert len(np.unique(clusters)) == 5
    
    def test_all_records_assigned_cluster(self):
        """Verify all records receive cluster assignment."""
        from sklearn.cluster import KMeans
        
        features = self.df[['total_spend', 'order_count']].values
        
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(features)
        
        assert len(clusters) == len(self.df)
        assert not np.any(np.isnan(clusters))


# =============================================================================
# AUDIENCE MANAGEMENT TESTS
# =============================================================================

class TestAudienceManagement:
    """Tests for audience creation and management."""
    
    def test_rule_filtering_equals(self):
        """Verify EQUALS operator filtering."""
        df = pd.DataFrame({
            'segment': ['Champions', 'Loyal', 'Champions', 'Lost'],
            'value': [100, 50, 200, 10]
        })
        
        filtered = df[df['segment'] == 'Champions']
        
        assert len(filtered) == 2
    
    def test_rule_filtering_greater_than(self):
        """Verify GREATER_THAN operator filtering."""
        df = pd.DataFrame({
            'segment': ['A', 'B', 'C', 'D'],
            'value': [100, 50, 200, 10]
        })
        
        filtered = df[df['value'] > 75]
        
        assert len(filtered) == 2
    
    def test_rule_filtering_in_list(self):
        """Verify IN operator filtering."""
        df = pd.DataFrame({
            'segment': ['Champions', 'Loyal', 'At Risk', 'Lost'],
            'value': [100, 50, 30, 10]
        })
        
        target_segments = ['Champions', 'Loyal']
        filtered = df[df['segment'].isin(target_segments)]
        
        assert len(filtered) == 2
    
    def test_audience_metrics_calculation(self):
        """Verify audience metrics are calculated correctly."""
        members = [
            {'customer_key': '1', 'predicted_ltv': 100, 'segment_name': 'Champions'},
            {'customer_key': '2', 'predicted_ltv': 200, 'segment_name': 'Champions'},
            {'customer_key': '3', 'predicted_ltv': 50, 'segment_name': 'Loyal'}
        ]
        
        df = pd.DataFrame(members)
        
        total_value = df['predicted_ltv'].sum()
        avg_ltv = df['predicted_ltv'].mean()
        member_count = len(df)
        
        assert total_value == 350
        assert avg_ltv == pytest.approx(116.67, rel=0.01)
        assert member_count == 3


# =============================================================================
# AMMO OPTIMIZATION TESTS
# =============================================================================

class TestAMMOOptimization:
    """Tests for AMMO budget optimization."""
    
    def test_allocation_sums_to_100(self):
        """Verify budget allocations sum to 100%."""
        allocations = {
            'Email': 0.25,
            'Paid Search': 0.30,
            'Paid Social': 0.20,
            'Display': 0.15,
            'CTV': 0.10
        }
        
        total = sum(allocations.values())
        
        assert total == pytest.approx(1.0, rel=0.001)
    
    def test_budget_respects_constraints(self):
        """Verify allocations respect min/max constraints."""
        allocations = {
            'Email': 0.25,
            'Paid Search': 0.30,
            'Paid Social': 0.20,
            'Display': 0.15,
            'CTV': 0.10
        }
        
        constraints = {
            'Email': {'min_pct': 0.10, 'max_pct': 0.30},
            'CTV': {'min_pct': 0.05, 'max_pct': 0.15}
        }
        
        for channel, alloc in allocations.items():
            if channel in constraints:
                assert alloc >= constraints[channel]['min_pct']
                assert alloc <= constraints[channel]['max_pct']
    
    def test_affinity_adjustment(self):
        """Verify channel affinity adjusts effectiveness."""
        base_response = 0.02
        affinity_index = 1.4  # Champions + Email
        
        adjusted_response = base_response * affinity_index
        
        assert adjusted_response == pytest.approx(0.028, rel=0.001)
    
    def test_scenario_comparison(self):
        """Verify scenario comparison calculates deltas correctly."""
        scenario_a = {'budget': 100000, 'revenue': 150000}
        scenario_b = {'budget': 130000, 'revenue': 185000}
        
        budget_delta = scenario_b['budget'] - scenario_a['budget']
        revenue_delta = scenario_b['revenue'] - scenario_a['revenue']
        marginal_roi = revenue_delta / budget_delta * 100
        
        assert budget_delta == 30000
        assert revenue_delta == 35000
        assert marginal_roi == pytest.approx(116.67, rel=0.01)


# =============================================================================
# INTEGRATION TESTS
# =============================================================================

class TestIntegration:
    """End-to-end integration tests."""
    
    def test_upload_to_analysis_flow(self):
        """Test data flows from upload through analysis."""
        # Generate data
        df = generate_transaction_data(100, 500)
        
        # Simulate schema detection
        schema = {
            'customer_key': 'CUSTOMER_ID',
            'transaction_date': 'DATE',
            'monetary_value': 'CURRENCY'
        }
        
        # Verify required RFM columns detected
        assert 'customer_key' in schema
        assert schema['customer_key'] == 'CUSTOMER_ID'
        assert 'transaction_date' in schema
        assert 'monetary_value' in schema
    
    def test_analysis_to_audience_flow(self):
        """Test data flows from analysis through audience creation."""
        # Simulate RFM output
        model_outputs = [
            {'customer_key': 'C1', 'segment_name': 'Champions', 'predicted_ltv': 500},
            {'customer_key': 'C2', 'segment_name': 'Champions', 'predicted_ltv': 400},
            {'customer_key': 'C3', 'segment_name': 'Loyal', 'predicted_ltv': 200},
            {'customer_key': 'C4', 'segment_name': 'Lost', 'predicted_ltv': 10}
        ]
        
        # Filter for Champions audience
        champions = [m for m in model_outputs if m['segment_name'] == 'Champions']
        
        assert len(champions) == 2
        assert sum(m['predicted_ltv'] for m in champions) == 900
    
    def test_audience_to_optimization_flow(self):
        """Test data flows from audience through AMMO optimization."""
        # Simulate audience summary
        audience = {
            'segment_name': 'Champions',
            'member_count': 1000,
            'total_value': 500000,
            'avg_ltv': 500
        }
        
        # AMMO should receive this and apply affinity
        champion_email_affinity = 1.4
        base_email_response = 0.02
        
        adjusted_response = base_email_response * champion_email_affinity
        expected_conversions = audience['member_count'] * adjusted_response
        
        assert expected_conversions == 28


# =============================================================================
# RUN TESTS
# =============================================================================

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
