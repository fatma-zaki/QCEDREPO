# PowerShell script to start both server and client
Write-Host "Starting QCED Full Stack Application..." -ForegroundColor Green

# Function to start server in background
function Start-Server {
    Write-Host "Starting server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-File", "scripts/start-server.ps1" -WindowStyle Normal
    Start-Sleep -Seconds 3
}

# Function to start client in background
function Start-Client {
    Write-Host "Starting client..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-File", "scripts/start-client.ps1" -WindowStyle Normal
}

# Start server and client
Start-Server
Start-Client

Write-Host "Both server and client are starting..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Client will be available at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop all processes" -ForegroundColor Red

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "Stopping all processes..." -ForegroundColor Red
    # Kill all node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "All processes stopped." -ForegroundColor Green
}
