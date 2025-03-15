@echo off
REM Windows batch script to run the app in Docker

echo Checking if Docker is installed...
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Docker is not installed. Please install Docker first.
  exit /b 1
)

echo Checking if Docker is running...
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Docker is not running. Please start Docker first.
  exit /b 1
)

REM Check if .env file exists, create it if it doesn't
if not exist .env (
  echo Creating .env file...
  echo OPENAI_API_KEY= > .env
  
  set /p add_key="Would you like to add your OpenAI API key now? (y/n): "
  if /i "%add_key%"=="y" (
    set /p api_key="Enter your OpenAI API key: "
    echo OPENAI_API_KEY=%api_key% > .env
    echo API key added to .env file.
  ) else (
    echo Please add your OpenAI API key to the .env file before running the application.
    echo You can edit the .env file manually.
  )
)

REM Check which Docker Compose command to use
set docker_compose_cmd=docker-compose
where docker >nul 2>&1
if %ERRORLEVEL% equ 0 (
  set /p compose_choice="Use 'docker compose' (newer) or 'docker-compose' (older)? [1/2] (default: 1): "
  if "%compose_choice%"=="2" (
    set docker_compose_cmd=docker-compose
  ) else (
    set docker_compose_cmd=docker compose
  )
)

echo Building and starting Docker containers...
%docker_compose_cmd% up --build -d

echo Checking if containers are running...
%docker_compose_cmd% ps -q > temp_containers.txt
for /f %%i in ("temp_containers.txt") do set size=%%~zi
if %size% equ 0 (
  echo Error: No containers are running. Check the logs with '%docker_compose_cmd% logs'
  del temp_containers.txt
  exit /b 1
)
del temp_containers.txt

echo Docker containers are running!
echo Frontend is available at: http://localhost:5173
echo Backend API is available at: http://localhost:8000/api
echo To stop the containers, run: %docker_compose_cmd% down 