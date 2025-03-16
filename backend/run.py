"""
Run script for the Stock Market Analysis API server
"""

import os
import sys
import argparse

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from api import app

if __name__ == "__main__":
    # Get port from environment variable or use default
    default_port = int(os.environ.get('BACKEND_PORT', 8881))
    
    parser = argparse.ArgumentParser(description="Stock Market Analysis API Server")
    parser.add_argument("--host", default="0.0.0.0", help="Host to run the server on")
    parser.add_argument("--port", type=int, default=default_port, help=f"Port to run the server on (default: {default_port})")
    parser.add_argument("--debug", action="store_true", help="Run in debug mode")
    
    args = parser.parse_args()
    
    print(f"Starting API server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=args.debug) 