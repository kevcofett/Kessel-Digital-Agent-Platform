# ADIS Analysis Engine Azure Function
# Version: 1.0
# Purpose: Execute analytical models (RFM, CLV, Decile, Cohort, Clustering)

import azure.functions as func
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd
from dataclasses import dataclass, asdict

app = func.FunctionApp()

# =============================================================================
# CONFIGURATION
# =============================================================================

RFM_SEGMENTS = {
    '555': 'Champions',
    '554': 'Champions',
    '544': 'Champions',
    '545': 'Champions',
    '454': 'Champions',
    '455': 'Champions',
    '445': 'Champions',
    '543': 'Loyal Customers',
    '444': 'Loyal Customers',
    '435': 'Loyal Customers',
    '355': 'Loyal Customers',
    '354': 'Loyal Customers',
    '345': 'Loyal Customers',
    '344': 'Loyal Customers',
    '335': 'Loyal Customers',
    '553': 'Potential Loyalists',
    '551': 'Potential Loyalists',
    '552': 'Potential Loyalists',
    '541': 'Potential Loyalists',
    '542': 'Potential Loyalists',
    '533': 'Potential Loyalists',
    '532': 'Potential Loyalists',
    '531': 'Potential Loyalists',
    '452': 'Potential Loyalists',
    '451': 'Potential Loyalists',
    '442': 'Potential Loyalists',
    '441': 'Potential Loyalists',
    '431': 'Potential Loyalists',
    '453': 'Potential Loyalists',
    '433': 'Potential Loyalists',
    '432': 'Potential Loyalists',
    '423': 'Potential Loyalists',
    '353': 'Potential Loyalists',
    '352': 'Potential Loyalists',
    '351': 'Potential Loyalists',
    '342': 'Potential Loyalists',
    '341': 'Potential Loyalists',
    '333': 'Potential Loyalists',
    '323': 'Potential Loyalists',
    '512': 'New Customers',
    '511': 'New Customers',
    '422': 'New Customers',
    '421': 'New Customers',
    '412': 'New Customers',
    '411': 'New Customers',
    '311': 'New Customers',
    '525': 'Promising',
    '524': 'Promising',
    '523': 'Promising',
    '522': 'Promising',
    '521': 'Promising',
    '515': 'Promising',
    '514': 'Promising',
    '513': 'Promising',
    '425': 'Promising',
    '424': 'Promising',
    '413': 'Promising',
    '414': 'Promising',
    '415': 'Promising',
    '315': 'Promising',
    '314': 'Promising',
    '313': 'Promising',
    '535': 'Customers Needing Attention',
    '534': 'Customers Needing Attention',
    '443': 'Customers Needing Attention',
    '434': 'Customers Needing Attention',
    '343': 'Customers Needing Attention',
    '334': 'Customers Needing Attention',
    '325': 'Customers Needing Attention',
    '324': 'Customers Needing Attention',
    '245': 'About To Sleep',
    '244': 'About To Sleep',
    '243': 'About To Sleep',
    '242': 'About To Sleep',
    '235': 'About To Sleep',
    '234': 'About To Sleep',
    '225': 'About To Sleep',
    '224': 'About To Sleep',
    '153': 'About To Sleep',
    '152': 'About To Sleep',
    '145': 'About To Sleep',
    '143': 'About To Sleep',
    '142': 'About To Sleep',
    '135': 'About To Sleep',
    '134': 'About To Sleep',
    '133': 'About To Sleep',
    '125': 'About To Sleep',
    '124': 'About To Sleep',
    '155': 'At Risk',
    '154': 'At Risk',
    '144': 'At Risk',
    '214': 'At Risk',
    '215': 'At Risk',
    '115': 'At Risk',
    '114': 'At Risk',
    '113': 'At Risk',
    '255': "Can't Lose Them",
    '254': "Can't Lose Them",
    '253': "Can't Lose Them",
    '252': "Can't Lose Them",
    '251': "Can't Lose Them",
    '241': "Can't Lose Them",
    '233': 'Hibernating',
    '232': 'Hibernating',
    '223': 'Hibernating',
    '222': 'Hibernating',
    '132': 'Hibernating',
    '123': 'Hibernating',
    '122': 'Hibernating',
    '212': 'Hibernating',
    '211': 'Hibernating',
    '111': 'Lost',
    '112': 'Lost',
    '121': 'Lost',
    '131': 'Lost',
    '141': 'Lost',
    '151': 'Lost',
    '213': 'Lost',
    '221': 'Lost',
    '231': 'Lost',
    '312': 'Lost',
    '321': 'Lost',
    '331': 'Lost',
    '332': 'Lost',
    '322': 'Lost',
}

# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class RFMResult:
    customer_key: str
    recency_days: int
    frequency: int
    monetary: float
    r_score: int
    f_score: int
    m_score: int
    rfm_combined: str
    segment_name: str
    percentile: int

@dataclass
class ModelRunResult:
    model_run_id: str
    model_type: str
    status: str
    records_processed: int
    segments_created: int
    duration_seconds: float
    metrics: Dict[str, Any]
    outputs: List[Dict[str, Any]]

# =============================================================================
# MAIN FUNCTION ENDPOINTS
# =============================================================================

@app.route(route="run-analysis", methods=["POST"])
async def run_analysis(req: func.HttpRequest) -> func.HttpResponse:
    """
    Main endpoint for running analytical models.
    """
    logging.info('ADIS Analysis Engine: Processing request')
    start_time = datetime.utcnow()
    
    try:
        body = req.get_json()
        
        model_type = body.get('model_type', 'RFM')
        model_run_id = body.get('model_run_id', f'run_{datetime.utcnow().strftime("%Y%m%d%H%M%S")}')
        parameters = body.get('parameters', {})
        data = body.get('data', [])
        
        if not data:
            return func.HttpResponse(
                json.dumps({'error': 'No data provided'}),
                status_code=400,
                mimetype='application/json'
            )
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Route to appropriate model
        model_map = {
            'RFM': run_rfm_analysis,
            'DECILE': run_decile_analysis,
            'COHORT': run_cohort_analysis,
            'CLV_DETERMINISTIC': run_deterministic_clv,
            'CLV_BGNBD': run_probabilistic_clv,
            'CLUSTERING_KMEANS': run_kmeans_clustering,
        }
        
        model_func = model_map.get(model_type)
        if not model_func:
            return func.HttpResponse(
                json.dumps({'error': f'Unknown model type: {model_type}'}),
                status_code=400,
                mimetype='application/json'
            )
        
        # Run the model
        result = model_func(df, parameters, model_run_id)
        
        # Calculate duration
        duration = (datetime.utcnow() - start_time).total_seconds()
        result['duration_seconds'] = duration
        
        return func.HttpResponse(
            json.dumps(result, default=str),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'ADIS Analysis Engine error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e), 'status': 'FAILED'}),
            status_code=500,
            mimetype='application/json'
        )


# =============================================================================
# RFM ANALYSIS
# =============================================================================

def run_rfm_analysis(df: pd.DataFrame, params: Dict, model_run_id: str) -> Dict[str, Any]:
    """
    Execute RFM (Recency, Frequency, Monetary) analysis.
    
    Required columns:
    - customer_key: Unique customer identifier
    - transaction_date: Date of transaction
    - monetary_value: Transaction amount
    
    Optional parameters:
    - analysis_date: Reference date for recency (default: max date + 1 day)
    - quintile_method: 'rank' or 'quantile' (default: 'rank')
    """
    logging.info(f'Running RFM analysis on {len(df)} records')
    
    # Identify columns
    customer_col = params.get('customer_column', 'customer_key')
    date_col = params.get('date_column', 'transaction_date')
    monetary_col = params.get('monetary_column', 'monetary_value')
    
    # Validate columns exist
    required_cols = [customer_col, date_col, monetary_col]
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        return {'error': f'Missing required columns: {missing_cols}', 'status': 'FAILED'}
    
    # Convert date column
    df[date_col] = pd.to_datetime(df[date_col])
    
    # Set analysis date
    analysis_date = params.get('analysis_date')
    if analysis_date:
        analysis_date = pd.to_datetime(analysis_date)
    else:
        analysis_date = df[date_col].max() + timedelta(days=1)
    
    # Calculate RFM metrics per customer
    rfm_df = df.groupby(customer_col).agg({
        date_col: lambda x: (analysis_date - x.max()).days,  # Recency
        monetary_col: ['count', 'sum']  # Frequency and Monetary
    }).reset_index()
    
    # Flatten column names
    rfm_df.columns = [customer_col, 'recency', 'frequency', 'monetary']
    
    # Calculate quintile scores (1-5, where 5 is best)
    # For Recency, lower is better so we reverse
    rfm_df['r_score'] = pd.qcut(rfm_df['recency'], q=5, labels=[5, 4, 3, 2, 1], duplicates='drop').astype(int)
    rfm_df['f_score'] = pd.qcut(rfm_df['frequency'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5], duplicates='drop').astype(int)
    rfm_df['m_score'] = pd.qcut(rfm_df['monetary'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5], duplicates='drop').astype(int)
    
    # Combined RFM score
    rfm_df['rfm_combined'] = rfm_df['r_score'].astype(str) + rfm_df['f_score'].astype(str) + rfm_df['m_score'].astype(str)
    
    # Map to segment names
    rfm_df['segment_name'] = rfm_df['rfm_combined'].map(RFM_SEGMENTS).fillna('Other')
    
    # Calculate percentile
    rfm_df['rfm_score'] = rfm_df['r_score'] + rfm_df['f_score'] + rfm_df['m_score']
    rfm_df['percentile'] = pd.qcut(rfm_df['rfm_score'].rank(method='first'), q=100, labels=range(1, 101), duplicates='drop').astype(int)
    
    # Segment summary
    segment_summary = rfm_df.groupby('segment_name').agg({
        customer_col: 'count',
        'monetary': 'sum',
        'frequency': 'mean',
        'recency': 'mean'
    }).reset_index()
    segment_summary.columns = ['segment', 'customer_count', 'total_value', 'avg_frequency', 'avg_recency']
    segment_summary['pct_of_customers'] = (segment_summary['customer_count'] / len(rfm_df) * 100).round(2)
    segment_summary['pct_of_value'] = (segment_summary['total_value'] / rfm_df['monetary'].sum() * 100).round(2)
    
    # Build output
    outputs = []
    for _, row in rfm_df.iterrows():
        outputs.append({
            'customer_key': row[customer_col],
            'recency_days': int(row['recency']),
            'frequency': int(row['frequency']),
            'monetary': float(row['monetary']),
            'r_score': int(row['r_score']),
            'f_score': int(row['f_score']),
            'm_score': int(row['m_score']),
            'rfm_combined': row['rfm_combined'],
            'segment_code': row['rfm_combined'],
            'segment_name': row['segment_name'],
            'percentile': int(row['percentile']),
            'score_primary': int(row['rfm_score'])
        })
    
    return {
        'model_run_id': model_run_id,
        'model_type': 'RFM',
        'status': 'COMPLETED',
        'records_processed': len(df),
        'customers_analyzed': len(rfm_df),
        'segments_created': rfm_df['segment_name'].nunique(),
        'analysis_date': str(analysis_date),
        'metrics': {
            'segment_distribution': segment_summary.to_dict(orient='records'),
            'avg_recency': float(rfm_df['recency'].mean()),
            'avg_frequency': float(rfm_df['frequency'].mean()),
            'avg_monetary': float(rfm_df['monetary'].mean()),
            'total_monetary': float(rfm_df['monetary'].sum()),
            'top_segment': segment_summary.loc[segment_summary['total_value'].idxmax(), 'segment'],
            'value_concentration': {
                'top_20_pct_customers': float(rfm_df.nlargest(int(len(rfm_df) * 0.2), 'monetary')['monetary'].sum() / rfm_df['monetary'].sum() * 100)
            }
        },
        'outputs': outputs
    }


# =============================================================================
# DECILE ANALYSIS
# =============================================================================

def run_decile_analysis(df: pd.DataFrame, params: Dict, model_run_id: str) -> Dict[str, Any]:
    """
    Execute Decile analysis for value-based customer stratification.
    """
    logging.info(f'Running Decile analysis on {len(df)} records')
    
    customer_col = params.get('customer_column', 'customer_key')
    value_col = params.get('value_column', 'monetary_value')
    
    # Aggregate by customer if needed
    if customer_col in df.columns:
        customer_df = df.groupby(customer_col)[value_col].sum().reset_index()
    else:
        customer_df = df[[value_col]].copy()
        customer_df[customer_col] = range(len(customer_df))
    
    # Calculate deciles (1 = lowest, 10 = highest)
    customer_df['decile'] = pd.qcut(customer_df[value_col].rank(method='first'), q=10, labels=range(1, 11)).astype(int)
    
    # Calculate percentile
    customer_df['percentile'] = pd.qcut(customer_df[value_col].rank(method='first'), q=100, labels=range(1, 101)).astype(int)
    
    # Decile summary
    decile_summary = customer_df.groupby('decile').agg({
        customer_col: 'count',
        value_col: ['sum', 'mean', 'min', 'max']
    }).reset_index()
    decile_summary.columns = ['decile', 'customer_count', 'total_value', 'avg_value', 'min_value', 'max_value']
    
    total_value = customer_df[value_col].sum()
    decile_summary['pct_of_value'] = (decile_summary['total_value'] / total_value * 100).round(2)
    decile_summary['cumulative_pct'] = decile_summary['pct_of_value'].cumsum().round(2)
    
    # Build outputs
    outputs = []
    for _, row in customer_df.iterrows():
        outputs.append({
            'customer_key': str(row[customer_col]),
            'monetary': float(row[value_col]),
            'decile': int(row['decile']),
            'percentile': int(row['percentile']),
            'segment_code': f'D{row["decile"]:02d}',
            'segment_name': f'Decile {row["decile"]}'
        })
    
    return {
        'model_run_id': model_run_id,
        'model_type': 'DECILE',
        'status': 'COMPLETED',
        'records_processed': len(df),
        'customers_analyzed': len(customer_df),
        'segments_created': 10,
        'metrics': {
            'decile_distribution': decile_summary.to_dict(orient='records'),
            'total_value': float(total_value),
            'avg_value': float(customer_df[value_col].mean()),
            'pareto_ratio': float(decile_summary[decile_summary['decile'] >= 9]['pct_of_value'].sum()),  # Top 20%
            'gini_coefficient': calculate_gini(customer_df[value_col].values)
        },
        'outputs': outputs
    }


def calculate_gini(values: np.ndarray) -> float:
    """Calculate Gini coefficient for inequality measurement."""
    sorted_values = np.sort(values)
    n = len(values)
    cumulative = np.cumsum(sorted_values)
    return (2 * np.sum((np.arange(1, n + 1) * sorted_values)) / (n * np.sum(sorted_values))) - (n + 1) / n


# =============================================================================
# COHORT ANALYSIS
# =============================================================================

def run_cohort_analysis(df: pd.DataFrame, params: Dict, model_run_id: str) -> Dict[str, Any]:
    """
    Execute Cohort analysis for retention measurement.
    """
    logging.info(f'Running Cohort analysis on {len(df)} records')
    
    customer_col = params.get('customer_column', 'customer_key')
    date_col = params.get('date_column', 'transaction_date')
    cohort_period = params.get('cohort_period', 'M')  # M=month, W=week, Q=quarter
    
    df[date_col] = pd.to_datetime(df[date_col])
    
    # Determine cohort for each customer (first transaction date)
    cohort_df = df.groupby(customer_col)[date_col].min().reset_index()
    cohort_df.columns = [customer_col, 'cohort_date']
    cohort_df['cohort'] = cohort_df['cohort_date'].dt.to_period(cohort_period)
    
    # Merge back to transactions
    df = df.merge(cohort_df[[customer_col, 'cohort']], on=customer_col)
    df['transaction_period'] = df[date_col].dt.to_period(cohort_period)
    
    # Calculate period number (0 = cohort period)
    df['period_number'] = (df['transaction_period'] - df['cohort']).apply(lambda x: x.n if hasattr(x, 'n') else 0)
    
    # Build retention matrix
    cohort_pivot = df.groupby(['cohort', 'period_number'])[customer_col].nunique().unstack(fill_value=0)
    
    # Calculate retention rates
    cohort_sizes = cohort_pivot[0]
    retention_matrix = cohort_pivot.divide(cohort_sizes, axis=0) * 100
    
    # Summary metrics
    avg_retention = {}
    for period in range(min(12, len(retention_matrix.columns))):
        if period in retention_matrix.columns:
            avg_retention[f'period_{period}'] = float(retention_matrix[period].mean())
    
    outputs = []
    for cohort in cohort_df['cohort'].unique():
        cohort_customers = cohort_df[cohort_df['cohort'] == cohort][customer_col].tolist()
        for cust in cohort_customers:
            outputs.append({
                'customer_key': str(cust),
                'segment_code': str(cohort),
                'segment_name': f'Cohort {cohort}'
            })
    
    return {
        'model_run_id': model_run_id,
        'model_type': 'COHORT',
        'status': 'COMPLETED',
        'records_processed': len(df),
        'customers_analyzed': cohort_df[customer_col].nunique(),
        'segments_created': len(cohort_df['cohort'].unique()),
        'metrics': {
            'cohort_sizes': cohort_sizes.to_dict(),
            'retention_rates': retention_matrix.to_dict(),
            'avg_retention_by_period': avg_retention,
            'overall_retention_month_1': avg_retention.get('period_1', 0),
            'overall_retention_month_3': avg_retention.get('period_3', 0),
            'overall_retention_month_6': avg_retention.get('period_6', 0),
            'overall_retention_month_12': avg_retention.get('period_12', 0)
        },
        'outputs': outputs
    }


# =============================================================================
# DETERMINISTIC CLV
# =============================================================================

def run_deterministic_clv(df: pd.DataFrame, params: Dict, model_run_id: str) -> Dict[str, Any]:
    """
    Calculate deterministic Customer Lifetime Value.
    Formula: CLV = (AOV × Purchase Frequency × Customer Lifespan) × Margin
    """
    logging.info(f'Running Deterministic CLV on {len(df)} records')
    
    customer_col = params.get('customer_column', 'customer_key')
    value_col = params.get('value_column', 'monetary_value')
    date_col = params.get('date_column', 'transaction_date')
    
    margin = params.get('margin', 0.3)  # Default 30% margin
    lifespan_years = params.get('lifespan_years', 3)  # Default 3 year lifespan
    
    df[date_col] = pd.to_datetime(df[date_col])
    
    # Calculate per-customer metrics
    customer_df = df.groupby(customer_col).agg({
        value_col: ['count', 'sum', 'mean'],
        date_col: ['min', 'max']
    }).reset_index()
    customer_df.columns = [customer_col, 'frequency', 'total_value', 'avg_order_value', 'first_date', 'last_date']
    
    # Calculate customer tenure in years
    customer_df['tenure_days'] = (customer_df['last_date'] - customer_df['first_date']).dt.days
    customer_df['tenure_years'] = customer_df['tenure_days'] / 365.25
    customer_df['tenure_years'] = customer_df['tenure_years'].clip(lower=0.1)  # Minimum tenure
    
    # Purchase frequency per year
    customer_df['annual_frequency'] = customer_df['frequency'] / customer_df['tenure_years']
    
    # CLV calculation
    customer_df['predicted_ltv'] = (
        customer_df['avg_order_value'] * 
        customer_df['annual_frequency'] * 
        lifespan_years * 
        margin
    )
    
    # Calculate confidence bounds (±20% for deterministic)
    customer_df['predicted_ltv_lower'] = customer_df['predicted_ltv'] * 0.8
    customer_df['predicted_ltv_upper'] = customer_df['predicted_ltv'] * 1.2
    
    # Decile by predicted LTV
    customer_df['decile'] = pd.qcut(customer_df['predicted_ltv'].rank(method='first'), q=10, labels=range(1, 11)).astype(int)
    
    outputs = []
    for _, row in customer_df.iterrows():
        outputs.append({
            'customer_key': str(row[customer_col]),
            'predicted_ltv': float(row['predicted_ltv']),
            'predicted_ltv_lower': float(row['predicted_ltv_lower']),
            'predicted_ltv_upper': float(row['predicted_ltv_upper']),
            'frequency': int(row['frequency']),
            'monetary': float(row['total_value']),
            'avg_order_value': float(row['avg_order_value']),
            'tenure_years': float(row['tenure_years']),
            'decile': int(row['decile']),
            'segment_code': f'LTV_D{row["decile"]:02d}',
            'segment_name': f'LTV Decile {row["decile"]}'
        })
    
    return {
        'model_run_id': model_run_id,
        'model_type': 'CLV_DETERMINISTIC',
        'status': 'COMPLETED',
        'records_processed': len(df),
        'customers_analyzed': len(customer_df),
        'segments_created': 10,
        'parameters': {
            'margin': margin,
            'lifespan_years': lifespan_years
        },
        'metrics': {
            'total_predicted_ltv': float(customer_df['predicted_ltv'].sum()),
            'avg_predicted_ltv': float(customer_df['predicted_ltv'].mean()),
            'median_predicted_ltv': float(customer_df['predicted_ltv'].median()),
            'ltv_std': float(customer_df['predicted_ltv'].std()),
            'avg_aov': float(customer_df['avg_order_value'].mean()),
            'avg_frequency': float(customer_df['frequency'].mean()),
            'avg_tenure_years': float(customer_df['tenure_years'].mean())
        },
        'outputs': outputs
    }


# =============================================================================
# PROBABILISTIC CLV (BG/NBD Placeholder)
# =============================================================================

def run_probabilistic_clv(df: pd.DataFrame, params: Dict, model_run_id: str) -> Dict[str, Any]:
    """
    Probabilistic CLV using BG/NBD model (requires lifetimes library).
    Falls back to deterministic if lifetimes not available.
    """
    try:
        from lifetimes import BetaGeoFitter, GammaGammaFitter
        from lifetimes.utils import summary_data_from_transaction_data
        
        logging.info('Running Probabilistic CLV with BG/NBD')
        
        customer_col = params.get('customer_column', 'customer_key')
        date_col = params.get('date_column', 'transaction_date')
        value_col = params.get('value_column', 'monetary_value')
        
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Prepare summary data for lifetimes
        summary = summary_data_from_transaction_data(
            df, customer_col, date_col, monetary_value_col=value_col
        )
        
        # Fit BG/NBD model
        bgf = BetaGeoFitter(penalizer_coef=0.001)
        bgf.fit(summary['frequency'], summary['recency'], summary['T'])
        
        # Predict future transactions
        summary['predicted_purchases'] = bgf.predict(
            params.get('prediction_period', 365),  # Default 1 year
            summary['frequency'],
            summary['recency'],
            summary['T']
        )
        
        # Fit Gamma-Gamma for monetary value
        returning_customers = summary[summary['frequency'] > 0]
        if len(returning_customers) > 10:
            ggf = GammaGammaFitter(penalizer_coef=0.001)
            ggf.fit(returning_customers['frequency'], returning_customers['monetary_value'])
            
            summary['predicted_monetary'] = ggf.conditional_expected_average_profit(
                summary['frequency'],
                summary['monetary_value']
            )
            
            # Calculate CLV
            summary['predicted_ltv'] = ggf.customer_lifetime_value(
                bgf,
                summary['frequency'],
                summary['recency'],
                summary['T'],
                summary['monetary_value'],
                time=12,  # months
                discount_rate=0.01
            )
        else:
            summary['predicted_ltv'] = summary['predicted_purchases'] * summary['monetary_value']
        
        # Calculate probability alive
        summary['prob_alive'] = bgf.conditional_probability_alive(
            summary['frequency'],
            summary['recency'],
            summary['T']
        )
        
        outputs = []
        for customer_key, row in summary.iterrows():
            outputs.append({
                'customer_key': str(customer_key),
                'predicted_ltv': float(row['predicted_ltv']),
                'predicted_purchases': float(row['predicted_purchases']),
                'prob_alive': float(row['prob_alive']),
                'frequency': int(row['frequency']),
                'recency': float(row['recency']),
                'T': float(row['T']),
                'monetary': float(row.get('monetary_value', 0))
            })
        
        return {
            'model_run_id': model_run_id,
            'model_type': 'CLV_BGNBD',
            'status': 'COMPLETED',
            'records_processed': len(df),
            'customers_analyzed': len(summary),
            'segments_created': 0,
            'metrics': {
                'total_predicted_ltv': float(summary['predicted_ltv'].sum()),
                'avg_predicted_ltv': float(summary['predicted_ltv'].mean()),
                'avg_prob_alive': float(summary['prob_alive'].mean()),
                'model_params': {
                    'bgf_r': float(bgf.params_['r']),
                    'bgf_alpha': float(bgf.params_['alpha']),
                    'bgf_a': float(bgf.params_['a']),
                    'bgf_b': float(bgf.params_['b'])
                }
            },
            'outputs': outputs
        }
        
    except ImportError:
        logging.warning('lifetimes library not available, falling back to deterministic CLV')
        return run_deterministic_clv(df, params, model_run_id)


# =============================================================================
# K-MEANS CLUSTERING
# =============================================================================

def run_kmeans_clustering(df: pd.DataFrame, params: Dict, model_run_id: str) -> Dict[str, Any]:
    """
    Execute K-Means clustering for behavioral segmentation.
    """
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler
    
    logging.info(f'Running K-Means clustering on {len(df)} records')
    
    customer_col = params.get('customer_column', 'customer_key')
    feature_cols = params.get('feature_columns', [])
    n_clusters = params.get('n_clusters', 5)
    
    # If no features specified, use all numeric columns
    if not feature_cols:
        feature_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if customer_col in feature_cols:
            feature_cols.remove(customer_col)
    
    if len(feature_cols) < 2:
        return {'error': 'At least 2 numeric features required for clustering', 'status': 'FAILED'}
    
    # Prepare feature matrix
    X = df[feature_cols].fillna(0).values
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Fit K-Means
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['cluster_id'] = kmeans.fit_predict(X_scaled)
    
    # Calculate distance to centroid
    df['cluster_distance'] = np.min(kmeans.transform(X_scaled), axis=1)
    
    # Cluster summary
    cluster_summary = df.groupby('cluster_id')[feature_cols].mean().reset_index()
    cluster_counts = df['cluster_id'].value_counts().to_dict()
    
    # Calculate silhouette score
    try:
        from sklearn.metrics import silhouette_score
        silhouette = silhouette_score(X_scaled, df['cluster_id'])
    except:
        silhouette = 0
    
    outputs = []
    for _, row in df.iterrows():
        output = {
            'cluster_id': int(row['cluster_id']),
            'cluster_distance': float(row['cluster_distance']),
            'segment_code': f'C{row["cluster_id"]:02d}',
            'segment_name': f'Cluster {row["cluster_id"]}'
        }
        if customer_col in df.columns:
            output['customer_key'] = str(row[customer_col])
        outputs.append(output)
    
    return {
        'model_run_id': model_run_id,
        'model_type': 'CLUSTERING_KMEANS',
        'status': 'COMPLETED',
        'records_processed': len(df),
        'customers_analyzed': len(df),
        'segments_created': n_clusters,
        'parameters': {
            'n_clusters': n_clusters,
            'feature_columns': feature_cols
        },
        'metrics': {
            'silhouette_score': float(silhouette),
            'inertia': float(kmeans.inertia_),
            'cluster_sizes': cluster_counts,
            'cluster_centroids': cluster_summary.to_dict(orient='records')
        },
        'outputs': outputs
    }


# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.route(route="health", methods=["GET"])
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint."""
    return func.HttpResponse(
        json.dumps({
            'status': 'healthy',
            'service': 'ADIS Analysis Engine',
            'version': '1.0',
            'timestamp': datetime.utcnow().isoformat(),
            'models': ['RFM', 'DECILE', 'COHORT', 'CLV_DETERMINISTIC', 'CLV_BGNBD', 'CLUSTERING_KMEANS']
        }),
        status_code=200,
        mimetype='application/json'
    )
