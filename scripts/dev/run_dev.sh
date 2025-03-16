#!/usr/bin/env bash
# Cross-platform script to run the app in development mode
# Works on Windows (with Git Bash/WSL), macOS, and Linux

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Detect OS
case "$(uname -s)" in
  CYGWIN*|MINGW*|MSYS*)
    OS="Windows"
    ACTIVATE_CMD="source"
    if [ -f ".venv/Scripts/activate" ]; then
      ACTIVATE_PATH=".venv/Scripts/activate"
    else
      ACTIVATE_PATH=".venv/bin/activate"
    fi
    ;;
  Darwin*)
    OS="macOS"
    ACTIVATE_CMD="source"
    ACTIVATE_PATH=".venv/bin/activate"
    ;;
  Linux*)
    OS="Linux"
    ACTIVATE_CMD="source"
    ACTIVATE_PATH=".venv/bin/activate"
    ;;
  *)
    OS="Unknown"
    ACTIVATE_CMD="source"
    ACTIVATE_PATH=".venv/bin/activate"
    ;;
esac

echo "Detected OS: $OS"

# Check and create .env file if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo ".env file created. Please update it with your actual API keys and configuration."
fi

# Ask user which Python package manager to use
USE_UV=false
if command_exists uv; then
  read -p "Use uv package manager instead of pip? (y/n, default: n): " use_uv_choice
  if [[ "$use_uv_choice" =~ ^[Yy]$ ]]; then
    USE_UV=true
    echo "Using uv package manager"
  else
    echo "Using pip package manager"
  fi
else
  read -p "Would you like to install uv package manager? (y/n, default: n): " install_uv_choice
  if [[ "$install_uv_choice" =~ ^[Yy]$ ]]; then
    echo "Installing uv package manager..."
    if command_exists curl; then
      curl -LsSf https://astral.sh/uv/install.sh | sh
      export PATH="$HOME/.cargo/bin:$PATH"
      USE_UV=true
      echo "uv installed successfully"
    else
      echo "curl is not installed. Please install uv manually: https://github.com/astral-sh/uv"
    fi
  fi
fi

# Start the Flask backend
echo "Starting Flask backend..."
cd backend || { echo "Backend directory not found"; exit 1; }

# Check which Python command to use
PYTHON_CMD="python3"
if command_exists python3; then
  PYTHON_CMD="python3"
elif command_exists python; then
  PYTHON_CMD="python"
fi

# Check if virtual environment exists, create it if it doesn't
if [ -d ".venv" ]; then
  echo "Activating existing virtual environment..."
  $ACTIVATE_CMD "$ACTIVATE_PATH"
else
  echo "Creating new virtual environment..."
  if $USE_UV; then
    uv venv .venv
  else
    $PYTHON_CMD -m venv .venv
  fi
  $ACTIVATE_CMD "$ACTIVATE_PATH"
fi

# Always install/update requirements to ensure we have the latest versions
echo "Installing/updating requirements..."
if $USE_UV; then
  uv pip install -r requirements.txt --upgrade
else
  pip install -r requirements.txt --upgrade
fi

# Run the Python file
echo "Starting backend server..."
$PYTHON_CMD run.py &
BACKEND_PID=$!

# Deactivate virtual environment
if [ "$OS" != "Windows" ]; then
  deactivate
fi
cd ..

# Start the React frontend
echo "Starting React frontend..."
cd frontend || { echo "Frontend directory not found"; exit 1; }

# Check if pnpm is installed
if ! command_exists pnpm; then
  echo "pnpm is not installed. Would you like to install it? (y/n, default: n): "
  read -p "" install_pnpm_choice
  if [[ "$install_pnpm_choice" =~ ^[Yy]$ ]]; then
    if command_exists npm; then
      echo "Installing pnpm using npm..."
      npm install -g pnpm
    else
      echo "npm is not installed. Please install Node.js and npm first, then install pnpm."
      # Kill the backend process before exiting
      kill $BACKEND_PID 2>/dev/null
      exit 1
    fi
  else
    echo "pnpm is required to run the frontend. Please install it manually."
    # Kill the backend process before exiting
    kill $BACKEND_PID 2>/dev/null
    exit 1
  fi
fi

pnpm install
pnpm run dev &
FRONTEND_PID=$!
cd ..

# Function to handle exit
cleanup() {
  echo "Shutting down servers..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "Development servers running. Press Ctrl+C to stop."
echo "Backend: http://localhost:8000/api"
echo "Frontend: http://localhost:5173"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 