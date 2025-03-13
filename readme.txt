# Quick Start Commands

# Setup Backend (with uv)
cd backend && uv venv && source .venv/bin/activate && uv pip install -r requirements.txt && cd ..

# Setup Frontend
cd frontend && npm install && cd ..

# Create .env file (replace with your actual API key)
echo "OPEN_AI_KEY=your_openai_api_key_here" > .env

# Option 1: Run everything with development script
./run_dev.sh

# Option 2: Run backend and frontend separately

# Terminal 1 - Backend
cd backend && source .venv/bin/activate && python run.py

# Terminal 2 - Frontend
cd frontend && npm run dev

# Access the application at:
# Backend API: http://localhost:5000/api
# Frontend: http://localhost:5173



