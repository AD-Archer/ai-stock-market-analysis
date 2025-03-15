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

### Frontend Structure
- `frontend/`: Web client (React/TypeScript)
  - `src/`: Source code
  - `public/`: Static assets
  - `package.json`: Node.js dependencies
  - `Dockerfile`: Frontend container configuration
  - Configuration files for TypeScript, Vite, Tailwind, etc.

### Scripts Structure
- `scripts/`: Cross-platform scripts for running the application
  - `docker/`: Scripts for Docker deployment
    - `run_docker.sh`: Linux/macOS script
    - `run_docker.bat`: Windows Command Prompt script
    - `run_docker.ps1`: Windows PowerShell script
  - `dev/`: Scripts for development environment
    - `run_dev.sh`: Linux/macOS script
    - `run_dev.bat`: Windows Command Prompt script
    - `run_dev.ps1`: Windows PowerShell script

### Root Directory
- `.env`: Environment configuration
- `.env.example`: Example environment configuration
- `docker-compose.yml`: Root Docker Compose configuration
- `DOCKER_README.md`: Docker-specific documentation

## Environment Configuration

The application uses a `.env` file in the root directory for configuration:

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

- `OPEN_AI_KEY`: Your OpenAI API key (required) for AI analysis
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
- Optional: `uv` package manager - A faster alternative to pip

### Development Setup

1. Clone the repository and set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

2. Run the development scripts:

```bash
# Linux/macOS
chmod +x scripts/dev/run_dev.sh
./scripts/dev/run_dev.sh

# Windows (Command Prompt)
scripts\dev\run_dev.bat

# Windows (PowerShell)
.\scripts\dev\run_dev.ps1
```

These scripts will:
- Check for required dependencies
- Set up a Python virtual environment
- Install backend and frontend dependencies
- Start both the Flask backend and React frontend servers

### Docker Setup

For containerized deployment, see `DOCKER_README.md` for detailed instructions:

```bash
# Linux/macOS
chmod +x scripts/docker/run_docker.sh
./scripts/docker/run_docker.sh

# Windows (Command Prompt)
scripts\docker\run_docker.bat

# Windows (PowerShell)
.\scripts\docker\run_docker.ps1

# Stop all services
docker-compose down
```

## Features

- Fetch real stock data from NASDAQ
- Generate mock data for testing
- AI-powered investment recommendations
- View and download recommendation reports
- Real-time task progress tracking
- Cross-platform support (Windows, macOS, Linux)
- Docker support for easy deployment

## Technologies Used

### Frontend
- React with TypeScript
- Vite build system
- React Router
- Axios for API requests
- Tailwind CSS
- Chart.js for data visualization

### Backend
- Flask API server
- Flask-CORS
- Pandas for data processing
- OpenAI API integration
- yfinance for stock data

## Accessing the Application

Once the application is running, you can access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

## License

MIT