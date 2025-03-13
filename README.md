# Stock Market Analysis

A web application for analyzing stock market data and getting AI-powered investment recommendations.

## Project Structure and Migration Notes

This project has been restructured from a single-file application to a modern web application with separate backend and frontend components:

### Current Structure

- `backend/`: Flask API server with stock data fetching and AI analysis
  - `app.py`: Main Flask application
  - `api.py`: API endpoints
  - `stock_data.py`: Stock data fetching and processing
  - `ai_utils.py`: OpenAI integration for stock analysis
- `frontend/`: Web client (React/TypeScript)
- `data/`: Stock data files
- `run_dev.sh`: Development startup script

### Legacy Files

The following files in the root directory are from the previous version and should be considered deprecated:

- `main.py`: Original script for stock analysis (functionality now in backend modules)
- `config.py`: Configuration (now integrated in backend)
- `run.py`: Simple Flask runner (replaced by backend/run.py)

### Migration Plan

1. Ensure all functionality from `main.py` has been properly migrated to the backend modules
1. Verify configuration in `config.py` is properly integrated in the backend
1. Use `run_dev.sh` or `backend/run.py` to start the application instead of the root `run.py`
1. Once verified, these legacy files can be safely removed or archived

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- pip (Python package manager)

### Backend Setup

1. Create a virtual environment (optional but recommended):

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

1. Install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

1. Create a `.env` file in the root directory with your OpenAI API key:

```bash
OPENAI_API_KEY=your_api_key_here
```

1. Start the Flask backend:

```bash
cd backend
python run.py
```

The backend API will be available at [http://localhost:5000/api](http://localhost:5000/api)

### Frontend Setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

1. Start the development server:

```bash
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173)

## Usage

1. Open the application in your browser
1. Fetch stock data from the home page
1. Generate AI recommendations
1. View and download recommendations from the results page

## Features

- Fetch real stock data from NASDAQ
- Generate mock data for testing
- AI-powered investment recommendations
- View and download recommendation reports
- Real-time task progress tracking

## Technologies Used

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Bootstrap
- Font Awesome
- Chart.js

### Backend

- Flask
- Flask-CORS
- Pandas
- OpenAI API
- yfinance

## License

MIT