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
from pathlib import Path
from dotenv import load_dotenv

# Get the backend directory (where .env is located)
BACKEND_DIR = Path(__file__).resolve().parent

# Try to load .env from different locations
env_paths = [
    Path('/app/.env'),  # Docker path
    BACKEND_DIR.parent / '.env',  # Local development path
]

env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        env_loaded = True
        break

if not env_loaded:
    raise FileNotFoundError(f"Could not find .env file in any of these locations: {', '.join(str(p) for p in env_paths)}")

# API Keys
OPENAI_API_KEY = os.environ.get("OPEN_AI_KEY")
ALPHA_VANTAGE_API_KEY = os.environ.get("AlphaAdvantage_API_KEY")

# Application settings
MAX_STOCKS_DEFAULT = 5

# Directory Configuration
DATA_DIR = os.path.join(BACKEND_DIR, "data")
RESULTS_DIR = os.path.join(DATA_DIR, "results")

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
OPENAI_CLASSIFICATION_MODEL = "gpt-4-turbo-preview"
OPENAI_RECOMMENDATION_MODEL = "gpt-4-turbo-preview"

# Validate required environment variables
if not OPENAI_API_KEY:
    raise ValueError("OPEN_AI_KEY is required in the root .env file") 