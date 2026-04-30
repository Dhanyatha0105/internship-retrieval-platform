@echo off
echo ===================================================
echo   Internship Retrieval Platform - Startup Script
echo ===================================================

echo.
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "python -m uvicorn backend.main:app --reload --port 8000"

echo.
echo [2/2] Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo All servers started!
echo Frontend URL: http://localhost:5173 (or check the Frontend window)
echo Backend URL: http://localhost:8000
echo.
echo Keeping this window open for your reference.
pause
