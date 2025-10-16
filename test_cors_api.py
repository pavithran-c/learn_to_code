#!/usr/bin/env python3
"""
Test script to verify CORS and API endpoint fixes
"""

import requests
import json

def test_cors_and_api():
    """Test CORS and API endpoints"""
    
    print("🧪 Testing CORS and API Endpoint Fixes")
    print("=" * 50)
    
    BASE_URL = "http://localhost:5000"
    
    # Test endpoints
    endpoints = [
        "/api/auth/verify-token",
        "/api/auth/login", 
        "/api/auth/register"
    ]
    
    # Test CORS preflight requests
    for endpoint in endpoints:
        print(f"\n🔍 Testing: {BASE_URL}{endpoint}")
        
        try:
            # Test OPTIONS request (preflight)
            options_response = requests.options(f"{BASE_URL}{endpoint}")
            print(f"   OPTIONS: {options_response.status_code}")
            
            # Check CORS headers
            cors_headers = {
                'Access-Control-Allow-Origin': options_response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': options_response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': options_response.headers.get('Access-Control-Allow-Headers')
            }
            
            print(f"   CORS Headers:")
            for header, value in cors_headers.items():
                if value:
                    print(f"     ✅ {header}: {value}")
                else:
                    print(f"     ❌ {header}: Not set")
            
        except requests.exceptions.ConnectionError:
            print(f"   ❌ Connection failed - Backend not running?")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    # Test a simple POST request
    print(f"\n🧪 Testing POST request to verify-token...")
    try:
        test_data = {"token": "test_token"}
        response = requests.post(
            f"{BASE_URL}/api/auth/verify-token",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code != 500:  # We expect it to fail gracefully, not error
            print("   ✅ Request processed (token validation expected to fail)")
        else:
            print("   ⚠️ Server error (check backend logs)")
            
    except Exception as e:
        print(f"   ❌ Request failed: {str(e)}")

if __name__ == "__main__":
    print("🚀 CORS and API Endpoint Test")
    print("🎯 Goal: Verify CORS configuration and API URL fixes")
    print()
    
    test_cors_and_api()
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")
    print("\n🔍 Next Steps:")
    print("1. Open http://localhost:5173/login")
    print("2. Try logging in with valid credentials")
    print("3. Check browser console for CORS errors")
    print("4. Verify dashboard shows correct user name")