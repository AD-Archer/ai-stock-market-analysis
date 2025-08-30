"""
Configuration Module for Stock Market Analysis Application

This module centralizes all configuration settings for the stock market analysis application.
It loads environment variables, sets up API keys, defines application paths, and configures
various parameters used throughout the application.

Features:
- Environment variable loading from .env file
- API key management for OpenAI, Gemini, and Alpha Vantage
- Configurable AI provider with fallback support
- Application directory configuration
- Customizable application settings via environment variables
- Stock market sector definitions
- AI model configuration with defaults

Usage:
1. Create a .env file with the following variables:
   - OPEN_AI_KEY=your_openai_api_key (optional if using Gemini as primary)
   - GEMINI_API_KEY=your_gemini_api_key (optional if using OpenAI as primary)
   - AlphaAdvantage_API_KEY=your_alphavantage_api_key
   - PRIMARY_AI_PROVIDER=openai (default) or gemini
   - FALLBACK_AI_PROVIDER=gemini (default) or openai
2. Import this module: import config
3. Access configuration values: config.OPENAI_API_KEY, config.DATA_DIR, etc.

Directory Structure:
- DATA_DIR: Directory for storing input data files
- RESULTS_DIR: Directory for storing output files and recommendations

AI Provider Configuration:
- Supports both OpenAI and Gemini APIs
- Configurable primary and fallback providers
- Automatic fallback if primary provider fails
- Customizable model selection for each provider

Dependencies:
- python-dotenv package for .env file loading
- Environment variables for API keys and configuration
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
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Application settings
MAX_STOCKS_DEFAULT = int(os.environ.get("MAX_STOCKS_DEFAULT", "5"))

# Directory Configuration
DATA_DIR = os.path.join(BACKEND_DIR, "data")
RESULTS_DIR = os.path.join(DATA_DIR, "results")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# Stock data settings
SECTORS = os.environ.get("SECTORS", 
    "Technology,Consumer Cyclical,Industrials,Utilities,Healthcare,Communication,Energy,Consumer Defensive,Real Estate,Financial"
).split(",")

# API settings
OPENAI_CLASSIFICATION_MODEL = os.environ.get("OPENAI_CLASSIFICATION_MODEL", "gpt-5-mini")
OPENAI_RECOMMENDATION_MODEL = os.environ.get("OPENAI_RECOMMENDATION_MODEL", "gpt-5-nano")
GEMINI_CLASSIFICATION_MODEL = os.environ.get("GEMINI_CLASSIFICATION_MODEL", "gemini-2.5-flash")
GEMINI_RECOMMENDATION_MODEL = os.environ.get("GEMINI_RECOMMENDATION_MODEL", "gemini-2.5-flash-lite")

# AI Provider Configuration
PRIMARY_AI_PROVIDER = os.environ.get("PRIMARY_AI_PROVIDER", "openai")  # "openai" or "gemini"
FALLBACK_AI_PROVIDER = os.environ.get("FALLBACK_AI_PROVIDER", "gemini")  # "openai" or "gemini"

# Helper functions for AI configuration
def get_classification_model(provider=None):
    """Get the classification model for the specified provider or primary provider."""
    provider = provider or PRIMARY_AI_PROVIDER
    if provider == "openai":
        return OPENAI_CLASSIFICATION_MODEL
    elif provider == "gemini":
        return GEMINI_CLASSIFICATION_MODEL
    else:
        raise ValueError(f"Unknown AI provider: {provider}")

def get_recommendation_model(provider=None):
    """Get the recommendation model for the specified provider or primary provider."""
    provider = provider or PRIMARY_AI_PROVIDER
    if provider == "openai":
        return OPENAI_RECOMMENDATION_MODEL
    elif provider == "gemini":
        return GEMINI_RECOMMENDATION_MODEL
    else:
        raise ValueError(f"Unknown AI provider: {provider}")

def get_api_key(provider=None):
    """Get the API key for the specified provider or primary provider."""
    provider = provider or PRIMARY_AI_PROVIDER
    if provider == "openai":
        return OPENAI_API_KEY
    elif provider == "gemini":
        return GEMINI_API_KEY
    else:
        raise ValueError(f"Unknown AI provider: {provider}")

def is_provider_available(provider):
    """Check if the specified provider has a valid API key."""
    if provider == "openai":
        return bool(OPENAI_API_KEY)
    elif provider == "gemini":
        return bool(GEMINI_API_KEY)
    else:
        return False

# Validate required environment variables
if not OPENAI_API_KEY and not GEMINI_API_KEY:
    raise ValueError("Either OPEN_AI_KEY or GEMINI_API_KEY is required in the .env file")

if PRIMARY_AI_PROVIDER == "openai" and not OPENAI_API_KEY:
    if FALLBACK_AI_PROVIDER == "gemini" and GEMINI_API_KEY:
        print("Warning: OpenAI API key not found, but Gemini is available as fallback")
    else:
        raise ValueError("OPEN_AI_KEY is required when PRIMARY_AI_PROVIDER is set to 'openai'")

if PRIMARY_AI_PROVIDER == "gemini" and not GEMINI_API_KEY:
    if FALLBACK_AI_PROVIDER == "openai" and OPENAI_API_KEY:
        print("Warning: Gemini API key not found, but OpenAI is available as fallback")
    else:
        raise ValueError("GEMINI_API_KEY is required when PRIMARY_AI_PROVIDER is set to 'gemini'") 