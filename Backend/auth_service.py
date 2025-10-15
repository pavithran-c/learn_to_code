"""
Authentication Service for Learning Platform
Handles user registration, login, JWT tokens, and session management
"""

import jwt
import bcrypt
import re
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from bson import ObjectId
from database_service import db_service
import os
from dotenv import load_dotenv

load_dotenv()

class AuthService:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
        self.algorithm = 'HS256'
        self.token_expiry_hours = 24
        self.refresh_token_expiry_days = 30
        
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def validate_password(self, password: str) -> tuple[bool, str]:
        """Validate password strength"""
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        return True, "Password is valid"
    
    def generate_token(self, user_id: str, email: str, token_type: str = 'access') -> str:
        """Generate JWT token"""
        expiry_time = datetime.now(timezone.utc) + (
            timedelta(hours=self.token_expiry_hours) if token_type == 'access' 
            else timedelta(days=self.refresh_token_expiry_days)
        )
        
        payload = {
            'user_id': user_id,
            'email': email,
            'type': token_type,
            'exp': expiry_time,
            'iat': datetime.now(timezone.utc)
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return {'valid': True, 'payload': payload}
        except jwt.ExpiredSignatureError:
            return {'valid': False, 'error': 'Token expired'}
        except jwt.InvalidTokenError:
            return {'valid': False, 'error': 'Invalid token'}
    
    def register_user(self, email: str, password: str, profile_data: dict = None) -> dict:
        """Register a new user"""
        try:
            # Validate email
            if not self.validate_email(email):
                return {'success': False, 'error': 'Invalid email format'}
            
            # Validate password
            is_valid, message = self.validate_password(password)
            if not is_valid:
                return {'success': False, 'error': message}
            
            # Check if user already exists
            existing_user = db_service.db.users.find_one({'email': email})
            if existing_user:
                return {'success': False, 'error': 'User already exists with this email'}
            
            # Hash password
            hashed_password = self.hash_password(password)
            
            # Create user document
            user_doc = {
                'email': email,
                'password_hash': hashed_password,
                'profile': profile_data or {},
                'skills': {
                    'programming_languages': [],
                    'concepts_mastered': [],
                    'skill_levels': {
                        'arrays': 0,
                        'strings': 0,
                        'loops': 0,
                        'recursion': 0,
                        'data_structures': 0,
                        'algorithms': 0,
                        'database': 0,
                        'operating_systems': 0,
                        'computer_networks': 0,
                        'software_engineering': 0
                    }
                },
                'preferences': {
                    'difficulty_preference': 'adaptive',
                    'learning_pace': 'medium',
                    'preferred_languages': ['python'],
                    'notification_settings': {
                        'email_notifications': True,
                        'achievement_alerts': True,
                        'daily_reminders': False
                    }
                },
                'adaptive_parameters': {
                    'theta': 0.0,  # Initial skill level (IRT parameter)
                    'learning_rate': 1.0,
                    'performance_history': [],
                    'difficulty_preference': 0.0
                },
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc),
                'last_login': None,
                'is_active': True,
                'email_verified': False
            }
            
            # Insert user
            result = db_service.db.users.insert_one(user_doc)
            user_id = str(result.inserted_id)
            
            # Initialize user progress document
            self._initialize_user_progress(user_id, email)
            
            # Generate tokens
            access_token = self.generate_token(user_id, email, 'access')
            refresh_token = self.generate_token(user_id, email, 'refresh')
            
            # Store refresh token in database
            self._store_refresh_token(user_id, refresh_token)
            
            return {
                'success': True,
                'user_id': user_id,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': user_id,
                    'email': email,
                    'profile': user_doc['profile'],
                    'skills': user_doc['skills'],
                    'preferences': user_doc['preferences']
                }
            }
            
        except Exception as e:
            print(f"Registration error: {e}")
            return {'success': False, 'error': 'Registration failed. Please try again.'}
    
    def authenticate_user(self, email: str, password: str) -> dict:
        """Authenticate user login"""
        try:
            # Find user by email
            user = db_service.db.users.find_one({'email': email})
            if not user:
                return {'success': False, 'error': 'Invalid email or password'}
            
            # Check if user is active
            if not user.get('is_active', True):
                return {'success': False, 'error': 'Account is deactivated'}
            
            # Verify password
            if not self.verify_password(password, user['password_hash']):
                return {'success': False, 'error': 'Invalid email or password'}
            
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
            
            return {
                'success': True,
                'user_id': user_id,
                'access_token': access_token,
                'refresh_token': refresh_token,
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
            print(f"Authentication error: {e}")
            return {'success': False, 'error': 'Login failed. Please try again.'}
    
    def refresh_access_token(self, refresh_token: str) -> dict:
        """Refresh access token using refresh token"""
        try:
            # Verify refresh token
            token_data = self.verify_token(refresh_token)
            if not token_data['valid']:
                return {'success': False, 'error': token_data['error']}
            
            payload = token_data['payload']
            if payload['type'] != 'refresh':
                return {'success': False, 'error': 'Invalid token type'}
            
            # Check if refresh token exists in database
            stored_token = db_service.db.refresh_tokens.find_one({
                'user_id': payload['user_id'],
                'token': refresh_token,
                'is_active': True
            })
            
            if not stored_token:
                return {'success': False, 'error': 'Invalid refresh token'}
            
            # Generate new access token
            new_access_token = self.generate_token(
                payload['user_id'], 
                payload['email'], 
                'access'
            )
            
            return {
                'success': True,
                'access_token': new_access_token
            }
            
        except Exception as e:
            print(f"Token refresh error: {e}")
            return {'success': False, 'error': 'Token refresh failed'}
    
    def logout_user(self, user_id: str, refresh_token: str = None) -> dict:
        """Logout user and invalidate tokens"""
        try:
            # Invalidate all refresh tokens for user
            db_service.db.refresh_tokens.update_many(
                {'user_id': user_id},
                {'$set': {'is_active': False, 'revoked_at': datetime.now(timezone.utc)}}
            )
            
            return {'success': True, 'message': 'Logged out successfully'}
            
        except Exception as e:
            print(f"Logout error: {e}")
            return {'success': False, 'error': 'Logout failed'}
    
    def get_user_profile(self, user_id: str) -> dict:
        """Get user profile information"""
        try:
            user = db_service.db.users.find_one(
                {'_id': ObjectId(user_id)},
                {'password_hash': 0}  # Exclude password hash
            )
            
            if not user:
                return {'success': False, 'error': 'User not found'}
            
            # Convert ObjectId to string
            user['id'] = str(user['_id'])
            del user['_id']
            
            return {'success': True, 'user': user}
            
        except Exception as e:
            print(f"Get profile error: {e}")
            return {'success': False, 'error': 'Failed to get user profile'}
    
    def update_user_profile(self, user_id: str, profile_data: dict) -> dict:
        """Update user profile information"""
        try:
            # Validate update data
            allowed_fields = ['profile', 'preferences']
            update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
            update_data['updated_at'] = datetime.now(timezone.utc)
            
            # Update user
            result = db_service.db.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return {'success': False, 'error': 'User not found'}
            
            return {'success': True, 'message': 'Profile updated successfully'}
            
        except Exception as e:
            print(f"Update profile error: {e}")
            return {'success': False, 'error': 'Failed to update profile'}
    
    def update_user_skills(self, user_id: str, skill_updates: dict) -> dict:
        """Update user skill levels and learning progress"""
        try:
            update_data = {
                'updated_at': datetime.now(timezone.utc)
            }
            
            # Update skill levels
            if 'skill_levels' in skill_updates:
                for skill, level in skill_updates['skill_levels'].items():
                    update_data[f'skills.skill_levels.{skill}'] = level
            
            # Update adaptive parameters
            if 'adaptive_parameters' in skill_updates:
                for param, value in skill_updates['adaptive_parameters'].items():
                    update_data[f'adaptive_parameters.{param}'] = value
            
            # Update concepts mastered
            if 'concepts_mastered' in skill_updates:
                update_data['skills.concepts_mastered'] = skill_updates['concepts_mastered']
            
            result = db_service.db.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return {'success': False, 'error': 'User not found'}
            
            return {'success': True, 'message': 'Skills updated successfully'}
            
        except Exception as e:
            print(f"Update skills error: {e}")
            return {'success': False, 'error': 'Failed to update skills'}
    
    def _store_refresh_token(self, user_id: str, refresh_token: str):
        """Store refresh token in database"""
        token_doc = {
            'user_id': user_id,
            'token': refresh_token,
            'created_at': datetime.now(timezone.utc),
            'expires_at': datetime.now(timezone.utc) + timedelta(days=self.refresh_token_expiry_days),
            'is_active': True
        }
        db_service.db.refresh_tokens.insert_one(token_doc)
    
    def _initialize_user_progress(self, user_id: str, email: str):
        """Initialize user progress document"""
        progress_doc = {
            'user_id': user_id,
            'email': email,
            'total_attempts': 0,
            'solved_problems': [],
            'attempted_problems': [],
            'skill_progress': {
                'arrays': {'level': 0, 'problems_solved': 0, 'total_attempts': 0},
                'strings': {'level': 0, 'problems_solved': 0, 'total_attempts': 0},
                'loops': {'level': 0, 'problems_solved': 0, 'total_attempts': 0},
                'recursion': {'level': 0, 'problems_solved': 0, 'total_attempts': 0},
                'data_structures': {'level': 0, 'problems_solved': 0, 'total_attempts': 0},
                'algorithms': {'level': 0, 'problems_solved': 0, 'total_attempts': 0}
            },
            'learning_metrics': {
                'average_score': 0.0,
                'learning_velocity': 0.0,
                'consistency_score': 0.0,
                'problem_solving_efficiency': 0.0
            },
            'achievements': [],
            'learning_streak': {
                'current': 0,
                'longest': 0,
                'last_activity': None
            },
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        db_service.db.user_progress.insert_one(progress_doc)

# Authentication decorator
def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid authorization header format'}), 401
        
        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401
        
        # Verify token
        auth_service = AuthService()
        token_data = auth_service.verify_token(token)
        
        if not token_data['valid']:
            return jsonify({'error': token_data['error']}), 401
        
        # Add user info to request context
        request.current_user = token_data['payload']
        
        return f(*args, **kwargs)
    
    return decorated_function

# Create singleton instance
auth_service = AuthService()