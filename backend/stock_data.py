"""
Stock Market Data Module

This module provides functions for fetching and processing stock market data
using the Finnhub API. It handles loading stock symbols and fetching real-time
market data with caching to avoid rate limits.

Features:
- Load NASDAQ-100 symbols from CSV file
- Fetch real-time stock data from Finnhub with caching
- Cache company profiles and financial data
- Calculate year-to-date (YTD) performance

Dependencies:
- pandas
- finnhub-python
- config module with DATA_DIR
"""

import os
import pandas as pd
import time
from datetime import datetime, timedelta
import finnhub
from dotenv import load_dotenv
import config
import json
from threading import Lock
from pathlib import Path

# Load environment variables
load_dotenv()

class CachedFinnhubClient:
    def __init__(self):
        self.client = finnhub.Client(api_key=os.getenv('FINNHUB_API_KEY'))
        self.cache_dir = Path(config.DATA_DIR) / 'finnhub_cache'
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.cache_lock = Lock()
        self.last_quote_time = {}
        self.quote_cache = {}
        self.QUOTE_CACHE_DURATION = timedelta(seconds=10)  # Cache quotes for 10 seconds
        self.PROFILE_CACHE_DURATION = timedelta(days=1)    # Cache profiles for 1 day
        self.FINANCIALS_CACHE_DURATION = timedelta(hours=6)  # Cache financials for 6 hours
        
    def check_api_status(self):
        """Check if the Finnhub API is working correctly"""
        try:
            # Try to fetch AAPL quote as a test
            test_quote = self.client.quote('AAPL')
            if test_quote and 'c' in test_quote:
                return True, "API is working correctly"
            return False, "API returned invalid response"
        except Exception as e:
            return False, f"API error: {str(e)}"
        
    def _load_cache(self, cache_type, symbol):
        """Load cached data for a symbol"""
        cache_file = self.cache_dir / f"{symbol}_{cache_type}.json"
        if not cache_file.exists():
            return None
            
        try:
            with open(cache_file, 'r') as f:
                data = json.load(f)
                if datetime.fromtimestamp(data['timestamp']) + self._get_cache_duration(cache_type) > datetime.now():
                    return data['data']
        except Exception:
            return None
        return None
        
    def _save_cache(self, cache_type, symbol, data):
        """Save data to cache"""
        if data is None:
            return
            
        cache_file = self.cache_dir / f"{symbol}_{cache_type}.json"
        cache_data = {
            'timestamp': datetime.now().timestamp(),
            'data': data
        }
        
        with self.cache_lock:
            with open(cache_file, 'w') as f:
                json.dump(cache_data, f)
                
    def _get_cache_duration(self, cache_type):
        """Get cache duration for different types of data"""
        return {
            'quote': self.QUOTE_CACHE_DURATION,
            'profile': self.PROFILE_CACHE_DURATION,
            'financials': self.FINANCIALS_CACHE_DURATION
        }.get(cache_type, timedelta(minutes=5))
        
    def get_stock_quote(self, symbol):
        """Get real-time quote for a symbol with short-term caching"""
        now = datetime.now()
        
        # Check in-memory cache first
        if symbol in self.quote_cache:
            last_time = self.last_quote_time.get(symbol)
            if last_time and (now - last_time) < self.QUOTE_CACHE_DURATION:
                return self.quote_cache[symbol]
        
        try:
            quote = self.client.quote(symbol)
            if quote:
                self.quote_cache[symbol] = quote
                self.last_quote_time[symbol] = now
            return quote
        except Exception as e:
            print(f"Error fetching quote for {symbol}: {e}")
            return None
            
    def get_company_profile(self, symbol):
        """Get company profile information with caching"""
        # Check cache first
        cached_data = self._load_cache('profile', symbol)
        if cached_data:
            return cached_data
            
        try:
            profile = self.client.company_profile2(symbol=symbol)
            if profile:
                self._save_cache('profile', symbol, profile)
            return profile
        except Exception as e:
            print(f"Error fetching company profile for {symbol}: {e}")
            return None
            
    def get_basic_financials(self, symbol):
        """Get basic financial metrics with caching"""
        # Check cache first
        cached_data = self._load_cache('financials', symbol)
        if cached_data:
            return cached_data
            
        try:
            financials = self.client.company_basic_financials(symbol, 'all')
            if financials:
                self._save_cache('financials', symbol, financials)
            return financials
        except Exception as e:
            print(f"Error fetching financials for {symbol}: {e}")
            return None

    def batch_get_profiles_and_financials(self, symbols):
        """Batch get profiles and financials for multiple symbols"""
        results = {}
        for symbol in symbols:
            results[symbol] = {
                'profile': self.get_company_profile(symbol),
                'financials': self.get_basic_financials(symbol)
            }
            time.sleep(0.1)  # Rate limiting between symbols
        return results

# Initialize Finnhub client with caching
finnhub_client = CachedFinnhubClient()

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
    Fetch real-time stock data for a given symbol using Finnhub with caching
    """
    try:
        # Get real-time quote (cached for 10 seconds)
        quote = finnhub_client.get_stock_quote(symbol)
        if not quote:
            raise Exception("Failed to fetch quote data")
            
        # Get cached company profile and financials
        profile = finnhub_client.get_company_profile(symbol)
        financials = finnhub_client.get_basic_financials(symbol)
        
        # Calculate YTD performance
        current_price = quote['c']
        ytd_change = ((current_price - quote.get('pc', current_price)) / quote.get('pc', current_price)) * 100 if quote.get('pc') else 0
        
        if profile:
            company_name = profile.get('name', symbol)
            industry = profile.get('finnhubIndustry', 'Unknown')
            market_cap = profile.get('marketCapitalization', 0)
        else:
            company_name = symbol
            industry = 'Unknown'
            market_cap = 0
            
        if financials and 'metric' in financials:
            metrics = financials['metric']
            pe_ratio = metrics.get('peBasicExcl', 'Unknown')
            dividend_yield = metrics.get('dividendYieldIndicatedAnnual', 'Unknown')
        else:
            pe_ratio = 'Unknown'
            dividend_yield = 'Unknown'
            
        return {
            'symbol': symbol,
            'name': company_name,
            'price': current_price,
            'ytd': ytd_change,
            'sector': industry,
            'industry': industry,
            'market_cap': market_cap,
            'pe_ratio': pe_ratio,
            'dividend_yield': dividend_yield
        }
        
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
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

def load_nasdaq_data():
    """
    Load real-time NASDAQ data for all symbols with caching
    
    Returns:
        pandas.DataFrame: DataFrame containing NASDAQ data with all required fields
    """
    symbols = load_nasdaq100_symbols()
    if not symbols:
        return pd.DataFrame()
        
    # First, batch fetch/update cached data for all symbols
    finnhub_client.batch_get_profiles_and_financials(symbols)
    
    # Then fetch real-time quotes with caching
    data = []
    for symbol in symbols:
        stock_data = fetch_stock_data(symbol)
        if stock_data:
            data.append(stock_data)
            
    return pd.DataFrame(data)

# The following functions are kept for backwards compatibility
def load_mock_data():
    """
    Load mock data from CSV file instead of fetching real data
    """
    try:
        # Load directly from the mock data CSV file
        mock_data_path = os.path.join(config.DATA_DIR, "nasdaq100_mock_data.csv")
        if os.path.exists(mock_data_path):
            print(f"Loading mock data from {mock_data_path}")
            df = pd.read_csv(mock_data_path)
            # Ensure numeric columns are numeric
            numeric_cols = ['ytd', 'market_cap', 'pe_ratio', 'dividend_yield', 'price']
            for col in numeric_cols:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            return df
        else:
            print(f"Mock data file not found at {mock_data_path}")
            return pd.DataFrame()
    except Exception as e:
        print(f"Error loading mock data: {e}")
        return pd.DataFrame()

def generate_mock_data(symbols):
    """
    Return mock data for the given symbols
    """
    mock_df = load_mock_data()
    if mock_df.empty:
        return []
    
    # Filter for the requested symbols
    filtered_df = mock_df[mock_df['symbol'].isin(symbols)]
    return filtered_df.to_dict('records')

# Test the Finnhub integration if this file is run directly
if __name__ == "__main__":
    print("Testing Finnhub integration...")
    
    # Check API status first
    api_working, status_msg = finnhub_client.check_api_status()
    print(f"\nAPI Status Check: {status_msg}")
    
    if not api_working:
        print("Aborting tests due to API issues")
        exit(1)
    
    # Test loading symbols
    symbols = load_nasdaq100_symbols()
    print(f"\nLoaded {len(symbols)} symbols")
    
    # Test fetching data for a single symbol
    test_symbol = "AAPL"
    print(f"\nFetching data for {test_symbol}...")
    result = fetch_stock_data(test_symbol)
    
    print("\nResult:")
    for key, value in result.items():
        print(f"{key}: {value}")
    
    # Test loading data for multiple symbols
    test_symbols = ["AAPL", "MSFT", "GOOGL"]
    print(f"\nFetching data for {test_symbols}...")
    data = generate_mock_data(test_symbols)
    print(f"Fetched {len(data)} records") 