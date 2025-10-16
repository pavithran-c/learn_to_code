"""
Authentication Routes for Learning Platform
Handles user registration, login, logout, and profile management
"""

from flask import Blueprint, request, jsonify
from auth_service import auth_service, require_auth
from database_service import db_service
import re

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract required fields
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        profile_data = data.get('profile', {})
        
        # Validate required fields
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Process profile data
        processed_profile = {
            'first_name': profile_data.get('first_name', '').strip(),
            'last_name': profile_data.get('last_name', '').strip(),
            'university': profile_data.get('university', '').strip(),
            'major': profile_data.get('major', '').strip(),
            'graduation_year': profile_data.get('graduation_year'),
            'experience_level': profile_data.get('experience_level', 'beginner'),
            'learning_goals': profile_data.get('learning_goals', []),
            'bio': profile_data.get('bio', '').strip()
        }
        
        # Register user
        result = auth_service.register_user(email, password, processed_profile)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'User registered successfully',
                'user': result['user'],
                'access_token': result['access_token'],
                'refresh_token': result['refresh_token']
            }), 201
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        print(f"Registration endpoint error: {e}")
        return jsonify({'error': 'Registration failed. Please try again.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user login"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Authenticate user
        result = auth_service.authenticate_user(email, password)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': result['user'],
                'access_token': result['access_token'],
                'refresh_token': result['refresh_token']
            }), 200
        else:
            return jsonify({'error': result['error']}), 401
            
    except Exception as e:
        print(f"Login endpoint error: {e}")
        return jsonify({'error': 'Login failed. Please try again.'}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token"""
    try:
        data = request.get_json()
        
        if not data or 'refresh_token' not in data:
            return jsonify({'error': 'Refresh token is required'}), 400
        
        refresh_token = data['refresh_token']
        
        # Refresh access token
        result = auth_service.refresh_access_token(refresh_token)
        
        if result['success']:
            return jsonify({
                'success': True,
                'access_token': result['access_token']
            }), 200
        else:
            return jsonify({'error': result['error']}), 401
            
    except Exception as e:
        print(f"Token refresh endpoint error: {e}")
        return jsonify({'error': 'Token refresh failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    """Logout user"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json() or {}
        refresh_token = data.get('refresh_token')
        
        result = auth_service.logout_user(user_id, refresh_token)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message']
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        print(f"Logout endpoint error: {e}")
        return jsonify({'error': 'Logout failed'}), 500

@auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get user profile"""
    try:
        user_id = request.current_user['user_id']
        
        result = auth_service.get_user_profile(user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'user': result['user']
            }), 200
        else:
            return jsonify({'error': result['error']}), 404
            
    except Exception as e:
        print(f"Get profile endpoint error: {e}")
        return jsonify({'error': 'Failed to get profile'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    """Update user profile"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = auth_service.update_user_profile(user_id, data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message']
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        print(f"Update profile endpoint error: {e}")
        return jsonify({'error': 'Failed to update profile'}), 500

@auth_bp.route('/profile/skills', methods=['PUT'])
@require_auth
def update_skills():
    """Update user skills and learning progress"""
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = auth_service.update_user_skills(user_id, data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message']
            }), 200
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        print(f"Update skills endpoint error: {e}")
        return jsonify({'error': 'Failed to update skills'}), 500

@auth_bp.route('/analytics', methods=['GET'])
@require_auth
def get_user_analytics():
    """Get user learning analytics"""
    try:
        user_id = request.current_user['user_id']
        days = request.args.get('days', 30, type=int)
        
        # Get learning analytics
        analytics = db_service.get_learning_analytics(user_id, days)
        
        if analytics is not None:
            return jsonify({
                'success': True,
                'analytics': analytics
            }), 200
        else:
            return jsonify({'error': 'Failed to get analytics'}), 500
            
    except Exception as e:
        print(f"Get analytics endpoint error: {e}")
        return jsonify({'error': 'Failed to get analytics'}), 500

@auth_bp.route('/test-auth', methods=['GET'])
@require_auth
def test_auth():
    """Test endpoint to verify authentication is working"""
    try:
        user_id = request.current_user['user_id']
        user_data = request.current_user
        
        return jsonify({
            'success': True,
            'message': 'Authentication working',
            'user_id': user_id,
            'user_data': user_data
        }), 200
        
    except Exception as e:
        print(f"Test auth error: {e}")
        return jsonify({'error': f'Authentication test failed: {str(e)}'}), 500

@auth_bp.route('/dashboard-analytics', methods=['GET'])
@require_auth
def get_dashboard_analytics():
    """Get comprehensive dashboard analytics combining quiz and problem data"""
    try:
        user_id = request.current_user['user_id']
        days = request.args.get('days', 30, type=int)
        
        print(f"📊 Dashboard analytics requested for user: {user_id}")
        
        # Get comprehensive analytics data with error handling
        analytics = None
        submissions = None
        progress = None
        skill_analysis = None
        
        try:
            analytics = db_service.get_learning_analytics(user_id, days)
            print(f"✅ Analytics loaded: {bool(analytics)}")
        except Exception as e:
            print(f"❌ Analytics error: {e}")
            analytics = {}
        
        try:
            submissions = db_service.get_user_code_submissions(user_id, None, 100)
            print(f"✅ Submissions loaded: {len(submissions) if submissions else 0}")
        except Exception as e:
            print(f"❌ Submissions error: {e}")
            submissions = []
        
        try:
            progress = db_service.get_user_progress(user_id)
            print(f"✅ Progress loaded: {bool(progress)}")
        except Exception as e:
            print(f"❌ Progress error: {e}")
            progress = {}
        
        try:
            skill_analysis = db_service.get_user_skill_analysis(user_id)
            print(f"✅ Skill analysis loaded: {bool(skill_analysis)}")
        except Exception as e:
            print(f"❌ Skill analysis error: {e}")
            skill_analysis = {}
        
        # Process and combine data safely
        dashboard_data = {
            'userStats': {
                'totalQuizzes': analytics.get('total_attempts', 0) if analytics else 0,
                'problemsSolved': len([s for s in submissions if s.get('status') == 'accepted']) if submissions else 0,
                'currentStreak': analytics.get('current_streak', 0) if analytics else 0,
                'totalScore': int(analytics.get('average_score', 0) * analytics.get('total_attempts', 0)) if analytics else 0,
                'averageAccuracy': int(analytics.get('success_rate', 0)) if analytics else 0,
                'studyHours': int((len(submissions) * 15) / 60) if submissions else 0  # Estimate 15 min per problem
            },
            'analytics': analytics or {},
            'submissions': submissions or [],
            'progress': progress or {},
            'skillAnalysis': skill_analysis or {}
        }
        
        print(f"📊 Dashboard data prepared successfully")
        
        return jsonify({
            'success': True,
            'data': dashboard_data
        }), 200
        
    except Exception as e:
        print(f"❌ Get dashboard analytics endpoint error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to get dashboard analytics: {str(e)}'}), 500

@auth_bp.route('/progress', methods=['GET'])
@require_auth
def get_user_progress():
    """Get user progress data"""
    try:
        user_id = request.current_user['user_id']
        
        progress = db_service.get_user_progress(user_id)
        
        return jsonify({
            'success': True,
            'progress': progress or {}
        }), 200
        
    except Exception as e:
        print(f"Get progress endpoint error: {e}")
        return jsonify({'error': 'Failed to get progress'}), 500

@auth_bp.route('/skill-analysis', methods=['GET'])
@require_auth
def get_skill_analysis():
    """Get detailed skill analysis for user"""
    try:
        user_id = request.current_user['user_id']
        
        # Get skill analysis
        analysis = db_service.get_user_skill_analysis(user_id)
        
        if analysis is not None:
            return jsonify({
                'success': True,
                'analysis': analysis
            }), 200
        else:
            return jsonify({'error': 'Failed to get skill analysis'}), 500
            
    except Exception as e:
        print(f"Get skill analysis endpoint error: {e}")
        return jsonify({'error': 'Failed to get skill analysis'}), 500

@auth_bp.route('/submissions', methods=['GET'])
@require_auth
def get_code_submissions():
    """Get user's code submission history"""
    try:
        user_id = request.current_user['user_id']
        problem_id = request.args.get('problem_id')
        limit = request.args.get('limit', 50, type=int)
        
        submissions = db_service.get_user_code_submissions(user_id, problem_id, limit)
        
        return jsonify({
            'success': True,
            'submissions': submissions
        }), 200
        
    except Exception as e:
        print(f"Get submissions endpoint error: {e}")
        return jsonify({'error': 'Failed to get submissions'}), 500

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify if a token is valid"""
    try:
        data = request.get_json()
        
        if not data or 'token' not in data:
            return jsonify({'error': 'Token is required'}), 400
        
        token = data['token']
        result = auth_service.verify_token(token)
        
        return jsonify({
            'valid': result['valid'],
            'payload': result.get('payload'),
            'error': result.get('error')
        }), 200
        
    except Exception as e:
        print(f"Token verification error: {e}")
        return jsonify({'error': 'Token verification failed'}), 500

# Error handlers for the blueprint
@auth_bp.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@auth_bp.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized'}), 401

@auth_bp.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden'}), 403

@auth_bp.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@auth_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500