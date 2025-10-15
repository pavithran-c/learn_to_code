@echo off
echo 🚀 Starting Smart Adaptive Learning Platform Backend...
echo ======================================================

cd /d "%~dp0Backend"

echo 📋 Checking environment setup...
if not exist ".env" (
    echo ⚠️  Warning: .env file not found
    echo 📝 Please copy .env.example to .env and configure your settings
    echo.
)

echo 🗄️  Starting Flask application...
echo 📍 Backend will be available at: http://localhost:5000
echo 🔒 Authentication endpoints ready
echo 📊 Problem database loaded: 205+ coding problems
echo.
echo 💡 Use Ctrl+C to stop the server
echo ======================================================

python app.py

pause