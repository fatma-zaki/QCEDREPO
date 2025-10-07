#!/bin/bash
# Bash script to start the client (Linux/Mac)

echo "Starting QCED Client..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "NPM is not installed or not in PATH"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Change to client directory
cd client

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing client dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Failed to install client dependencies"
        exit 1
    fi
fi

# Start the client
echo "Starting client in development mode..."
npm run dev
