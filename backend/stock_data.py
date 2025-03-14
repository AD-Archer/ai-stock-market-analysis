"""
Stock Market Data Module

This module provides functions for fetching and processing stock market data
from pregenerated mock data files. It handles loading stock symbols and data from CSV files,
eliminating the need for API calls to improve performance.

Features:
- Load NASDAQ-100 symbols from CSV file
- Load pregenerated mock stock data
- Calculate year-to-date (YTD) performance

Usage:
1. Load symbols: symbols = load_nasdaq100_symbols()
2. Fetch data: stock_data = fetch_stock_data(symbol)
3. Load mock data: mock_data = load_mock_data()

Note: This module uses pregenerated mock data to avoid API rate limits and improve performance.

Dependencies:
- pandas
- config module with DATA_DIR and SECTORS
"""

import os
import pandas as pd
import time
import random
from datetime import datetime
import config

def load_nasdaq100_symbols():
    """Load NASDAQ-100 symbols from CSV file"""
    symbols_path = os.path.join(config.DATA_DIR, "nasdaq100.csv")
    
    if not os.path.exists(symbols_path):
        print(f"Warning: NASDAQ-100 symbols file not found at {symbols_path}")
        return []
    
    try:
        df = pd.read_csv(symbols_path)
        if 'symbol' not in df.columns:
            print(f"Warning: 'symbol' column not found in {symbols_path}")
            if len(df.columns) > 0:
                return df.iloc[:, 0].tolist()
            return []
        return df["symbol"].tolist()
    except Exception as e:
        print(f"Error loading NASDAQ-100 symbols: {e}")
        return []

def fetch_stock_data(symbol):
    """
    Fetch stock data for a given symbol from pregenerated mock data
    """
    mock_data_path = os.path.join(config.DATA_DIR, "nasdaq100_mock_data.csv")
    
    try:
        mock_df = pd.read_csv(mock_data_path)
        stock_data = mock_df[mock_df['symbol'] == symbol]
        
        if stock_data.empty:
            print(f"Warning: No data found for symbol {symbol} in mock data")
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
        
        stock_dict = stock_data.iloc[0].to_dict()
        time.sleep(0.1)  # Simulate API call
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
    """
    mock_data_path = os.path.join(config.DATA_DIR, "nasdaq100_mock_data.csv")
    
    try:
        return pd.read_csv(mock_data_path)
    except Exception as e:
        print(f"Error loading mock data: {e}")
        return pd.DataFrame()

def generate_mock_data(symbols):
    """
    Return pregenerated mock data for the given symbols
    """
    mock_df = load_mock_data()
    filtered_df = mock_df[mock_df['symbol'].isin(symbols)]
    mock_data = filtered_df.to_dict('records')
    
    # Add default entries for missing symbols
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

def load_nasdaq_data():
    """
    Load NASDAQ data from pregenerated mock data
    
    Returns:
        pandas.DataFrame: DataFrame containing NASDAQ data with all required fields
    """
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