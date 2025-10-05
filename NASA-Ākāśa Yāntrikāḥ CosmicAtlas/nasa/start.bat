@echo off
echo Starting NASA Data Exploration Platform...
echo.

echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server...
start "NASA Backend" cmd /k "npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting frontend development server...
cd ..
start "NASA Frontend" cmd /k "npm run dev"

echo.
echo NASA Data Exploration Platform is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul
