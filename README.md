# AI Stock Market Analysis

AI‑assisted stock market data exploration and recommendation demo. Analyze NASDAQ‑100 style mock / cached datasets plus uploaded spreadsheets & markdown notes, then generate AI commentary and recommendations. NOT for real investment decisions.

## Quick Start Paths
```bash
git clone https://github.com/AD-Archer/ai-stock-market-analysis.git

cd ai-stock-market-analysis
```

Choose one of the options below:

1. One‑liner local dev (auto installs & runs both servers):
  ```bash
  ./start.sh
  ```
  - Creates a Python venv inside `backend/.venv`
  - Installs backend requirements & frontend deps (installs `pnpm` globally if missing)
  - Starts Flask backend (default port 8881) & Vite frontend (default port 8173)
  - Ctrl+C stops both processes (script traps signals)

2. Manual dev (more control) – see [Manual Local Development](#manual-local-development)

3. Docker (multi‑container, reproducible) – see [Docker Usage](#docker-usage)

4. Production‑ish local Docker (detached):
  ```bash
  docker compose up -d --build
  ```

After startup:
* Frontend: http://localhost:8173 (or your `FRONTEND_PORT`)
* Backend API: http://localhost:8881/api (or your `BACKEND_PORT`)

If you change ports in `.env`, restart the relevant processes / containers.

---

## Project Structure

Split backend (Flask) & frontend (React/Vite) with Docker support.

### Backend
`backend/` – Flask API + AI orchestration
* `run.py` / `app.py` start the server (default `BACKEND_PORT=8881`)
* `api.py` lightweight REST endpoints (`/api/...`)
* `stock_data.py` loads cached/mock NASDAQ‑100 & performs processing
* `ai_utils.py` multi‑provider AI helpers (OpenAI + Gemini) with model fallbacks
* `config.py` configuration constants & paths
* `data/` cached financial/profile JSONs + mock CSVs (faster demos)
* `results/` generated recommendation text files
* `Dockerfile` (Alpine Python base, non‑root user, healthcheck)

### Frontend
`frontend/` – React + TypeScript + Vite
* Vite dev server (default `FRONTEND_PORT=8173`)
* Proxies `/api` to the backend using env `BACKEND_PORT`
* Tailwind, React Router, Chart.js (planned/used for visualizations)
* Docker build args inject ports & set `VITE_DOCKER_ENV` for container URL resolution

### Scripts
`start.sh` (root) – simple all‑in‑one local dev launcher.

`scripts/` (optional / alternative approach):
* `dev/` – platform‑specific richer dev scripts (dependency checks, etc.)
* `docker/` – wrappers around compose for different OS shells.

### Root
* `.env` / `.env.example` – shared configuration for both services (compose pulls from here)
* `docker-compose.yml` – multi‑service stack (backend + frontend networked)
* `results/` (host) mounted into backend container at `/app/results`
* `README.md` – this file
* `LICENSE` – MIT

## Environment Configuration

Consistent configuration lives in a single root `.env` file **(copy from `.env.example`)**. Docker Compose interpolates values; `vite.config.ts` + backend code use `BACKEND_PORT` / `FRONTEND_PORT` directly.

Minimal required vars (for AI functionality):
```bash
OPEN_AI_KEY=sk-...           # OR provide GEMINI_API_KEY and set PRIMARY_AI_PROVIDER=gemini
GEMINI_API_KEY=...           # Optional if OpenAI primary
PRIMARY_AI_PROVIDER=openai   # openai | gemini
FALLBACK_AI_PROVIDER=gemini  # fallback provider or omit
```

Ports & runtime:
```bash
BACKEND_PORT=8881   # Flask inside & outside container (compose maps ${BACKEND_PORT}:${BACKEND_PORT})
FRONTEND_PORT=8173  # Vite dev server
VITE_DOCKER_ENV=false  # Automatically true in container build
```

Models (override if you have access to different tiers):
```bash
OPENAI_CLASSIFICATION_MODEL=gpt-5-mini
OPENAI_RECOMMENDATION_MODEL=gpt-5-nano
GEMINI_CLASSIFICATION_MODEL=gemini-2.5-flash
GEMINI_RECOMMENDATION_MODEL=gemini-2.5-flash-lite
```

Other knobs:
```bash
MAX_STOCKS_DEFAULT=5
SECTORS=Technology,Consumer Cyclical,... # etc
```

The backend references `BACKEND_PORT` (default 8881) and the frontend proxies to that port. Change both if you need to avoid conflicts.

## Setup Instructions

### Prerequisites

Local (non‑Docker):
* Python 3.10+ recommended (virtual env created automatically by `start.sh`)
* Node.js 18+ (for modern Vite / React features)
* pnpm (auto‑installed by `start.sh` if missing)
* (Optional) Docker 24+ / Compose v2 for container path

### Installing pnpm

If you don't have pnpm installed:

```bash
# Using npm
npm install -g pnpm

# Using Homebrew (macOS)
brew install pnpm

# Using Scoop (Windows)
scoop install pnpm

# Using Chocolatey (Windows)
choco install pnpm
```

### Manual Local Development

```bash
cp .env.example .env  # then edit values

# Backend
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
python backend/run.py  # or: python backend/app.py --port 8881

# Frontend (new terminal)
cd frontend
pnpm install
pnpm dev
```

The frontend proxy `/api` should resolve automatically once both are running.

### Docker Usage

Core stack defined in root `docker-compose.yml` (frontend + backend on a shared bridge network):

Key behaviors:
* Ports map 1:1: `${BACKEND_PORT}:${BACKEND_PORT}`, `${FRONTEND_PORT}:${FRONTEND_PORT}` – change values in `.env` if needed.
* Backend volume mounts for data + results for persistence (`./backend/data`, `./results`).
* Healthchecks: backend polls `/api/status` every 30s.
* Frontend build ARGs propagate port & backend URL; runtime env sets `VITE_DOCKER_ENV=true` so the proxy uses `http://backend:${BACKEND_PORT}` internally.

Commands:
```bash
docker compose up --build          # foreground
docker compose up -d --build       # detached
docker compose logs -f backend     # tail backend logs
docker compose ps                  # service status
docker compose down                # stop & remove containers
```

Update dependencies / code then rebuild:
```bash
docker compose build --no-cache backend
docker compose build frontend
```

Single-service dev with just backend (legacy / optional) exists at `backend/docker-compose.yml` (maps 8000) but root compose supersedes it. Prefer the root file for integrated dev.

## Features

* Cached NASDAQ‑100 style dataset + mock mode for instant demos
* (Pluggable) AI provider abstraction (OpenAI primary, Gemini fallback)
* AI classification & recommendation models configurable separately
* Recommendation text file generation & history retention (`results/`)
* Background threading with task progress endpoint
* Frontend status polling & health indicator
* Automated `sitemap.xml` generation on frontend build (static + discovered report routes)
* Dockerized multi‑service stack
* Cross‑platform helper scripts

## Technologies Used

### Frontend
* React (TypeScript) + Vite + Tailwind
* React Router (navigation)
* Axios (API calls) – implied
* Chart.js (visual components)

### Backend
* Flask + Flask-CORS
* Pandas for CSV/DF manipulation
* Multi‑provider AI (OpenAI / Gemini)
* yfinance (planned / partial) + cached JSON financials

### Package Management
* pnpm (Node) – workspace/local caching
* pip (virtualenv) – can swap to `uv` manually if desired

## Accessing the Application

Default (from `.env.example`):
* Frontend: http://localhost:8173
* Backend API: http://localhost:8881/api

If using legacy single backend compose file: backend would be at :8000. Prefer unified root compose with 8881.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Frontend 404 on /api | Ensure backend running & ports match `.env` |
| CORS errors | Confirm you're using the proxied `/api` path (not full origin) in frontend code |
| AI errors / missing key | Verify `OPEN_AI_KEY` or switch providers (`PRIMARY_AI_PROVIDER=gemini`) |
| Port already in use | Adjust `BACKEND_PORT` / `FRONTEND_PORT` then restart |
| Containers unhealthy | Run `docker compose logs backend` for traceback |

## License

MIT

---

Contributions & small PRs welcome (docs clarifications, test additions, provider extensions). This is a demo / educational project – keep scope lean.
