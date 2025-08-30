#!/bin/bash
# Unified start script
# Default: development (live reload) -> Flask backend + Vite dev server
# Prod-like: pass --prod or --build to build static frontend then serve with vite preview
# Usage:
#   ./start.sh            # dev mode
#   ./start.sh --prod     # build + preview
#   ./start.sh --build    # same as --prod

set -e  # Exit on any error

MODE=dev
for arg in "$@"; do
    case "$arg" in
        --prod|--build|--production)
            MODE=prod
            shift;;
        -h|--help)
            echo "Usage: $0 [--prod]"; exit 0;;
    esac
done

# Load root .env early (export vars) so Vite + backend pick them up
if [ -f ".env" ]; then
    set -a
    # shellcheck disable=SC1091
    . ./.env
    set +a
fi

# Determine backend/front-end ports (allow override via env or default)
BACKEND_PORT="${BACKEND_PORT:-8881}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

# Allow per-directory .env overrides
if [ -f "backend/.env" ]; then
    ENV_PORT=$(grep -E '^BACKEND_PORT=' backend/.env | cut -d '=' -f2)
    if [ -n "$ENV_PORT" ]; then BACKEND_PORT=$ENV_PORT; fi
fi
if [ -f "frontend/.env" ]; then
    ENV_PORT=$(grep -E '^(FRONTEND_PORT|PORT)=' frontend/.env | tail -n1 | cut -d '=' -f2)
    if [ -n "$ENV_PORT" ]; then FRONTEND_PORT=$ENV_PORT; fi
fi

export BACKEND_PORT FRONTEND_PORT

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

echo "Starting backend server on port $BACKEND_PORT ..."
python3 run.py --port "$BACKEND_PORT" &
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

if [ "$MODE" = "prod" ]; then
    echo "Building frontend (Vite)..."
    pnpm run build
    echo "Starting frontend preview server on port $FRONTEND_PORT (strict)..."
    pnpm run preview -- --host 0.0.0.0 --port "$FRONTEND_PORT" --strictPort &
    FRONTEND_PID=$!
else
    echo "Starting frontend dev server on port $FRONTEND_PORT (strict)..."
    pnpm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" --strictPort &
    FRONTEND_PID=$!
fi

# Check if frontend started successfully
sleep 2
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "Error: Frontend failed to start"
    exit 1
fi

cd ..

echo "✅ Both servers running successfully! (mode: $MODE)"
echo "Backend:  http://localhost:$BACKEND_PORT"
echo "Frontend: http://localhost:$FRONTEND_PORT"
if [ "$MODE" = "prod" ]; then
    echo "(Frontend is built static preview. Re-run without --prod for hot reload.)"
fi
echo "Press Ctrl+C to stop both servers."

# Wait for processes to finish
wait
