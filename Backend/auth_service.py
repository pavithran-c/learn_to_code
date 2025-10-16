"""
Authentication Service for Learning Platform
Handles user registration, login, JWT tokens, and session management
"""

import os
import re
import bcrypt
import jwt  # This should be PyJWT
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from bson import ObjectId
from database_service import db_service
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AuthService:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-fallback-secret-key-change-in-production')
        self.algorithm = 'HS256'
        self.access_token_expire_minutes = 60  # 1 hour
        self.refresh_token_expire_days = 30    # 30 days
        
        print(f"🔐 JWT Secret Key loaded: {'✅' if self.secret_key != 'your-fallback-secret-key-change-in-production' else '⚠️ Using fallback key'}")

    def generate_token(self, user_id: str, email: str, token_type: str = 'access') -> str:
        """Generate JWT token"""
        try:
            now = datetime.now(timezone.utc)
            
            if token_type == 'access':
                expire_delta = timedelta(minutes=self.access_token_expire_minutes)
            else:  # refresh token
                expire_delta = timedelta(days=self.refresh_token_expire_days)
            
            expire = now + expire_delta
            
            payload = {
                'user_id': user_id,
                'email': email,
                'type': token_type,
                'iat': now,
                'exp': expire,
                'iss': 'adaptive-learning-platform',
                'aud': 'adaptive-learning-users'
            }
            
            print(f"🔐 Generating {token_type} token for user: {email}")
            print(f"🔐 Token expires at: {expire}")
            
            # Use PyJWT's encode method
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            
            # PyJWT returns string in newer versions, bytes in older versions
            if isinstance(token, bytes):
                token = token.decode('utf-8')
            
            print(f"✅ {token_type.capitalize()} token generated successfully")
            return token
            
        except Exception as e:
            print(f"❌ Token generation error: {e}")
            raise Exception(f"Failed to generate {token_type} token: {str(e)}")

    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            print(f"🔐 Verifying token...")
            
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                audience='adaptive-learning-users',
                issuer='adaptive-learning-platform'
            )
            
            print(f"✅ Token verified for user: {payload.get('email', 'unknown')}")
            return payload
            
        except jwt.ExpiredSignatureError:
            print("❌ Token expired")
            raise Exception("Token has expired")
        except jwt.InvalidTokenError as e:
            print(f"❌ Invalid token: {e}")
            raise Exception("Invalid token")
        except Exception as e:
            print(f"❌ Token verification error: {e}")
            raise Exception(f"Token verification failed: {str(e)}")

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        try:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        except Exception as e:
            print(f"❌ Password hashing error: {e}")
            raise Exception("Failed to hash password")

    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        try:
            if isinstance(hashed_password, str):
                hashed_password = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password)
        except Exception as e:
            print(f"❌ Password verification error: {e}")
            return False

    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def validate_password(self, password: str, strict: bool = True) -> tuple[bool, str]:
        """Validate password strength"""
        if not strict:
            # Basic validation for login
            if len(password) < 1:
                return False, "Password cannot be empty"
            return True, "Password is valid"
        
        # Strict validation for registration
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        return True, "Password is valid"

    def authenticate_user(self, email: str, password: str) -> dict:
        """Authenticate user login"""
        try:
            print(f"🔍 Attempting login for email: {email}")
            
            # Find user by email
            user = db_service.db.users.find_one({'email': email})
            if not user:
                print(f"❌ User not found: {email}")
                return {'success': False, 'error': 'Invalid email or password'}
            
            print(f"✅ User found: {email}")
            
            # Check if user is active
            if not user.get('is_active', True):
                print(f"❌ Account deactivated: {email}")
                return {'success': False, 'error': 'Account is deactivated'}
            
            # Verify password
            stored_hash = user.get('password_hash')
            if not stored_hash:
                print(f"❌ No password hash found for user: {email}")
                return {'success': False, 'error': 'Account setup incomplete'}
            
            print(f"🔐 Stored hash type: {type(stored_hash)}")
            print(f"🔐 Password input length: {len(password)}")
            
            password_match = self.verify_password(password, stored_hash)
            print(f"🔐 Password verification result: {password_match}")
            
            if not password_match:
                print(f"❌ Invalid password for: {email}")
                return {'success': False, 'error': 'Invalid email or password'}
            
            print(f"✅ Password verified for: {email}")
            
            user_id = str(user['_id'])
            
            # Update last login
            db_service.db.users.update_one(
                {'_id': user['_id']},
                {'$set': {'last_login': datetime.now(timezone.utc)}}
            )
            
            # Generate tokens
            access_token = self.generate_token(user_id, email, 'access')
            refresh_token = self.generate_token(user_id, email, 'refresh')
            
            # Store refresh token
            self._store_refresh_token(user_id, refresh_token)
            
            print(f"✅ Login successful for: {email}")
            
            return {
                'success': True,
                'user_id': user_id,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'expires_in': self.access_token_expire_minutes * 60,  # in seconds
                'user': {
                    'id': user_id,
                    'email': email,
                    'profile': user.get('profile', {}),
                    'skills': user.get('skills', {}),
                    'preferences': user.get('preferences', {}),
                    'adaptive_parameters': user.get('adaptive_parameters', {})
                }
            }
            
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': 'Login failed. Please try again.'}

    def _store_refresh_token(self, user_id: str, refresh_token: str):
        """Store refresh token in database"""
        try:
            db_service.db.refresh_tokens.insert_one({
                'user_id': user_id,
                'token': refresh_token,
                'created_at': datetime.now(timezone.utc),
                'expires_at': datetime.now(timezone.utc) + timedelta(days=self.refresh_token_expire_days),
                'is_active': True
            })
        except Exception as e:
            print(f"❌ Error storing refresh token: {e}")

    def register_user(self, email: str, password: str, profile_data: dict = None) -> dict:
        """Register a new user"""
        try:
            print(f"🔄 Registering user: {email}")
            
            # Validate email
            if not self.validate_email(email):
                return {'success': False, 'error': 'Invalid email format'}
            
            # Validate password with strict rules
            is_valid, message = self.validate_password(password, strict=True)
            if not is_valid:
                return {'success': False, 'error': message}
            
            # Check if user already exists
            existing_user = db_service.db.users.find_one({'email': email})
            if existing_user:
                return {'success': False, 'error': 'User already exists with this email'}
            
            # Hash password
            hashed_password = self.hash_password(password)
            print(f"🔐 Password hashed successfully")
            
            # Prepare user document
            user_doc = {
                'email': email,
                'password_hash': hashed_password,
                'profile': profile_data or {},
                'created_at': datetime.now(timezone.utc),
                'is_active': True,
                'is_verified': False,
                'last_login': None,
                'skills': {},
                'preferences': {
                    'theme': 'dark',
                    'language': 'python',
                    'difficulty_preference': 'adaptive'
                },
                'adaptive_parameters': {
                    'theta': 0.0,  # IRT ability parameter
                    'elo_rating': 1200,  # Elo rating
                    'skill_levels': {},
                    'learning_style': 'visual'
                }
            }
            
            # Insert user
            result = db_service.db.users.insert_one(user_doc)
            user_id = str(result.inserted_id)
            
            print(f"✅ User registered successfully: {email}")
            
            # Generate tokens
            access_token = self.generate_token(user_id, email, 'access')
            refresh_token = self.generate_token(user_id, email, 'refresh')
            
            # Store refresh token
            self._store_refresh_token(user_id, refresh_token)
            
            return {
                'success': True,
                'user_id': user_id,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'expires_in': self.access_token_expire_minutes * 60,
                'user': {
                    'id': user_id,
                    'email': email,
                    'profile': user_doc['profile'],
                    'skills': user_doc['skills'],
                    'preferences': user_doc['preferences'],
                    'adaptive_parameters': user_doc['adaptive_parameters']
                }
            }
            
        except Exception as e:
            print(f"❌ Registration error: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': 'Registration failed. Please try again.'}

# Create global auth service instance
auth_service = AuthService()

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            payload = auth_service.verify_token(token)
            request.current_user = payload
        except Exception as e:
            return jsonify({'error': str(e)}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function