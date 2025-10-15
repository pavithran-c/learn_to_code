"""
Test script for enhanced backend real-time features
"""
import requests
import json
import time
from datetime import datetime

# Backend URL
BASE_URL = "http://localhost:5000"

def test_realtime_dashboard_endpoints():
    """Test real-time dashboard endpoints"""
    print("🔄 Testing Real-time Dashboard Endpoints...")
    
    # Test user ID for testing
    test_user_id = "test_user_123"
    
    # Test endpoints
    endpoints = [
        f"/api/realtime/dashboard/{test_user_id}",
        f"/api/realtime/stats/{test_user_id}",
        f"/api/realtime/activity/{test_user_id}",
        f"/api/realtime/skills/{test_user_id}",
        f"/api/realtime/achievements/{test_user_id}",
        f"/api/realtime/leaderboard/{test_user_id}",
        "/api/realtime/active-users"
    ]
    
    results = {}
    
    for endpoint in endpoints:
        try:
            print(f"  📡 Testing: {endpoint}")
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results[endpoint] = {
                    'status': 'SUCCESS',
                    'response_time': response.elapsed.total_seconds(),
                    'data_keys': list(data.keys()) if isinstance(data, dict) else 'non-dict-response'
                }
                print(f"    ✅ Success: {response.status_code}")
            else:
                results[endpoint] = {
                    'status': 'FAILED',
                    'status_code': response.status_code,
                    'error': response.text[:100]
                }
                print(f"    ❌ Failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            results[endpoint] = {
                'status': 'CONNECTION_ERROR',
                'error': str(e)
            }
            print(f"    🔌 Connection Error: {str(e)}")
        except Exception as e:
            results[endpoint] = {
                'status': 'ERROR',
                'error': str(e)
            }
            print(f"    ⚠️ Error: {str(e)}")
    
    return results

def test_enhanced_quiz_endpoints():
    """Test enhanced quiz endpoints"""
    print("\\n🔄 Testing Enhanced Quiz Endpoints...")
    
    test_user_id = "test_user_123"
    
    endpoints = [
        "/api/quiz/categories",
        "/api/quiz/questions/programming?difficulty=beginner&count=5",
        "/api/quiz/leaderboard/programming?period=weekly",
        f"/api/quiz/user-stats/{test_user_id}"
    ]
    
    results = {}
    
    for endpoint in endpoints:
        try:
            print(f"  📊 Testing: {endpoint}")
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results[endpoint] = {
                    'status': 'SUCCESS',
                    'response_time': response.elapsed.total_seconds(),
                    'data_keys': list(data.keys()) if isinstance(data, dict) else 'non-dict-response'
                }
                print(f"    ✅ Success: {response.status_code}")
            else:
                results[endpoint] = {
                    'status': 'FAILED',
                    'status_code': response.status_code,
                    'error': response.text[:100]
                }
                print(f"    ❌ Failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            results[endpoint] = {
                'status': 'CONNECTION_ERROR',
                'error': str(e)
            }
            print(f"    🔌 Connection Error: {str(e)}")
    
    return results

def test_backend_health():
    """Test basic backend health"""
    print("🔄 Testing Backend Health...")
    
    try:
        # Test basic health endpoint or any simple endpoint
        response = requests.get(f"{BASE_URL}/api/quiz/categories", timeout=5)
        
        if response.status_code == 200:
            print("    ✅ Backend is healthy and responding")
            return True
        else:
            print(f"    ❌ Backend returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("    🔌 Backend is not running or not accessible")
        return False
    except Exception as e:
        print(f"    ⚠️ Error checking backend health: {str(e)}")
        return False

def print_test_summary(realtime_results, quiz_results):
    """Print test summary"""
    print("\\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    # Count results
    realtime_success = sum(1 for r in realtime_results.values() if r['status'] == 'SUCCESS')
    realtime_total = len(realtime_results)
    
    quiz_success = sum(1 for r in quiz_results.values() if r['status'] == 'SUCCESS')
    quiz_total = len(quiz_results)
    
    print(f"Real-time Dashboard Endpoints: {realtime_success}/{realtime_total} passed")
    print(f"Enhanced Quiz Endpoints: {quiz_success}/{quiz_total} passed")
    
    print("\\n📝 DETAILED RESULTS:")
    print("-" * 40)
    
    print("\\n🔴 Real-time Dashboard:")
    for endpoint, result in realtime_results.items():
        status_icon = "✅" if result['status'] == 'SUCCESS' else "❌"
        print(f"  {status_icon} {endpoint.split('/')[-1]}: {result['status']}")
    
    print("\\n🔴 Enhanced Quiz:")
    for endpoint, result in quiz_results.items():
        status_icon = "✅" if result['status'] == 'SUCCESS' else "❌"
        endpoint_name = endpoint.split('?')[0].split('/')[-1]
        print(f"  {status_icon} {endpoint_name}: {result['status']}")
    
    print("\\n💡 NEXT STEPS:")
    print("- If backend is not running, start it with: python Backend/app.py")
    print("- Install missing dependencies: pip install flask-socketio python-socketio")
    print("- Check that all new endpoints are properly registered")
    print("- Test WebSocket connectivity separately")

def main():
    """Main test function"""
    print("🚀 BACKEND ENHANCEMENT TESTING")
    print("=" * 60)
    print(f"Testing backend at: {BASE_URL}")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check if backend is running
    if not test_backend_health():
        print("\\n❌ Backend is not accessible. Please start the backend first.")
        print("Run: python Backend/app.py")
        return
    
    # Run tests
    realtime_results = test_realtime_dashboard_endpoints()
    quiz_results = test_enhanced_quiz_endpoints()
    
    # Print summary
    print_test_summary(realtime_results, quiz_results)

if __name__ == "__main__":
    main()