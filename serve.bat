@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [BuySmart] Node.js was not found on PATH. Install Node from https://nodejs.org/ and try again.
  pause
  exit /b 1
)

set PORT=8125
echo [BuySmart] Serving %CD% on http://localhost:%PORT%/
echo [BuySmart] Press Ctrl+C or close this window to stop.
start "" "http://localhost:%PORT%/"
node ".claude\static-server.js"
endlocal
