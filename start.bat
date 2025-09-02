@echo off
echo Starting Smart Adaptive Learning Platform...
echo.

echo [1/3] Installing Python dependencies...
cd Backend
pip install -r requirements.txt
echo.

echo [2/3] Starting Flask Backend Server...
start cmd /k "python app.py"
cd ..

echo [3/3] Starting React Frontend...
cd compiler
npm install
npm run dev

pause
