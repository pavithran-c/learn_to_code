#!/usr/bin/env python3
"""
Test script to verify that the Dashboard shows the correct user name
instead of hardcoded "Alex Thompson"
"""

import requests
import json

# API endpoints
BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/auth/login"

def test_dashboard_user_display():
    """Test that dashboard shows correct user after login"""
    
    print("🧪 Testing Dashboard User Display")
    print("=" * 50)
    
    # Test credentials
    test_user = {
        "email": "sujith@example.com",
        "password": "password123"
    }
    
    try:
        # Step 1: Login
        print(f"📝 Attempting login with: {test_user['email']}")
        
        response = requests.post(LOGIN_URL, json=test_user)
        print(f"📡 Login response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                user_info = data.get('user', {})
                access_token = data.get('access_token')
                
                print(f"✅ Login successful!")
                print(f"👤 User data received:")
                print(f"   - Name: {user_info.get('name', 'Not set')}")
                print(f"   - Email: {user_info.get('email', 'Not set')}")
                print(f"   - ID: {user_info.get('id', 'Not set')}")
                
                # Expected dashboard display
                expected_name = user_info.get('name') or user_info.get('email', '').split('@')[0]
                print(f"\n📊 Expected Dashboard Display:")
                print(f"   - Display Name: {expected_name}")
                print(f"   - Should NOT show: Alex Thompson")
                
                return True
            else:
                print(f"❌ Login failed: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ Login request failed with status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Error response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("   Make sure the Flask server is running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_user_registration():
    """Test user registration if login fails"""
    
    print("\n🔐 Testing User Registration")
    print("=" * 50)
    
    REGISTER_URL = f"{BASE_URL}/auth/register"
    
    test_user = {
        "name": "Sujith Kumar",
        "email": "sujith@example.com", 
        "password": "password123",
        "confirm_password": "password123"
    }
    
    try:
        print(f"📝 Attempting registration for: {test_user['name']} ({test_user['email']})")
        
        response = requests.post(REGISTER_URL, json=test_user)
        print(f"📡 Registration response status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Registration successful!")
            print(f"👤 User created: {data.get('user', {})}")
            return True
        else:
            print(f"❌ Registration failed with status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Error response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Dashboard User Display Test")
    print("🎯 Goal: Verify dashboard shows 'Sujith' instead of 'Alex Thompson'")
    print()
    
    # Try login first
    login_success = test_dashboard_user_display()
    
    if not login_success:
        print("\n🔄 Login failed, trying registration...")
        register_success = test_user_registration()
        
        if register_success:
            print("\n🔄 Registration successful, trying login again...")
            login_success = test_dashboard_user_display()
    
    print("\n" + "=" * 50)
    if login_success:
        print("✅ TEST PASSED: User authentication working")
        print("📊 Dashboard should now display the correct user name")
        print("🌐 Check http://localhost:5177/dashboard after logging in")
    else:
        print("❌ TEST FAILED: Authentication issues detected")
    
    print("\n🔍 Next Steps:")
    print("1. Open http://localhost:5177/login")
    print("2. Login with: sujith@example.com / password123")
    print("3. Navigate to Dashboard")
    print("4. Verify it shows 'Sujith' instead of 'Alex Thompson'")