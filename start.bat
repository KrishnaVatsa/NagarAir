@echo off
echo Starting NagarAir backend and frontend...
echo.

REM Start the backend API in a new window
start "NagarAir Backend (port 8000)" cmd /k "cd backend && python -m uvicorn forecast_api:app --reload --port 8000"

REM Give the backend a moment to start
timeout /t 3 /nobreak >nul

REM Start the frontend static server in a new window
start "NagarAir Frontend (port 5500)" cmd /k "cd frontend && python -m http.server 5500"

REM Give it a moment then open the browser
timeout /t 2 /nobreak >nul
start http://127.0.0.1:5500

echo.
echo Two windows have opened: Backend (port 8000) and Frontend (port 5500).
echo Your browser should open automatically to the dashboard.
echo Keep both windows running while you use the dashboard.
echo Close both windows when you're done.
pause
