@echo off
echo 🚀 Starting Smart Adaptive Learning Platform Backend (Virtual Environment)...
echo ======================================================================

cd /d "%~dp0"

echo 📋 Checking virtual environment...
if not exist ".venv\Scripts\python.exe" (
    echo ❌ Virtual environment not found!
    echo 💡 Please create virtual environment first:
    echo    python -m venv .venv
    echo    .venv\Scripts\activate
    echo    pip install -r Backend\requirements.txt
    echo.
    pause
    exit /b 1
)

echo ✅ Virtual environment found
echo 📦 Python: .venv\Scripts\python.exe

cd Backend

echo 🗄️  Checking environment setup...
if not exist ".env" (
    echo ⚠️  Warning: .env file not found
    echo 📝 Please copy .env.example to .env and configure your settings
    echo.
)

echo 🚀 Starting Flask application...
echo 📍 Backend will be available at: http://localhost:5000
echo 🔒 Authentication endpoints ready
echo 📊 Problem database: 205+ coding problems loaded
echo.
echo 💡 Use Ctrl+C to stop the server
echo ======================================================================

"..\\.venv\\Scripts\\python.exe" app.py

pause