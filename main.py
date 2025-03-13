# filepath: stock-market-analysis/main.py
import os
import pandas as pd
from openai import OpenAI
from tqdm import tqdm

# Instantiate OpenAI client
client = OpenAI(api_key=os.environ["OPEN_AI_KEY"])

# Load datasets
nasdaq100 = pd.read_csv("data/nasdaq100.csv")
price_change = pd.read_csv("data/nasdaq100_price_change.csv")

# Merge the datasets on the "symbol" column
nasdaq100 = nasdaq100.merge(price_change[["symbol", "ytd"]], on="symbol", how="inner")

# Function to classify a company into a sector using OpenAI
def classify_sector(company):
    prompt = f'''Classify company {company} into one of the following sectors. Answer only with the sector name: 
    Technology, Consumer Cyclical, Industrials, Utilities, Healthcare, Communication, Energy, Consumer Defensive, Real Estate, Financial.'''
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"Error classifying {company}: {e}")
        return "Unknown"

# Apply classification to all companies with a progress bar
tqdm.pandas(desc="Classifying Sectors")
nasdaq100["Sector"] = nasdaq100["symbol"].progress_apply(classify_sector)

# Count the number of companies per sector
sector_counts = nasdaq100["Sector"].value_counts()
print("\nSector Distribution:\n", sector_counts)

# Identify top-performing sectors based on average YTD price change
top_sectors = nasdaq100.groupby("Sector")["ytd"].mean().nlargest(3).index.tolist()

# Filter top companies within each sector
top_stocks = nasdaq100[nasdaq100["Sector"].isin(top_sectors)].sort_values(by="ytd", ascending=False)

# Format the company data for OpenAI
company_data = top_stocks[["symbol", "Sector", "ytd"]].to_dict(orient="records")

# OpenAI prompt for stock recommendations
prompt = f'''
Based on year-to-date (YTD) performance, recommend the best three sectors from the Nasdaq-100 along with three or more high-performing companies per sector.
Company data: {company_data}
'''

# Generate AI recommendations
try:
    response = client.chat.completions.create(
        model="gpt-4o-mini", # I love 4o mini
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
    )
    stock_recommendations = response.choices[0].message.content
    print("\nStock Recommendations:\n", stock_recommendations)

except Exception as e:
    print("Error fetching stock recommendations:", e)