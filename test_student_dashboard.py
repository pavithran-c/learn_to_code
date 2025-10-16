import requests
import json

# Test the student dashboard endpoint
API_BASE_URL = 'http://localhost:5000'

def test_student_dashboard():
    """Test the student dashboard endpoint"""
    
    # You'll need to replace this with an actual user ID and token
    # For now, let's test with a mock setup
    user_id = "test_user_123"
    
    try:
        # Test the endpoint without authentication first
        url = f"{API_BASE_URL}/api/student/dashboard/{user_id}"
        
        print(f"Testing endpoint: {url}")
        response = requests.get(url)
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Dashboard data received successfully!")
            print(f"User info: {data.get('user_info', {})}")
            print(f"Problems solved: {data.get('metrics', {}).get('total_problems_solved', 0)}")
            print(f"Concepts: {len(data.get('progress', {}).get('concept_progress', []))}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Could not connect to backend. Make sure the Flask server is running on localhost:5000")
    except Exception as e:
        print(f"Error testing dashboard: {e}")

if __name__ == "__main__":
    test_student_dashboard()