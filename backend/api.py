import os
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import threading

# Import our modules
import sys
sys.path.append('..')  # Add parent directory to path
import config
import stock_data
import ai_utils

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.secret_key = os.urandom(24)

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

@app.route('/api/status', methods=['GET'])
def status():
    """API status check"""
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/data-status', methods=['GET'])
def data_status():
    """Check if we have cached data"""
    global nasdaq_df
    if nasdaq_df is None:
        nasdaq_df = stock_data.load_cached_stock_data()
    
    return jsonify({
        'has_data': nasdaq_df is not None
    })

@app.route('/api/fetch-data', methods=['POST'])
def fetch_data():
    """API endpoint to fetch stock data"""
    global current_task
    
    if current_task is not None:
        return jsonify({
            'success': False,
            'message': f'Another task is already running: {current_task}'
        }), 400
    
    data = request.json
    max_stocks = data.get('max_stocks', 100)
    use_mock_data = data.get('use_mock_data', False)
    
    # Start the data fetching in a background thread
    current_task = "Fetching stock data"
    thread = threading.Thread(target=fetch_data_task, args=(max_stocks, use_mock_data))
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'success': True,
        'message': 'Started fetching stock data'
    })

def fetch_data_task(max_stocks, use_mock_data):
    """Background task to fetch stock data"""
    global task_progress, task_total, task_message, task_complete, nasdaq_df
    
    try:
        # Reset progress
        task_progress = 0
        task_total = 100
        task_message = "Initializing..."
        
        # Load NASDAQ symbols
        task_message = "Loading NASDAQ symbols..."
        symbols = stock_data.get_nasdaq_symbols(max_stocks)
        task_progress = 10
        
        # Fetch stock data
        task_message = "Fetching stock data..."
        task_total = len(symbols) + 10  # 10 for initialization steps
        
        if use_mock_data:
            # Use mock data for testing
            nasdaq_df = stock_data.generate_mock_data(symbols)
            for i in range(len(symbols)):
                task_progress = 10 + i
                task_message = f"Generating mock data ({i+1}/{len(symbols)})"
        else:
            # Fetch real data
            data_list = []
            for i, symbol in enumerate(symbols):
                try:
                    stock = stock_data.fetch_stock_data(symbol)
                    if stock is not None:
                        data_list.append(stock)
                except Exception as e:
                    print(f"Error fetching {symbol}: {e}")
                
                task_progress = 10 + i
                task_message = f"Fetching {symbol} ({i+1}/{len(symbols)})"
            
            # Create DataFrame
            nasdaq_df = pd.DataFrame(data_list)
        
        # Save to cache
        task_message = "Saving data to cache..."
        stock_data.save_stock_data(nasdaq_df)
        
        task_progress = task_total
        task_message = "Data fetching complete!"
        task_complete = True
        
    except Exception as e:
        task_message = f"Error: {str(e)}"
        task_complete = True
    finally:
        global current_task
        current_task = None

@app.route('/api/get-recommendations', methods=['POST'])
def get_recommendations():
    """API endpoint to get AI recommendations"""
    global current_task, nasdaq_df
    
    if current_task is not None:
        return jsonify({
            'success': False,
            'message': f'Another task is already running: {current_task}'
        }), 400
    
    if nasdaq_df is None:
        nasdaq_df = stock_data.load_cached_stock_data()
        
    if nasdaq_df is None:
        return jsonify({
            'success': False,
            'message': 'No stock data available. Please fetch data first.'
        }), 400
    
    # Start the recommendations task in a background thread
    current_task = "Generating recommendations"
    thread = threading.Thread(target=recommendations_task)
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'success': True,
        'message': 'Started generating recommendations'
    })

def recommendations_task():
    """Background task to generate recommendations"""
    global task_progress, task_total, task_message, task_complete, nasdaq_df
    
    try:
        # Reset progress
        task_progress = 0
        task_total = 100
        task_message = "Initializing AI analysis..."
        
        # Generate recommendations
        task_message = "Analyzing stock data..."
        task_progress = 10
        
        # Get recommendations from AI
        recommendations_file = ai_utils.analyze_stocks(nasdaq_df)
        
        task_progress = task_total
        task_message = f"Analysis complete! Recommendations saved to {recommendations_file}"
        task_complete = True
        
    except Exception as e:
        task_message = f"Error: {str(e)}"
        task_complete = True
    finally:
        global current_task
        current_task = None

@app.route('/api/task-status', methods=['GET'])
def task_status():
    """API endpoint to get the status of the current task"""
    return jsonify({
        'task': current_task,
        'progress': task_progress,
        'total': task_total,
        'message': task_message,
        'complete': task_complete
    })

@app.route('/api/results', methods=['GET'])
def results():
    """API endpoint to get the list of recommendation files"""
    results_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'results')
    
    if not os.path.exists(results_dir):
        return jsonify({
            'files': []
        })
    
    files = []
    for filename in os.listdir(results_dir):
        if filename.endswith('.txt'):
            file_path = os.path.join(results_dir, filename)
            files.append({
                'name': filename,
                'date': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
                'size': os.path.getsize(file_path)
            })
    
    # Sort by date, newest first
    files.sort(key=lambda x: x['date'], reverse=True)
    
    return jsonify({
        'files': files
    })

@app.route('/api/download/<path:filename>', methods=['GET'])
def download_file(filename):
    """API endpoint to download a recommendation file"""
    results_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'results')
    return send_from_directory(results_dir, filename, as_attachment=True)

@app.route('/api/view-recommendation/<path:filename>', methods=['GET'])
def view_recommendation(filename):
    """API endpoint to view a recommendation file"""
    results_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'results')
    file_path = os.path.join(results_dir, filename)
    
    if not os.path.exists(file_path):
        return jsonify({
            'success': False,
            'message': 'File not found'
        }), 404
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    return jsonify({
        'success': True,
        'content': content
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000) 