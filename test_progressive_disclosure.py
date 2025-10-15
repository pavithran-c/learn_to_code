#!/usr/bin/env python3
"""
Test script for progressive disclosure system
Tests the smart test case revelation feature
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER = {
    "email": "test_progressive@example.com",
    "password": "Password123!",
    "profile": {
        "first_name": "Test",
        "last_name": "User",
        "experience_level": "beginner"
    }
}

def register_and_login():
    """Register test user and get authentication token"""
    print("🔐 Setting up test user...")
    
    # Register user
    register_response = requests.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
    if register_response.status_code in [200, 201]:
        # Registration successful, get token from response
        data = register_response.json()
        if data.get('success') and 'access_token' in data:
            token = data['access_token']
            print(f"   ✅ User registered and authenticated successfully")
            return token
    
    # If registration failed (user might exist), try login
    print("   User already exists, proceeding to login...")
    
    # Login
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    
    if login_response.status_code == 200:
        data = login_response.json()
        if data.get('success') and 'access_token' in data:
            token = data['access_token']
            print(f"   ✅ Authentication successful")
            return token
        else:
            print(f"   ❌ Login failed: {data.get('message', 'Unknown error')}")
            return None
    else:
        print(f"   ❌ Login failed: {login_response.text}")
        return None

def submit_wrong_code(token, problem_id, attempt_number):
    """Submit intentionally wrong code to trigger failures"""
    print(f"📝 Submitting wrong code (Attempt {attempt_number})...")
    
    # Intentionally wrong Python code
    wrong_codes = [
        'def solution(nums):\n    return []',  # Wrong logic
        'def solution(nums):\n    return None',  # Wrong return type
        'def solution(nums):\n    return nums[0]',  # Wrong approach
        'def solution(nums):\n    return "wrong"'  # Completely wrong
    ]
    
    code = wrong_codes[min(attempt_number - 1, len(wrong_codes) - 1)]
    
    headers = {'Authorization': f'Bearer {token}'}
    submission_data = {
        'problem_id': problem_id,
        'code': code,
        'language': 'python'
    }
    
    response = requests.post(f"{BASE_URL}/api/submit_code", 
                           json=submission_data, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"   📊 Results:")
        print(f"      - Passed: {result['all_passed']}")
        print(f"      - Hidden tests: {result['hidden_tests']['passed']}/{result['hidden_tests']['total']}")
        
        # Check progressive disclosure
        if 'progressive_disclosure' in result:
            disclosure = result['progressive_disclosure']
            print(f"      - Failure count: {disclosure['failure_count']}")
            print(f"      - Hidden tests revealed: {disclosure['hidden_tests_revealed']}")
            print(f"      - Hints available: {disclosure['hints_available']}")
            
            if disclosure['hidden_tests_revealed']:
                print(f"      - 🔓 Hidden test details now revealed!")
                if result.get('hidden_test_details'):
                    print(f"      - Hidden test count: {len(result['hidden_test_details'])}")
            
            if disclosure['hints_available'] and result.get('hints'):
                print(f"      - 💡 Hints now available: {len(result['hints'])} hints")
        
        return result
    else:
        print(f"   ❌ Submission failed: {response.text}")
        return None

def test_progressive_disclosure():
    """Test the complete progressive disclosure system"""
    print("🚀 Testing Progressive Disclosure System")
    print("=" * 50)
    
    # Step 1: Authentication
    token = register_and_login()
    if not token:
        print("❌ Authentication failed, cannot proceed")
        return
    
    # Step 2: Get a problem to test with
    print("\n📚 Getting test problem...")
    headers = {'Authorization': f'Bearer {token}'}
    problems_response = requests.get(f"{BASE_URL}/api/problems?difficulty=easy", headers=headers)
    
    if problems_response.status_code != 200:
        print("❌ Failed to get problems")
        return
    
    problems = problems_response.json()
    if not problems:
        print("❌ No problems available")
        return
    
    test_problem = problems[0]
    problem_id = test_problem['id']
    print(f"   ✅ Using problem: {test_problem['title']}")
    
    # Step 3: Test progressive disclosure
    print(f"\n🎯 Testing Progressive Disclosure on Problem {problem_id}")
    print("-" * 30)
    
    # Submit wrong code multiple times to trigger progressive disclosure
    for attempt in range(1, 5):
        print(f"\n🔄 Attempt {attempt}:")
        result = submit_wrong_code(token, problem_id, attempt)
        
        if result and 'progressive_disclosure' in result:
            disclosure = result['progressive_disclosure']
            
            if attempt >= 2 and disclosure['hints_available']:
                print("   🎉 SUCCESS: Hints are now available after 2+ failures!")
                
            if attempt >= 3 and disclosure['hidden_tests_revealed']:
                print("   🎉 SUCCESS: Hidden tests revealed after 3+ failures!")
                print("   🔍 Progressive disclosure system working correctly!")
                break
        
        time.sleep(1)  # Brief pause between attempts
    
    print("\n✅ Progressive Disclosure Test Complete!")
    print("=" * 50)

if __name__ == "__main__":
    try:
        test_progressive_disclosure()
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure the server is running on localhost:5000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")