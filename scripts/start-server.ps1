# PowerShell script to start the server
Write-Host "Starting QCED Server..." -ForegroundColor Green

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

# Change to server directory
Set-Location -Path "server"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install server dependencies" -ForegroundColor Red
        exit 1
    }
}

# Start the server
Write-Host "Starting server in development mode..." -ForegroundColor Green
npm run dev
