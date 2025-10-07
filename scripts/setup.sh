#!/bin/bash
# Bash script to setup the QCED project (Linux/Mac)

echo "Setting up QCED Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "NPM is not installed. Please install NPM first."
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Create necessary directories
echo "Creating necessary directories..."
directories=("server/logs" "server/uploads" "server/exports" "client/dist")
for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "Created directory: $dir"
    fi
done

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
echo "Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install client dependencies"
    exit 1
fi

# Copy environment file if it doesn't exist
cd ../server
if [ ! -f "config.env" ]; then
    if [ -f "config.env.example" ]; then
        cp config.env.example config.env
        echo "Created config.env from example file"
        echo "Please update config.env with your actual values"
    else
        echo "config.env.example not found. Please create config.env manually."
    fi
fi

# Return to root directory
cd ..

# Make scripts executable
chmod +x scripts/*.sh

echo "Setup completed successfully!"
echo "Next steps:"
echo "1. Update server/config.env with your database and other settings"
echo "2. Run './scripts/start-server.sh' to start the server"
echo "3. Run './scripts/start-client.sh' to start the client"
echo "4. Or run both in separate terminals"
