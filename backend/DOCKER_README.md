# Docker Setup for Stock Market Analysis Backend

This guide explains how to run the backend using Docker.

## Quick Start

The easiest way to run the backend is using the provided script:

```bash
./run_docker.sh
```

This will:
1. Check for a `.env` file with your OpenAI API key
2. Build and start the Docker container
3. Make the API available at http://localhost:8000/api

## Manual Setup

If you prefer to run commands manually:

1. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Build and start the container:
   ```bash
   docker-compose up --build -d
   ```

3. Stop the container when done:
   ```bash
   docker-compose down
   ```

## Configuration

The Docker setup uses the following configuration:

- Port: 8000 (exposed to host)
- Data volume: `./data` is mounted to `/app/data` in the container
- Environment variables: Loaded from `.env` file

## Troubleshooting

If you encounter issues:

1. Check logs:
   ```bash
   docker-compose logs
   ```

2. Verify the API is running:
   ```bash
   curl http://localhost:8000/api/status
   ```

3. Rebuild the container:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ``` 