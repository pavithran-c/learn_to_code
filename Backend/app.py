import json
import ast
from flask import Flask, request, jsonify
from Python_Compiler.python_executor import execute_python_code
from Java_Compiler.java_executor import execute_java_code
from flask_cors import CORS
import requests
import time
from adaptive_engine import AdaptiveLearningEngine, AttemptRecord
from deep_evaluator import DeepCodeEvaluator
from database_service import db_service
from quiz_evaluation_service import QuizEvaluationService, QuizAttempt, QuizSessionEvaluation
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Initialize adaptive learning engine, deep evaluator, and quiz evaluator
adaptive_engine = AdaptiveLearningEngine()
deep_evaluator = DeepCodeEvaluator()
quiz_evaluator = QuizEvaluationService(adaptive_engine, db_service)

# Load/save state files
ADAPTIVE_STATE_FILE = 'adaptive_state.json'
if os.path.exists(ADAPTIVE_STATE_FILE):
    adaptive_engine.load_state(ADAPTIVE_STATE_FILE)

# Load problems from coding_questions folder
def load_problems_from_coding_questions():
    """Load and combine problems from easy.json and medium.json"""
    problems = []
    
    try:
        # Load easy questions
        easy_path = os.path.join('..', 'coding_questions', 'easy.json')
        if os.path.exists(easy_path):
            with open(easy_path, 'r', encoding='utf-8') as f:
                easy_questions = json.load(f)
                problems.extend(easy_questions)
                print(f"Loaded {len(easy_questions)} easy questions")
        
        # Load medium questions
        medium_path = os.path.join('..', 'coding_questions', 'medium.json')
        if os.path.exists(medium_path):
            with open(medium_path, 'r', encoding='utf-8') as f:
                medium_questions = json.load(f)
                problems.extend(medium_questions)
                print(f"Loaded {len(medium_questions)} medium questions")
        
        # Ensure each problem has required fields
        for i, problem in enumerate(problems):
            # Keep original ID if it exists, otherwise assign sequential integer
            if 'id' not in problem or problem['id'] is None:
                problem['id'] = i + 1
            
            # Map statement_markdown to description if needed
            if 'description' not in problem and 'statement_markdown' in problem:
                problem['description'] = problem['statement_markdown']
            
            # Ensure concepts exist
            if 'concepts' not in problem:
                problem['concepts'] = problem.get('topics', [])
            
            # Ensure required fields exist
            if 'difficulty' not in problem:
                problem['difficulty'] = 'medium'  # Default difficulty
            if 'test_cases' not in problem:
                problem['test_cases'] = []
            if 'starter_code' not in problem:
                problem['starter_code'] = {'python': '# Write your solution here', 'java': '// Write your solution here'}
        
        print(f"Total problems loaded: {len(problems)}")
        return problems
        
    except Exception as e:
        print(f"Error loading problems: {e}")
        return []

problems = load_problems_from_coding_questions()

# Enhanced problem metadata for adaptive learning
enhanced_problems = {}
for problem in problems:
    problem_id = str(problem['id'])
    concepts = []
    
    # Infer concepts from problem content
    title_lower = problem['title'].lower()
    desc_lower = problem['description'].lower()
    
    if any(word in title_lower or word in desc_lower for word in ['array', 'list']):
        concepts.append('arrays')
    if any(word in title_lower or word in desc_lower for word in ['loop', 'iterate']):
        concepts.append('loops')
    if any(word in title_lower or word in desc_lower for word in ['string', 'text']):
        concepts.append('strings')
    if any(word in title_lower or word in desc_lower for word in ['recursive', 'fibonacci']):
        concepts.append('recursion')
    if any(word in title_lower or word in desc_lower for word in ['sort', 'search', 'maximum', 'minimum']):
        concepts.append('algorithms')
    if any(word in title_lower or word in desc_lower for word in ['palindrome', 'reverse']):
        concepts.append('string_manipulation')
    
    # Create or update item in adaptive engine
    adaptive_engine.get_or_create_item(problem_id, concepts)
    
    # Store enhanced metadata
    enhanced_problems[problem_id] = {
        'concepts': concepts,
        'estimated_difficulty': {'easy': -1.0, 'medium': 0.0, 'hard': 1.0}.get(problem.get('difficulty', 'medium'), 0.0),
        'expected_time_ms': {'easy': 30000, 'medium': 60000, 'hard': 120000}.get(problem.get('difficulty', 'medium'), 60000)
    }

# Helper to get problems by difficulty
def get_problems_by_difficulty(level):
    return [p for p in problems if p['difficulty'] == level]

@app.route('/api/problems', methods=['GET'])
def list_problems():
    difficulty = request.args.get('difficulty')
    if difficulty:
        filtered = get_problems_by_difficulty(difficulty)
        return jsonify(filtered)
    return jsonify(problems)

@app.route('/api/problem/<pid>', methods=['GET'])
def get_problem(pid):
    # Handle both string and integer IDs
    for p in problems:
        # Check if ID matches as string or as integer
        if str(p['id']) == str(pid) or p['id'] == pid:
            return jsonify(p)
    return jsonify({'error': f'Problem {pid} not found'}), 404

@app.route('/api/submit_code', methods=['POST'])
def submit_code():
    data = request.get_json()
    pid = data.get('problem_id')
    code = data.get('code')
    lang = data.get('language', 'python')
    user_id = data.get('user_id', 'guest')
    
    # Find problem - handle both string and integer IDs
    problem = next((p for p in problems if str(p['id']) == str(pid) or p['id'] == pid), None)
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    
    # Get starter code for the specific language
    starter_code = problem['starter_code']
    if isinstance(starter_code, dict):
        starter_code = starter_code.get(lang, '')
    
    # Use deep evaluator for comprehensive analysis
    try:
        start_time = time.time()
        
        # Convert test cases to the format expected by deep evaluator
        test_cases_formatted = []
        for tc in problem['test_cases']:
            test_cases_formatted.append({
                'input': tc['input'],
                'output': tc['output'],
                'type': tc.get('type', 'public')
            })
        
        # Get problem configuration
        problem_config = enhanced_problems.get(str(pid), {})
        problem_config.update({
            'time_limit_ms': problem_config.get('expected_time_ms', 5000),
            'memory_limit_mb': 128,
            'expected_complexity': 'O(n)' if problem.get('difficulty') == 'easy' else 'O(n log n)'
        })
        
        # Perform deep evaluation
        evaluation_result = deep_evaluator.evaluate_submission(
            problem_id=str(pid),
            user_id=user_id,
            code=code,
            language=lang,
            test_cases=test_cases_formatted,
            problem_config=problem_config
        )
        
        # Process attempt for adaptive learning
        binary_score = 1 if evaluation_result.correctness_score >= 70 else 0
        partial_score = evaluation_result.overall_score / 100.0
        
        attempt = AttemptRecord(
            user_id=user_id,
            item_id=str(pid),
            score=partial_score,
            binary_score=binary_score,
            time_taken=int((time.time() - start_time) * 1000),
            timestamp=datetime.now().isoformat(),
            hints_used=0,  # Could be tracked from frontend
            code_quality_signals={
                'cyclomatic_complexity': evaluation_result.quality_metrics.cyclomatic_complexity,
                'lines_of_code': evaluation_result.quality_metrics.lines_of_code,
                'style_violations': len(evaluation_result.quality_metrics.style_violations),
                'security_issues': len(evaluation_result.quality_metrics.security_issues)
            }
        )
        
        # Update adaptive learning models
        adaptive_result = adaptive_engine.process_attempt(attempt)
        
        # Save adaptive engine state periodically
        adaptive_engine.save_state(ADAPTIVE_STATE_FILE)
        
        # Format results for frontend
        formatted_results = []
        
        # Public test results
        for test in evaluation_result.public_tests:
            formatted_results.append({
                'input': test.input_data,
                'expected': test.expected_output,
                'output': test.actual_output,
                'passed': test.passed,
                'execution_time_ms': test.execution_time_ms,
                'memory_mb': test.memory_used_mb,
                'error': test.error_message,
                'type': 'public'
            })
        
        # Hidden test results (limited info)
        hidden_passed = sum(1 for test in evaluation_result.hidden_tests if test.passed)
        hidden_total = len(evaluation_result.hidden_tests)
        
        response_data = {
            'results': formatted_results,
            'all_passed': evaluation_result.correctness_score >= 100,
            'scores': {
                'correctness': round(evaluation_result.correctness_score, 1),
                'efficiency': round(evaluation_result.efficiency_score, 1),
                'quality': round(evaluation_result.quality_score, 1),
                'overall': round(evaluation_result.overall_score, 1)
            },
            'hidden_tests': {
                'passed': hidden_passed,
                'total': hidden_total,
                'percentage': round(hidden_passed / hidden_total * 100, 1) if hidden_total > 0 else 0
            },
            'performance': {
                'execution_time_ms': evaluation_result.performance_metrics.execution_time_ms,
                'memory_peak_mb': round(evaluation_result.performance_metrics.memory_peak_mb, 2),
                'time_complexity': evaluation_result.performance_metrics.time_complexity_estimate
            },
            'quality_metrics': {
                'cyclomatic_complexity': evaluation_result.quality_metrics.cyclomatic_complexity,
                'lines_of_code': evaluation_result.quality_metrics.lines_of_code,
                'style_violations': len(evaluation_result.quality_metrics.style_violations),
                'security_issues': len(evaluation_result.quality_metrics.security_issues)
            },
            'feedback': evaluation_result.feedback,
            'hints': evaluation_result.hints,
            'adaptive_data': {
                'user_theta': round(adaptive_result['user_theta'], 3),
                'user_elo': round(adaptive_result['user_elo'], 0),
                'accuracy': round(adaptive_result['accuracy'], 3),
                'concept_mastery': {k: round(v, 3) for k, v in adaptive_result['concept_mastery'].items()}
            }
        }
        
        # Save evaluation to database
        try:
            evaluation_document = {
                'user_id': user_id,
                'problem_id': str(pid),
                'problem_title': problem['title'],
                'problem_difficulty': problem.get('difficulty', 'medium'),
                'language': lang,
                'code': code,
                'submission_time': datetime.now().isoformat(),
                'all_passed': response_data['all_passed'],
                'scores': response_data['scores'],
                'results': formatted_results,
                'hidden_tests': response_data['hidden_tests'],
                'performance': response_data['performance'],
                'quality_metrics': response_data['quality_metrics'],
                'feedback': response_data['feedback'],
                'hints': response_data['hints'],
                'adaptive_data': response_data['adaptive_data'],
                'execution_time_ms': int((time.time() - start_time) * 1000)
            }
            
            evaluation_id = db_service.save_evaluation(evaluation_document)
            response_data['evaluation_id'] = evaluation_id
            
        except Exception as e:
            print(f"Error saving evaluation to database: {e}")
            # Continue without database save if it fails
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in deep evaluation: {e}")
        # Fallback to simple evaluation
        return fallback_simple_evaluation(problem, code, lang)

def fallback_simple_evaluation(problem, code, lang):
    """Fallback to simple evaluation if deep evaluation fails"""
    results = []
    for tc in problem['test_cases']:
        if lang == 'python':
            if 'def ' in code:
                func_name = code.split('def ')[1].split('(')[0]
            else:
                func_name = 'main'
            
            test_code = code + f"\nresult = {func_name}(*{tc['input']})\nprint(result)"
            exec_result = execute_python_code(test_code)
            try:
                output = ast.literal_eval(exec_result['stdout'].strip())
            except:
                output = exec_result['stdout'].strip()
            passed = output == tc['output']
            results.append({
                'input': tc['input'],
                'expected': tc['output'],
                'output': output,
                'passed': passed,
                'stderr': exec_result['stderr']
            })
    
    all_passed = all(r.get('passed', False) for r in results)
    return jsonify({
        'results': results, 
        'all_passed': all_passed,
        'scores': {'overall': 100 if all_passed else 50}
    })


# In-memory user progress (for demo)
user_progress = {}

@app.route('/api/adaptive/next_problem', methods=['POST'])
def get_adaptive_next_problem():
    """Get next problem using adaptive learning algorithm"""
    data = request.get_json()
    user_id = data.get('user_id', 'guest')
    topic_preference = data.get('topic', None)
    difficulty_preference = data.get('difficulty', None)
    
    # Get all available problem IDs
    available_items = [str(p['id']) for p in problems]
    
    # Filter by preferences if provided
    if topic_preference:
        available_items = [
            str(p['id']) for p in problems 
            if topic_preference.lower() in p['title'].lower() or 
               topic_preference.lower() in p['description'].lower()
        ]
    
    if difficulty_preference:
        available_items = [
            str(p['id']) for p in problems 
            if p.get('difficulty') == difficulty_preference and str(p['id']) in available_items
        ]
    
    # Use adaptive engine to select next problem
    selected_item_id = adaptive_engine.select_next_item(
        user_id=user_id,
        available_items=available_items,
        content_constraints={'topic': topic_preference}
    )
    
    if selected_item_id:
        # Find the selected problem
        selected_problem = next((p for p in problems if str(p['id']) == selected_item_id), None)
        if selected_problem:
            # Get user analytics for context
            user_analytics = adaptive_engine.get_user_analytics(user_id)
            
            return jsonify({
                'problem': selected_problem,
                'recommendation_reason': 'Selected based on your current skill level and learning progress',
                'user_analytics': user_analytics,
                'adaptive_metadata': {
                    'difficulty_estimate': enhanced_problems.get(selected_item_id, {}).get('estimated_difficulty', 0.0),
                    'concepts': enhanced_problems.get(selected_item_id, {}).get('concepts', [])
                }
            })
    
    # Fallback to random selection
    import random
    if available_items:
        fallback_id = random.choice(available_items)
        fallback_problem = next((p for p in problems if str(p['id']) == fallback_id), None)
        return jsonify({
            'problem': fallback_problem,
            'recommendation_reason': 'Random selection (insufficient data for adaptive recommendation)'
        })
    
    return jsonify({'error': 'No problems available'}), 404

@app.route('/api/adaptive/user_analytics', methods=['GET'])
def get_user_analytics():
    """Get comprehensive user analytics"""
    user_id = request.args.get('user_id', 'guest')
    analytics = adaptive_engine.get_user_analytics(user_id)
    
    # Add additional derived metrics
    user_skill = adaptive_engine.get_or_create_user(user_id)
    
    # Calculate learning velocity (improvement rate)
    recent_attempts = [a for a in adaptive_engine.attempt_history if a.user_id == user_id][-10:]
    if len(recent_attempts) >= 5:
        early_accuracy = sum(1 for a in recent_attempts[:len(recent_attempts)//2] if a.binary_score) / (len(recent_attempts)//2)
        late_accuracy = sum(1 for a in recent_attempts[len(recent_attempts)//2:] if a.binary_score) / (len(recent_attempts)//2)
        learning_velocity = late_accuracy - early_accuracy
    else:
        learning_velocity = 0.0
    
    # Predict next difficulty level
    if user_skill.theta > 1.0:
        predicted_next_level = "hard"
    elif user_skill.theta > -0.5:
        predicted_next_level = "medium"
    else:
        predicted_next_level = "easy"
    
    # Enhanced analytics
    enhanced_analytics = analytics.copy()
    enhanced_analytics.update({
        'learning_velocity': round(learning_velocity, 3),
        'predicted_next_level': predicted_next_level,
        'session_count': len(set(a.timestamp[:10] for a in recent_attempts)),  # Unique days
        'avg_time_per_problem': sum(a.time_taken for a in recent_attempts) / len(recent_attempts) if recent_attempts else 0,
        'problem_types_attempted': len(set(a.item_id for a in recent_attempts)),
        'recent_performance_trend': 'improving' if learning_velocity > 0.1 else 'stable' if learning_velocity > -0.1 else 'declining'
    })
    
    return jsonify(enhanced_analytics)

@app.route('/api/adaptive/concept_mastery', methods=['GET'])
def get_concept_mastery():
    """Get detailed concept mastery breakdown"""
    user_id = request.args.get('user_id', 'guest')
    user_skill = adaptive_engine.get_or_create_user(user_id)
    
    # Organize mastery by concept categories
    concept_categories = {
        'Data Structures': ['arrays', 'lists', 'stacks', 'queues', 'trees', 'graphs'],
        'Algorithms': ['sorting', 'searching', 'recursion', 'dynamic_programming'],
        'Programming Basics': ['loops', 'conditions', 'functions', 'variables'],
        'String Processing': ['strings', 'string_manipulation', 'pattern_matching'],
        'Mathematics': ['number_theory', 'probability', 'statistics', 'geometry']
    }
    
    categorized_mastery = {}
    for category, concepts in concept_categories.items():
        category_mastery = []
        for concept in concepts:
            mastery = user_skill.concept_mastery.get(concept, 0.0)
            if mastery > 0.0:  # Only include concepts that have been practiced
                category_mastery.append({
                    'concept': concept,
                    'mastery': round(mastery, 3),
                    'level': 'Mastered' if mastery > 0.8 else 'Proficient' if mastery > 0.6 else 'Learning' if mastery > 0.3 else 'Beginner'
                })
        
        if category_mastery:
            categorized_mastery[category] = {
                'concepts': sorted(category_mastery, key=lambda x: x['mastery'], reverse=True),
                'avg_mastery': round(sum(c['mastery'] for c in category_mastery) / len(category_mastery), 3),
                'total_concepts': len(category_mastery)
            }
    
    return jsonify({
        'user_id': user_id,
        'categorized_mastery': categorized_mastery,
        'overall_progress': {
            'total_concepts_practiced': len(user_skill.concept_mastery),
            'mastered_concepts': sum(1 for m in user_skill.concept_mastery.values() if m > 0.8),
            'learning_concepts': sum(1 for m in user_skill.concept_mastery.values() if 0.3 <= m <= 0.8),
            'struggling_concepts': sum(1 for m in user_skill.concept_mastery.values() if m < 0.3)
        }
    })

@app.route('/api/adaptive/learning_path', methods=['POST'])
def generate_learning_path():
    """Generate personalized learning path"""
    data = request.get_json()
    user_id = data.get('user_id', 'guest')
    goal = data.get('goal', 'general_improvement')  # interview_prep, contest, general_improvement
    timeline_days = data.get('timeline_days', 30)
    
    user_analytics = adaptive_engine.get_user_analytics(user_id)
    user_skill = adaptive_engine.get_or_create_user(user_id)
    
    # Identify focus areas based on weaknesses
    weak_concepts = [concept for concept, mastery in user_skill.concept_mastery.items() if mastery < 0.5]
    
    # Generate learning path
    learning_path = {
        'user_id': user_id,
        'goal': goal,
        'timeline_days': timeline_days,
        'current_level': user_analytics.get('percentile_rank', 50),
        'focus_areas': weak_concepts[:5],  # Top 5 weak areas
        'daily_plan': [],
        'milestones': []
    }
    
    # Generate daily plan
    problems_per_day = max(1, min(5, timeline_days // 7))  # 1-5 problems per day based on timeline
    
    for day in range(1, min(8, timeline_days + 1)):  # Generate first week
        daily_problems = []
        
        # Mix of review and new concepts
        if day <= 3:
            # First 3 days: focus on weakest concepts
            target_concepts = weak_concepts[:2] if weak_concepts else ['arrays', 'loops']
        else:
            # Later days: mix weak and new concepts
            target_concepts = weak_concepts[2:4] if len(weak_concepts) > 2 else ['algorithms', 'strings']
        
        # Find suitable problems
        suitable_problems = [
            p for p in problems 
            if any(concept in enhanced_problems.get(str(p['id']), {}).get('concepts', []) for concept in target_concepts)
        ]
        
        if suitable_problems:
            selected_problems = suitable_problems[:problems_per_day]
            for prob in selected_problems:
                daily_problems.append({
                    'problem_id': prob['id'],
                    'title': prob['title'],
                    'difficulty': prob['difficulty'],
                    'concepts': enhanced_problems.get(str(prob['id']), {}).get('concepts', []),
                    'estimated_time_minutes': {'easy': 15, 'medium': 30, 'hard': 45}.get(prob['difficulty'], 30)
                })
        
        learning_path['daily_plan'].append({
            'day': day,
            'focus_concepts': target_concepts,
            'problems': daily_problems,
            'total_time_minutes': sum(p['estimated_time_minutes'] for p in daily_problems)
        })
    
    # Generate milestones
    learning_path['milestones'] = [
        {'week': 1, 'goal': f'Master {weak_concepts[0] if weak_concepts else "basic concepts"}', 'target_accuracy': 70},
        {'week': 2, 'goal': 'Solve 20 problems with 80% accuracy', 'target_accuracy': 80},
        {'week': 3, 'goal': 'Tackle medium-level problems confidently', 'target_accuracy': 75},
        {'week': 4, 'goal': 'Complete end-to-end coding challenges', 'target_accuracy': 85}
    ]
    
    return jsonify(learning_path)

@app.route('/api/evaluations/user/<user_id>', methods=['GET'])
def get_user_evaluations(user_id):
    """Get user's evaluation history"""
    try:
        limit = int(request.args.get('limit', 50))
        skip = int(request.args.get('skip', 0))
        
        evaluations = db_service.get_user_evaluations(user_id, limit=limit, skip=skip)
        
        return jsonify({
            'user_id': user_id,
            'evaluations': evaluations,
            'total_count': len(evaluations)
        })
        
    except Exception as e:
        print(f"Error fetching user evaluations: {e}")
        return jsonify({'error': 'Failed to fetch evaluations'}), 500

@app.route('/api/evaluations/progress/<user_id>', methods=['GET'])
def get_user_progress_stats(user_id):
    """Get user's overall progress statistics"""
    try:
        progress = db_service.get_user_progress(user_id)
        
        if not progress:
            # Return empty progress for new users
            progress = {
                'user_id': user_id,
                'solved_problems': [],
                'attempted_problems': [],
                'total_attempts': 0,
                'total_solved': 0,
                'average_score': 0
            }
        
        return jsonify(progress)
        
    except Exception as e:
        print(f"Error fetching user progress: {e}")
        return jsonify({'error': 'Failed to fetch user progress'}), 500

@app.route('/api/evaluations/problem/<problem_id>/stats', methods=['GET'])
def get_problem_statistics(problem_id):
    """Get statistics for a specific problem"""
    try:
        stats = db_service.get_problem_statistics(problem_id)
        
        if not stats:
            return jsonify({'error': 'Problem not found'}), 404
        
        return jsonify(stats)
        
    except Exception as e:
        print(f"Error fetching problem statistics: {e}")
        return jsonify({'error': 'Failed to fetch problem statistics'}), 500

@app.route('/api/evaluations/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top users leaderboard"""
    try:
        limit = int(request.args.get('limit', 10))
        leaderboard = db_service.get_leaderboard(limit=limit)
        
        return jsonify({
            'leaderboard': leaderboard,
            'total_count': len(leaderboard)
        })
        
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500

@app.route('/api/evaluations/user/<user_id>/problem/<problem_id>/status', methods=['GET'])
def get_user_problem_status(user_id, problem_id):
    """Check if user has solved a specific problem"""
    try:
        progress = db_service.get_user_progress(user_id)
        
        if not progress:
            return jsonify({
                'user_id': user_id,
                'problem_id': problem_id,
                'solved': False,
                'attempted': False,
                'attempts': 0,
                'best_score': 0
            })
        
        # Check if problem is solved
        solved_problems = progress.get('solved_problems', [])
        attempted_problems = progress.get('attempted_problems', [])
        
        solved_problem = next((p for p in solved_problems if p['problem_id'] == problem_id), None)
        attempted_problem = next((p for p in attempted_problems if p['problem_id'] == problem_id), None)
        
        return jsonify({
            'user_id': user_id,
            'problem_id': problem_id,
            'solved': solved_problem is not None,
            'attempted': attempted_problem is not None,
            'attempts': attempted_problem['attempts'] if attempted_problem else 0,
            'best_score': attempted_problem['best_score'] if attempted_problem else 0,
            'solved_at': solved_problem['solved_at'] if solved_problem else None
        })
        
    except Exception as e:
        print(f"Error checking problem status: {e}")
        return jsonify({'error': 'Failed to check problem status'}), 500

def get_next_difficulty(user_id):
    progress = user_progress.get(user_id, {'level': 'easy', 'last_time': None, 'last_correct': True})
    # If last answer was correct and quick, increase difficulty
    if progress['last_correct'] and progress['last_time'] is not None and progress['last_time'] < 30:
        if progress['level'] == 'easy':
            return 'medium'
        elif progress['level'] == 'medium':
            return 'hard'
        else:
            return 'hard'
    # If last answer was slow or incorrect, decrease or keep level
    if not progress['last_correct'] or (progress['last_time'] is not None and progress['last_time'] > 60):
        if progress['level'] == 'hard':
            return 'medium'
        elif progress['level'] == 'medium':
            return 'easy'
        else:
            return 'easy'
    return progress['level']

@app.route('/api/next_question', methods=['POST'])
def next_question():
    data = request.get_json()
    user_id = data.get('user_id', 'guest')
    difficulty = get_next_difficulty(user_id)
    # Fetch question from Open Trivia DB
    resp = requests.get(f'https://opentdb.com/api.php?amount=1&category=18&difficulty={difficulty}&type=multiple')
    qdata = resp.json()
    if qdata['response_code'] == 0 and qdata['results']:
        question = qdata['results'][0]
        # Save last question for user
        user_progress[user_id] = user_progress.get(user_id, {})
        user_progress[user_id]['last_question'] = question
        user_progress[user_id]['level'] = difficulty
        return jsonify({
            'question': question['question'],
            'choices': question['incorrect_answers'] + [question['correct_answer']],
            'difficulty': difficulty
        })
    return jsonify({'error': 'No question found'}), 404

@app.route('/api/submit_answer', methods=['POST'])
def submit_answer():
    data = request.get_json()
    user_id = data.get('user_id', 'guest')
    answer = data.get('answer')
    time_taken = data.get('time_taken', 0)
    progress = user_progress.get(user_id, {})
    last_question = progress.get('last_question')
    correct = False
    if last_question and answer:
        correct = (answer == last_question['correct_answer'])
    # Update progress
    user_progress[user_id] = {
        'level': progress.get('level', 'easy'),
        'last_time': time_taken,
        'last_correct': correct
    }
    return jsonify({'correct': correct, 'next_level': get_next_difficulty(user_id)})

@app.route('/run/python', methods=['POST'])
def run_python():
    data = request.get_json()
    code = data.get('code', '')
    result = execute_python_code(code)
    return jsonify(result)

@app.route('/run/java', methods=['POST'])
def run_java():
    data = request.get_json()
    code = data.get('code', '')
    result = execute_java_code(code)
    return jsonify(result)

# Quiz evaluation endpoints

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    """Submit a completed quiz for evaluation and adaptive learning updates"""
    data = request.get_json()
    
    user_id = data.get('user_id', 'anonymous')
    quiz_type = data.get('quiz_type')  # 'competitive', 'programming', 'core_subjects'
    subject = data.get('subject')  # For core subjects or programming topics
    attempts = data.get('attempts', [])  # List of quiz attempts
    session_duration = data.get('session_duration', 0)
    
    if not quiz_type or not attempts:
        return jsonify({'error': 'Missing required fields: quiz_type, attempts'}), 400
    
    try:
        # Convert attempts to QuizAttempt objects
        quiz_attempts = []
        for attempt in attempts:
            quiz_attempt = QuizAttempt(
                question_id=attempt.get('question_id', ''),
                question_text=attempt.get('question_text', ''),
                user_answer=attempt.get('user_answer'),
                correct_answer=attempt.get('correct_answer'),
                difficulty=attempt.get('difficulty', 1.0),
                time_spent=attempt.get('time_spent', 0),
                question_type=attempt.get('question_type', 'multiple_choice')
            )
            quiz_attempts.append(quiz_attempt)
        
        # Evaluate quiz session
        evaluation = quiz_evaluator.evaluate_quiz_session(
            user_id, quiz_type, subject, quiz_attempts, session_duration
        )
        
        return jsonify({
            'evaluation_id': evaluation.evaluation_id,
            'overall_score': evaluation.overall_score,
            'accuracy': evaluation.accuracy,
            'performance_metrics': evaluation.performance_metrics,
            'knowledge_updates': evaluation.knowledge_updates,
            'recommendations': evaluation.recommendations,
            'adaptive_insights': evaluation.adaptive_insights
        })
        
    except Exception as e:
        return jsonify({'error': f'Quiz evaluation failed: {str(e)}'}), 500

@app.route('/api/quiz/user/<user_id>/evaluations', methods=['GET'])
def get_user_quiz_evaluations(user_id):
    """Get quiz evaluation history for a user"""
    quiz_type = request.args.get('quiz_type')  # Optional filter
    subject = request.args.get('subject')  # Optional filter
    limit = int(request.args.get('limit', 50))
    
    try:
        # Build filter
        filter_criteria = {'user_id': user_id, 'type': 'quiz_session'}
        if quiz_type:
            filter_criteria['quiz_type'] = quiz_type
        if subject:
            filter_criteria['subject'] = subject
        
        evaluations = db_service.get_user_evaluations(user_id, filter_criteria, limit)
        
        return jsonify({
            'user_id': user_id,
            'evaluations': evaluations,
            'total_count': len(evaluations)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve quiz evaluations: {str(e)}'}), 500

@app.route('/api/quiz/user/<user_id>/analytics', methods=['GET'])
def get_user_quiz_analytics(user_id):
    """Get comprehensive quiz analytics for a user"""
    try:
        # Get quiz evaluations
        quiz_filter = {'user_id': user_id, 'type': 'quiz_session'}
        evaluations = db_service.get_user_evaluations(user_id, quiz_filter, 100)
        
        if not evaluations:
            return jsonify({
                'user_id': user_id,
                'analytics': {
                    'total_quizzes': 0,
                    'average_score': 0,
                    'accuracy': 0,
                    'subject_breakdown': {},
                    'performance_trend': [],
                    'knowledge_level': 'Beginner'
                }
            })
        
        # Calculate analytics
        total_quizzes = len(evaluations)
        total_score = sum(eval_data.get('overall_score', 0) for eval_data in evaluations)
        total_correct = sum(eval_data.get('total_correct', 0) for eval_data in evaluations)
        total_questions = sum(eval_data.get('total_questions', 1) for eval_data in evaluations)
        
        # Subject breakdown
        subject_breakdown = {}
        for evaluation in evaluations:
            subject = evaluation.get('subject', 'General')
            if subject not in subject_breakdown:
                subject_breakdown[subject] = {
                    'count': 0, 
                    'total_score': 0, 
                    'total_correct': 0, 
                    'total_questions': 0
                }
            subject_breakdown[subject]['count'] += 1
            subject_breakdown[subject]['total_score'] += evaluation.get('overall_score', 0)
            subject_breakdown[subject]['total_correct'] += evaluation.get('total_correct', 0)
            subject_breakdown[subject]['total_questions'] += evaluation.get('total_questions', 1)
        
        # Calculate subject averages
        for subject in subject_breakdown:
            count = subject_breakdown[subject]['count']
            subject_breakdown[subject]['average_score'] = subject_breakdown[subject]['total_score'] / count
            subject_breakdown[subject]['accuracy'] = (
                subject_breakdown[subject]['total_correct'] / 
                max(subject_breakdown[subject]['total_questions'], 1)
            ) * 100
        
        # Performance trend (last 10 quizzes)
        recent_evaluations = sorted(evaluations, key=lambda x: x.get('timestamp', ''))[-10:]
        performance_trend = [
            {
                'date': eval_data.get('timestamp', ''),
                'score': eval_data.get('overall_score', 0),
                'subject': eval_data.get('subject', 'General')
            }
            for eval_data in recent_evaluations
        ]
        
        # Determine knowledge level based on average score
        avg_score = total_score / total_quizzes
        if avg_score >= 85:
            knowledge_level = 'Expert'
        elif avg_score >= 70:
            knowledge_level = 'Advanced'
        elif avg_score >= 55:
            knowledge_level = 'Intermediate'
        else:
            knowledge_level = 'Beginner'
        
        analytics = {
            'total_quizzes': total_quizzes,
            'average_score': avg_score,
            'accuracy': (total_correct / max(total_questions, 1)) * 100,
            'subject_breakdown': subject_breakdown,
            'performance_trend': performance_trend,
            'knowledge_level': knowledge_level
        }
        
        return jsonify({
            'user_id': user_id,
            'analytics': analytics
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve quiz analytics: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)