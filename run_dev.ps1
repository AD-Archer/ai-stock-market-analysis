# PowerShell script to run the app in development mode
# Works on Windows with PowerShell

# Function to check if a command exists
function Test-Command {
    param (
        [string]$Command
    )
    return (Get-Command $Command -ErrorAction SilentlyContinue)
}

Write-Host "Detected OS: Windows (PowerShell)" -ForegroundColor Cyan

# Check which Python command to use
$pythonCmd = "python"
if (Test-Command "python") {
    $pythonCmd = "python"
} elseif (Test-Command "python3") {
    $pythonCmd = "python3"
} else {
    Write-Host "Python is not installed. Please install Python first." -ForegroundColor Red
    exit 1
}

# Ask user which Python package manager to use
$useUv = $false
if (Test-Command "uv") {
    $useUvChoice = Read-Host "Use uv package manager instead of pip? (y/n, default: n)"
    if ($useUvChoice -eq "y") {
        $useUv = $true
        Write-Host "Using uv package manager" -ForegroundColor Green
    } else {
        Write-Host "Using pip package manager" -ForegroundColor Green
    }
} else {
    $installUvChoice = Read-Host "Would you like to install uv package manager? (y/n, default: n)"
    if ($installUvChoice -eq "y") {
        Write-Host "Installing uv package manager..."
        if (Test-Command "curl") {
            Invoke-Expression "curl -LsSf https://astral.sh/uv/install.sh | sh"
            $env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"
            $useUv = $true
            Write-Host "uv installed successfully" -ForegroundColor Green
        } else {
            Write-Host "curl is not installed. Please install uv manually: https://github.com/astral-sh/uv" -ForegroundColor Yellow
        }
    }
}

# Start the Flask backend
Write-Host "Starting Flask backend..." -ForegroundColor Cyan
if (-not (Test-Path "backend")) {
    Write-Host "Backend directory not found" -ForegroundColor Red
    exit 1
}
Set-Location -Path "backend"

# Check if virtual environment exists, create it if it doesn't
if (Test-Path ".venv") {
    Write-Host "Activating existing virtual environment..." -ForegroundColor Green
    if (Test-Path ".venv\Scripts\Activate.ps1") {
        . ".venv\Scripts\Activate.ps1"
    } else {
        . ".venv\bin\Activate.ps1"
    }
} else {
    Write-Host "Creating new virtual environment..." -ForegroundColor Green
    if ($useUv) {
        Invoke-Expression "uv venv .venv"
    } else {
        Invoke-Expression "$pythonCmd -m venv .venv"
    }
    
    if (Test-Path ".venv\Scripts\Activate.ps1") {
        . ".venv\Scripts\Activate.ps1"
    } else {
        . ".venv\bin\Activate.ps1"
    }
}

# Always install/update requirements to ensure we have the latest versions
Write-Host "Installing/updating requirements..." -ForegroundColor Green
if ($useUv) {
    Invoke-Expression "uv pip install -r requirements.txt --upgrade"
} else {
    Invoke-Expression "pip install -r requirements.txt --upgrade"
}

# Run the Python file
Write-Host "Starting backend server..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    param($pythonCmd)
    Set-Location -Path $using:PWD
    & $pythonCmd run.py
} -ArgumentList $pythonCmd

# Deactivate virtual environment
deactivate
Set-Location -Path ".."

# Start the React frontend
Write-Host "Starting React frontend..." -ForegroundColor Cyan
if (-not (Test-Path "frontend")) {
    Write-Host "Frontend directory not found" -ForegroundColor Red
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob
    exit 1
}
Set-Location -Path "frontend"

# Check if npm is installed
if (-not (Test-Command "npm")) {
    Write-Host "npm is not installed. Please install Node.js and npm first." -ForegroundColor Red
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob
    exit 1
}

Invoke-Expression "npm install"
$frontendJob = Start-Job -ScriptBlock {
    Set-Location -Path $using:PWD
    npm run dev
}
Set-Location -Path ".."

Write-Host "Development servers running. Press Ctrl+C to stop." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000/api" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan

# Wait for user to press Ctrl+C
try {
    Write-Host "Press Ctrl+C to stop the servers..." -ForegroundColor Yellow
    Wait-Job -Job $backendJob, $frontendJob
} finally {
    Write-Host "Shutting down servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
} 