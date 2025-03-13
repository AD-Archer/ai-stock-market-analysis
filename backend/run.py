"""
Run script for the Stock Market Analysis API server
"""

import argparse
from api import app

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stock Market Analysis API Server")
    parser.add_argument("--host", default="0.0.0.0", help="Host to run the server on")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
    parser.add_argument("--debug", action="store_true", help="Run in debug mode")
    
    args = parser.parse_args()
    
    print(f"Starting API server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=args.debug) 