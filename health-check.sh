#!/bin/bash

# Health check script for Threat Intelligence Dashboard
# Checks if both services are running and responsive

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${1}${2}${NC}"
}

print_success() {
    print_status $GREEN "✓ $1"
}

print_error() {
    print_status $RED "✗ $1"
}

print_warning() {
    print_status $YELLOW "⚠ $1"
}

echo "🏥 Health Check - Threat Intelligence Dashboard"
echo "=============================================="

# Check if ports are listening
backend_port_open=false
frontend_port_open=false

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_success "Backend port 8000 is listening"
    backend_port_open=true
else
    print_error "Backend port 8000 is not listening"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_success "Frontend port 3000 is listening"
    frontend_port_open=true
else
    print_error "Frontend port 3000 is not listening"
fi

# Test backend API health
if [ "$backend_port_open" = true ]; then
    echo ""
    echo "Testing Backend API..."
    
    if curl -s -f http://localhost:8000/api/health > /dev/null; then
        print_success "Backend health check passed"
        
        # Test indicators endpoint
        if curl -s -f "http://localhost:8000/api/indicators?limit=1" > /dev/null; then
            print_success "Indicators endpoint responding"
        else
            print_error "Indicators endpoint not responding"
        fi
    else
        print_error "Backend health check failed"
    fi
fi

# Test frontend
if [ "$frontend_port_open" = true ]; then
    echo ""
    echo "Testing Frontend..."
    
    if curl -s -f http://localhost:3000 > /dev/null; then
        print_success "Frontend is serving content"
    else
        print_error "Frontend not responding"
    fi
fi

echo ""
echo "📊 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000/api"
echo "   Health Check: http://localhost:8000/api/health"
echo ""

# Overall status
if [ "$backend_port_open" = true ] && [ "$frontend_port_open" = true ]; then
    print_success "All services are running"
    exit 0
else
    print_error "Some services are not running"
    echo ""
    echo "💡 To start services:"
    echo "   ./start-dev.sh"
    echo "   or: npm run dev"
    exit 1
fi