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
        task_message = f"Fetching data for {task_total} stocks..."
        
        # Fetch data for each symbol
        stock_data_list = []
        
        if use_mock_data:
            task_message = "Generating mock data..."
            stock_data_list = stock_data.generate_mock_data(symbols)
            task_progress = task_total
        else:
            for i, symbol in enumerate(symbols):
                task_message = f"Fetching data for {symbol}..."
                stock_info = stock_data.fetch_stock_data(symbol)
                stock_data_list.append(stock_info)
                task_progress = i + 1
        
        # Create DataFrame
        nasdaq_df = pd.DataFrame(stock_data_list)
        
        # Classify sectors
        task_message = "Classifying sectors..."
        task_progress = 0
        task_total = len(nasdaq_df)
        
        sectors = []
        for i, row in tqdm(nasdaq_df.iterrows(), total=len(nasdaq_df)):
            task_message = f"Classifying sector for {row['name']}..."
            sector = ai_utils.classify_sector(row['name'])
            sectors.append(sector)
            task_progress = i + 1
        
        nasdaq_df['sector'] = sectors
        
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
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Stock Market Analysis Flask App')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    parser.add_argument('--host', default='127.0.0.1', help='Host to run the server on')
    parser.add_argument('--port', type=int, default=5000, help='Port to run the server on')
    args = parser.parse_args()
    
    # Run the Flask app
    app.run(debug=args.debug, host=args.host, port=args.port) 