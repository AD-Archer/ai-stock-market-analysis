#!/bin/bash
# Simple start script - runs both backend and frontend

set -e  # Exit on any error

# Function to cleanup processes on exit
cleanup() {
    echo "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit
}

# Handle Ctrl+C and other signals
trap cleanup SIGINT SIGTERM EXIT

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed. Please install Python 3."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: node is not installed. Please install Node.js."
    exit 1
fi

echo "Starting backend..."
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found!"
    exit 1
fi

cd backend
echo "Setting up Python virtual environment..."
python3 -m venv .venv 2>/dev/null || true
source .venv/bin/activate

if [ ! -f "requirements.txt" ]; then
    echo "Error: requirements.txt not found in backend directory!"
    exit 1
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt || {
    echo "Error: Failed to install Python dependencies"
    exit 1
}

echo "Starting backend server..."
python3 run.py &
BACKEND_PID=$!

# Check if backend started successfully
sleep 2
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Error: Backend failed to start"
    exit 1
fi

cd ..

echo "Starting frontend..."
if [ ! -d "frontend" ]; then
    echo "Error: frontend directory not found!"
    exit 1
fi

cd frontend

if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in frontend directory!"
    exit 1
fi

echo "Installing dependencies..."
# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm || {
        echo "Error: Failed to install pnpm"
        exit 1
    }
fi

echo "Installing frontend dependencies..."
pnpm install || {
    echo "Error: Failed to install frontend dependencies"
    exit 1
}

echo "Starting frontend server..."
pnpm run dev &
FRONTEND_PID=$!

# Check if frontend started successfully
sleep 2
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "Error: Frontend failed to start"
    exit 1
fi

cd ..

# Read backend port from backend/.env if exists, fallback to 8881
BACKEND_PORT=8881
if [ -f "backend/.env" ]; then
    ENV_PORT=$(grep -E '^PORT=' backend/.env | cut -d '=' -f2)
    if [ ! -z "$ENV_PORT" ]; then
        BACKEND_PORT=$ENV_PORT
    fi
fi

# Read frontend port from frontend/.env if exists, fallback to 5173
FRONTEND_PORT=5173
if [ -f "frontend/.env" ]; then
    ENV_PORT=$(grep -E '^PORT=' frontend/.env | cut -d '=' -f2)
    if [ ! -z "$ENV_PORT" ]; then
        FRONTEND_PORT=$ENV_PORT
    fi
fi

echo "✅ Both servers running successfully!"
echo "Backend: http://localhost:$BACKEND_PORT"
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Press Ctrl+C to stop both servers."

# Wait for processes to finish
wait
