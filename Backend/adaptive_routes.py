"""
API Routes for Enhanced Problem Selection and Analytics
Phase 2 Implementation
"""

from flask import Blueprint, request, jsonify
from functools import wraps
import traceback
from datetime import datetime, timezone

from auth_service import AuthService
from database_service import db_service
from problem_selector import ProblemSelector

# Create blueprint
adaptive_bp = Blueprint('adaptive', __name__, url_prefix='/api/adaptive')

# Initialize services
auth_service = AuthService()

def require_auth(f):
    """Decorator to require authentication for endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Authorization header required'}), 401
            
            token = auth_header.split(' ')[1]
            payload = auth_service.verify_token(token)
            
            if not payload:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            request.user_id = payload['user_id']
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f"Auth error: {e}")
            return jsonify({'error': 'Authentication failed'}), 401
    
    return decorated_function

def init_problem_selector(problems_data):
    """Initialize problem selector with loaded problems data"""
    global problem_selector
    problem_selector = ProblemSelector(db_service, problems_data)
    # Store reference in blueprint for access in routes
    adaptive_bp.problem_selector = problem_selector

@adaptive_bp.route('/problems/adaptive', methods=['GET'])
@require_auth
def get_adaptive_problems():
    """
    Get adaptively selected problems based on user performance
    """
    try:
        user_id = request.user_id
        count = int(request.args.get('count', 5))
        
        if not hasattr(adaptive_bp, 'problem_selector'):
            return jsonify({'error': 'Problem selector not initialized'}), 500
        
        # Get adaptive problems
        selected_problems = adaptive_bp.problem_selector.select_adaptive_problems(user_id, count)
        
        return jsonify({
            'success': True,
            'problems': selected_problems,
            'count': len(selected_problems),
            'selection_method': 'adaptive_irt'
        })
        
    except Exception as e:
        print(f"Error in get_adaptive_problems: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to get adaptive problems'}), 500

@adaptive_bp.route('/problems/learning-path/<skill>', methods=['GET'])
@require_auth
def get_learning_path(skill):
    """
    Get personalized learning path for a specific skill
    """
    try:
        user_id = request.user_id
        
        if not hasattr(adaptive_bp, 'problem_selector'):
            return jsonify({'error': 'Problem selector not initialized'}), 500
        
        # Generate learning path
        learning_path = adaptive_bp.problem_selector.get_learning_path(user_id, skill)
        
        return jsonify({
            'success': True,
            'skill': skill,
            'learning_path': learning_path,
            'total_problems': len(learning_path)
        })
        
    except Exception as e:
        print(f"Error in get_learning_path: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to generate learning path'}), 500

@adaptive_bp.route('/analytics/recommendations', methods=['GET'])
@require_auth
def get_recommendation_stats():
    """
    Get recommendation statistics and user analytics
    """
    try:
        user_id = request.user_id
        
        if not hasattr(adaptive_bp, 'problem_selector'):
            return jsonify({'error': 'Problem selector not initialized'}), 500
        
        # Get recommendation stats
        stats = adaptive_bp.problem_selector.get_recommendation_stats(user_id)
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        print(f"Error in get_recommendation_stats: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to get recommendation stats'}), 500

@adaptive_bp.route('/code-submissions', methods=['POST'])
@require_auth
def save_code_submission():
    """
    Save code submission with version history
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['problem_id', 'code', 'language']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Prepare submission data
        submission_data = {
            'user_id': user_id,
            'problem_id': data['problem_id'],
            'code': data['code'],
            'language': data['language'],
            'status': data.get('status', 'submitted'),
            'execution_result': data.get('execution_result'),
            'submission_type': data.get('submission_type', 'manual')
        }
        
        # Save submission
        submission_id = db_service.save_code_submission(submission_data)
        
        return jsonify({
            'success': True,
            'submission_id': submission_id,
            'version': submission_data.get('version', 1)
        })
        
    except Exception as e:
        print(f"Error in save_code_submission: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to save code submission'}), 500

@adaptive_bp.route('/code-submissions/history', methods=['GET'])
@require_auth
def get_code_submission_history():
    """
    Get code submission history for user
    """
    try:
        user_id = request.user_id
        problem_id = request.args.get('problem_id')
        limit = int(request.args.get('limit', 50))
        
        # Get submission history
        submissions = db_service.get_code_submission_history(user_id, problem_id, limit)
        
        return jsonify({
            'success': True,
            'submissions': submissions,
            'count': len(submissions)
        })
        
    except Exception as e:
        print(f"Error in get_code_submission_history: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to get submission history'}), 500

@adaptive_bp.route('/skills/progress', methods=['POST'])
@require_auth
def update_skill_progress():
    """
    Update skill-based progress tracking
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['skill_name', 'score']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Prepare skill data
        skill_data = {
            'skill_name': data['skill_name'],
            'problem_id': data.get('problem_id'),
            'score': float(data['score']),
            'time_spent': data.get('time_spent', 0),
            'difficulty': data.get('difficulty')
        }
        
        # Update skill progress
        db_service.update_skill_progress(user_id, skill_data)
        
        return jsonify({
            'success': True,
            'message': 'Skill progress updated successfully'
        })
        
    except Exception as e:
        print(f"Error in update_skill_progress: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to update skill progress'}), 500

@adaptive_bp.route('/skills/progress', methods=['GET'])
@require_auth
def get_skill_progress():
    """
    Get comprehensive skill progress for user
    """
    try:
        user_id = request.user_id
        
        # Get skill progress
        progress = db_service.get_skill_progress(user_id)
        
        return jsonify({
            'success': True,
            'progress': progress
        })
        
    except Exception as e:
        print(f"Error in get_skill_progress: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to get skill progress'}), 500

@adaptive_bp.route('/analytics/learning', methods=['GET'])
@require_auth
def get_learning_analytics():
    """
    Get comprehensive learning analytics
    """
    try:
        user_id = request.user_id
        days = int(request.args.get('days', 30))
        
        # Get learning analytics
        analytics = db_service.get_learning_analytics(user_id, days)
        
        return jsonify({
            'success': True,
            'analytics': analytics
        })
        
    except Exception as e:
        print(f"Error in get_learning_analytics: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to get learning analytics'}), 500

@adaptive_bp.route('/analytics/performance', methods=['GET'])
@require_auth
def get_performance_analytics():
    """
    Get detailed performance analytics with IRT metrics
    """
    try:
        user_id = request.user_id
        
        # Get recommendation stats (includes IRT ability estimation)
        recommendation_stats = adaptive_bp.problem_selector.get_recommendation_stats(user_id)
        
        # Get skill progress
        skill_progress = db_service.get_skill_progress(user_id)
        
        # Get recent learning analytics
        learning_analytics = db_service.get_learning_analytics(user_id, 30)
        
        # Combine all analytics
        performance_analytics = {
            'ability_estimation': {
                'current_ability': recommendation_stats.get('estimated_ability', 0),
                'ability_interpretation': interpret_ability_level(recommendation_stats.get('estimated_ability', 0))
            },
            'skill_mastery': recommendation_stats.get('skill_mastery', {}),
            'learning_metrics': {
                'completion_rate': recommendation_stats.get('completion_rate', 0),
                'learning_velocity': recommendation_stats.get('learning_velocity', 0),
                'total_solved': recommendation_stats.get('total_solved', 0)
            },
            'skill_analysis': skill_progress.get('analytics', {}),
            'recent_activity': learning_analytics
        }
        
        return jsonify({
            'success': True,
            'analytics': performance_analytics
        })
        
    except Exception as e:
        print(f"Error in get_performance_analytics: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to get performance analytics'}), 500

def interpret_ability_level(ability):
    """Interpret IRT ability level for human understanding"""
    if ability < -1.5:
        return "Beginner - Focus on fundamental concepts"
    elif ability < -0.5:
        return "Novice - Building basic problem-solving skills"
    elif ability < 0.5:
        return "Intermediate - Developing solid programming foundation"
    elif ability < 1.5:
        return "Advanced - Ready for challenging problems"
    else:
        return "Expert - Tackle the most difficult challenges"

# Error handlers
@adaptive_bp.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@adaptive_bp.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized'}), 401

@adaptive_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500