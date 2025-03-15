@echo off
setlocal enabledelayedexpansion
REM Windows batch script to run the app in development mode

echo Detected OS: Windows

REM Check and create .env file if it doesn't exist
if not exist .env (
  if exist .env.example (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo .env file created. Please update it with your actual API keys and configuration.
  )
)

REM Function to check if a command exists
where /q python >nul 2>&1
if %ERRORLEVEL% equ 0 (
  set PYTHON_CMD=python
) else (
  where /q python3 >nul 2>&1
  if %ERRORLEVEL% equ 0 (
    set PYTHON_CMD=python3
  ) else (
    echo Python is not installed. Please install Python first.
    exit /b 1
  )
)

REM Ask user which Python package manager to use
set USE_UV=false
where /q uv >nul 2>&1
if %ERRORLEVEL% equ 0 (
  set /p use_uv_choice="Use uv package manager instead of pip? (y/n, default: n): "
  if /i "%use_uv_choice%"=="y" (
    set USE_UV=true
    echo Using uv package manager
  ) else (
    echo Using pip package manager
  )
) else (
  set /p install_uv_choice="Would you like to install uv package manager? (y/n, default: n): "
  if /i "%install_uv_choice%"=="y" (
    echo Installing uv package manager...
    where /q curl >nul 2>&1
    if %ERRORLEVEL% equ 0 (
      curl -LsSf https://astral.sh/uv/install.sh | sh
      set PATH=%USERPROFILE%\.cargo\bin;%PATH%
      set USE_UV=true
      echo uv installed successfully
    ) else (
      echo curl is not installed. Please install uv manually: https://github.com/astral-sh/uv
    )
  )
)

REM Start the Flask backend
echo Starting Flask backend...
if not exist backend (
  echo Backend directory not found
  exit /b 1
)
cd backend

REM Check if virtual environment exists, create it if it doesn't
if exist .venv (
  echo Activating existing virtual environment...
  if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
  ) else (
    call .venv\bin\activate.bat
  )
) else (
  echo Creating new virtual environment...
  if "%USE_UV%"=="true" (
    uv venv .venv
  ) else (
    %PYTHON_CMD% -m venv .venv
  )
  
  if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
  ) else (
    call .venv\bin\activate.bat
  )
)

REM Always install/update requirements to ensure we have the latest versions
echo Installing/updating requirements...
if "%USE_UV%"=="true" (
  uv pip install -r requirements.txt --upgrade
) else (
  pip install -r requirements.txt --upgrade
)

REM Run the Python file
echo Starting backend server...
start /b "" cmd /c "%PYTHON_CMD% run.py"
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq cmd.exe" /v ^| find "run.py"') do set BACKEND_PID=%%a
echo Backend process started with PID: !BACKEND_PID!

REM Deactivate virtual environment
call deactivate
cd ..

REM Start the React frontend
echo Starting React frontend...
if not exist frontend (
  echo Frontend directory not found
  taskkill /PID !BACKEND_PID! /F >nul 2>&1
  exit /b 1
)
cd frontend

REM Check if npm is installed
where /q npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo npm is not installed. Please install Node.js and npm first.
  exit /b 1
)

call npm install
start /b "" cmd /c "npm run dev"
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq cmd.exe" /v ^| find "npm run dev"') do set FRONTEND_PID=%%a
echo Frontend process started with PID: !FRONTEND_PID!
cd ..

echo Development servers running. Press Ctrl+C to stop.
echo Backend: http://localhost:8000/api
echo Frontend: http://localhost:5173

REM Create a cleanup batch file
echo @echo off > cleanup.bat
echo echo Shutting down servers... >> cleanup.bat
echo taskkill /PID !BACKEND_PID! /F ^>nul 2^>^&1 >> cleanup.bat
echo taskkill /PID !FRONTEND_PID! /F ^>nul 2^>^&1 >> cleanup.bat
echo del cleanup.bat >> cleanup.bat

REM Wait for user to press Ctrl+C
echo Press Ctrl+C to stop the servers, or any key to exit...
pause > nul
call cleanup.bat 