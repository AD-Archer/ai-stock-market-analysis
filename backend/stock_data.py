import os
import pandas as pd
import requests
import time
import random
from datetime import datetime
import sys

# Add the parent directory to the path so we can import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

def load_nasdaq100_symbols():
    """Load NASDAQ-100 symbols from CSV file"""
    # First try to load from the backend/data directory
    backend_symbols_path = os.path.join(os.path.dirname(__file__), "data", "nasdaq100.csv")
    
    # Then try the config.DATA_DIR path
    config_symbols_path = os.path.join(config.DATA_DIR, "nasdaq100.csv")
    
    # Check which path exists
    if os.path.exists(backend_symbols_path):
        symbols_path = backend_symbols_path
    elif os.path.exists(config_symbols_path):
        symbols_path = config_symbols_path
    else:
        print(f"Warning: NASDAQ-100 symbols file not found at {config_symbols_path}")
        # Create a sample file with a few symbols for testing
        sample_data = pd.DataFrame({
            'symbol': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'],
            'company_name': ['Apple Inc.', 'Microsoft Corporation', 'Alphabet Inc.', 'Amazon.com Inc.', 'Meta Platforms Inc.']
        })
        
        # Ensure the directory exists
        os.makedirs(config.DATA_DIR, exist_ok=True)
        
        symbols_path = config_symbols_path
        sample_data.to_csv(symbols_path, index=False)
        print(f"Created sample NASDAQ-100 symbols file at {symbols_path}")
    
    try:
        df = pd.read_csv(symbols_path)
        if 'symbol' not in df.columns:
            print(f"Warning: 'symbol' column not found in {symbols_path}")
            if len(df.columns) > 0:
                # Try to use the first column as the symbol column
                # Only return top 3 symbols to avoid API rate limits
                return df.iloc[:, 0].tolist()[:3]
            return []
        # Only return top 3 symbols to avoid API rate limits
        return df["symbol"].tolist()[:3]
    except Exception as e:
        print(f"Error loading NASDAQ-100 symbols: {e}")
        return []

def fetch_stock_data(symbol, max_retries=5):
    """Fetch stock data for a given symbol with retry logic using Alpha Vantage API"""
    api_key = config.ALPHA_VANTAGE_API_KEY
    
    for attempt in range(max_retries):
        try:
            # Add delay to avoid hitting API rate limits (Alpha Vantage has a limit of 5 calls per minute for free tier)
            delay = random.uniform(12, 15)  # Increased delay for Alpha Vantage rate limits
            print(f"Waiting {delay:.2f} seconds before fetching {symbol}...")
            time.sleep(delay)
            
            # Get company overview for name and other info
            overview_url = f"https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={api_key}"
            overview_response = requests.get(overview_url)
            overview_data = overview_response.json()
            
            if "Error Message" in overview_data or not overview_data:
                raise Exception(f"Error in Alpha Vantage response for {symbol} overview: {overview_data}")
            
            # Get time series data for YTD calculation
            # Using TIME_SERIES_DAILY for daily data
            ts_url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&outputsize=full&apikey={api_key}"
            ts_response = requests.get(ts_url)
            ts_data = ts_response.json()
            
            if "Error Message" in ts_data or "Time Series (Daily)" not in ts_data:
                raise Exception(f"Error in Alpha Vantage response for {symbol} time series: {ts_data}")
            
            # Get the time series data
            time_series = ts_data["Time Series (Daily)"]
            
            # Convert to DataFrame and calculate YTD change
            df = pd.DataFrame.from_dict(time_series, orient='index')
            df.index = pd.to_datetime(df.index)
            df = df.sort_index()
            
            # Convert string values to float
            for col in df.columns:
                df[col] = df[col].astype(float)
            
            # Get current year's first trading day
            current_year = datetime.now().year
            ytd_start_date = df[df.index >= f"{current_year}-01-01"].index.min()
            
            if pd.isna(ytd_start_date):
                ytd_change = 0
            else:
                ytd_start_price = float(df.loc[ytd_start_date, "4. close"])
                current_price = float(df.iloc[-1]["4. close"])
                ytd_change = ((current_price - ytd_start_price) / ytd_start_price) * 100
            
            return {
                'symbol': symbol,
                'name': overview_data.get('Name', overview_data.get('Symbol', 'Unknown')),
                'ytd': round(ytd_change, 2),
                'sector': overview_data.get('Sector', 'Unknown'),
                'industry': overview_data.get('Industry', 'Unknown'),
                'market_cap': overview_data.get('MarketCapitalization', 'Unknown'),
                'pe_ratio': overview_data.get('PERatio', 'Unknown'),
                'dividend_yield': overview_data.get('DividendYield', 'Unknown'),
                'price': float(df.iloc[-1]["4. close"]) if not df.empty else 0
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
                'ytd': 0,
                'sector': 'Unknown',
                'industry': 'Unknown',
                'market_cap': 'Unknown',
                'pe_ratio': 'Unknown',
                'dividend_yield': 'Unknown',
                'price': 0
            }

def generate_mock_data(symbols):
    """Generate mock stock data for testing"""
    mock_data = []
    for symbol in symbols:
        mock_data.append({
            'symbol': symbol,
            'name': f"Mock {symbol} Inc.",
            'ytd': round(random.uniform(-30, 30), 2),
            'sector': random.choice(config.SECTORS),
            'industry': f"Mock Industry {random.randint(1, 10)}",
            'market_cap': str(random.randint(1000000, 2000000000)),
            'pe_ratio': str(round(random.uniform(5, 50), 2)),
            'dividend_yield': str(round(random.uniform(0, 5), 2)),
            'price': round(random.uniform(10, 1000), 2)
        })
    return mock_data

def save_stock_data(data_df):
    """Save stock data to CSV file"""
    current_date = datetime.now().strftime("%Y-%m-%d")
    output_path = os.path.join(config.RESULTS_DIR, f"nasdaq100_data_{current_date}.csv")
    
    # Ensure the directory exists
    os.makedirs(config.RESULTS_DIR, exist_ok=True)
    
    data_df.to_csv(output_path, index=False)
    return output_path

def load_cached_stock_data():
    """Load the most recent cached stock data if available"""
    try:
        # Ensure the directory exists
        os.makedirs(config.RESULTS_DIR, exist_ok=True)
        
        files = [f for f in os.listdir(config.RESULTS_DIR) if f.startswith("nasdaq100_data_") and f.endswith(".csv")]
        if not files:
            return None
        
        # Get the most recent file
        latest_file = max(files, key=lambda x: os.path.getmtime(os.path.join(config.RESULTS_DIR, x)))
        return pd.read_csv(os.path.join(config.RESULTS_DIR, latest_file))
    except Exception as e:
        print(f"Error loading cached data: {e}")
        return None

# Test the Alpha Vantage integration if this file is run directly
if __name__ == "__main__":
    print("Testing Alpha Vantage API integration...")
    print(f"API Key: {'*' * (len(config.ALPHA_VANTAGE_API_KEY) - 4) + config.ALPHA_VANTAGE_API_KEY[-4:]}")
    
    # Test with a single symbol
    test_symbol = "AAPL"
    print(f"Fetching data for {test_symbol}...")
    result = fetch_stock_data(test_symbol)
    
    print("\nResult:")
    for key, value in result.items():
        print(f"{key}: {value}") 