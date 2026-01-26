#!/bin/bash
# Download ADIS test datasets
# Run from the test-data directory

set -e

echo "Downloading ADIS test datasets..."

# UCI Online Retail (CC BY 4.0)
echo "1/5 Downloading UCI Online Retail dataset..."
curl -L -o online_retail.xlsx "https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx"

# Convert Excel to CSV
echo "   Converting Excel to CSV..."
python3 -c "
import pandas as pd
df = pd.read_excel('online_retail.xlsx')
df.to_csv('online_retail_transactions.csv', index=False)
print(f'   Saved {len(df)} records to online_retail_transactions.csv')
"

# Bank Churn (Kaggle)
echo "2/5 Downloading Bank Churn dataset..."
curl -L -o bank_churn.csv "https://raw.githubusercontent.com/selva86/datasets/master/Churn_Modelling.csv"

# Credit Card Customers (Kaggle)
echo "3/5 Downloading Credit Card Customers dataset..."
curl -L -o credit_card_customers.csv "https://raw.githubusercontent.com/azar-s91/dataset/master/BankChurners.csv"

# Retail Customer Shopping Trends (Kaggle)
echo "4/5 Downloading Retail Customer Shopping Trends dataset..."
curl -L -o retail_customer_shopping_trends.csv "https://raw.githubusercontent.com/nileshely/Customer-Shopping-Trends/main/shopping_trends.csv"

# Telco Churn (IBM)
echo "5/5 Downloading Telco Churn dataset..."
curl -L -o telco_churn.csv "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv"

echo ""
echo "Download complete! Files:"
ls -lh *.csv *.xlsx 2>/dev/null || true

echo ""
echo "Dataset summary:"
for f in *.csv; do
  count=$(wc -l < "$f")
  echo "  $f: $((count-1)) records"
done
