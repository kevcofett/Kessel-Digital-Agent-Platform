# MPA Test Data

This directory contains test data derived from real-world ecommerce customer and marketing data for validating MPA (Media Planning Agent) responses.

## Data Sources

The test data was derived from two uploaded Excel files:
- `Topo_P_L_Forecast_Model_01042021_.xlsx` - P&L forecast model with Name Flow cohorts, NCA metrics, GA attribution
- `customer_analytics_export-3.xlsm` - Customer-level analytics with RFM data (13,879 customers)

## Files

### mpa_customer_rfm_test_data.csv
Anonymized customer RFM (Recency, Frequency, Monetary) scores and segments.
- 220+ representative customer records
- Fields: customer_id, days_since_acquired, days_since_last_order, order_count, average_order_size, days_between_orders, lifetime_value, r_score, f_score, m_score, rfm_segment
- Segments: Champions, Loyal Customers, Big Spenders, New Customers, At Risk, Hibernating, Potential Loyalists

### mpa_ga_attribution_test_data.csv
Google Analytics attribution data showing new vs returning customer behavior.
- 36 monthly records (Jan 2019 - Dec 2019)
- Fields: month, segment (All/New/Returning), transactions, transaction_pct, revenue, revenue_pct, aos

### mpa_cohort_retention_test_data.csv
Year-over-year customer cohort retention rates.
- 6 annual cohorts (2014-2019)
- Fields: cohort_year, customers_acquired, retained_year_1 through retained_year_5

### mpa_nca_metrics_test_data.json
New Customer Acquisition efficiency metrics.
- FY18 gross sales, acquired customers, orders, AOS
- Calculated CAC and orders per customer
- New vs returning revenue shares

### mpa_test_data_summary.json
Summary statistics for test scenario validation.
- Total customers analyzed: 13,879
- Segment distributions (recency, frequency, monetary)
- Marketing metrics (new vs returning)
- Cohort retention rates
- Total and average LTV

### mpa_ecommerce_test_scenarios.json
Five real-data-based MPA test scenarios:
1. **ecommerce_rfm_reactivation** - Dormant customer reactivation budget allocation
2. **new_vs_returning_attribution** - Channel mix based on customer type contribution
3. **cohort_retention_optimization** - Media strategies for improving retention
4. **high_value_segment_targeting** - Lookalike audience creation for VIP customers
5. **seasonal_planning_with_cohorts** - Q1 retention of Q4-acquired customers

## Usage

These files support Braintrust evaluation tests for:
- RFM-based audience targeting validation
- Retention vs acquisition budget guidance
- Customer lifetime value calculations
- Cohort analysis recommendations
- Channel mix optimization based on customer segments

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Customers | 13,879 |
| Average LTV | $396.51 |
| Dormant Rate | 20.8% |
| VIP Rate (10+ orders) | 19.2% |
| New Customer Revenue Share | 36% |
| Returning Customer Revenue Share | 64% |
| Cohort Retention (2018→2019) | 21.0% |
