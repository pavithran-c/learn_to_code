import os
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone

# Load environment variables
load_dotenv()

def debug_authentication():
    """Debug authentication by checking the database directly"""
    
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv('MONGODB_URI')
        mongodb_database = os.getenv('MONGODB_DATABASE', 'learn_to_code')
        
        print(f"🔗 MongoDB URI: {mongodb_uri[:50]}..." if mongodb_uri else "❌ No MongoDB URI")
        print(f"🔗 Database: {mongodb_database}")
        
        if not mongodb_uri:
            print("❌ MONGODB_URI not found in environment variables")
            return
        
        client = MongoClient(mongodb_uri)
        db = client[mongodb_database]
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB successfully")
        
        # Look for the specific user
        email = "sujithg.22it@kongu.edu"
        print(f"\n🔍 Looking for user: {email}")
        
        user = db.users.find_one({'email': email})
        
        if user:
            print("✅ User found!")
            print(f"   User ID: {user['_id']}")
            print(f"   Email: {user['email']}")
            print(f"   Has password_hash: {'Yes' if user.get('password_hash') else 'No'}")
            print(f"   Password hash type: {type(user.get('password_hash'))}")
            print(f"   Password hash length: {len(user.get('password_hash', ''))}")
            print(f"   Is active: {user.get('is_active', True)}")
            print(f"   Created: {user.get('created_at', 'Unknown')}")
            
            # Test password verification manually
            stored_hash = user.get('password_hash')
            test_password = "test123"
            
            print(f"\n🔐 Testing password verification:")
            print(f"   Password to test: '{test_password}'")
            print(f"   Stored hash: {stored_hash[:50]}..." if stored_hash else "None")
            
            if stored_hash:
                try:
                    # Convert to bytes if it's a string
                    if isinstance(stored_hash, str):
                        stored_hash_bytes = stored_hash.encode('utf-8')
                    else:
                        stored_hash_bytes = stored_hash
                    
                    # Test password verification
                    is_valid = bcrypt.checkpw(test_password.encode('utf-8'), stored_hash_bytes)
                    print(f"   Password verification result: {is_valid}")
                    
                    if not is_valid:
                        print("❌ Password verification failed!")
                        print("💡 Let's reset the password...")
                        
                        # Generate new password hash
                        salt = bcrypt.gensalt()
                        new_hash = bcrypt.hashpw(test_password.encode('utf-8'), salt).decode('utf-8')
                        
                        # Update the user's password
                        result = db.users.update_one(
                            {'_id': user['_id']},
                            {'$set': {'password_hash': new_hash, 'updated_at': datetime.now(timezone.utc)}}
                        )
                        
                        if result.modified_count > 0:
                            print("✅ Password reset successfully!")
                            print(f"   New password: {test_password}")
                            
                            # Verify the new password works
                            new_is_valid = bcrypt.checkpw(test_password.encode('utf-8'), new_hash.encode('utf-8'))
                            print(f"   New password verification: {new_is_valid}")
                        else:
                            print("❌ Failed to reset password")
                    else:
                        print("✅ Password verification successful! The issue might be elsewhere.")
                        
                except Exception as e:
                    print(f"❌ Error during password verification: {e}")
                    print("💡 Let's create a fresh password hash...")
                    
                    # Generate new password hash
                    salt = bcrypt.gensalt()
                    new_hash = bcrypt.hashpw(test_password.encode('utf-8'), salt).decode('utf-8')
                    
                    # Update the user's password
                    result = db.users.update_one(
                        {'_id': user['_id']},
                        {'$set': {'password_hash': new_hash, 'updated_at': datetime.now(timezone.utc)}}
                    )
                    
                    if result.modified_count > 0:
                        print("✅ Fresh password hash created!")
                        print(f"   Password: {test_password}")
            else:
                print("❌ No password hash found!")
                
        else:
            print("❌ User not found!")
            print("💡 Creating the user account...")
            
            # Create user with proper password hash
            salt = bcrypt.gensalt()
            password_hash = bcrypt.hashpw("test123".encode('utf-8'), salt).decode('utf-8')
            
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
            
            result = db.users.insert_one(user_doc)
            print(f"✅ User created with ID: {result.inserted_id}")
            print(f"   Email: {email}")
            print(f"   Password: test123")
        
        # Check all users in database
        print(f"\n📊 Total users in database: {db.users.count_documents({})}")
        
        # List first 5 users
        users = list(db.users.find({}, {'email': 1, 'created_at': 1, 'is_active': 1}).limit(5))
        print("📋 Users in database:")
        for i, u in enumerate(users, 1):
            print(f"   {i}. {u['email']} (active: {u.get('is_active', True)})")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    debug_authentication()