"""
Stock Market Analysis Web Application

This Flask web application provides a user interface for fetching, analyzing, and visualizing
stock market data. It serves as the main web server for the stock market analysis application,
handling user requests, background tasks, and rendering HTML templates.

Features:
- Web interface for stock data fetching and analysis
- Background task processing with progress tracking
- Real-time task status updates
- Stock performance visualization
- AI-powered stock recommendations
- File download and viewing capabilities

Routes:
- / (GET): Main page with data fetching form
- /fetch-data (POST): Start data fetching task
- /get-recommendations (POST): Generate AI recommendations
- /task-status (GET): Get current task status (AJAX endpoint)
- /results (GET): View analysis results and recommendations
- /download/<filename> (GET): Download a recommendation file
- /view-recommendation/<filename> (GET): View a recommendation file

Usage:
1. Start the server: python app.py [options]
2. Access the web interface at http://localhost:5000
3. Use the form to fetch stock data (real or mock)
4. Generate AI recommendations
5. View and download results

Command-line options:
- --debug: Run in debug mode
- --host: Host to run the server on (default: 127.0.0.1)
- --port: Port to run the server on (default: 5000)

Dependencies:
- Flask
- pandas
- tqdm
- Custom modules: config, stock_data, ai_utils
"""

import os
import pandas as pd
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from tqdm import tqdm
import argparse
from datetime import datetime
import threading

# Import our modules
import config
import stock_data
import ai_utils

# Create Flask app
app = Flask(__name__)
app.secret_key = os.urandom(24)

# Add datetime now function to templates
@app.context_processor
def inject_now():
    return {'now': datetime.now}

# Global variables to store state
current_task = None
task_progress = 0
task_total = 0
task_message = ""
task_complete = False
nasdaq_df = None

def reset_task_status():
    """Reset the task status variables"""
    global current_task, task_progress, task_total, task_message, task_complete
    current_task = None
    task_progress = 0
    task_total = 0
    task_message = ""
    task_complete = False

@app.route('/')
def index():
    """Main page route"""
    # Check if we have cached data
    global nasdaq_df
    if nasdaq_df is None:
        nasdaq_df = stock_data.load_cached_stock_data()
    
    return render_template('index.html', 
                          has_data=nasdaq_df is not None,
                          current_task=current_task,
                          task_complete=task_complete)

@app.route('/fetch-data', methods=['POST'])
def fetch_data():
    """Route to fetch stock data"""
    global current_task, task_progress, task_total, task_message, task_complete, nasdaq_df
    
    # Get parameters from form
    max_stocks = int(request.form.get('max_stocks', config.MAX_STOCKS_DEFAULT))
    use_mock_data = 'use_mock_data' in request.form
    
    # Reset task status
    reset_task_status()
    current_task = "fetch_data"
    task_message = "Initializing..."
    
    # Start the data fetching in a background thread
    thread = threading.Thread(target=fetch_data_task, args=(max_stocks, use_mock_data))
    thread.daemon = True
    thread.start()
    
    return redirect(url_for('index'))

def fetch_data_task(max_stocks, use_mock_data):
    """Background task to fetch stock data"""
    global task_progress, task_total, task_message, task_complete, nasdaq_df
    
    try:
        # Load NASDAQ-100 symbols
        symbols = stock_data.load_nasdaq100_symbols()
        
        # Limit symbols if max_stocks is specified
        if max_stocks > 0:
            symbols = symbols[:max_stocks]
        
        task_total = len(symbols)
        
        # Use pregenerated mock data for better performance
        if use_mock_data:
            task_message = "Loading pregenerated mock data..."
            # Load all mock data at once (more efficient)
            nasdaq_df = stock_data.load_mock_data()
            
            # Filter to requested symbols if needed
            if max_stocks > 0:
                nasdaq_df = nasdaq_df[nasdaq_df['symbol'].isin(symbols)]
                
            task_progress = task_total
        else:
            # Even when not using "mock" data, we still use our pregenerated data
            # but we simulate fetching each stock individually for progress tracking
            task_message = "Fetching stock data..."
            stock_data_list = []
            
            for i, symbol in enumerate(symbols):
                task_message = f"Fetching data for {symbol}..."
                stock_info = stock_data.fetch_stock_data(symbol)
                stock_data_list.append(stock_info)
                task_progress = i + 1
            
            # Create DataFrame
            nasdaq_df = pd.DataFrame(stock_data_list)
        
        # Save data
        task_message = "Saving data..."
        stock_data.save_stock_data(nasdaq_df)
        
        task_message = "Data fetching complete!"
        task_complete = True
        
    except Exception as e:
        task_message = f"Error: {str(e)}"
        task_complete = True

@app.route('/get-recommendations', methods=['POST'])
def get_recommendations():
    """Route to get stock recommendations"""
    global current_task, task_progress, task_total, task_message, task_complete, nasdaq_df
    
    if nasdaq_df is None or 'sector' not in nasdaq_df.columns:
        flash("No stock data available. Please fetch data first.")
        return redirect(url_for('index'))
    
    # Reset task status
    reset_task_status()
    current_task = "get_recommendations"
    task_message = "Generating recommendations..."
    
    # Start the recommendation task in a background thread
    thread = threading.Thread(target=recommendations_task)
    thread.daemon = True
    thread.start()
    
    return redirect(url_for('index'))

def recommendations_task():
    """Background task to get stock recommendations"""
    global task_message, task_complete, nasdaq_df
    
    try:
        task_message = "Analyzing stock data..."
        recommendations, file_path = ai_utils.get_stock_recommendations(nasdaq_df)
        
        if file_path:
            task_message = f"Recommendations saved to {os.path.basename(file_path)}"
        else:
            task_message = "Failed to save recommendations"
        
        task_complete = True
        
    except Exception as e:
        task_message = f"Error: {str(e)}"
        task_complete = True

@app.route('/task-status')
def task_status():
    """API endpoint to get the current task status"""
    return jsonify({
        'current_task': current_task,
        'progress': task_progress,
        'total': task_total,
        'message': task_message,
        'complete': task_complete,
        'percent': int(task_progress / max(task_total, 1) * 100) if task_total > 0 else 0
    })

@app.route('/results')
def results():
    """Route to display results"""
    global nasdaq_df
    
    if nasdaq_df is None or 'sector' not in nasdaq_df.columns:
        flash("No stock data available. Please fetch data first.")
        return redirect(url_for('index'))
    
    # Get top and bottom performers
    top_performers = nasdaq_df.sort_values(by='ytd', ascending=False).head(10)
    bottom_performers = nasdaq_df.sort_values(by='ytd', ascending=True).head(10)
    
    # Get sector performance
    sector_performance = nasdaq_df.groupby('sector')['ytd'].mean().reset_index()
    sector_performance = sector_performance.sort_values(by='ytd', ascending=False)
    
    # Get recommendation files
    recommendation_files = []
    try:
        files = [f for f in os.listdir(config.RESULTS_DIR) if f.startswith("stock_recommendations_") and f.endswith(".txt")]
        recommendation_files = sorted(files, key=lambda x: os.path.getmtime(os.path.join(config.RESULTS_DIR, x)), reverse=True)
    except Exception as e:
        print(f"Error listing recommendation files: {e}")
    
    return render_template('results.html',
                          top_performers=top_performers,
                          bottom_performers=bottom_performers,
                          sector_performance=sector_performance,
                          recommendation_files=recommendation_files)

@app.route('/download/<path:filename>')
def download_file(filename):
    """Route to download a file"""
    return send_from_directory(config.RESULTS_DIR, filename, as_attachment=True)

@app.route('/view-recommendation/<path:filename>')
def view_recommendation(filename):
    """Route to view a recommendation file"""
    try:
        with open(os.path.join(config.RESULTS_DIR, filename), 'r') as f:
            content = f.read()
        return render_template('view_recommendation.html', filename=filename, content=content)
    except Exception as e:
        flash(f"Error reading file: {str(e)}")
        return redirect(url_for('results'))

if __name__ == '__main__':
    # Get port from environment variable or use default
    default_port = int(os.environ.get('BACKEND_PORT', 8881))
    
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Stock Market Analysis Flask App')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    parser.add_argument('--host', default='127.0.0.1', help='Host to run the server on')
    parser.add_argument('--port', type=int, default=default_port, help=f'Port to run the server on (default: {default_port})')
    args = parser.parse_args()
    
    # Run the Flask app
    app.run(debug=args.debug, host=args.host, port=args.port) 