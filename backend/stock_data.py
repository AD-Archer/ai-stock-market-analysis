import os
import pandas as pd
import yfinance as yf
import time
import random
from datetime import datetime
import config

def load_nasdaq100_symbols():
    """Load NASDAQ-100 symbols from CSV file"""
    symbols_path = os.path.join(config.DATA_DIR, "nasdaq100.csv")
    try:
        if not os.path.exists(symbols_path):
            print(f"Warning: NASDAQ-100 symbols file not found at {symbols_path}")
            # Create a sample file with a few symbols for testing
            sample_data = pd.DataFrame({
                'symbol': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'],
                'company_name': ['Apple Inc.', 'Microsoft Corporation', 'Alphabet Inc.', 'Amazon.com Inc.', 'Meta Platforms Inc.']
            })
            sample_data.to_csv(symbols_path, index=False)
            print(f"Created sample NASDAQ-100 symbols file at {symbols_path}")
            
        df = pd.read_csv(symbols_path)
        if 'symbol' not in df.columns:
            print(f"Warning: 'symbol' column not found in {symbols_path}")
            if len(df.columns) > 0:
                # Try to use the first column as the symbol column
                return df.iloc[:, 0].tolist()
            return []
        return df["symbol"].tolist()
    except Exception as e:
        print(f"Error loading NASDAQ-100 symbols: {e}")
        return []

def fetch_stock_data(symbol, max_retries=5):
    """Fetch stock data for a given symbol with retry logic"""
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

def generate_mock_data(symbols):
    """Generate mock stock data for testing"""
    mock_data = []
    for symbol in symbols:
        mock_data.append({
            'symbol': symbol,
            'name': f"Mock {symbol} Inc.",
            'ytd': round(random.uniform(-30, 30), 2)
        })
    return mock_data

def save_stock_data(data_df):
    """Save stock data to CSV file"""
    current_date = datetime.now().strftime("%Y-%m-%d")
    output_path = os.path.join(config.RESULTS_DIR, f"nasdaq100_data_{current_date}.csv")
    data_df.to_csv(output_path, index=False)
    return output_path

def load_cached_stock_data():
    """Load the most recent cached stock data if available"""
    try:
        files = [f for f in os.listdir(config.RESULTS_DIR) if f.startswith("nasdaq100_data_") and f.endswith(".csv")]
        if not files:
            return None
        
        # Get the most recent file
        latest_file = max(files, key=lambda x: os.path.getmtime(os.path.join(config.RESULTS_DIR, x)))
        return pd.read_csv(os.path.join(config.RESULTS_DIR, latest_file))
    except Exception as e:
        print(f"Error loading cached data: {e}")
        return None 