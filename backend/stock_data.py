"""
Stock Market Data Module

This module provides functions for fetching, processing, and managing stock market data
from pregenerated mock data files. It handles loading stock symbols and data from CSV files,
eliminating the need for API calls to improve performance.

Features:
- Load NASDAQ-100 symbols from CSV file
- Load pregenerated mock stock data
- Calculate year-to-date (YTD) performance
- Save and load cached stock data

Usage:
1. Load symbols: symbols = load_nasdaq100_symbols()
2. Fetch data: stock_data = fetch_stock_data(symbol)
3. Load mock data: mock_data = load_mock_data()
4. Save data: save_stock_data(data_df)
5. Load cached data: data_df = load_cached_stock_data()

Note: This module uses pregenerated mock data to avoid API rate limits and improve performance.

Dependencies:
- pandas
- config module with DATA_DIR, RESULTS_DIR, and SECTORS
"""

import os
import pandas as pd
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
        # Return empty list if no file found
        return []
    
    try:
        df = pd.read_csv(symbols_path)
        if 'symbol' not in df.columns:
            print(f"Warning: 'symbol' column not found in {symbols_path}")
            if len(df.columns) > 0:
                # Try to use the first column as the symbol column
                return df.iloc[:, 0].tolist()
            return []
        # Return all symbols
        return df["symbol"].tolist()
    except Exception as e:
        print(f"Error loading NASDAQ-100 symbols: {e}")
        return []

def fetch_stock_data(symbol):
    """
    Fetch stock data for a given symbol from pregenerated mock data
    
    This function no longer makes API calls but instead loads data from the mock data file
    """
    # Load the mock data file
    mock_data_path = os.path.join(os.path.dirname(__file__), "data", "nasdaq100_mock_data.csv")
    
    try:
        # Load the mock data
        mock_df = pd.read_csv(mock_data_path)
        
        # Find the data for the requested symbol
        stock_data = mock_df[mock_df['symbol'] == symbol]
        
        if stock_data.empty:
            print(f"Warning: No data found for symbol {symbol} in mock data")
            # Return default data if symbol not found
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
        
        # Convert the row to a dictionary
        stock_dict = stock_data.iloc[0].to_dict()
        
        # Add a small delay to simulate API call (can be removed if not needed)
        time.sleep(0.1)
        
        return stock_dict
        
    except Exception as e:
        print(f"Error fetching mock data for {symbol}: {e}")
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

def load_mock_data():
    """
    Load all pregenerated mock data at once
    
    This is more efficient than loading data for each symbol separately
    """
    mock_data_path = os.path.join(os.path.dirname(__file__), "data", "nasdaq100_mock_data.csv")
    
    try:
        # Load the mock data
        mock_df = pd.read_csv(mock_data_path)
        return mock_df
    except Exception as e:
        print(f"Error loading mock data: {e}")
        return pd.DataFrame()

def generate_mock_data(symbols):
    """
    Return pregenerated mock data for the given symbols
    
    This function no longer generates random data but loads from the mock data file
    """
    mock_df = load_mock_data()
    
    # Filter the mock data for the requested symbols
    filtered_df = mock_df[mock_df['symbol'].isin(symbols)]
    
    # Convert to list of dictionaries
    mock_data = filtered_df.to_dict('records')
    
    # If some symbols are not in the mock data, add default entries
    mock_symbols = set(filtered_df['symbol'])
    for symbol in symbols:
        if symbol not in mock_symbols:
            mock_data.append({
                'symbol': symbol,
                'name': f"{symbol} Inc.",
                'ytd': round(random.uniform(-30, 30), 2),
                'sector': random.choice(config.SECTORS),
                'industry': f"Industry {random.randint(1, 10)}",
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
    
    # Convert to DataFrame if it's a list
    if isinstance(data_df, list):
        data_df = pd.DataFrame(data_df)
    
    data_df.to_csv(output_path, index=False)
    return output_path

def load_cached_stock_data():
    """Load the most recent cached stock data if available"""
    try:
        # Ensure the directory exists
        os.makedirs(config.RESULTS_DIR, exist_ok=True)
        
        files = [f for f in os.listdir(config.RESULTS_DIR) if f.startswith("nasdaq100_data_") and f.endswith(".csv")]
        if not files:
            # If no cached data, return the mock data
            return load_mock_data()
        
        # Get the most recent file
        latest_file = max(files, key=lambda x: os.path.getmtime(os.path.join(config.RESULTS_DIR, x)))
        return pd.read_csv(os.path.join(config.RESULTS_DIR, latest_file))
    except Exception as e:
        print(f"Error loading cached data: {e}")
        # If error loading cached data, return the mock data
        return load_mock_data()

def load_nasdaq_data():
    """
    Load NASDAQ data from pregenerated mock data
    
    Returns:
        pandas.DataFrame: DataFrame containing NASDAQ data with all required fields
    """
    # Load the mock data directly
    return load_mock_data()

# Test the mock data integration if this file is run directly
if __name__ == "__main__":
    print("Testing mock data integration...")
    
    # Test loading symbols
    symbols = load_nasdaq100_symbols()
    print(f"Loaded {len(symbols)} symbols")
    
    # Test loading mock data for a single symbol
    test_symbol = "AAPL"
    print(f"\nFetching mock data for {test_symbol}...")
    result = fetch_stock_data(test_symbol)
    
    print("\nResult:")
    for key, value in result.items():
        print(f"{key}: {value}")
    
    # Test loading all mock data
    print("\nLoading all mock data...")
    all_mock_data = load_mock_data()
    print(f"Loaded {len(all_mock_data)} records")
    
    # Test generating mock data for a list of symbols
    test_symbols = ["AAPL", "MSFT", "GOOGL"]
    print(f"\nGenerating mock data for {test_symbols}...")
    mock_data = generate_mock_data(test_symbols)
    print(f"Generated {len(mock_data)} records") 