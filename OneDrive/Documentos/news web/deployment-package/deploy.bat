@echo off
echo ===============================================
echo    African News Site - Quick Deploy Script
echo ===============================================
echo.

echo Checking Node.js installation...
node --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version

echo.
echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building production version...
call npm run build

if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ===============================================
echo    Build completed successfully!
echo ===============================================
echo.
echo To start the server, run:
echo    npm start
echo.
echo Your site will be available at http://localhost:3000
echo.
pause