# Docker Setup for Stock Market Analysis

This guide explains how to run the entire application (frontend and backend) using Docker.

## Quick Start

The easiest way to run the application is using the provided script:

```bash
./run_docker.sh
```

This will:
1. Check for a `.env` file with your OpenAI API key
2. Build and start the Docker containers for both frontend and backend
3. Make the frontend available at http://localhost:5173
4. Make the backend API available at http://localhost:8000/api

## Manual Setup

If you prefer to run commands manually:

1. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   AlphaAdvantage_API_KEY=your_alpha_vantage_api_key_here
   ```

2. Build and start the containers:
   ```bash
   docker-compose up --build -d
   ```

3. Stop the containers when done:
   ```bash
   docker-compose down
   ```

## Configuration

The Docker setup uses the following configuration:

- Frontend: 
  - Port: 5173 (exposed to host)
  - Proxy: Automatically forwards API requests to the backend

- Backend:
  - Port: 8000 (exposed to host)
  - Data volume: `./backend/data` is mounted to `/app/data` in the container
  - Results volume: `./results` is mounted to `/app/results` in the container
  - Config: `./config.py` is mounted to `/app/config.py` in the container
  - Environment variables: Loaded from `.env` file

## Environment Variables

The application requires the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key for AI recommendations
- `AlphaAdvantage_API_KEY`: Your Alpha Vantage API key for stock data (optional)

These are automatically loaded from the `.env` file in the root directory.

## Troubleshooting

If you encounter issues:

1. Check logs:
   ```bash
   docker-compose logs
   ```

2. Check specific service logs:
   ```bash
   docker-compose logs frontend
   docker-compose logs backend
   ```

3. Verify the services are running:
   ```bash
   docker-compose ps
   ```

4. Rebuild the containers:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

5. Check network connectivity:
   ```bash
   docker network inspect stock-market-network
   ``` 