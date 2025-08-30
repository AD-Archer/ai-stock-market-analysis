"""
AI Utilities Module for Stock Market Analysis

This module provides AI-powered functionality for the stock market analysis application
using both OpenAI and Google Gemini APIs with automatic fallback support. It handles 
company sector classification and generates investment recommendations based on stock 
performance data.

Features:
- Multi-provider AI support (OpenAI and Gemini)
- Automatic fallback between providers
- Company sector classification using AI
- Investment recommendations generation with market analysis
- Automatic retry logic for API failures
- Rate limiting to comply with API usage policies
- Recommendation file generation and storage

Functions:
- init_ai_clients(): Initialize AI clients for available providers
- get_available_client(): Get an available AI client with fallback logic
- classify_sector(company, max_retries=3): Classify a company into a predefined sector
- get_stock_recommendations(nasdaq_data, top_n=5, bottom_n=5): Generate investment recommendations
- analyze_stocks(nasdaq_data): Analyze NASDAQ stock data and generate investment recommendations
- analyze_uploaded_files(file_contents): Analyze uploaded files using AI and generate insights

Usage:
1. Ensure API keys are set in config.py (OPENAI_API_KEY and/or GEMINI_API_KEY)
2. Initialize clients: init_ai_clients()
3. Classify sectors: sector = classify_sector("Apple Inc.")
4. Get recommendations: recommendations, file_path = get_stock_recommendations(nasdaq_df)

Dependencies:
- openai Python package
- google-generativeai Python package
- config module with API keys and model configurations
- API access with appropriate models configured
"""

import time
import random
import os
from datetime import datetime
from openai import OpenAI
import google.generativeai as genai
import config

# Initialize AI clients
openai_client = None
gemini_client = None

def init_ai_clients():
    """Initialize AI clients for all available providers"""
    global openai_client, gemini_client
    
    # Initialize OpenAI client
    if config.OPENAI_API_KEY:
        try:
            openai_client = OpenAI(api_key=config.OPENAI_API_KEY)
            print("OpenAI client initialized successfully")
        except Exception as e:
            print(f"Error initializing OpenAI client: {e}")
            openai_client = None
    else:
        print("OpenAI API key not found")
        
    # Initialize Gemini client
    if config.GEMINI_API_KEY:
        try:
            genai.configure(api_key=config.GEMINI_API_KEY)
            gemini_client = genai.GenerativeModel(config.get_classification_model('gemini'))
            print("Gemini client initialized successfully")
        except Exception as e:
            print(f"Error initializing Gemini client: {e}")
            gemini_client = None
    else:
        print("Gemini API key not found")
    
    # Check if at least one client is available
    if not openai_client and not gemini_client:
        print("Warning: No AI clients available. AI features will not work.")
        return False
        
    return True

def get_available_client(preferred_provider=None):
    """
    Get an available AI client with fallback logic
    
    Args:
        preferred_provider (str): Preferred provider ('openai' or 'gemini')
        
    Returns:
        tuple: (client, provider_name) or (None, None) if no client available
    """
    if preferred_provider is None:
        preferred_provider = config.PRIMARY_AI_PROVIDER
        
    # Try preferred provider first
    if preferred_provider == "openai" and openai_client:
        return openai_client, "openai"
    elif preferred_provider == "gemini" and gemini_client:
        return gemini_client, "gemini"
        
    # Fallback to any available provider
    fallback_provider = config.FALLBACK_AI_PROVIDER
    if fallback_provider == "openai" and openai_client:
        print(f"Falling back to OpenAI from {preferred_provider}")
        return openai_client, "openai"
    elif fallback_provider == "gemini" and gemini_client:
        print(f"Falling back to Gemini from {preferred_provider}")
        return gemini_client, "gemini"
        
    # Try any available client as last resort
    if openai_client:
        print("Using OpenAI as last resort")
        return openai_client, "openai"
    elif gemini_client:
        print("Using Gemini as last resort")
        return gemini_client, "gemini"
        
    return None, None

def call_ai_service(prompt, task_type="recommendation", max_retries=3):
    """
    Make an AI API call with fallback support
    
    Args:
        prompt (str): The prompt to send to the AI
        task_type (str): Type of task ('classification' or 'recommendation')
        max_retries (int): Maximum number of retries
        
    Returns:
        str: AI response or error message
    """
    if not openai_client and not gemini_client:
        init_ai_clients()
        
    for attempt in range(max_retries):
        client, provider = get_available_client()
        
        if not client:
            return "Error: No AI providers available"
            
        try:
            if provider == "openai":
                return call_openai(client, prompt, task_type)
            elif provider == "gemini":
                return call_gemini(client, prompt, task_type)
        except Exception as e:
            print(f"Error with {provider} (attempt {attempt + 1}): {e}")
            
            # Try fallback provider
            if provider == "openai" and gemini_client:
                try:
                    return call_gemini(gemini_client, prompt, task_type)
                except Exception as fallback_e:
                    print(f"Fallback to Gemini also failed: {fallback_e}")
            elif provider == "gemini" and openai_client:
                try:
                    return call_openai(openai_client, prompt, task_type)
                except Exception as fallback_e:
                    print(f"Fallback to OpenAI also failed: {fallback_e}")
                    
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                
    return f"Error: All AI providers failed after {max_retries} attempts"

def call_openai(client, prompt, task_type):
    """Make an OpenAI API call"""
    model = config.get_classification_model("openai") if task_type == "classification" else config.get_recommendation_model("openai")
    
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0 if task_type == "classification" else 0.5,
        max_tokens=2000 if task_type == "recommendation" else 50
    )
    return response.choices[0].message.content

def call_gemini(client, prompt, task_type):
    """Make a Gemini API call"""
    # For different tasks, we might want to use different models
    if task_type == "classification":
        model = genai.GenerativeModel(config.get_classification_model("gemini"))
    else:
        model = genai.GenerativeModel(config.get_recommendation_model("gemini"))
    
    # Configure generation parameters
    generation_config = genai.types.GenerationConfig(
        temperature=0.0 if task_type == "classification" else 0.5,
        max_output_tokens=2000 if task_type == "recommendation" else 50,
    )
    
    response = model.generate_content(prompt, generation_config=generation_config)
    return response.text

def classify_sector(company, max_retries=3):
    """
    Return a sector for a company using AI classification
    
    Args:
        company (str): Company name to classify
        max_retries (int): Maximum number of retries
        
    Returns:
        str: Classified sector name
    """
    # Initialize clients if not already done
    if not openai_client and not gemini_client:
        init_ai_clients()
    
    sectors_list = ", ".join(config.SECTORS)
    prompt = f"""Classify the following company into one of these sectors: {sectors_list}

Company: {company}

Respond with only the sector name, nothing else."""

    result = call_ai_service(prompt, task_type="classification", max_retries=max_retries)
    
    # Validate the result is in our sectors list
    if result in config.SECTORS:
        return result
    else:
        # Try to find a close match
        result_lower = result.lower().strip()
        for sector in config.SECTORS:
            if sector.lower() in result_lower or result_lower in sector.lower():
                return sector
        
        # Default fallback
        return "Technology"

def get_stock_recommendations(nasdaq_data, top_n=5, bottom_n=5):
    """Get stock recommendations based on the data using AI"""
    # Initialize clients if not already done
    if not openai_client and not gemini_client:
        if not init_ai_clients():
            error_msg = "Error: No AI providers configured or available."
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
        recommendations = call_ai_service(prompt, task_type="recommendation")
        
        if recommendations.startswith("Error:"):
            print(recommendations)
            return recommendations, None
        
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
    Analyze uploaded files using AI and generate insights
    
    Args:
        file_contents (list): List of dictionaries containing file information
                             Each dict has 'filename', 'content', and 'type' keys
    
    Returns:
        str: Markdown-formatted analysis of the uploaded files
    """
    # Initialize AI clients if not already done
    if not openai_client and not gemini_client:
        if not init_ai_clients():
            return "Error: No AI providers configured or available."
    
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
        # Call AI service to generate analysis
        analysis = call_ai_service(prompt, task_type="recommendation")
        
        if analysis.startswith("Error:"):
            print(analysis)
            return analysis
        
        # Save the analysis to a file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"file_analysis_{timestamp}.md"
        file_path = os.path.join(config.RESULTS_DIR, filename)
        
        with open(file_path, 'w') as f:
            f.write(analysis)
        
        return analysis
        
    except Exception as e:
        error_msg = f"Error generating AI analysis: {str(e)}"
        print(error_msg)
        return error_msg 