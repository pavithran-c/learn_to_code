@echo off
echo 🚀 Starting Enhanced LearnToCode Backend with Real-time Features
echo ================================================================

echo.
echo 📦 Checking Python environment...
python --version
if errorlevel 1 (
    echo ❌ Python not found! Please install Python and add it to PATH
    pause
    exit /b 1
)

echo.
echo 📁 Navigating to Backend directory...
cd /d "%~dp0Backend"
if not exist "app.py" (
    echo ❌ Backend directory not found or app.py missing!
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo.
echo 📋 Installing/checking dependencies...
echo Installing flask-socketio for WebSocket support...
pip install flask-socketio python-socketio --quiet
if errorlevel 1 (
    echo ⚠️ Warning: Could not install some dependencies
    echo Continuing anyway...
)

echo.
echo 🔧 Installing all requirements...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ⚠️ Warning: Some requirements may not be installed
)

echo.
echo 🌐 Starting backend server with real-time features...
echo Backend will be available at: http://localhost:5000
echo WebSocket endpoint: ws://localhost:5000
echo.
echo 📊 New features available:
echo   - Real-time dashboard updates
echo   - Enhanced quiz system with categories
echo   - WebSocket notifications
echo   - Live user activity tracking
echo   - Achievement notifications
echo.
echo Press Ctrl+C to stop the server
echo ================================================================
echo.

python app.py