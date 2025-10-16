import requests
import json

def test_login_directly():
    """Test the login endpoint directly"""
    
    url = "http://localhost:5000/api/auth/login"
    
    # Test data
    login_data = {
        "email": "sujithg.22it@kongu.edu",
        "password": "test123"
    }
    
    print(f"🔄 Testing login endpoint: {url}")
    print(f"📧 Email: {login_data['email']}")
    print(f"🔐 Password: {login_data['password']}")
    
    try:
        # Make the request
        response = requests.post(
            url,
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"\n📡 Response Status: {response.status_code}")
        print(f"📡 Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"📡 Response Data: {json.dumps(response_data, indent=2)}")
        except:
            print(f"📡 Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return True
        else:
            print("❌ Login failed!")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("💡 Make sure the Flask server is running on http://localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:5000/", timeout=5)
        print(f"✅ Backend is running (status: {response.status_code})")
        return True
    except:
        print("❌ Backend is not responding")
        return False

if __name__ == "__main__":
    print("🔍 Testing Login Functionality\n")
    
    # First check if backend is running
    if test_backend_health():
        print("\n" + "="*50)
        test_login_directly()
    else:
        print("💡 Please start the backend server first:")
        print("   cd Backend")
        print("   python app.py")