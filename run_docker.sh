#!/bin/bash

# yo this script runs our whole app in docker

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Please install Docker first."
  exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
  echo "Docker is not running. Please start Docker first."
  exit 1
fi

# Check if .env file exists, create it if it doesn't
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "OPENAI_API_KEY=" > .env
  echo "Please add your OpenAI API key to the .env file"
  exit 1
fi

# Build and run the Docker containers
echo "Building and starting Docker containers..."
docker-compose up --build -d

# Check if containers are running
if [ "$(docker-compose ps -q | wc -l)" -ne 2 ]; then
  echo "Error: Not all containers are running. Check the logs with 'docker-compose logs'"
  exit 1
fi

echo "Docker containers are running!"
echo "Frontend is available at: http://localhost:5173"
echo "Backend API is available at: http://localhost:8000/api"
echo "To stop the containers, run: docker-compose down" 