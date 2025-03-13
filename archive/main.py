# filepath: stock-market-analysis/main.py
import os
import pandas as pd
import yfinance as yf
from openai import OpenAI
from tqdm import tqdm
from datetime import datetime, timedelta
import time
import random
from dotenv import load_dotenv
import argparse

# Parse command-line arguments
parser = argparse.ArgumentParser(description='Stock Market Analysis')
parser.add_argument('--max-stocks', type=int, default=5, help='Maximum number of stocks to fetch (default: 5, use 0 for all)')
parser.add_argument('--skip-fetch', action='store_true', help='Skip fetching stock data and use cached data')
parser.add_argument('--skip-classify', action='store_true', help='Skip classifying sectors and use cached data')
parser.add_argument('--use-mock-data', action='store_true', help='Use mock data instead of fetching from Yahoo Finance')
args = parser.parse_args()

# Load environment variables from .env file
load_dotenv()

# Check if API key is available
if "OPEN_AI_KEY" not in os.environ or not os.environ["OPEN_AI_KEY"]:
    print("Error: OpenAI API key not found. Please set the OPEN_AI_KEY environment variable in the .env file.")
    exit(1)

# Instantiate OpenAI client
client = OpenAI(api_key=os.environ["OPEN_AI_KEY"])

# Get NASDAQ-100 symbols
nasdaq100_symbols = pd.read_csv("data/nasdaq100.csv")["symbol"].tolist()

MAX_STOCKS = args.max_stocks if args.max_stocks > 0 else None
if MAX_STOCKS is not None:
    print(f"Testing mode: Limiting to {MAX_STOCKS} stocks")
    nasdaq100_symbols = nasdaq100_symbols[:MAX_STOCKS]

def fetch_stock_data(symbol, max_retries=5):
    for attempt in range(max_retries):
        try:
            # Increased random delay between requests (5-10 seconds)
            delay = random.uniform(5, 10)
            print(f"Waiting {delay:.2f} seconds before fetching {symbol}...")
            time.sleep(delay)
            
            stock = yf.Ticker(symbol)
            info = stock.info
            hist = stock.history(period="ytd")
            
            if not hist.empty:
                current_price = hist['Close'].iloc[-1]
                ytd_start_price = hist['Close'].iloc[0]
                ytd_change = ((current_price - ytd_start_price) / ytd_start_price) * 100
            else:
                ytd_change = 0
                
            return {
                'symbol': symbol,
                'name': info.get('longName', 'Unknown'),
                'ytd': round(ytd_change, 2)
            }
        except Exception as e:
            wait_time = min(60, (2 ** attempt) * 5 + random.uniform(1, 5))
            print(f"Error fetching data for {symbol} (attempt {attempt+1}/{max_retries}): {e}")
            print(f"Retrying in {wait_time:.2f} seconds...")
            
            if attempt < max_retries - 1:
                time.sleep(wait_time)
                continue
            print(f"Error fetching data for {symbol} after {max_retries} attempts: {e}")
            return {
                'symbol': symbol,
                'name': symbol,
                'ytd': 0
            }

# [Previous setup code remains identical until sector classification...]

def classify_sector(company, max_retries=3):
    prompt = f'''Classify company {company} into one of the following sectors. Answer only with the sector name: 
    Technology, Consumer Cyclical, Industrials, Utilities, Healthcare, Communication, Energy, Consumer Defensive, Real Estate, Financial.'''
    
    for attempt in range(max_retries):
        try:
            # Add OpenAI API rate limit delay (3 seconds between requests)
            time.sleep(3)  # Stay under 20 RPM limit
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",  
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
            )
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            print(f"Error classifying {company} (attempt {attempt+1}/{max_retries}): {e}")
            print(f"Retrying in {wait_time:.2f} seconds...")
            
            if attempt < max_retries - 1:
                time.sleep(wait_time)
                continue
            
            print(f"Failed to classify {company} after {max_retries} attempts.")
            return "Unknown"

# [Rest of the code remains identical until the recommendation API call...]

try:
    response = client.chat.completions.create(
        model="gpt-4-turbo",  # CORRECTED MODEL NAME
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
    )
    stock_recommendations = response.choices[0].message.content
    print("\nStock Recommendations:\n", stock_recommendations)

except Exception as e:
    print("Error fetching stock recommendations:", e)

# Save results to a file
try:
    # Create a results directory if it doesn't exist
    if not os.path.exists("results"):
        os.makedirs("results")
    
    # Get current date for the filename
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # Save the stock recommendations to a text file
    with open(f"results/stock_recommendations_{current_date}.txt", "w") as f:
        f.write(f"Stock Recommendations ({current_date}):\n\n")
        f.write(stock_recommendations)
    
    # Save the DataFrame with all stock data to a CSV file
    nasdaq100.to_csv(f"results/nasdaq100_data_{current_date}.csv", index=False)
    
    print(f"\nResults saved to results/stock_recommendations_{current_date}.txt and results/nasdaq100_data_{current_date}.csv")

except Exception as e:
    print(f"Error saving results: {e}")

print("\nAnalysis complete!")