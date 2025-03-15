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

2. Run the Development Scripts:

   Depending on your operating system, use one of the following scripts to start the development environment:

   - **Unix-like Systems (macOS, Linux)**
     ```bash
     # Make the script executable
     chmod +x scripts/dev/run_dev.sh

     # Run the script
     ./scripts/dev/run_dev.sh
     ```

   - **Windows (Command Prompt)**
     ```cmd
     scripts\dev\run_dev.bat
     ```

   - **Windows (PowerShell)**
     ```powershell
     .\scripts\dev\run_dev.ps1
     ```

   These scripts will:
   - Check for required dependencies (Python, npm)
   - Ask if you want to use the `uv` package manager instead of pip
   - Set up a Python virtual environment
   - Install backend dependencies
   - Start the Flask backend server
   - Install frontend dependencies
   - Start the React development server

3. Backend Setup (Manual, if not using scripts):
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

4. Frontend Setup (Manual, if not using scripts):
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

# Stock Market Analysis Application

This application provides tools for analyzing stock market data. It consists of a Flask backend and a React frontend.

## Cross-Platform Scripts

This project includes cross-platform scripts to run the application in both development and Docker environments. The scripts work on Windows, macOS, and Linux.

### Development Mode

To run the application in development mode, use one of the following scripts based on your operating system:

#### Unix-like Systems (macOS, Linux)
```bash
# Make the script executable
chmod +x run_dev.sh

# Run the script
./run_dev.sh
```

#### Windows (Command Prompt)
```cmd
run_dev.bat
```

#### Windows (PowerShell)
```powershell
.\run_dev.ps1
```

The development script will:
1. Check for required dependencies (Python, npm)
2. Ask if you want to use the `uv` package manager instead of pip
3. Set up a Python virtual environment
4. Install backend dependencies
5. Start the Flask backend server
6. Install frontend dependencies
7. Start the React development server

### Docker Mode

To run the application using Docker, use one of the following scripts:

#### Unix-like Systems (macOS, Linux)
```bash
# Make the script executable
chmod +x run_docker.sh

# Run the script
./run_docker.sh
```

#### Windows (Command Prompt)
```cmd
run_docker.bat
```

#### Windows (PowerShell)
```powershell
.\run_docker.ps1
```

The Docker script will:
1. Check if Docker is installed and running
2. Create a `.env` file if it doesn't exist and prompt for your OpenAI API key
3. Build and start the Docker containers
4. Verify that the containers are running

## Script Features

All scripts include the following features:
- Cross-platform compatibility (Windows, macOS, Linux)
- User input for configuration options
- Option to use `uv` package manager instead of pip
- Automatic dependency installation
- Graceful shutdown of servers

## Accessing the Application

Once the application is running, you can access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

## Requirements

- Python 3.6 or higher
- Node.js and npm
- Docker and Docker Compose (for Docker mode)

## Optional Dependencies

- `uv` package manager: A faster alternative to pip (https://github.com/astral-sh/uv)