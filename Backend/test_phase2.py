"""
Phase 2 Testing Script
Tests enhanced database features, problem selection, and analytics
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:5000"
test_user_credentials = {
    "email": "test@phase2.com",
    "password": "TestPassword123!",
    "name": "Phase2 Test User",
    "institution": "Test University",
    "field_of_study": "Computer Science",
    "experience_level": "intermediate"
}

class Phase2Tester:
    def __init__(self):
        self.token = None
        self.user_id = None
        
    def authenticate(self):
        """Register and login test user"""
        print("🔐 Setting up authentication...")
        
        # Try to register user
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user_credentials)
        if register_response.status_code == 201:
            print("✅ User registered successfully")
        elif register_response.status_code == 409:
            print("ℹ️ User already exists, proceeding to login")
        else:
            print(f"❌ Registration failed: {register_response.json()}")
            return False
        
        # Login user
        login_data = {
            "email": test_user_credentials["email"],
            "password": test_user_credentials["password"]
        }
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            self.token = login_result['access_token']
            self.user_id = login_result['user']['user_id']
            print(f"✅ Authentication successful. User ID: {self.user_id}")
            return True
        else:
            print(f"❌ Login failed: {login_response.json()}")
            return False
    
    def get_headers(self):
        """Get headers with authentication token"""
        return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_adaptive_problem_selection(self):
        """Test IRT-based adaptive problem selection"""
        print("\n🧠 Testing Adaptive Problem Selection...")
        
        # Get adaptive problems
        response = requests.get(
            f"{BASE_URL}/api/adaptive/problems/adaptive?count=5",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            problems = data.get('problems', [])
            print(f"✅ Retrieved {len(problems)} adaptive problems")
            
            for i, problem in enumerate(problems[:3]):  # Show first 3
                print(f"   Problem {i+1}: {problem.get('title')} ({problem.get('difficulty')})")
                print(f"   Skills: {', '.join(problem.get('skills', []))}")
                print(f"   Reason: {problem.get('selection_reason', 'N/A')}")
            
            return True
        else:
            print(f"❌ Failed to get adaptive problems: {response.json()}")
            return False
    
    def test_code_submission_storage(self):
        """Test code submission with version history"""
        print("\n💾 Testing Code Submission Storage...")
        
        # Submit code for a problem
        submission_data = {
            "problem_id": "1",
            "code": "def hello_world():\n    return 'Hello, World!'",
            "language": "python",
            "status": "completed",
            "execution_result": {"score": 85, "passed": True}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/adaptive/code-submissions",
            headers=self.get_headers(),
            json=submission_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Code submission saved with ID: {data.get('submission_id')}")
            print(f"   Version: {data.get('version', 1)}")
            
            # Submit another version
            submission_data["code"] = "def hello_world():\n    print('Hello, World!')\n    return 'Hello, World!'"
            
            response2 = requests.post(
                f"{BASE_URL}/api/adaptive/code-submissions",
                headers=self.get_headers(),
                json=submission_data
            )
            
            if response2.status_code == 200:
                data2 = response2.json()
                print(f"✅ Second version saved with version: {data2.get('version', 1)}")
            
            return True
        else:
            print(f"❌ Failed to save code submission: {response.json()}")
            return False
    
    def test_code_submission_history(self):
        """Test retrieving code submission history"""
        print("\n📖 Testing Code Submission History...")
        
        response = requests.get(
            f"{BASE_URL}/api/adaptive/code-submissions/history?limit=10",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            submissions = data.get('submissions', [])
            print(f"✅ Retrieved {len(submissions)} code submissions")
            
            for submission in submissions[:3]:  # Show first 3
                print(f"   Problem: {submission.get('problem_id')} | Version: {submission.get('version')} | Language: {submission.get('language')}")
            
            return True
        else:
            print(f"❌ Failed to get submission history: {response.json()}")
            return False
    
    def test_skill_progress_tracking(self):
        """Test skill-based progress tracking"""
        print("\n📊 Testing Skill Progress Tracking...")
        
        # Update progress for multiple skills
        skills_to_update = [
            {"skill_name": "algorithms", "score": 85, "problem_id": "1", "time_spent": 300},
            {"skill_name": "data_structures", "score": 78, "problem_id": "2", "time_spent": 450},
            {"skill_name": "dynamic_programming", "score": 92, "problem_id": "3", "time_spent": 600}
        ]
        
        for skill_data in skills_to_update:
            response = requests.post(
                f"{BASE_URL}/api/adaptive/skills/progress",
                headers=self.get_headers(),
                json=skill_data
            )
            
            if response.status_code == 200:
                print(f"✅ Updated progress for {skill_data['skill_name']}: {skill_data['score']}%")
            else:
                print(f"❌ Failed to update {skill_data['skill_name']}: {response.json()}")
                return False
        
        return True
    
    def test_skill_progress_retrieval(self):
        """Test retrieving skill progress"""
        print("\n📈 Testing Skill Progress Retrieval...")
        
        response = requests.get(
            f"{BASE_URL}/api/adaptive/skills/progress",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            progress = data.get('progress', {})
            skills = progress.get('skills', {})
            
            print(f"✅ Retrieved progress for {len(skills)} skills")
            print(f"   Overall Progress: {progress.get('overall_progress', 0):.2f}")
            print(f"   Learning Velocity: {progress.get('learning_velocity', 0):.2f}")
            
            # Show analytics
            analytics = progress.get('analytics', {})
            strongest = analytics.get('strongest_skills', [])
            if strongest:
                print(f"   Strongest Skills: {', '.join([s['skill'] for s in strongest[:3]])}")
            
            return True
        else:
            print(f"❌ Failed to get skill progress: {response.json()}")
            return False
    
    def test_learning_analytics(self):
        """Test comprehensive learning analytics"""
        print("\n📊 Testing Learning Analytics...")
        
        response = requests.get(
            f"{BASE_URL}/api/adaptive/analytics/learning?days=30",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            analytics = data.get('analytics', {})
            
            activity = analytics.get('activity_summary', {})
            print(f"✅ Learning Analytics Retrieved:")
            print(f"   Problems Attempted: {activity.get('total_problems_attempted', 0)}")
            print(f"   Code Submissions: {activity.get('total_code_submissions', 0)}")
            print(f"   Success Rate: {activity.get('success_rate', 0):.1f}%")
            print(f"   Average Score: {activity.get('average_score', 0):.1f}")
            
            return True
        else:
            print(f"❌ Failed to get learning analytics: {response.json()}")
            return False
    
    def test_recommendation_stats(self):
        """Test IRT ability estimation and recommendation stats"""
        print("\n🎯 Testing Recommendation Statistics...")
        
        response = requests.get(
            f"{BASE_URL}/api/adaptive/analytics/recommendations",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            stats = data.get('stats', {})
            
            print(f"✅ Recommendation Statistics:")
            print(f"   Estimated Ability: {stats.get('estimated_ability', 0):.2f}")
            print(f"   Completion Rate: {stats.get('completion_rate', 0):.1f}%")
            print(f"   Learning Velocity: {stats.get('learning_velocity', 0):.2f}")
            print(f"   Total Solved: {stats.get('total_solved', 0)}")
            
            weak_skills = stats.get('weak_skills', [])
            strong_skills = stats.get('strong_skills', [])
            
            if weak_skills:
                print(f"   Areas for Improvement: {', '.join(weak_skills[:3])}")
            if strong_skills:
                print(f"   Strong Areas: {', '.join(strong_skills[:3])}")
            
            return True
        else:
            print(f"❌ Failed to get recommendation stats: {response.json()}")
            return False
    
    def test_learning_path_generation(self):
        """Test personalized learning path generation"""
        print("\n🛤️ Testing Learning Path Generation...")
        
        target_skill = "dynamic_programming"
        response = requests.get(
            f"{BASE_URL}/api/adaptive/problems/learning-path/{target_skill}",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            learning_path = data.get('learning_path', [])
            
            print(f"✅ Generated learning path for {target_skill}:")
            print(f"   Total Problems: {data.get('total_problems', 0)}")
            
            for i, problem in enumerate(learning_path[:5]):  # Show first 5
                path_type = problem.get('path_type', 'unknown')
                print(f"   {i+1}. {problem.get('title')} ({problem.get('difficulty')}) - {path_type}")
            
            return True
        else:
            print(f"❌ Failed to generate learning path: {response.json()}")
            return False
    
    def test_performance_analytics(self):
        """Test comprehensive performance analytics"""
        print("\n🏆 Testing Performance Analytics...")
        
        response = requests.get(
            f"{BASE_URL}/api/adaptive/analytics/performance",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            data = response.json()
            analytics = data.get('analytics', {})
            
            ability = analytics.get('ability_estimation', {})
            print(f"✅ Performance Analytics:")
            print(f"   Current Ability: {ability.get('current_ability', 0):.2f}")
            print(f"   Interpretation: {ability.get('ability_interpretation', 'N/A')}")
            
            metrics = analytics.get('learning_metrics', {})
            print(f"   Completion Rate: {metrics.get('completion_rate', 0):.1f}%")
            print(f"   Learning Velocity: {metrics.get('learning_velocity', 0):.2f}")
            
            return True
        else:
            print(f"❌ Failed to get performance analytics: {response.json()}")
            return False
    
    def run_all_tests(self):
        """Run all Phase 2 tests"""
        print("🚀 Starting Phase 2 Comprehensive Testing")
        print("=" * 50)
        
        if not self.authenticate():
            print("❌ Authentication failed, cannot proceed with tests")
            return
        
        tests = [
            self.test_adaptive_problem_selection,
            self.test_code_submission_storage,
            self.test_code_submission_history,
            self.test_skill_progress_tracking,
            self.test_skill_progress_retrieval,
            self.test_learning_analytics,
            self.test_recommendation_stats,
            self.test_learning_path_generation,
            self.test_performance_analytics
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with error: {e}")
        
        print("\n" + "=" * 50)
        print(f"🏁 Phase 2 Testing Complete: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All Phase 2 features are working correctly!")
        else:
            print(f"⚠️ {total - passed} test(s) failed. Please check the implementation.")

if __name__ == "__main__":
    tester = Phase2Tester()
    tester.run_all_tests()