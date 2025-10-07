# PowerShell script to setup the QCED project
Write-Host "Setting up QCED Project..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "NPM version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "NPM is not installed. Please install NPM first." -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host "Creating necessary directories..." -ForegroundColor Yellow
$directories = @("server/logs", "server/uploads", "server/exports", "client/dist")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

# Install server dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Yellow
Set-Location -Path "server"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install server dependencies" -ForegroundColor Red
    exit 1
}

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
Set-Location -Path "../client"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install client dependencies" -ForegroundColor Red
    exit 1
}

# Copy environment file if it doesn't exist
Set-Location -Path "../server"
if (-not (Test-Path "config.env")) {
    if (Test-Path "config.env.example") {
        Copy-Item "config.env.example" "config.env"
        Write-Host "Created config.env from example file" -ForegroundColor Green
        Write-Host "Please update config.env with your actual values" -ForegroundColor Yellow
    } else {
        Write-Host "config.env.example not found. Please create config.env manually." -ForegroundColor Red
    }
}

# Return to root directory
Set-Location -Path ".."

Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update server/config.env with your database and other settings" -ForegroundColor White
Write-Host "2. Run 'scripts/start-all.ps1' to start both server and client" -ForegroundColor White
Write-Host "3. Or run 'scripts/start-server.ps1' and 'scripts/start-client.ps1' separately" -ForegroundColor White
