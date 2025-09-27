# Database Reset and Repopulation Tools

This directory contains tools to clear all threat intelligence data from the database and repopulate it with fresh data from configured feeds.

## Available Scripts

### 1. Node.js Script (Recommended)
**File:** `reset-database.js`
**Usage:**
```bash
# Interactive mode (asks for confirmation)
node reset-database.js

# Force mode (no confirmation prompt)
node reset-database.js --force
```

**Features:**
- ✅ Full database clearing and repopulation
- ✅ Index recreation
- ✅ Progress tracking with detailed output
- ✅ Data verification
- ✅ Error handling and recovery
- ✅ Interactive confirmation

### 2. Bash Script (Alternative)
**File:** `reset-database.sh`
**Usage:**
```bash
# Interactive mode (asks for confirmation)
./reset-database.sh

# Force mode (no confirmation prompt)
./reset-database.sh --force
```

**Features:**
- ✅ Works without Node.js dependencies
- ✅ Colored output for better readability
- ✅ MongoDB connection checking
- ✅ Automatic fallback mechanisms
- ✅ Integration with backend API

## What These Scripts Do

### Step 1: Database Clearing
- Connects to MongoDB using configured connection string
- Lists all collections in the database
- Deletes all documents from each collection
- Preserves database structure

### Step 2: Index Recreation
- Drops existing indexes (except `_id`)
- Recreates optimal indexes for:
  - `indicators.value` (unique)
  - `indicators.type`
  - `indicators.last_seen` (descending)
  - `indicators.first_seen` (descending)
  - `indicators.sources.feed_id`
  - `sources.feed_id`
  - `sources.fetched_at` (descending)

### Step 3: Data Repopulation
- Triggers fresh ingestion from all configured data feeds
- Uses the same ingestion service as the main application
- Processes data from:
  - Feodo Tracker (malicious IPs)
  - FireHOL Level 1 (IP ranges)
  - MalwareBazaar (file hashes)
  - GreenSnow (spam IPs)

### Step 4: Verification
- Counts documents in each collection
- Displays statistics about ingested data
- Confirms database is ready for use

## Prerequisites

### For Node.js Script:
- Node.js installed
- MongoDB running on localhost:27017 (or configured URI)
- Backend dependencies available

### For Bash Script:
- Bash shell
- `mongosh` (MongoDB Shell) installed
- `curl` for API calls
- MongoDB running

## Configuration

Both scripts read configuration from:
- `backend/.env` file
- Environment variables:
  - `MONGODB_URI` (default: mongodb://localhost:27017/tidb)
  - `DB_NAME` (default: tidb)
  - `DATA_FEEDS` (configured feed URLs)

## Examples

### Quick Reset (Node.js):
```bash
# Clear and repopulate database
node reset-database.js --force

# Expected output:
# 🚀 Starting Database Reset and Repopulation...
# 🔌 Connected to MongoDB successfully
# 🗑️ Clearing all existing data...
# 🔧 Recreating database indexes...
# 📥 Starting fresh data ingestion...
# 📊 Total indicators ingested: 9,234
# 🎉 Database reset completed successfully!
```

### Quick Reset (Bash):
```bash
# Clear and repopulate database
./reset-database.sh --force

# Expected output:
# 🛡️ Threat Intelligence Database Reset Tool
# ✅ MongoDB is running and accessible
# ✅ Deleted 5,432 documents from indicators
# ✅ Database indexes recreated
# ✅ Ingestion triggered successfully
# ✅ Database is ready for use
```

## When to Use

### Use Case 1: Development Reset
- Testing new features
- Cleaning up test data
- Starting with fresh dataset

### Use Case 2: Data Corruption
- Database inconsistencies
- Index corruption
- Data quality issues

### Use Case 3: Feed Configuration Changes
- Added/removed data feeds
- Changed feed URLs
- Updated parsing logic

### Use Case 4: Performance Issues
- Fragmented collections
- Missing indexes
- Query optimization

## Safety Features

### Confirmation Prompts
- Interactive mode asks for explicit confirmation
- Shows what will be deleted
- Allows cancellation

### Force Mode
- `--force` or `-f` flag skips confirmation
- Useful for automation
- Use with caution

### Error Handling
- Stops on first error
- Displays helpful error messages
- Suggests recovery steps

### Connection Verification
- Tests MongoDB connectivity
- Checks backend API availability
- Validates configuration

## Output Examples

### Successful Run:
```
🚀 Starting Database Reset and Repopulation...
============================================================
🔌 Connected to MongoDB successfully
🗑️ Clearing all existing data...
   ✅ Cleared indicators: 8,745 documents deleted
   ✅ Cleared sources: 156 documents deleted
🔧 Recreating database indexes...
   ✅ Database indexes recreated successfully
📥 Starting fresh data ingestion...
   ✅ Feed 1: 3,421 indicators processed
   ✅ Feed 2: 4,532 indicators processed
   ✅ Feed 3: 1,287 indicators processed
📊 Total indicators ingested: 9,240
🎉 Database reset and repopulation completed successfully!
⏱️ Total time: 45.3 seconds
```

### Error Example:
```
💥 Database reset failed: Connection refused
⚠️ Please ensure MongoDB is running:
   • Ubuntu/Debian: sudo systemctl start mongod
   • macOS: brew services start mongodb-community
   • Docker: docker run -d -p 27017:27017 mongo:latest
```

## Troubleshooting

### MongoDB Not Running
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Backend Not Available
```bash
# Start backend server
cd backend
npm run dev

# Or use the start script
./start-dev.sh
```

### Permission Issues
```bash
# Make bash script executable
chmod +x reset-database.sh

# Check MongoDB permissions
mongosh --eval "db.runCommand('ping')"
```

---

**⚠️ Important:** These scripts will permanently delete all data in your threat intelligence database. Always ensure you have backups if needed, and confirm you're working with the correct database before running.