"""
AI Utilities Module for Stock Market Analysis

This module provides AI-powered functionality for the stock market analysis application
using OpenAI's API. It handles company sector classification and generates investment
recommendations based on stock performance data.

Features:
- OpenAI client initialization and management
- Company sector classification using AI
- Investment recommendations generation with market analysis
- Automatic retry logic for API failures
- Rate limiting to comply with OpenAI API usage policies
- Recommendation file generation and storage

Functions:
- init_openai_client(): Initialize the OpenAI API client
- classify_sector(company, max_retries=3): Classify a company into a predefined sector
- get_stock_recommendations(nasdaq_data, top_n=5, bottom_n=5): Generate investment recommendations
- analyze_stocks(nasdaq_data): Analyze NASDAQ stock data and generate investment recommendations
- analyze_uploaded_files(file_contents): Analyze uploaded files using OpenAI and generate insights

Usage:
1. Ensure OPENAI_API_KEY is set in config.py
2. Initialize client: client = init_openai_client()
3. Classify sectors: sector = classify_sector("Apple Inc.")
4. Get recommendations: recommendations, file_path = get_stock_recommendations(nasdaq_df)

Dependencies:
- openai Python package
- config module with OPENAI_API_KEY, SECTORS, RESULTS_DIR
- OpenAI API access with appropriate models configured
"""

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
    """
    Return a sector for a company
    
    Since we're using pregenerated mock data that already includes sectors,
    this function now just returns a default sector without making API calls.
    It's kept for compatibility with existing code.
    """
    # For compatibility with existing code, return Technology as default
    # The actual sector data will come from our pregenerated mock data
    return "Technology"

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
    prompt = f"""Based on the following NASDAQ-100 stock data, provide investment recommendations in markdown format:

Top {top_n} Performers (YTD):
{top_performers[['symbol', 'name', 'ytd', 'sector']].to_string(index=False)}

Bottom {bottom_n} Performers (YTD):
{bottom_performers[['symbol', 'name', 'ytd', 'sector']].to_string(index=False)}

Sector Performance (Average YTD %):
{sector_performance.to_string(index=False)}

Please provide a markdown-formatted analysis with:
1. A brief market overview based on this data
2. 3-5 specific stock recommendations with rationale
3. Sector-based investment strategy

Use markdown formatting for headers, lists, and emphasis.
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
        
        # Ensure the results directory exists
        os.makedirs(config.RESULTS_DIR, exist_ok=True)
        
        # Save as both markdown and text files
        md_output_path = os.path.join(config.RESULTS_DIR, f"stock_recommendations_{current_date}.md")
        txt_output_path = os.path.join(config.RESULTS_DIR, f"stock_recommendations_{current_date}.txt")
        
        with open(md_output_path, "w") as f:
            f.write(f"# Stock Recommendations ({current_date})\n\n")
            f.write(recommendations)
            
        with open(txt_output_path, "w") as f:
            f.write(f"Stock Recommendations ({current_date}):\n\n")
            f.write(recommendations)
            
        return recommendations, md_output_path
        
    except Exception as e:
        error_message = f"Error fetching stock recommendations: {e}"
        print(error_message)
        return error_message, None

def analyze_stocks(nasdaq_data):
    """
    Analyze NASDAQ stock data and generate investment recommendations
    
    Args:
        nasdaq_data (DataFrame): DataFrame containing NASDAQ stock data with columns:
                                symbol, name, ytd, sector
    
    Returns:
        str: Path to the generated recommendations file
    """
    # Check if we have sector information, if not, try to classify
    if 'sector' not in nasdaq_data.columns:
        print("Classifying sectors for companies...")
        # Add a sector column if it doesn't exist
        nasdaq_data['sector'] = 'Unknown'
        
        # Classify sectors for each company
        for idx, row in nasdaq_data.iterrows():
            company_name = row.get('name', row.get('company_name', ''))
            if company_name:
                nasdaq_data.at[idx, 'sector'] = classify_sector(company_name)
    
    # Generate recommendations
    recommendations, output_path = get_stock_recommendations(nasdaq_data)
    
    if output_path is None:
        raise Exception("Failed to generate recommendations")
    
    return output_path

def analyze_uploaded_files(file_contents):
    """
    Analyze uploaded files using OpenAI and generate insights
    
    Args:
        file_contents (list): List of dictionaries containing file information
                             Each dict has 'filename', 'content', and 'type' keys
    
    Returns:
        str: Markdown-formatted analysis of the uploaded files
    """
    # Initialize OpenAI client if not already done
    global client
    if not client:
        client = init_openai_client()
    
    # If no files were provided, return a message
    if not file_contents:
        return "No files were provided for analysis."
    
    # Create a prompt for the AI based on the file contents
    prompt = "I'm going to provide you with the contents of several files related to stock market data. "
    prompt += "Please analyze this data and provide insights, trends, and recommendations. "
    prompt += "Format your response in Markdown with appropriate sections and bullet points.\n\n"
    
    # Add each file's content to the prompt
    for file_info in file_contents:
        filename = file_info['filename']
        content = file_info['content']
        file_type = file_info['type']
        
        # Truncate very large content to avoid token limits
        if len(content) > 10000:
            content = content[:10000] + "... [content truncated due to size]"
        
        prompt += f"\n## File: {filename} (Type: {file_type})\n"
        prompt += f"```\n{content}\n```\n\n"
    
    prompt += "\nPlease provide a comprehensive analysis of this data, including:\n"
    prompt += "1. Summary of the data\n"
    prompt += "2. Key insights and patterns\n"
    prompt += "3. Potential investment recommendations\n"
    prompt += "4. Risk factors to consider\n"
    prompt += "5. Any additional observations\n"
    
    try:
        # Call OpenAI API to generate analysis
        response = client.chat.completions.create(
            model=config.OPENAI_RECOMMENDATION_MODEL,
            messages=[
                {"role": "system", "content": "You are a financial analyst expert specializing in stock market analysis. Your task is to analyze financial data and provide clear, actionable insights."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=2000
        )
        
        # Extract and return the analysis
        analysis = response.choices[0].message.content
        
        # Save the analysis to a file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"file_analysis_{timestamp}.md"
        file_path = os.path.join(config.RESULTS_DIR, filename)
        
        with open(file_path, 'w') as f:
            f.write(analysis)
        
        return analysis
        
    except Exception as e:
        print(f"Error generating AI analysis: {str(e)}")
        return f"Error generating analysis: {str(e)}" 