#!/bin/bash

# Start the Flask backend
echo "Starting Flask backend..."
cd backend
# Check if virtual environment exists and activate it
if [ -d ".venv" ]; then
  echo "Activating virtual environment..."
  source .venv/bin/activate
else
  echo "Virtual environment not found. Using system Python..."
fi
python run.py &
BACKEND_PID=$!
# Deactivate virtual environment if it was activated
if [ -n "$VIRTUAL_ENV" ]; then
  deactivate
fi
cd ..

# Start the React frontend
echo "Starting React frontend..."
cd frontend
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