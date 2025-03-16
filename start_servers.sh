#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "Loaded environment variables from .env"
else
  echo "Warning: .env file not found. Using default values."
  # Set default values
  export BACKEND_PORT=8881
  export FRONTEND_PORT=8173
fi

echo "Using backend port: $BACKEND_PORT"
echo "Using frontend port: $FRONTEND_PORT"

# Kill any processes running on the configured ports
echo "Checking for processes on ports $BACKEND_PORT and $FRONTEND_PORT..."
lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null
lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null
echo "Cleared ports."

# Start backend server
echo "Starting backend server..."
cd backend
python3 run.py --port $BACKEND_PORT &
BACKEND_PID=$!
cd ..

# Start frontend server
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Development servers running. Press Ctrl+C to stop."
echo "Backend: http://localhost:$BACKEND_PORT/api"
echo "Frontend: http://localhost:$FRONTEND_PORT"

# Handle graceful shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait 