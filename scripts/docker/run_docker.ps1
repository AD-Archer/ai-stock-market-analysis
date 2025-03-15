# PowerShell script to run the app in Docker
# Works on Windows with PowerShell

# Function to check if a command exists
function Test-Command {
    param (
        [string]$Command
    )
    return (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Check if Docker is installed
Write-Host "Checking if Docker is installed..."
if (-not (Test-Command "docker")) {
    Write-Host "Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
Write-Host "Checking if Docker is running..."
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists, create it if it doesn't
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..."
    "OPENAI_API_KEY=" | Out-File -FilePath ".env"
    
    $addKey = Read-Host "Would you like to add your OpenAI API key now? (y/n)"
    if ($addKey -eq "y") {
        $apiKey = Read-Host "Enter your OpenAI API key"
        "OPENAI_API_KEY=$apiKey" | Out-File -FilePath ".env"
        Write-Host "API key added to .env file." -ForegroundColor Green
    } else {
        Write-Host "Please add your OpenAI API key to the .env file before running the application."
        Write-Host "You can edit the .env file manually."
    }
}

# Ask user which Docker Compose command to use
$dockerComposeCmd = "docker-compose"
if (Test-Command "docker") {
    $composeChoice = Read-Host "Use 'docker compose' (newer) or 'docker-compose' (older)? [1/2] (default: 1)"
    if ($composeChoice -eq "2") {
        $dockerComposeCmd = "docker-compose"
    } else {
        $dockerComposeCmd = "docker compose"
    }
}

# Build and run the Docker containers
Write-Host "Building and starting Docker containers..."
Invoke-Expression "$dockerComposeCmd up --build -d"

# Check if containers are running
$containers = Invoke-Expression "$dockerComposeCmd ps -q"
if (-not $containers) {
    Write-Host "Error: No containers are running. Check the logs with '$dockerComposeCmd logs'" -ForegroundColor Red
    exit 1
}

Write-Host "Docker containers are running!" -ForegroundColor Green
Write-Host "Frontend is available at: http://localhost:5173"
Write-Host "Backend API is available at: http://localhost:8000/api"
Write-Host "To stop the containers, run: $dockerComposeCmd down" 