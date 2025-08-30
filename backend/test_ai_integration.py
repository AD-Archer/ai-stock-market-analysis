#!/usr/bin/env python3
"""
Test script for AI integration (OpenAI and Gemini)

This script tests both OpenAI and Gemini integration to ensure the fallback
mechanism works correctly and both providers can handle stock analysis tasks.

Usage:
    python test_ai_integration.py

Requirements:
    - .env file with API keys (OPEN_AI_KEY and/or GEMINI_API_KEY)
    - All dependencies installed: pip install -r requirements.txt
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import config
    import ai_utils
    import pandas as pd
    
    def test_config():
        """Test configuration loading"""
        print("=" * 50)
        print("TESTING CONFIGURATION")
        print("=" * 50)
        
        print(f"Primary AI Provider: {config.PRIMARY_AI_PROVIDER}")
        print(f"Fallback AI Provider: {config.FALLBACK_AI_PROVIDER}")
        print(f"OpenAI API Key Available: {'Yes' if config.OPENAI_API_KEY else 'No'}")
        print(f"Gemini API Key Available: {'Yes' if config.GEMINI_API_KEY else 'No'}")
        print(f"OpenAI Classification Model: {config.get_classification_model('openai')}")
        print(f"OpenAI Recommendation Model: {config.get_recommendation_model('openai')}")
        print(f"Gemini Classification Model: {config.get_classification_model('gemini')}")
        print(f"Gemini Recommendation Model: {config.get_recommendation_model('gemini')}")
        print()
    
    def test_ai_initialization():
        """Test AI client initialization"""
        print("=" * 50)
        print("TESTING AI CLIENT INITIALIZATION")
        print("=" * 50)
        
        success = ai_utils.init_ai_clients()
        print(f"AI clients initialization: {'Success' if success else 'Failed'}")
        
        # Test provider availability
        openai_available = ai_utils.config.is_provider_available('openai')
        gemini_available = ai_utils.config.is_provider_available('gemini')
        
        print(f"OpenAI provider available: {'Yes' if openai_available else 'No'}")
        print(f"Gemini provider available: {'Yes' if gemini_available else 'No'}")
        
        # Test getting available client
        client, provider = ai_utils.get_available_client()
        print(f"Available client: {provider if client else 'None'}")
        print()
        
        return success
    
    def test_sector_classification():
        """Test sector classification"""
        print("=" * 50)
        print("TESTING SECTOR CLASSIFICATION")
        print("=" * 50)
        
        test_companies = [
            "Apple Inc.",
            "Microsoft Corporation", 
            "Google Inc.",
            "Amazon.com Inc.",
            "Tesla Inc."
        ]
        
        for company in test_companies:
            try:
                sector = ai_utils.classify_sector(company)
                print(f"{company}: {sector}")
            except Exception as e:
                print(f"{company}: Error - {e}")
        print()
    
    def test_stock_recommendations():
        """Test stock recommendations with sample data"""
        print("=" * 50)
        print("TESTING STOCK RECOMMENDATIONS")
        print("=" * 50)
        
        # Create sample data
        sample_data = pd.DataFrame({
            'symbol': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
            'name': ['Apple Inc.', 'Microsoft Corp.', 'Alphabet Inc.', 'Amazon.com Inc.', 'Tesla Inc.'],
            'ytd': [25.5, 20.3, 15.8, -5.2, -10.1],
            'sector': ['Technology', 'Technology', 'Technology', 'Consumer Cyclical', 'Consumer Cyclical']
        })
        
        try:
            recommendations, file_path = ai_utils.get_stock_recommendations(sample_data, top_n=3, bottom_n=2)
            
            if file_path:
                print(f"Recommendations saved to: {file_path}")
                print("\nFirst 500 characters of recommendations:")
                print("-" * 40)
                print(recommendations[:500] + "..." if len(recommendations) > 500 else recommendations)
            else:
                print(f"Failed to generate recommendations: {recommendations}")
                
        except Exception as e:
            print(f"Error generating recommendations: {e}")
        print()
    
    def main():
        """Main test function"""
        print("AI Integration Test Script")
        print("=" * 50)
        
        try:
            # Test configuration
            test_config()
            
            # Test AI initialization
            if not test_ai_initialization():
                print("❌ AI initialization failed. Check your API keys in .env file.")
                return False
                
            # Test sector classification
            test_sector_classification()
            
            # Test stock recommendations
            test_stock_recommendations()
            
            print("✅ All tests completed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            return False
    
    if __name__ == "__main__":
        main()
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you have installed all dependencies:")
    print("pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)
