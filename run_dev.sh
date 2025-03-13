#!/bin/bash

# Start the Flask backend
echo "Starting Flask backend..."
cd backend

# Check if virtual environment exists, create it if it doesn't
if [ -d ".venv" ]; then
  echo "Activating existing virtual environment..."
  source .venv/bin/activate
else
  echo "Creating new virtual environment..."
  python3 -m venv .venv
  source .venv/bin/activate
  
  # Install requirements
  echo "Installing requirements..."
  pip install -r requirements.txt
fi

# If virtual environment exists but requirements need to be installed/updated
if [ -d ".venv" ] && [ ! -f ".venv/.requirements_installed" ]; then
  echo "Installing/updating requirements..."
  pip install -r requirements.txt
  touch .venv/.requirements_installed
fi

# Run the Python file
echo "Starting backend server..."
python run.py &
BACKEND_PID=$!

# Deactivate virtual environment
deactivate
cd ..

# Start the React frontend
echo "Starting React frontend..."
cd frontend
# yo make sure we're using the development environment
cp .env.development .env
npm run dev &
FRONTEND_PID=$!
cd ..

# Function to handle exit
function cleanup {
  echo "Shutting down servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "Development servers running. Press Ctrl+C to stop."
echo "Backend: http://localhost:8000/api"
echo "Frontend: http://localhost:5173"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 