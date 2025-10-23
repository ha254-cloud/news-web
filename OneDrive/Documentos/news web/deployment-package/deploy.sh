#!/bin/bash

echo "==============================================="
echo "    African News Site - Quick Deploy Script"
echo "==============================================="
echo

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js found! Version:"
node --version

echo
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo
echo "==============================================="
echo "    Build completed successfully!"
echo "==============================================="
echo
echo "To start the server, run:"
echo "    npm start"
echo
echo "Your site will be available at http://localhost:3000"
echo