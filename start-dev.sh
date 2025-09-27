#!/bin/bash

# Threat Intelligence Dashboard - Development Startup Script
# This script starts both backend and frontend services concurrently

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[STARTUP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
port_available() {
    ! lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to cleanup background processes on exit
cleanup() {
    print_status "Shutting down services..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

print_status "Starting Threat Intelligence Dashboard..."

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_warning "Node.js version is $NODE_VERSION. Recommended version is 18+."
fi

# Check if ports are available
if ! port_available 8000; then
    print_error "Port 8000 is already in use. Please stop the service using port 8000."
    exit 1
fi

if ! port_available 3000; then
    print_error "Port 3000 is already in use. Please stop the service using port 3000."
    exit 1
fi

print_success "Prerequisites check passed"

# Check if dependencies are installed
print_status "Checking dependencies..."

BACKEND_DEPS_MISSING=false
FRONTEND_DEPS_MISSING=false

if [ ! -d "backend/node_modules" ]; then
    print_warning "Backend dependencies not found. Will install..."
    BACKEND_DEPS_MISSING=true
fi

if [ ! -d "frontend/node_modules" ]; then
    print_warning "Frontend dependencies not found. Will install..."
    FRONTEND_DEPS_MISSING=true
fi

# Install backend dependencies if needed
if [ "$BACKEND_DEPS_MISSING" = true ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
fi

# Install frontend dependencies if needed
if [ "$FRONTEND_DEPS_MISSING" = true ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
fi

# Check for environment files
print_status "Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        print_warning "Backend .env file not found. Copying from .env.example..."
        cp backend/.env.example backend/.env
        print_warning "Please edit backend/.env with your MongoDB URI and other settings"
    else
        print_error "Backend .env.example file not found. Cannot create .env file."
        exit 1
    fi
fi

print_success "Environment configuration checked"

# Start services
print_status "Starting services..."

# Start backend in background
print_status "Starting backend on port 8000..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_error "Backend failed to start. Check logs/backend.log for details."
    exit 1
fi

print_success "Backend started (PID: $BACKEND_PID)"

# Start frontend in background
print_status "Starting frontend on port 3000..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Give frontend time to start
sleep 3

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    print_error "Frontend failed to start. Check logs/frontend.log for details."
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

print_success "Frontend started (PID: $FRONTEND_PID)"

print_success "All services started successfully!"
echo ""
echo -e "${GREEN}🚀 Threat Intelligence Dashboard is running:${NC}"
echo -e "   ${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "   ${BLUE}Backend API:${NC} http://localhost:8000/api"
echo -e "   ${BLUE}Health Check:${NC} http://localhost:8000/api/health"
echo ""
echo -e "${YELLOW}📋 Logs:${NC}"
echo -e "   Backend: tail -f logs/backend.log"
echo -e "   Frontend: tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}⚡ Commands:${NC}"
echo -e "   Press Ctrl+C to stop all services"
echo -e "   View logs in real-time with: tail -f logs/*.log"
echo ""

# Wait for processes to finish or for user to interrupt
wait