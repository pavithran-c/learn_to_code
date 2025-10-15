#!/usr/bin/env python3
"""
Setup script for Phase 1 Authentication System
Initializes database collections and creates sample data
"""

import os
import sys
from datetime import datetime, timezone
from dotenv import load_dotenv

# Add Backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database_service import db_service
from auth_service import auth_service

def setup_authentication():
    """Setup authentication system"""
    print("🚀 Setting up Authentication System...")
    
    try:
        # Test database connection
        print("✅ Testing database connection...")
        db_service.client.admin.command('ping')
        print("✅ Database connection successful!")
        
        # Create indexes
        print("📊 Creating database indexes...")
        db_service.create_indexes()
        print("✅ Database indexes created!")
        
        # Test user registration
        print("👤 Testing user registration...")
        test_user = {
            'email': 'test@example.com',
            'password': 'TestPassword123',
            'profile': {
                'first_name': 'Test',
                'last_name': 'User',
                'university': 'Test University',
                'major': 'Computer Science',
                'experience_level': 'intermediate',
                'learning_goals': ['algorithms', 'data_structures']
            }
        }
        
        # Check if test user already exists
        existing_user = db_service.db.users.find_one({'email': test_user['email']})
        if existing_user:
            print("⚠️  Test user already exists, skipping registration test")
        else:
            result = auth_service.register_user(
                test_user['email'],
                test_user['password'],
                test_user['profile']
            )
            
            if result['success']:
                print("✅ Test user registration successful!")
                print(f"   User ID: {result['user_id']}")
                print(f"   Email: {result['user']['email']}")
            else:
                print(f"❌ Test user registration failed: {result['error']}")
        
        # Display collection status
        print("\n📈 Collection Status:")
        collections = ['users', 'user_progress', 'evaluations', 'code_submissions', 'skill_progress', 'refresh_tokens']
        
        for collection in collections:
            count = db_service.db[collection].count_documents({})
            print(f"   {collection}: {count} documents")
        
        print("\n🎉 Authentication System Setup Complete!")
        print("\n🔧 Next Steps:")
        print("1. Copy .env.example to .env and configure your settings")
        print("2. Install requirements: pip install -r requirements.txt")
        print("3. Start the Flask app: python app.py")
        print("4. Test the authentication endpoints")
        
        return True
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        return False

def create_sample_data():
    """Create sample skill progress and evaluation data"""
    print("\n📝 Creating sample data...")
    
    try:
        # Find test user
        test_user = db_service.db.users.find_one({'email': 'test@example.com'})
        if not test_user:
            print("⚠️  Test user not found, skipping sample data creation")
            return
        
        user_id = str(test_user['_id'])
        
        # Create sample skill progress
        sample_skills = {
            'arrays': {'solved': True, 'score': 85},
            'strings': {'solved': True, 'score': 92},
            'loops': {'solved': False, 'score': 45},
            'recursion': {'solved': False, 'score': 30}
        }
        
        for skill_name, data in sample_skills.items():
            db_service.update_user_skill_progress(user_id, skill_name, data)
        
        # Create sample evaluations
        sample_evaluations = [
            {
                'user_id': user_id,
                'problem_id': '1',
                'scores': {'overall': 85, 'correctness': 90, 'efficiency': 80},
                'all_passed': True,
                'difficulty': 'easy',
                'concepts': ['arrays'],
                'timestamp': datetime.now(timezone.utc)
            },
            {
                'user_id': user_id,
                'problem_id': '2',
                'scores': {'overall': 92, 'correctness': 95, 'efficiency': 88},
                'all_passed': True,
                'difficulty': 'medium',
                'concepts': ['strings'],
                'timestamp': datetime.now(timezone.utc)
            }
        ]
        
        for evaluation in sample_evaluations:
            db_service.db.evaluations.insert_one(evaluation)
        
        print("✅ Sample data created successfully!")
        
    except Exception as e:
        print(f"❌ Sample data creation failed: {e}")

def display_api_endpoints():
    """Display available API endpoints"""
    print("\n🌐 Available Authentication Endpoints:")
    print("POST /api/auth/register      - Register new user")
    print("POST /api/auth/login         - User login")
    print("POST /api/auth/refresh       - Refresh access token")
    print("POST /api/auth/logout        - User logout")
    print("GET  /api/auth/profile       - Get user profile")
    print("PUT  /api/auth/profile       - Update user profile")
    print("PUT  /api/auth/profile/skills - Update user skills")
    print("GET  /api/auth/analytics     - Get user analytics")
    print("GET  /api/auth/skill-analysis - Get skill analysis")
    print("GET  /api/auth/submissions   - Get code submissions")
    print("POST /api/auth/verify-token  - Verify token validity")
    
    print("\n🔒 Protected Endpoints (require authentication):")
    print("POST /api/submit_code        - Submit code solution")
    print("... (other existing endpoints)")
    
    print("\n📝 Example Registration Request:")
    print("""
curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "university": "MIT",
      "major": "Computer Science",
      "experience_level": "intermediate"
    }
  }'
    """)
    
    print("\n📝 Example Login Request:")
    print("""
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
    """)

if __name__ == "__main__":
    load_dotenv()
    
    print("🎯 Phase 1: Authentication & User Management Setup")
    print("=" * 50)
    
    success = setup_authentication()
    
    if success:
        # Ask if user wants to create sample data
        response = input("\n🤔 Create sample data for testing? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            create_sample_data()
        
        # Display API endpoints
        display_api_endpoints()
    
    print("\n" + "=" * 50)
    print("Setup complete! Check the output above for any errors.")