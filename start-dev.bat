@echo off
REM Threat Intelligence Dashboard - Development Startup Script (Windows)
setlocal enabledelayedexpansion

echo [STARTUP] Starting Threat Intelligence Dashboard...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed

REM Check if dependencies are installed
if not exist "backend\node_modules" (
    echo [WARNING] Backend dependencies not found. Installing...
    cd backend
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Backend dependencies installed
)

if not exist "frontend\node_modules" (
    echo [WARNING] Frontend dependencies not found. Installing...
    cd frontend
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Frontend dependencies installed
)

REM Check for environment files
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        echo [WARNING] Backend .env file not found. Copying from .env.example...
        copy "backend\.env.example" "backend\.env"
        echo [WARNING] Please edit backend\.env with your MongoDB URI and other settings
    ) else (
        echo [ERROR] Backend .env.example file not found. Cannot create .env file.
        pause
        exit /b 1
    )
)

echo [SUCCESS] Environment configuration checked

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

echo [SUCCESS] Starting services with concurrently...
echo.
echo ^>^> Frontend: http://localhost:3000
echo ^>^> Backend API: http://localhost:8000/api  
echo ^>^> Health Check: http://localhost:8000/api/health
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start both services using npm script
npm run dev

pause