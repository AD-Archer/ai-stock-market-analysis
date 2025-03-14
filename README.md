# Stock Market Analysis

A web application for analyzing stock market data and getting AI-powered investment recommendations.

## Project Structure

The project is organized into separate backend and frontend components with Docker support:

### Backend Structure
- `backend/`: Flask API server with stock data fetching and AI analysis
  - `app.py`: Main Flask application
  - `api.py`: API endpoints
  - `stock_data.py`: Stock data fetching and processing
  - `ai_utils.py`: OpenAI integration for stock analysis
  - `config.py`: Configuration management
  - `run.py`: Application entry point
  - `requirements.txt`: Python dependencies
  - `Dockerfile`: Backend container configuration
  - `docker-compose.yml`: Backend service configuration

### Frontend Structure
- `frontend/`: Web client (React/TypeScript)
  - `src/`: Source code
  - `public/`: Static assets
  - `package.json`: Node.js dependencies
  - `Dockerfile`: Frontend container configuration
  - Configuration files for TypeScript, Vite, Tailwind, etc.

### Root Directory
- `.env`: Environment configuration (see Environment Configuration section)
- `.env.example`: Example environment configuration
- `docker-compose.yml`: Root Docker Compose configuration
- `run_dev.sh`: Development startup script
- `run_docker.sh`: Docker startup script
- `DOCKER_README.md`: Docker-specific documentation

## Environment Configuration

The application uses a `.env` file in the root directory for configuration. See `.env.example` for a template:

```bash
# OpenAI API Key
OPEN_AI_KEY=your_openai_api_key_here

# Alpha Vantage API Key (optional)
AlphaAdvantage_API_KEY=your_alphavantage_api_key_here

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=0

# Frontend Configuration
VITE_DOCKER_ENV=false
```

### Environment Variables

- `OPEN_AI_KEY`: Your OpenAI API key (require) for full ai analysis
- `AlphaAdvantage_API_KEY`: Your Alpha Vantage API key (optional)
- `FLASK_ENV`: Flask environment (production/development)
- `FLASK_DEBUG`: Flask debug mode (0/1)
- `VITE_DOCKER_ENV`: Frontend Docker environment flag (false/true)

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- pip (Python package manager)
- Docker and Docker Compose (optional, for containerized deployment)

### Development Setup

1. Clone the repository and set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

2. Backend Setup:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

3. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup

For containerized deployment, see `DOCKER_README.md` for detailed instructions. Basic usage:

```bash
# Build and start all services
./run_docker.sh

# Stop all services
docker-compose down
```

## Usage

1. Open the application in your browser
2. Fetch stock data from the home page
3. Generate AI recommendations
4. View and download recommendations from the results page

## Features

- Fetch real stock data from NASDAQ
- Generate mock data for testing
- AI-powered investment recommendations
- View and download recommendation reports
- Real-time task progress tracking
- Docker support for easy deployment

## Technologies Used

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Chart.js

### Backend

- Flask
- Flask-CORS
- Pandas
- OpenAI API
- yfinance

## License

MIT