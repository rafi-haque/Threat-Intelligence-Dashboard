# Threat Intelligence Dashboard API Reference

## Enhanced API Capabilities

The API now supports enhanced querying, pagination, and sorting capabilities.

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### GET /api/indicators
Query threat intelligence indicators with advanced filtering and pagination.

**Query Parameters:**
- `q` (string): Search term (searches in value and type fields)
- `source` (string): Filter by data source (e.g., "GreenSnow", "FireHOL", "MalwareBazaar")
- `limit` (integer): Number of results to return (default: 100, max: 10,000)
- `offset` or `skip` (integer): Number of results to skip for pagination
- `sort` (string): Sort field ("value", "type", "first_seen", "last_seen")
- `order` (string): Sort order ("asc" or "desc", default: "asc")

**Examples:**
```bash
# Get default 100 results
curl "http://localhost:8000/api/indicators"

# Get 500 results
curl "http://localhost:8000/api/indicators?limit=500"

# Search for specific IP
curl "http://localhost:8000/api/indicators?q=192.168.1.1"

# Get only hash indicators
curl "http://localhost:8000/api/indicators?q=hash"

# Get indicators from specific source
curl "http://localhost:8000/api/indicators?source=MalwareBazaar"

# Pagination: Get results 100-199
curl "http://localhost:8000/api/indicators?limit=100&offset=100"

# Sort by type ascending
curl "http://localhost:8000/api/indicators?sort=type&order=asc"

# Get all indicators (up to 10,000)
curl "http://localhost:8000/api/indicators?limit=10000"
```

#### GET /api/indicators/:id
Get a specific indicator by ID.

#### POST /api/ingest
Manually trigger data ingestion from all configured feeds.

#### GET /api/health
Health check endpoint.

### Response Format
```json
{
  "items": [
    {
      "id": "648f1b2c3d4e5f6a7b8c9d0e",
      "type": "ip",
      "value": "192.168.1.100",
      "first_seen": "2025-09-27T10:00:00.000Z",
      "last_seen": "2025-09-27T12:00:00.000Z",
      "sources": [
        {
          "feed_id": "feed-1",
          "original_id": null,
          "fetched_at": "2025-09-27T10:00:00.000Z"
        }
      ],
      "metadata": {
        "category": "Suspicious IP",
        "source": "GreenSnow"
      }
    }
  ]
}
```

### Current Data Statistics
- **Total Indicators**: 9,716
- **Data Sources**: GreenSnow (4,536), FireHOL (4,469), MalwareBazaar (704), etc.
- **Indicator Types**: IP addresses (9,009), Hashes (705), URLs (1), Domains (1)
- **Update Frequency**: Every 30 minutes

### Performance Notes
- Default limit increased from 50 to 100 results
- Maximum limit: 10,000 results per request
- Results sorted by last_seen (most recent first) by default
- All queries use MongoDB indexes for optimal performance