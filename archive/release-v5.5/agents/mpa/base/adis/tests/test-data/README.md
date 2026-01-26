# ADIS Test Data

Public datasets for testing Audience Data Intelligence System (ADIS) functionality.

## Datasets

### Transaction Data (for RFM Analysis)

| File | Records | Columns | Source | Use Case |
|------|---------|---------|--------|----------|
| `online_retail_transactions.csv` | 541,909 | InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country | UCI ML Repository | RFM segmentation, transaction analysis |
| `online_retail.xlsx` | 541,909 | Same as above (original Excel format) | UCI ML Repository | Original source file |

### Full Customer Files - Retail

| File | Records | Key Columns | Source | Use Case |
|------|---------|-------------|--------|----------|
| `retail_customer_shopping_trends.csv` | 3,900 | Customer ID, Age, Gender, Category, Purchase Amount, Location, Season, Review Rating, Subscription Status, Payment Method, Previous Purchases, Frequency | Kaggle | Customer profiling, segmentation, purchase behavior |

### Full Customer Files - Banking/Financial

| File | Records | Key Columns | Source | Use Case |
|------|---------|-------------|--------|----------|
| `bank_churn.csv` | 10,000 | CustomerId, CreditScore, Geography, Gender, Age, Tenure, Balance, NumOfProducts, HasCrCard, IsActiveMember, EstimatedSalary, Exited | Kaggle | Bank customer segmentation, churn prediction |
| `credit_card_customers.csv` | 10,127 | CLIENTNUM, Customer_Age, Gender, Dependent_count, Education_Level, Marital_Status, Income_Category, Card_Category, Credit_Limit, Total_Trans_Amt, Total_Trans_Ct, Avg_Utilization_Ratio, Attrition_Flag | Kaggle | Credit card customer profiling, CLV, churn analysis |

### Subscription Data (for CLV Analysis)

| File | Records | Key Columns | Source | Use Case |
|------|---------|-------------|--------|----------|
| `telco_churn.csv` | 7,043 | customerID, gender, SeniorCitizen, tenure, Contract, MonthlyCharges, TotalCharges, Churn | IBM/Kaggle | CLV prediction, subscription churn analysis |

## Dataset Details

### online_retail_transactions.csv
- **Source**: UCI Machine Learning Repository (CC BY 4.0)
- **Description**: UK-based online retail transactions from 2010-2011
- **Best for**: RFM analysis testing - has CustomerID, InvoiceDate, and transaction amounts
- **Note**: Some CustomerID values are null (~25%), filter these for RFM

### retail_customer_shopping_trends.csv
- **Source**: Kaggle (synthetic dataset)
- **Description**: Customer shopping preferences with demographics
- **Best for**: Customer profiling, demographic segmentation
- **Note**: Includes Previous Purchases and Frequency columns useful for behavior analysis

### bank_churn.csv
- **Source**: Kaggle (synthetic based on real patterns)
- **Description**: Bank customers with demographics and account info
- **Best for**: Full customer file example for banking vertical
- **Note**: Includes CreditScore, Geography, Balance - good for value segmentation

### credit_card_customers.csv
- **Source**: Kaggle / LEAPS Analyttica
- **Description**: Credit card customers with full demographic and transaction summary
- **Best for**: Banking CLV analysis, income-based segmentation
- **Note**: Rich demographic data (Education, Marital Status, Income Category)

### telco_churn.csv
- **Source**: IBM via Kaggle
- **Description**: Telecom subscription data with services and billing
- **Best for**: CLV/subscription analysis, probabilistic modeling
- **Note**: Has tenure, MonthlyCharges, TotalCharges for CLV calculations

## Column Mappings for ADIS

### RFM Analysis Requirements
| Required Field | online_retail | retail_shopping_trends |
|----------------|---------------|------------------------|
| customer_id | CustomerID | Customer ID |
| transaction_date | InvoiceDate | (not available) |
| transaction_amount | UnitPrice * Quantity | Purchase Amount (USD) |

### CLV Analysis Requirements
| Required Field | telco_churn | credit_card_customers |
|----------------|-------------|----------------------|
| customer_id | customerID | CLIENTNUM |
| tenure/months | tenure | Months_on_book |
| monthly_value | MonthlyCharges | Total_Trans_Amt / 12 |
| churn_flag | Churn | Attrition_Flag |

## Licenses

- **UCI Online Retail**: CC BY 4.0
- **Kaggle Datasets**: Public domain / Open Database License
- **IBM Telco**: Sample data for educational use

## Usage in Tests

```python
import pandas as pd

# Load transaction data for RFM
transactions = pd.read_csv('online_retail_transactions.csv')
transactions = transactions.dropna(subset=['CustomerID'])  # Remove nulls

# Load customer file for banking
bank_customers = pd.read_csv('credit_card_customers.csv')

# Load subscription data for CLV
subscriptions = pd.read_csv('telco_churn.csv')
```
