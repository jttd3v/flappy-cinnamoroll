@echo off
title Cinnamoroll Learning Games Server
color 0D

echo.
echo  ================================================
echo     🐰 Cinnamoroll Learning Games 🐰
echo  ================================================
echo.
echo  Starting game server...
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo  ❌ Python is not installed or not in PATH
    echo.
    echo  Please install Python from https://python.org
    echo  Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

:: Find an available port
set PORT=8080

:: Check if port 8080 is available
netstat -an | find ":%PORT% " >nul 2>&1
if not errorlevel 1 (
    set PORT=8081
    netstat -an | find ":%PORT% " >nul 2>&1
    if not errorlevel 1 (
        set PORT=3000
    )
)

echo  ✅ Server starting on port %PORT%
echo.
echo  ================================================
echo     Open your browser to:
echo     http://localhost:%PORT%
echo  ================================================
echo.
echo  Press Ctrl+C to stop the server
echo.

:: Wait a moment then open browser
start "" "http://localhost:%PORT%/"

:: Start the Python HTTP server
python -m http.server %PORT%

pause
