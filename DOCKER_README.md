# Docker Setup for Stock Market Analysis

This guide explains how to run the entire application (frontend and backend) using Docker.

## Quick Start

The easiest way to run the application is using the provided script:

```bash
./run_docker.sh
```

This will:
1. Check for a `.env` file with your API keys
2. Build and start the Docker containers for both frontend and backend
3. Make the frontend available at http://localhost:5173
4. Make the backend API available at http://localhost:8000/api

## Manual Setup

If you prefer to run commands manually:

1. Create a `.env` file with your API keys:
   ```
   OPEN_AI_KEY=your_openai_api_key_here
   AlphaAdvantage_API_KEY=your_alpha_vantage_api_key_here
   FLASK_ENV=production
   FLASK_DEBUG=0
   VITE_DOCKER_ENV=true
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

### Frontend Container
- Port: 5173 (exposed to host)
- Environment Variables:
  - `NODE_ENV`: development
  - `VITE_DOCKER_ENV`: true
  - `VITE_API_BASE_URL`: http://localhost:8000/api
- Dependencies: Requires backend service to be running

### Backend Container
- Port: 8000 (exposed to host)
- Environment Variables:
  - `OPEN_AI_KEY`: Your OpenAI API key
  - `FLASK_ENV`: production
  - `FLASK_DEBUG`: 0
  - `AlphaAdvantage_API_KEY`: Your Alpha Vantage API key (optional)
- Volumes:
  - `./backend/data` → `/app/data`
  - `./results` → `/app/results`
  - `./.env` → `/app/.env`
- Health Check:
  - Endpoint: http://localhost:8000/api/status
  - Interval: 30s
  - Timeout: 10s
  - Retries: 3
  - Start Period: 5s

### Network
- All services are connected via the `stock-market-network` bridge network
- Services can communicate using their service names as hostnames

## Environment Variables

The application requires the following environment variables:

- `OPEN_AI_KEY`: Your OpenAI API key for AI recommendations (required)
- `AlphaAdvantage_API_KEY`: Your Alpha Vantage API key for stock data (optional)
- `FLASK_ENV`: Flask environment (production/development)
- `FLASK_DEBUG`: Flask debug mode (0/1)
- `VITE_DOCKER_ENV`: Frontend Docker environment flag (true/false)

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

6. Verify environment variables:
   ```bash
   docker-compose exec backend env
   docker-compose exec frontend env
   ``` 