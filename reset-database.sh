#!/bin/bash

# Database Reset and Repopulation Script (Bash version)
# Alternative to the Node.js script for environments where Node modules aren't available

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="tidb"
MONGO_URI="mongodb://localhost:27017"

echo -e "${BLUE}🛡️  Threat Intelligence Database Reset Tool${NC}"
echo "============================================================"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if MongoDB is running
check_mongodb() {
    print_info "Checking MongoDB connection..."
    if ! mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_error "MongoDB is not running or not accessible"
        print_info "Please start MongoDB first:"
        print_info "  • On Ubuntu/Debian: sudo systemctl start mongod"
        print_info "  • On macOS: brew services start mongodb-community"
        print_info "  • Using Docker: docker run -d -p 27017:27017 mongo:latest"
        exit 1
    fi
    print_status "MongoDB is running and accessible"
}

# Confirm with user
confirm_reset() {
    if [[ "$1" != "--force" && "$1" != "-f" ]]; then
        echo
        print_warning "This will DELETE ALL data in the database '${DB_NAME}'"
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [[ $confirm != "yes" && $confirm != "y" ]]; then
            print_error "Operation cancelled by user"
            exit 0
        fi
    fi
}

# Clear all collections in the database
clear_database() {
    print_info "Clearing all data from database '${DB_NAME}'..."
    
    # Get list of collections
    collections=$(mongosh "${MONGO_URI}/${DB_NAME}" --quiet --eval "
        db.getCollectionNames().forEach(function(collection) {
            print(collection);
        });
    ")
    
    if [[ -z "$collections" ]]; then
        print_info "No collections found in database"
        return
    fi
    
    # Drop each collection
    echo "$collections" | while read -r collection; do
        if [[ -n "$collection" ]]; then
            result=$(mongosh "${MONGO_URI}/${DB_NAME}" --quiet --eval "
                var result = db.${collection}.deleteMany({});
                print('Deleted ' + result.deletedCount + ' documents from ${collection}');
            ")
            print_status "$result"
        fi
    done
}

# Recreate indexes
recreate_indexes() {
    print_info "Recreating database indexes..."
    
    mongosh "${MONGO_URI}/${DB_NAME}" --quiet --eval "
        // Create indexes for indicators collection
        db.indicators.createIndex({ 'value': 1 }, { unique: true });
        db.indicators.createIndex({ 'type': 1 });
        db.indicators.createIndex({ 'last_seen': -1 });
        db.indicators.createIndex({ 'first_seen': -1 });
        db.indicators.createIndex({ 'sources.feed_id': 1 });
        
        // Create indexes for sources collection if it exists
        db.sources.createIndex({ 'feed_id': 1 });
        db.sources.createIndex({ 'fetched_at': -1 });
        
        print('Database indexes recreated successfully');
    "
    
    print_status "Database indexes recreated"
}

# Trigger data ingestion by calling the backend API
trigger_ingestion() {
    print_info "Triggering fresh data ingestion..."
    
    # Check if backend is running
    if ! curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        print_warning "Backend API is not running on port 8000"
        print_info "Please start the backend server first:"
        print_info "  cd backend && npm run dev"
        print_info "  OR"
        print_info "  ./start-dev.sh"
        return 1
    fi
    
    # Trigger ingestion
    print_info "Calling ingestion API endpoint..."
    response=$(curl -s -X POST http://localhost:8000/api/ingestion/run 2>/dev/null || echo "error")
    
    if [[ "$response" == "error" ]]; then
        print_warning "Could not trigger ingestion via API"
        print_info "You can manually trigger ingestion by:"
        print_info "  1. Starting the backend server"
        print_info "  2. Waiting for automatic ingestion (every 30 minutes)"
        print_info "  3. Or restart the backend to trigger immediate ingestion"
        return 1
    fi
    
    print_status "Ingestion triggered successfully"
    print_info "Data population is running in the background..."
}

# Alternative: Direct data ingestion using Node.js script
run_node_ingestion() {
    print_info "Running Node.js ingestion script..."
    
    if [[ -f "backend/src/scripts/manual-ingestion.js" ]]; then
        cd backend && node src/scripts/manual-ingestion.js
        cd ..
    elif [[ -f "reset-database.js" ]]; then
        node reset-database.js --force
    else
        print_warning "No ingestion script found"
        print_info "Creating manual ingestion script..."
        create_manual_ingestion_script
        node backend/src/scripts/manual-ingestion.js
    fi
}

# Create a simple manual ingestion script
create_manual_ingestion_script() {
    mkdir -p backend/src/scripts
    
    cat > backend/src/scripts/manual-ingestion.js << 'EOF'
require('dotenv').config({ path: '../../../backend/.env' });
const ingestion = require('../services/ingestion');

async function runManualIngestion() {
    console.log('🚀 Starting manual ingestion...');
    try {
        const results = await ingestion.runIngestion();
        console.log('✅ Ingestion completed:', results);
    } catch (error) {
        console.error('❌ Ingestion failed:', error);
    }
}

runManualIngestion();
EOF
    
    print_status "Created manual ingestion script"
}

# Verify database state
verify_database() {
    print_info "Verifying database state..."
    
    result=$(mongosh "${MONGO_URI}/${DB_NAME}" --quiet --eval "
        var collections = db.getCollectionNames();
        var stats = {};
        
        collections.forEach(function(collection) {
            stats[collection] = db[collection].countDocuments();
        });
        
        print('Database Statistics:');
        for (var collection in stats) {
            print('  • ' + collection + ': ' + stats[collection].toLocaleString() + ' documents');
        }
        
        var indicatorCount = db.indicators.countDocuments();
        print('\\nTotal threat indicators: ' + indicatorCount.toLocaleString());
        
        if (indicatorCount > 0) {
            print('✅ Database is ready for use');
        } else {
            print('⚠️ Database is empty - ingestion may still be running');
        }
    ")
    
    echo "$result"
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    echo
    confirm_reset "$1"
    echo
    
    check_mongodb
    clear_database
    recreate_indexes
    
    # Try API ingestion first, fall back to Node.js script
    if ! trigger_ingestion; then
        print_info "Falling back to Node.js ingestion..."
        run_node_ingestion
    fi
    
    echo
    print_info "Waiting 10 seconds for ingestion to process..."
    sleep 10
    
    verify_database
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo
    echo "============================================================"
    print_status "Database reset and repopulation completed!"
    print_info "Total time: ${duration} seconds"
    echo
    print_info "You can now access the dashboard at: http://localhost:3000"
    print_info "API is available at: http://localhost:8000/api"
}

# Handle script termination
trap 'echo -e "\n${YELLOW}⚠️  Script interrupted by user${NC}"; exit 130' INT TERM

# Run main function
main "$1"