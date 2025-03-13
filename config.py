"""
Configuration Module for Stock Market Analysis Application

This module centralizes all configuration settings for the stock market analysis application.
It loads environment variables, sets up API keys, defines application paths, and configures
various parameters used throughout the application.

Features:
- Environment variable loading from .env file
- API key management for OpenAI and Alpha Vantage
- Application directory configuration
- Default application settings
- Stock market sector definitions
- AI model configuration

Usage:
1. Create a .env file with the following variables:
   - OPEN_AI_KEY=your_openai_api_key
   - AlphaAdvantage_API_KEY=your_alphavantage_api_key
2. Import this module: import config
3. Access configuration values: config.OPENAI_API_KEY, config.DATA_DIR, etc.

Directory Structure:
- DATA_DIR: Directory for storing input data files
- RESULTS_DIR: Directory for storing output files and recommendations

Dependencies:
- python-dotenv package for .env file loading
- Environment variables for API keys
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
OPENAI_API_KEY = os.environ.get("OPEN_AI_KEY")
ALPHA_VANTAGE_API_KEY = os.environ.get("AlphaAdvantage_API_KEY")

# Application settings
MAX_STOCKS_DEFAULT = 5
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# Stock data settings
SECTORS = [
    "Technology", "Consumer Cyclical", "Industrials", "Utilities", 
    "Healthcare", "Communication", "Energy", "Consumer Defensive", 
    "Real Estate", "Financial"
]

# API settings
OPENAI_CLASSIFICATION_MODEL = "gpt-4o-mini"
OPENAI_RECOMMENDATION_MODEL = "gpt-4-turbo" 