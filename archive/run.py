#!/usr/bin/env python3
"""
Run script for the Stock Market Analysis Flask application.
This is a convenience script to run the application with default settings.
"""

from app import app

if __name__ == '__main__':
    app.run(debug=True) 