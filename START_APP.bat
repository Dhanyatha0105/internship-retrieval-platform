@echo off
cls
echo ============================================
echo  Internship Platform - Starting Servers
echo ============================================
echo.

REM Kill any existing processes on ports 8000 and 5173
echo Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [1/3] Starting Backend Server...
echo ----------------------------------------
cd /d "%~dp0"
start "Backend" cmd /c "python -m uvicorn backend.main:app --reload --port 8000 & pause"
timeout /t 3 /nobreak >nul

echo.
echo [2/3] Starting Frontend Server...
echo ----------------------------------------
cd frontend
start "Frontend" cmd /c "npm run dev & pause"
cd ..
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Check the Backend and Frontend windows for any errors.
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:5173

echo.
echo Application opened! Keep this window and the server windows open.
echo Press any key to exit...
pause >nul
