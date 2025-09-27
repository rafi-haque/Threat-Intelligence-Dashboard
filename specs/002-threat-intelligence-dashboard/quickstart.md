# Quickstart: Threat Intelligence Dashboard

## Setup Steps

1. **MongoDB Setup**
   ```bash
   # Create MongoDB Atlas cluster at https://cloud.mongodb.com
   # Get connection string and create database 'tidb'
   # Note the connection URI for next step
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and feed URLs
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Initial Data Ingestion** (optional)
   ```bash
   cd backend
   # Set ENABLE_INGESTION=true in .env
   # Or run manual ingestion:
   node -e "require('./src/services/ingest').runIngestion()"
   ```

5. **Access Dashboard**
   - Open http://localhost:3000 for frontend
   - API available at http://localhost:8000/api

## Validation Steps (Smoke Tests)

1. **Health Check**
   ```bash
   curl http://localhost:8000/api/health
   # Should return: {"status":"ok","timestamp":"...","service":"threat-intelligence-api"}
   ```

2. **API Query Test**
   ```bash
   curl "http://localhost:8000/api/indicators?limit=5"
   # Should return: {"items":[...]}
   ```

3. **Dashboard Test**
   - Visit http://localhost:3000
   - Verify dashboard loads without errors
   - Test search functionality
   - Confirm last-updated timestamps display correctly

## Troubleshooting

- **Database connection fails**: Check MongoDB URI in .env
- **No indicators returned**: Run initial ingestion or add test data
- **Frontend can't reach API**: Verify backend is running on port 8000
- **CORS issues**: Backend includes CORS middleware for development
