import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
OPENAI_API_KEY = os.environ.get("OPEN_AI_KEY")

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