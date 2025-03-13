#!/bin/bash

# yo this script helps run our docker container

# Check if .env file exists, create it if it doesn't
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "OPENAI_API_KEY=" > .env
  echo "Please add your OpenAI API key to the .env file"
  exit 1
fi

# Build and run the Docker container
echo "Building and starting Docker container..."
docker-compose up --build -d

echo "Docker container is running!"
echo "Backend API is available at: http://localhost:8000/api"
echo "To stop the container, run: docker-compose down" 