import time
import random
import os
from datetime import datetime
from openai import OpenAI
import config

# Initialize OpenAI client
client = None

def init_openai_client():
    """Initialize the OpenAI client with API key"""
    global client
    if client:
        return client
        
    if not config.OPENAI_API_KEY:
        print("Warning: OpenAI API key not found. AI features will not work.")
        return None
        
    try:
        client = OpenAI(api_key=config.OPENAI_API_KEY)
        return client
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        return None

def classify_sector(company, max_retries=3):
    """Classify a company into a sector using OpenAI API"""
    if not init_openai_client():
        print(f"Warning: Unable to classify sector for {company} - OpenAI client not available")
        return "Unknown"
        
    prompt = f'''Classify company {company} into one of the following sectors. Answer only with the sector name: 
    {", ".join(config.SECTORS)}.'''
    
    for attempt in range(max_retries):
        try:
            # Add OpenAI API rate limit delay (3 seconds between requests)
            time.sleep(3)  # Stay under 20 RPM limit
            
            response = client.chat.completions.create(
                model=config.OPENAI_CLASSIFICATION_MODEL,
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

def get_stock_recommendations(nasdaq_data, top_n=5, bottom_n=5):
    """Get stock recommendations based on the data using OpenAI API"""
    if not init_openai_client():
        error_msg = "Error: OpenAI API key not configured or client initialization failed."
        print(error_msg)
        return error_msg, None
        
    # Prepare the data for the prompt
    top_performers = nasdaq_data.sort_values(by='ytd', ascending=False).head(top_n)
    bottom_performers = nasdaq_data.sort_values(by='ytd', ascending=True).head(bottom_n)
    
    # Prepare sector performance data
    sector_performance = nasdaq_data.groupby('sector')['ytd'].mean().reset_index()
    sector_performance = sector_performance.sort_values(by='ytd', ascending=False)
    
    # Create the prompt
    prompt = f"""Based on the following NASDAQ-100 stock data, provide investment recommendations:

Top {top_n} Performers (YTD):
{top_performers[['symbol', 'name', 'ytd', 'sector']].to_string(index=False)}

Bottom {bottom_n} Performers (YTD):
{bottom_performers[['symbol', 'name', 'ytd', 'sector']].to_string(index=False)}

Sector Performance (Average YTD %):
{sector_performance.to_string(index=False)}

Please provide:
1. A brief market overview based on this data
2. 3-5 specific stock recommendations with rationale
3. Sector-based investment strategy
"""

    try:
        response = client.chat.completions.create(
            model=config.OPENAI_RECOMMENDATION_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        recommendations = response.choices[0].message.content
        
        # Save recommendations to file
        current_date = datetime.now().strftime("%Y-%m-%d")
        output_path = os.path.join(config.RESULTS_DIR, f"stock_recommendations_{current_date}.txt")
        
        with open(output_path, "w") as f:
            f.write(f"Stock Recommendations ({current_date}):\n\n")
            f.write(recommendations)
            
        return recommendations, output_path
        
    except Exception as e:
        error_message = f"Error fetching stock recommendations: {e}"
        print(error_message)
        return error_message, None 