#!/usr/bin/env bash
# Cross-platform script to run the app in Docker
# Works on Windows (with Git Bash/WSL), macOS, and Linux

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Docker is installed
if ! command_exists docker; then
  echo "Docker is not installed. Please install Docker first."
  exit 1
fi

# Check if Docker Compose is installed
if ! command_exists docker-compose && ! command_exists "docker compose"; then
  echo "Docker Compose is not installed. Please install Docker Compose first."
  exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Please start Docker first."
  exit 1
fi

# Check if .env file exists, create it if it doesn't
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "OPENAI_API_KEY=" > .env
  
  # Ask user if they want to add the API key now
  read -p "Would you like to add your OpenAI API key now? (y/n): " add_key
  if [[ "$add_key" =~ ^[Yy]$ ]]; then
    read -p "Enter your OpenAI API key: " api_key
    sed -i.bak "s/OPENAI_API_KEY=/OPENAI_API_KEY=$api_key/" .env
    rm -f .env.bak 2>/dev/null
    echo "API key added to .env file."
  else
    echo "Please add your OpenAI API key to the .env file before running the application."
    echo "You can edit the .env file manually."
  fi
fi

# Ask user which Docker Compose command to use
docker_compose_cmd="docker-compose"
if command_exists "docker compose"; then
  read -p "Use 'docker compose' (newer) or 'docker-compose' (older)? [1/2] (default: 1): " compose_choice
  if [ "$compose_choice" = "2" ]; then
    docker_compose_cmd="docker-compose"
  else
    docker_compose_cmd="docker compose"
  fi
fi

# Build and run the Docker containers
echo "Building and starting Docker containers..."
$docker_compose_cmd up --build -d

# Check if containers are running
container_count=$($docker_compose_cmd ps -q | wc -l)
if [ "$container_count" -lt 1 ]; then
  echo "Error: No containers are running. Check the logs with '$docker_compose_cmd logs'"
  exit 1
fi

echo "Docker containers are running!"
echo "Frontend is available at: http://localhost:5173"
echo "Backend API is available at: http://localhost:8000/api"
echo "To stop the containers, run: $docker_compose_cmd down" 