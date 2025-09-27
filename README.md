# Threat Intelligence Dashboard

A full-stack threat intelligence dashboard with data ingestion, API, and visualization components.

## Architecture

- **Backend**: Node.js (Express) API with MongoDB Atlas
- **Frontend**: React SPA with Chart.js and Leaflet
- **Data Pipeline**: Scheduled fetchers for threat intelligence feeds

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Environment variables configured

### Quick Start (Recommended)

```bash
# Install all dependencies and start both services
npm run install:all
npm run dev
```

Or use the bash script:
```bash
./start-dev.sh
```

### Manual Setup

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure MONGODB_URI and DATA_FEEDS in .env
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Backend `.env` (copy from `.env.example`):
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tidb
DATA_FEEDS=["https://feed1.com/json","https://feed2.com/xml"]
PORT=8000
NODE_ENV=development
ENABLE_INGESTION=false
INGESTION_INTERVAL_MINUTES=60
DB_NAME=tidb
```

Frontend environment (optional):
```
VITE_API_URL=http://localhost:8000/api
```

## API Endpoints

- `GET /api/indicators` - Query threat indicators
  - Query params: `q` (search term), `source` (feed filter), `limit` (max results)

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend

# Testing
npm run test            # Run all tests
npm run test:backend    # Run backend tests only
npm run test:frontend   # Run frontend tests only
npm run test:integration # Run integration tests

# Building
npm run build           # Build frontend for production
npm run lint            # Lint all code

# Maintenance
npm run maintenance     # Run data retention cleanup
npm run performance     # Generate performance report

# Utilities
npm run install:all     # Install all dependencies
npm run clean          # Remove all node_modules
```

### Development Scripts

```bash
# Cross-platform startup scripts
./start-dev.sh          # Linux/macOS bash script
start-dev.bat           # Windows batch script  
./health-check.sh       # Check if services are running

# VS Code Integration
# Use Ctrl+Shift+P -> Tasks: Run Task -> "Start Development Server"
```

## Maintenance

```bash
# Run data retention cleanup
cd backend && node src/maintenance/retention.js

# Generate performance report
cd backend && node src/maintenance/stress_check.js
```

## Deployment

### Backend (DigitalOcean Droplet)
```bash
cd deploy/backend
docker build -t threat-intel-api .
docker run -p 8000:8000 --env-file .env threat-intel-api
```

### Frontend (Netlify/Vercel)
- **Netlify**: Connect repository, set build command `npm run build`, publish directory `frontend/dist`
- **Vercel**: Use `deploy/frontend/vercel.json` configuration
- **GitHub Pages**: Build and deploy `frontend/dist` folder

### Environment Setup
1. Create MongoDB Atlas cluster
2. Configure `DATA_FEEDS` with actual threat intelligence feed URLs
3. Set `ENABLE_INGESTION=true` in production
4. Configure frontend `VITE_API_URL` to point to deployed backend

See `/deploy/` directory for detailed deployment configurations.