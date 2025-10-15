#!/usr/bin/env python3
"""
Backend Startup Script for Virtual Environment
Automatically detects and uses the correct Python environment
"""

import os
import sys
import subprocess
import platform

def find_python_executable():
    """Find the correct Python executable"""
    
    # Check if we're in a virtual environment
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Already in virtual environment")
        return sys.executable
    
    # Look for virtual environment in project root
    project_root = os.path.dirname(os.path.abspath(__file__))
    
    if platform.system() == "Windows":
        venv_python = os.path.join(project_root, ".venv", "Scripts", "python.exe")
    else:
        venv_python = os.path.join(project_root, ".venv", "bin", "python")
    
    if os.path.exists(venv_python):
        print(f"✅ Found virtual environment: {venv_python}")
        return venv_python
    
    print("⚠️  Virtual environment not found, using system Python")
    return sys.executable

def check_dependencies(python_exe):
    """Check if required packages are installed"""
    required_packages = [
        'flask', 'flask_cors', 'pymongo', 'python_dotenv', 
        'jwt', 'bcrypt', 'requests', 'psutil'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            result = subprocess.run(
                [python_exe, '-c', f'import {package}'],
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                missing_packages.append(package)
        except Exception:
            missing_packages.append(package)
    
    return missing_packages

def install_dependencies(python_exe):
    """Install missing dependencies"""
    print("📦 Installing required packages...")
    
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Backend")
    requirements_file = os.path.join(backend_dir, "requirements.txt")
    
    if os.path.exists(requirements_file):
        try:
            subprocess.run(
                [python_exe, '-m', 'pip', 'install', '-r', requirements_file],
                check=True
            )
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return False
    else:
        print("❌ requirements.txt not found")
        return False

def start_backend():
    """Start the Flask backend"""
    print("🚀 Starting Smart Adaptive Learning Platform Backend...")
    print("=" * 60)
    
    # Find Python executable
    python_exe = find_python_executable()
    print(f"🐍 Using Python: {python_exe}")
    
    # Check dependencies
    missing = check_dependencies(python_exe)
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        if not install_dependencies(python_exe):
            sys.exit(1)
    else:
        print("✅ All dependencies satisfied")
    
    # Change to Backend directory
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Backend")
    if not os.path.exists(backend_dir):
        print("❌ Backend directory not found!")
        sys.exit(1)
    
    app_py = os.path.join(backend_dir, "app.py")
    if not os.path.exists(app_py):
        print("❌ app.py not found in Backend directory!")
        sys.exit(1)
    
    print(f"📁 Backend directory: {backend_dir}")
    print("🌐 Starting Flask application...")
    print("📍 Server will be available at: http://localhost:5000")
    print("🔒 Authentication endpoints ready")
    print("📊 Problem database: 205+ coding problems")
    print("")
    print("💡 Use Ctrl+C to stop the server")
    print("=" * 60)
    
    # Start the Flask app
    try:
        os.chdir(backend_dir)
        subprocess.run([python_exe, "app.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_backend()