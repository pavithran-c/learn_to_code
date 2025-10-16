import os
import sys
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_user_in_database():
    """Check if user exists in database and verify authentication setup"""
    
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            print("❌ MONGODB_URI not found in environment variables")
            return
        
        client = MongoClient(mongodb_uri)
        db = client[os.getenv('MONGODB_DATABASE', 'learn_to_code')]
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB successfully")
        
        # Check for the specific email
        email = "sujithg.22it@kongu.edu"
        print(f"\n🔍 Searching for user: {email}")
        
        user = db.users.find_one({'email': email})
        
        if user:
            print("✅ User found in database!")
            print(f"   User ID: {user['_id']}")
            print(f"   Email: {user['email']}")
            print(f"   Has password hash: {'Yes' if user.get('password_hash') else 'No'}")
            print(f"   Is active: {user.get('is_active', True)}")
            print(f"   Created: {user.get('created_at', 'Unknown')}")
            print(f"   Last login: {user.get('last_login', 'Never')}")
            
            # Check profile info
            profile = user.get('profile', {})
            if profile:
                print(f"   Name: {profile.get('first_name', '')} {profile.get('last_name', '')}")
                print(f"   University: {profile.get('university', 'Not set')}")
        else:
            print("❌ User not found in database!")
            print("\n💡 User needs to register first. Let's check if we can create the account...")
            
            # List existing users (first 5)
            print("\n📋 Existing users in database:")
            users = list(db.users.find({}, {'email': 1, 'created_at': 1}).limit(5))
            if users:
                for i, u in enumerate(users, 1):
                    print(f"   {i}. {u['email']} (created: {u.get('created_at', 'Unknown')})")
            else:
                print("   No users found in database")
        
        # Check database collections
        print(f"\n📊 Database collections:")
        collections = db.list_collection_names()
        for collection in collections:
            count = db[collection].count_documents({})
            print(f"   {collection}: {count} documents")
            
    except Exception as e:
        print(f"❌ Error checking database: {e}")

def create_test_user():
    """Create a test user for the specific email"""
    
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv('MONGODB_URI')
        client = MongoClient(mongodb_uri)
        db = client[os.getenv('MONGODB_DATABASE', 'learn_to_code')]
        
        email = "sujithg.22it@kongu.edu"
        password = "test123"  # You can change this
        
        # Check if user already exists
        if db.users.find_one({'email': email}):
            print(f"❌ User {email} already exists!")
            return
        
        # Hash password
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        # Create user document
        from datetime import datetime, timezone
        user_doc = {
            'email': email,
            'password_hash': password_hash,
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'profile': {
                'first_name': 'Sujith',
                'last_name': 'G',
                'university': 'Kongu Engineering College',
                'major': 'Information Technology',
                'experience_level': 'intermediate'
            }
        }
        
        # Insert user
        result = db.users.insert_one(user_doc)
        print(f"✅ Test user created successfully!")
        print(f"   User ID: {result.inserted_id}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   You can now try logging in with these credentials")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")

if __name__ == "__main__":
    print("🔍 Checking authentication setup...\n")
    
    # Check if user exists
    check_user_in_database()
    
    # Ask if user wants to create test account
    print(f"\n" + "="*50)
    response = input("Do you want to create a test user account? (y/n): ").lower()
    
    if response == 'y':
        create_test_user()
    else:
        print("💡 To create an account, use the registration form on the frontend or run this script again.")