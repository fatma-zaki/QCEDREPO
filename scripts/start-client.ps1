# PowerShell script to start the client
Write-Host "Starting QCED Client..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "NPM version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "NPM is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Change to client directory
Set-Location -Path "client"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install client dependencies" -ForegroundColor Red
        exit 1
    }
}

# Start the client
Write-Host "Starting client in development mode..." -ForegroundColor Green
npm run dev
