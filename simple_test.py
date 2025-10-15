import requests
import json

# Test basic backend functionality
BASE_URL = "http://localhost:5000"

print("🔧 Testing Backend Progressive Disclosure...")

# Step 1: Register and get token
user_data = {
    "email": "test_simple@example.com",
    "password": "Password123!",
    "profile": {
        "first_name": "Simple",
        "last_name": "Test"
    }
}

print("\n1. Testing Registration...")
reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
print(f"Registration Status: {reg_response.status_code}")

if reg_response.status_code in [200, 201]:
    token = reg_response.json()['access_token']
    print("✅ Got token from registration")
else:
    # Try login
    print("User exists, trying login...")
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    print(f"Login Status: {login_response.status_code}")
    if login_response.status_code == 200:
        token = login_response.json()['access_token']
        print("✅ Got token from login")
    else:
        print("❌ Authentication failed")
        exit(1)

# Step 2: Get problems
print("\n2. Testing Problems Endpoint...")
headers = {'Authorization': f'Bearer {token}'}
problems_response = requests.get(f"{BASE_URL}/api/problems?difficulty=easy", headers=headers)
print(f"Problems Status: {problems_response.status_code}")

if problems_response.status_code == 200:
    problems = problems_response.json()
    if problems:
        problem = problems[0]
        print(f"✅ Got problem: {problem['title']} (ID: {problem['id']})")
        
        # Step 3: Test submission
        print("\n3. Testing Code Submission...")
        submission_data = {
            'problem_id': problem['id'],
            'code': 'def solution(nums):\n    return []',
            'language': 'python'
        }
        
        submit_response = requests.post(f"{BASE_URL}/api/submit_code", json=submission_data, headers=headers)
        print(f"Submission Status: {submit_response.status_code}")
        
        if submit_response.status_code == 200:
            result = submit_response.json()
            print("✅ Submission successful!")
            print(f"All passed: {result.get('all_passed', 'N/A')}")
            if 'progressive_disclosure' in result:
                print(f"Progressive disclosure working: {result['progressive_disclosure']}")
            else:
                print("⚠️ No progressive disclosure data")
        else:
            print(f"❌ Submission failed")
            print(f"Response: {submit_response.text}")
    else:
        print("❌ No problems found")
else:
    print(f"❌ Problems request failed: {problems_response.text}")

print("\n🏁 Test Complete!")