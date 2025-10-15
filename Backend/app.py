import json
import ast
import random
from flask import Flask, request, jsonify
from Python_Compiler.python_executor import execute_python_code
from Java_Compiler.java_executor import execute_java_code
from flask_cors import CORS
import requests
import time
from datetime import datetime, timedelta
from dataclasses import asdict
from adaptive_engine import AdaptiveLearningEngine, AttemptRecord
from deep_evaluator import DeepCodeEvaluator
from database_service import db_service
from quiz_evaluation_service import QuizEvaluationService, QuizAttempt, QuizSessionEvaluation
from auth_routes import auth_bp
from adaptive_routes import adaptive_bp, init_problem_selector
from auth_service import require_auth
from learning_analytics import LearningAnalytics
from adaptive_engine_enhanced import EnhancedAdaptiveEngine  
from skill_analyzer import SkillAnalyzer
from datetime import datetime
from dataclasses import asdict
import os

app = Flask(__name__)
CORS(app)

# Initialize real-time service with SocketIO
from realtime_service import realtime_service
socketio = realtime_service.init_app(app)

# Register authentication blueprint
app.register_blueprint(auth_bp)
# Register adaptive learning blueprint
app.register_blueprint(adaptive_bp)

# Initialize adaptive learning engine, deep evaluator, and quiz evaluator
adaptive_engine = AdaptiveLearningEngine()
deep_evaluator = DeepCodeEvaluator()
quiz_evaluator = QuizEvaluationService(adaptive_engine, db_service)

# Initialize Phase 3 AI Recommendation Engine components  
learning_analytics = LearningAnalytics()
enhanced_adaptive_engine = EnhancedAdaptiveEngine()
skill_analyzer = SkillAnalyzer()
print("Phase 3 AI Recommendation Engine components initialized successfully")

# Initialize Phase 4 Advanced Analytics Dashboard components
from dashboard_service import dashboard_service
from analytics_service import analytics_service  
from prediction_models import prediction_models
print("Phase 4 Advanced Analytics Dashboard components initialized successfully")

# Load/save state files
ADAPTIVE_STATE_FILE = 'adaptive_state.json'
if os.path.exists(ADAPTIVE_STATE_FILE):
    adaptive_engine.load_state(ADAPTIVE_STATE_FILE)

# Load problems from JSON files
def extract_test_cases_from_samples(problem):
    """Extract simple test cases from complex public_sample_testcases structure"""
    test_cases = []
    
    if 'public_sample_testcases' in problem and problem['public_sample_testcases']:
        try:
            sample_cases = problem['public_sample_testcases']
            
            # Handle different structures of sample test cases
            if isinstance(sample_cases, list):
                for case in sample_cases:
                    if isinstance(case, dict):
                        # Extract input and output from the case
                        input_data = case.get('input', '')
                        output_data = case.get('output', '')
                        
                        # If input/output are not directly available, try to parse from explanation
                        if not input_data and 'explanation' in case:
                            explanation = case['explanation']
                            # Try to extract test cases from explanation text
                            extracted = parse_test_cases_from_text(explanation)
                            test_cases.extend(extracted)
                            continue
                        
                        test_cases.append({
                            'input': input_data,
                            'output': output_data,
                            'type': case.get('type', 'example')
                        })
            elif isinstance(sample_cases, dict):
                # Single test case in dict format
                input_data = sample_cases.get('input', '')
                output_data = sample_cases.get('output', '')
                
                if input_data or output_data:
                    test_cases.append({
                        'input': input_data,
                        'output': output_data,
                        'type': 'example'
                    })
                    
                # Try to extract from explanation if available
                elif 'explanation' in sample_cases:
                    explanation = sample_cases['explanation']
                    extracted = parse_test_cases_from_text(explanation)
                    test_cases.extend(extracted)
        except Exception as e:
            print(f"Error extracting test cases from problem {problem.get('id', 'unknown')}: {e}")
    
    # If still no test cases, create a simple example
    if not test_cases:
        test_cases = create_default_test_cases(problem)
    
    return test_cases

def parse_test_cases_from_text(text):
    """Parse test cases from explanation text using pattern matching"""
    test_cases = []
    
    try:
        # Look for common patterns like "Input: ... Output: ..."
        import re
        
        # Pattern to match input/output pairs
        pattern = r'(?:Input:?\s*)(.*?)(?:\s*Output:?\s*)(.*?)(?=Input:|$)'
        matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
        
        for match in matches:
            input_str = match[0].strip()
            output_str = match[1].strip()
            
            if input_str and output_str:
                # Clean up the extracted strings
                input_str = clean_test_case_string(input_str)
                output_str = clean_test_case_string(output_str)
                
                test_cases.append({
                    'input': input_str,
                    'output': output_str,
                    'type': 'example'
                })
        
        # If no matches found, try another pattern
        if not test_cases:
            # Look for array-like structures
            array_pattern = r'\[(.*?)\]'
            arrays = re.findall(array_pattern, text)
            
            if len(arrays) >= 2:
                test_cases.append({
                    'input': f"[{arrays[0]}]",
                    'output': f"[{arrays[1]}]",
                    'type': 'example'
                })
    except Exception as e:
        print(f"Error parsing test cases from text: {e}")
    
    return test_cases

def clean_test_case_string(s):
    """Clean and format test case strings"""
    # Remove extra whitespace and newlines
    s = ' '.join(s.split())
    
    # Remove common prefixes/suffixes
    prefixes = ['=', ':', 'input', 'output', 'example']
    for prefix in prefixes:
        if s.lower().startswith(prefix.lower()):
            s = s[len(prefix):].strip()
    
    # Try to parse as JSON if it looks like a data structure
    try:
        if s.startswith('[') or s.startswith('{') or s.isdigit():
            import json
            return json.loads(s)
    except:
        pass
    
    return s

def create_default_test_cases(problem):
    """Create default test cases when none can be extracted"""
    title = problem.get('title', 'Solution')
    
    # Create simple default test cases based on problem type
    if 'array' in title.lower() or 'list' in title.lower():
        return [
            {'input': [1, 2, 3], 'output': [1, 2, 3], 'type': 'example'},
            {'input': [4, 5, 6], 'output': [4, 5, 6], 'type': 'example'}
        ]
    elif 'string' in title.lower():
        return [
            {'input': "hello", 'output': "hello", 'type': 'example'},
            {'input': "world", 'output': "world", 'type': 'example'}
        ]
    elif 'number' in title.lower() or 'integer' in title.lower():
        return [
            {'input': 5, 'output': 5, 'type': 'example'},
            {'input': 10, 'output': 10, 'type': 'example'}
        ]
    else:
        # Generic default
        return [
            {'input': "test_input", 'output': "test_output", 'type': 'example'}
        ]

def load_problems():
    """Load problems from coding_questions directory with skill metadata"""
    problems = []
    
    # Path to coding questions directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    questions_dir = os.path.join(base_dir, 'coding_questions')
    
    # Skill mapping for problems
    skill_mappings = {
        'easy': ['programming_fundamentals', 'basic_algorithms', 'data_structures'],
        'medium': ['algorithms', 'data_structures', 'problem_solving', 'optimization'],
        'hard': ['advanced_algorithms', 'complex_data_structures', 'dynamic_programming', 'graph_algorithms']
    }
    
    try:
        # Load problems from different difficulty files
        for difficulty in ['easy', 'medium', 'hard']:
            file_path = os.path.join(questions_dir, f'{difficulty}.json')
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    difficulty_problems = json.load(f)
                    # Convert string IDs to integers and add difficulty info
                    for problem in difficulty_problems:
                        # Convert ID from string to integer (e.g., "E001" -> 1)
                        if isinstance(problem['id'], str):
                            # Extract numeric part from ID like "E001", "M001", "H001"
                            numeric_id = int(problem['id'][1:])
                            if difficulty == 'medium':
                                numeric_id += 1000  # Medium problems start from 1001
                            elif difficulty == 'hard':
                                numeric_id += 2000  # Hard problems start from 2001
                            problem['id'] = numeric_id
                        
                        problem['difficulty'] = difficulty
                        
                        # Add skill metadata for adaptive learning
                        problem['skills'] = get_problem_skills(problem, difficulty, skill_mappings)
                        
                        # Add learning metadata
                        problem['estimated_time_minutes'] = estimate_problem_time(problem, difficulty)
                        problem['complexity_score'] = calculate_complexity_score(problem)
                        
                        # Ensure test_cases format is compatible
                        if 'test_cases' in problem:
                            for tc in problem['test_cases']:
                                # Convert test case format if needed
                                if 'input' in tc and isinstance(tc['input'], list):
                                    if len(tc['input']) == 2:
                                        tc['input'] = tc['input'][0]  # Use first element as input
                                        # Keep output as is
                        
                        # Extract test cases from public_sample_testcases if no test_cases exist
                        if 'test_cases' not in problem or not problem['test_cases']:
                            problem['test_cases'] = extract_test_cases_from_samples(problem)
                        
                        problems.append(problem)
                print(f"Loaded {len(difficulty_problems)} {difficulty} problems")
            else:
                print(f"Warning: {file_path} not found")
        
        if not problems:
            # Create sample problems if none found
            print("No problems found, creating sample problems...")
            problems = create_sample_problems()
        
        print(f"Total problems loaded: {len(problems)}")
        
        # Initialize problem selector with loaded problems
        try:
            init_problem_selector(problems)
            print("Problem selector initialized successfully")
        except Exception as e:
            print(f"Warning: Could not initialize problem selector: {e}")
        
        return problems
        
    except Exception as e:
        print(f"Error loading problems: {e}")
        print("Creating sample problems as fallback...")
        return create_sample_problems()

def get_problem_skills(problem, difficulty, skill_mappings):
    """Extract or assign skills based on problem content and difficulty"""
    skills = []
    
    # Add default skills based on difficulty
    skills.extend(skill_mappings.get(difficulty, []))
    
    # Analyze problem content for specific skills
    title = problem.get('title', '').lower()
    description = problem.get('description', '').lower()
    content = f"{title} {description}"
    
    # Algorithm-specific skills
    if any(word in content for word in ['sort', 'sorting', 'merge', 'quick']):
        skills.append('sorting')
    if any(word in content for word in ['search', 'binary', 'find']):
        skills.append('searching')
    if any(word in content for word in ['dynamic', 'dp', 'memoization']):
        skills.append('dynamic_programming')
    if any(word in content for word in ['tree', 'binary tree', 'bst']):
        skills.append('trees')
    if any(word in content for word in ['graph', 'bfs', 'dfs', 'shortest path']):
        skills.append('graphs')
    if any(word in content for word in ['array', 'list', 'matrix']):
        skills.append('arrays')
    if any(word in content for word in ['string', 'substring', 'character']):
        skills.append('string_manipulation')
    if any(word in content for word in ['recursion', 'recursive']):
        skills.append('recursion')
    if any(word in content for word in ['hash', 'map', 'dictionary']):
        skills.append('hash_tables')
    if any(word in content for word in ['stack', 'queue']):
        skills.append('stacks_queues')
    
    # Remove duplicates and return
    return list(set(skills))

def estimate_problem_time(problem, difficulty):
    """Estimate time needed to solve problem based on difficulty and complexity"""
    base_times = {'easy': 15, 'medium': 30, 'hard': 60}  # minutes
    base_time = base_times.get(difficulty, 30)
    
    # Adjust based on test cases
    test_cases = problem.get('test_cases', [])
    if len(test_cases) > 5:
        base_time += 10
    
    # Adjust based on description length (more complex problems have longer descriptions)
    description_length = len(problem.get('description', ''))
    if description_length > 500:
        base_time += 15
    elif description_length > 200:
        base_time += 5
    
    return base_time

def calculate_complexity_score(problem):
    """Calculate complexity score (0-100) based on various factors"""
    score = 0
    
    # Base score by difficulty
    difficulty_scores = {'easy': 20, 'medium': 50, 'hard': 80}
    score += difficulty_scores.get(problem.get('difficulty', 'medium'), 50)
    
    # Adjust based on test cases
    test_cases = problem.get('test_cases', [])
    score += min(len(test_cases) * 2, 10)
    
    # Adjust based on skills required
    skills = problem.get('skills', [])
    if 'dynamic_programming' in skills:
        score += 15
    if 'graphs' in skills:
        score += 10
    if 'recursion' in skills:
        score += 5
    
    return min(score, 100)

def create_sample_problems():
    """Create sample problems for testing"""
    return [
        {
            "id": 1,
            "title": "Hello World",
            "difficulty": "easy",
            "description": "Print 'Hello, World!' to the console",
            "starter_code": {
                "python": "# Write your code here\nprint('Hello, World!')",
                "java": "public class Solution {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"
            },
            "test_cases": [
                {"input": "", "output": "Hello, World!", "type": "public"}
            ],
            "expected_time_ms": 1000
        },
        {
            "id": 2,
            "title": "Add Two Numbers",
            "difficulty": "easy", 
            "description": "Add two integers and return the sum",
            "starter_code": {
                "python": "def add_numbers(a, b):\n    # Write your code here\n    return a + b",
                "java": "public class Solution {\n    public int addNumbers(int a, int b) {\n        // Write your code here\n        return a + b;\n    }\n}"
            },
            "test_cases": [
                {"input": "2 3", "output": "5", "type": "public"},
                {"input": "-1 1", "output": "0", "type": "hidden"}
            ],
            "expected_time_ms": 1000
        }
    ]

problems = load_problems()

# Enhanced problem metadata for adaptive learning
enhanced_problems = {}
for problem in problems:
    problem_id = str(problem['id'])
    concepts = []
    
    # Infer concepts from problem content
    title_lower = problem['title'].lower()
    desc_lower = problem.get('description', '').lower()
    statement_lower = problem.get('statement_markdown', '').lower()
    topics = problem.get('topics', [])
    
    # Use topics if available
    if topics:
        for topic in topics:
            topic_lower = topic.lower()
            if 'array' in topic_lower:
                concepts.append('arrays')
            elif 'string' in topic_lower:
                concepts.append('strings')
            elif 'tree' in topic_lower:
                concepts.append('trees')
            elif 'graph' in topic_lower:
                concepts.append('graphs')
            elif 'dynamic' in topic_lower or 'dp' in topic_lower:
                concepts.append('dynamic_programming')
            elif 'hash' in topic_lower:
                concepts.append('hash_tables')
            else:
                concepts.append(topic_lower.replace(' ', '_'))
    
    # Fallback to content-based inference
    all_text = f"{title_lower} {desc_lower} {statement_lower}"
    
    if any(word in all_text for word in ['array', 'list', 'index']):
        concepts.append('arrays')
    if any(word in all_text for word in ['loop', 'iterate', 'for', 'while']):
        concepts.append('loops')
    if any(word in all_text for word in ['string', 'text', 'char', 'substring']):
        concepts.append('strings')
    if any(word in all_text for word in ['recursive', 'fibonacci', 'recursion']):
        concepts.append('recursion')
    if any(word in all_text for word in ['sort', 'search', 'maximum', 'minimum', 'binary']):
        concepts.append('algorithms')
    if any(word in all_text for word in ['palindrome', 'reverse']):
        concepts.append('string_manipulation')
    if any(word in all_text for word in ['tree', 'node', 'root', 'leaf']):
        concepts.append('trees')
    if any(word in all_text for word in ['graph', 'vertex', 'edge', 'path']):
        concepts.append('graphs')
    
    # Remove duplicates
    concepts = list(set(concepts))
    
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
    randomize = request.args.get('randomize', 'false').lower() == 'true'
    limit = request.args.get('limit', type=int)
    
    if difficulty:
        filtered = get_problems_by_difficulty(difficulty)
    else:
        filtered = problems
    
    # Apply randomization if requested
    if randomize:
        filtered = filtered.copy()  # Don't modify the original list
        random.shuffle(filtered)
    
    # Apply limit if specified
    if limit and limit > 0:
        filtered = filtered[:limit]
    
    return jsonify(filtered)

@app.route('/api/problem/<int:pid>', methods=['GET'])
def get_problem(pid):
    for p in problems:
        if p['id'] == pid:
            return jsonify(p)
    return jsonify({'error': 'Problem not found'}), 404

@app.route('/api/problems/random', methods=['GET'])
def get_random_problems():
    """Get randomized problems with advanced filtering options"""
    difficulty = request.args.get('difficulty')
    category = request.args.get('category')
    count = request.args.get('count', 10, type=int)
    exclude_solved = request.args.get('exclude_solved', 'false').lower() == 'true'
    user_id = request.args.get('user_id')
    
    # Start with all problems or filter by difficulty
    if difficulty:
        filtered_problems = get_problems_by_difficulty(difficulty)
    else:
        filtered_problems = problems.copy()
    
    # Filter by category/topic if specified
    if category:
        filtered_problems = [
            p for p in filtered_problems 
            if any(category.lower() in topic.lower() for topic in p.get('topics', [])) or
               category.lower() in p.get('title', '').lower() or
               category.lower() in p.get('statement_markdown', '').lower()
        ]
    
    # Exclude solved problems if requested (would need to check user progress)
    if exclude_solved and user_id:
        # This would require checking user's solved problems from database
        # For now, just implement the structure
        pass
    
    # Randomize the filtered problems
    random.shuffle(filtered_problems)
    
    # Return requested count
    result = filtered_problems[:count]
    
    return jsonify({
        'problems': result,
        'total_available': len(filtered_problems),
        'returned': len(result),
        'filters_applied': {
            'difficulty': difficulty,
            'category': category,
            'exclude_solved': exclude_solved
        }
    })

@app.route('/api/problems/shuffle', methods=['POST'])
def shuffle_problems():
    """Shuffle a specific list of problems"""
    data = request.get_json()
    problem_ids = data.get('problem_ids', [])
    
    if not problem_ids:
        return jsonify({'error': 'No problem IDs provided'}), 400
    
    # Get the specified problems
    selected_problems = []
    for pid in problem_ids:
        problem = next((p for p in problems if p['id'] == pid), None)
        if problem:
            selected_problems.append(problem)
    
    # Shuffle them
    random.shuffle(selected_problems)
    
    return jsonify({
        'problems': selected_problems,
        'shuffled_count': len(selected_problems),
        'original_order': problem_ids,
        'new_order': [p['id'] for p in selected_problems]
    })

@app.route('/api/problems/daily-challenge', methods=['GET'])
def get_daily_challenge():
    """Get a daily challenge problem based on user level"""
    user_id = request.args.get('user_id', 'guest')
    
    # Get user's current level from adaptive engine
    try:
        user_analytics = adaptive_engine.get_user_analytics(user_id)
        user_level = user_analytics.get('percentile_rank', 50)
        
        # Choose difficulty based on user level
        if user_level < 30:
            target_difficulty = 'Easy'
        elif user_level < 70:
            target_difficulty = 'Medium'
        else:
            target_difficulty = 'Hard'
    except:
        target_difficulty = 'Medium'  # Default fallback
    
    # Get problems of target difficulty
    difficulty_problems = get_problems_by_difficulty(target_difficulty)
    
    if not difficulty_problems:
        difficulty_problems = problems  # Fallback to all problems
    
    # Select a random problem for daily challenge
    daily_problem = random.choice(difficulty_problems)
    
    # Add some metadata
    challenge_data = {
        'problem': daily_problem,
        'challenge_date': datetime.now().strftime('%Y-%m-%d'),
        'difficulty_reasoning': f'Selected {target_difficulty} based on your skill level',
        'user_level': user_level if 'user_level' in locals() else 50,
        'bonus_points': {
            'Easy': 50,
            'Medium': 100,
            'Hard': 200
        }.get(target_difficulty, 100)
    }
    
    return jsonify(challenge_data)

@app.route('/api/submit_code', methods=['POST'])
@require_auth
def submit_code():
    data = request.get_json()
    pid = data.get('problem_id')
    code = data.get('code')
    lang = data.get('language', 'python')
    user_id = request.current_user['user_id']  # Get from authenticated user
    
    # Find problem
    problem = next((p for p in problems if p['id'] == pid), None)
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
        
        # Save code submission to database with enhanced metadata
        submission_data = {
            'user_id': user_id,
            'problem_id': str(pid),
            'code': code,
            'language': lang,
            'status': 'completed',
            'execution_result': evaluation_result.__dict__,
            'submission_type': 'evaluation',
            'performance_data': {
                'execution_time_ms': evaluation_result.performance_metrics.execution_time_ms,
                'memory_peak_mb': evaluation_result.performance_metrics.memory_peak_mb,
                'time_complexity': evaluation_result.performance_metrics.time_complexity_estimate
            }
        }
        
        submission_id = db_service.save_code_submission(submission_data)
        
        # Update skill progress for each skill associated with this problem
        problem_skills = problem.get('skills', [])
        for skill in problem_skills:
            skill_data = {
                'skill_name': skill,
                'problem_id': str(pid),
                'score': evaluation_result.overall_score,
                'time_spent': int((time.time() - start_time) * 1000) / 1000,  # Convert to seconds
                'difficulty': problem.get('difficulty', 'medium')
            }
            try:
                db_service.update_skill_progress(user_id, skill_data)
            except Exception as e:
                print(f"Error updating skill progress for {skill}: {e}")
        
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
        
        # Progressive disclosure logic - track failures and reveal hidden tests
        failure_threshold = 3
        hint_threshold = 2
        
        # Get user's previous failures for this problem
        previous_failures = list(db_service.db.evaluations.find({
            'user_id': user_id,
            'problem_id': str(pid),
            'all_passed': False
        }).sort('submission_time', -1).limit(10))
        
        current_failure_count = len(previous_failures)
        if not evaluation_result.correctness_score >= 100:
            current_failure_count += 1  # Include current failure
        
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
        
        # Hidden test results (limited info by default)
        hidden_passed = sum(1 for test in evaluation_result.hidden_tests if test.passed)
        hidden_total = len(evaluation_result.hidden_tests)
        
        # Progressive disclosure of hidden tests
        hidden_test_details = None
        should_reveal_hidden = current_failure_count >= failure_threshold
        should_show_hints = current_failure_count >= hint_threshold
        
        if should_reveal_hidden:
            hidden_test_details = []
            for test in evaluation_result.hidden_tests:
                hidden_test_details.append({
                    'input': test.input_data,
                    'expected': test.expected_output,
                    'output': test.actual_output,
                    'passed': test.passed,
                    'execution_time_ms': test.execution_time_ms,
                    'error': test.error_message
                })
        
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
            'hidden_test_details': hidden_test_details,
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
            'hints': evaluation_result.hints if should_show_hints else [],
            'progressive_disclosure': {
                'failure_count': current_failure_count,
                'hidden_tests_revealed': should_reveal_hidden,
                'hints_available': should_show_hints,
                'message': f"After {current_failure_count} attempts, additional debugging information is now available."
            },
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

# ===========================
# Enhanced Quiz API Endpoints with Real-time Features
# ===========================

@app.route('/api/quiz/categories', methods=['GET'])
def get_quiz_categories():
    """Get available quiz categories"""
    try:
        categories = [
            {
                'id': 'programming',
                'name': 'Programming Fundamentals',
                'description': 'Core programming concepts and syntax',
                'difficulty_levels': ['beginner', 'intermediate', 'advanced'],
                'question_count': 50,
                'icon': 'code'
            },
            {
                'id': 'algorithms',
                'name': 'Algorithms & Data Structures',
                'description': 'Algorithmic thinking and data structure knowledge',
                'difficulty_levels': ['beginner', 'intermediate', 'advanced'],
                'question_count': 75,
                'icon': 'tree'
            },
            {
                'id': 'web_development',
                'name': 'Web Development',
                'description': 'Frontend and backend web technologies',
                'difficulty_levels': ['beginner', 'intermediate', 'advanced'],
                'question_count': 60,
                'icon': 'globe'
            },
            {
                'id': 'databases',
                'name': 'Database Design',
                'description': 'Database concepts and SQL',
                'difficulty_levels': ['beginner', 'intermediate', 'advanced'],
                'question_count': 40,
                'icon': 'database'
            },
            {
                'id': 'software_engineering',
                'name': 'Software Engineering',
                'description': 'Software development practices and patterns',
                'difficulty_levels': ['intermediate', 'advanced'],
                'question_count': 35,
                'icon': 'tool'
            }
        ]
        
        return jsonify({'categories': categories})
        
    except Exception as e:
        return jsonify({'error': f'Failed to get quiz categories: {str(e)}'}), 500

@app.route('/api/quiz/questions/<category>', methods=['GET'])
def get_quiz_questions(category):
    """Get quiz questions for a specific category"""
    try:
        difficulty = request.args.get('difficulty', 'beginner')
        count = int(request.args.get('count', 10))
        
        # Mock quiz questions based on category
        questions = generate_quiz_questions(category, difficulty, count)
        
        return jsonify({
            'category': category,
            'difficulty': difficulty,
            'questions': questions,
            'total_count': len(questions)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get quiz questions: {str(e)}'}), 500

@app.route('/api/quiz/submit-realtime', methods=['POST'])
@require_auth
def submit_quiz_realtime():
    """Submit quiz with real-time notifications"""
    try:
        data = request.json
        user_id = data.get('user_id')
        quiz_data = data.get('quiz_data', {})
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        # Process quiz submission
        result = process_quiz_submission(user_id, quiz_data)
        
        # Send real-time notifications
        if result.get('achievement_unlocked'):
            realtime_service.send_achievement_notification(user_id, result['achievement_unlocked'])
        
        if result.get('progress_update'):
            realtime_service.send_progress_update(user_id, result['progress_update'])
        
        # Send activity update
        realtime_service.send_activity_update(user_id, {
            'type': 'quiz_completed',
            'data': {
                'score': result.get('score', 0),
                'category': quiz_data.get('category'),
                'difficulty': quiz_data.get('difficulty')
            }
        })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Failed to submit quiz: {str(e)}'}), 500

@app.route('/api/quiz/leaderboard/<category>', methods=['GET'])
def get_quiz_leaderboard(category):
    """Get quiz leaderboard for a category"""
    try:
        time_period = request.args.get('period', 'weekly')  # daily, weekly, monthly, all_time
        
        # Mock leaderboard data
        leaderboard = generate_leaderboard(category, time_period)
        
        return jsonify({
            'category': category,
            'time_period': time_period,
            'leaderboard': leaderboard,
            'last_updated': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get leaderboard: {str(e)}'}), 500

@app.route('/api/quiz/user-stats/<user_id>', methods=['GET'])
def get_user_quiz_stats(user_id):
    """Get comprehensive quiz statistics for a user"""
    try:
        stats = {
            'total_quizzes_taken': random.randint(10, 100),
            'total_questions_answered': random.randint(100, 1000),
            'overall_accuracy': random.uniform(65, 95),
            'favorite_category': random.choice(['programming', 'algorithms', 'web_development']),
            'current_streak': random.randint(0, 15),
            'best_streak': random.randint(5, 25),
            'achievements_earned': random.randint(3, 20),
            'category_performance': {
                'programming': random.uniform(60, 90),
                'algorithms': random.uniform(50, 85),
                'web_development': random.uniform(70, 95),
                'databases': random.uniform(55, 80),
                'software_engineering': random.uniform(45, 75)
            },
            'recent_performance': [
                {
                    'date': (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'),
                    'score': random.uniform(60, 100),
                    'category': random.choice(['programming', 'algorithms', 'web_development'])
                }
                for i in range(7)
            ],
            'last_updated': datetime.now().isoformat()
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user quiz stats: {str(e)}'}), 500

def generate_quiz_questions(category, difficulty, count):
    """Generate quiz questions for a category and difficulty"""
    base_questions = {
        'programming': [
            {
                'id': 1,
                'type': 'multiple_choice',
                'question': 'What is the time complexity of binary search?',
                'options': ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
                'correct_answer': 1,
                'explanation': 'Binary search divides the search space in half with each iteration, resulting in O(log n) time complexity.',
                'difficulty': difficulty,
                'points': 10
            },
            {
                'id': 2,
                'type': 'multiple_choice',
                'question': 'Which of the following is NOT a valid Python data type?',
                'options': ['list', 'tuple', 'array', 'dictionary'],
                'correct_answer': 2,
                'explanation': 'Array is not a built-in Python data type, though it exists in the array module.',
                'difficulty': difficulty,
                'points': 10
            }
        ],
        'algorithms': [
            {
                'id': 3,
                'type': 'multiple_choice',
                'question': 'Which sorting algorithm has the best average-case time complexity?',
                'options': ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Selection Sort'],
                'correct_answer': 2,
                'explanation': 'Merge Sort consistently has O(n log n) time complexity in all cases.',
                'difficulty': difficulty,
                'points': 15
            }
        ]
    }
    
    questions = base_questions.get(category, base_questions['programming'])
    return questions[:count]

def generate_leaderboard(category, time_period):
    """Generate mock leaderboard data"""
    names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack']
    
    leaderboard = []
    for i, name in enumerate(names):
        leaderboard.append({
            'rank': i + 1,
            'username': name,
            'score': random.randint(500, 1000) - (i * 50),
            'quizzes_completed': random.randint(10, 50),
            'accuracy': random.uniform(70, 95),
            'last_active': (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat()
        })
    
    return leaderboard

def process_quiz_submission(user_id, quiz_data):
    """Process quiz submission and return results"""
    # Mock processing logic
    score = random.uniform(60, 100)
    accuracy = random.uniform(65, 95)
    
    result = {
        'score': round(score, 1),
        'accuracy': round(accuracy, 1),
        'points_earned': int(score),
        'questions_correct': int(len(quiz_data.get('answers', [])) * accuracy / 100),
        'total_questions': len(quiz_data.get('answers', [])),
        'time_taken': quiz_data.get('time_taken', 0),
        'difficulty': quiz_data.get('difficulty', 'beginner'),
        'category': quiz_data.get('category', 'programming')
    }
    
    # Check for achievements
    if score > 90:
        result['achievement_unlocked'] = {
            'id': 'high_scorer',
            'title': 'High Scorer',
            'description': 'Scored above 90% in a quiz',
            'points': 25
        }
    
    # Progress update
    result['progress_update'] = {
        'skill_improvement': f"+{random.randint(1, 5)} points in {quiz_data.get('category', 'programming')}",
        'level_progress': random.uniform(1, 10)
    }
    
    return result

# ============================================================================
# PHASE 3: AI RECOMMENDATION ENGINE API ENDPOINTS
# ============================================================================

@app.route('/api/learning-analytics/<user_id>', methods=['GET'])
@require_auth
def get_learning_analytics(user_id):
    """Get comprehensive learning analytics for user"""
    try:
        days_back = request.args.get('days', 30, type=int)
        patterns = learning_analytics.analyze_learning_patterns(user_id, days_back)
        
        return jsonify({
            'user_id': user_id,
            'analysis_period_days': days_back,
            'patterns': patterns,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate learning analytics: {str(e)}'}), 500

@app.route('/api/learning-insights/<user_id>', methods=['GET'])
@require_auth
def get_learning_insights(user_id):
    """Get actionable learning insights for user"""
    try:
        insights = learning_analytics.generate_learning_insights(user_id)
        recommendations = learning_analytics.get_personalized_recommendations(user_id)
        
        return jsonify({
            'user_id': user_id,
            'insights': [asdict(insight) for insight in insights],
            'recommendations': recommendations,
            'total_insights': len(insights),
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate learning insights: {str(e)}'}), 500

@app.route('/api/difficulty-adaptation/<user_id>', methods=['POST'])
@require_auth
def adapt_difficulty(user_id):
    """Trigger difficulty adaptation for user"""
    try:
        adaptation_result = enhanced_adaptive_engine.adapt_difficulty(user_id)
        
        return jsonify({
            'user_id': user_id,
            'adaptation_result': adaptation_result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to adapt difficulty: {str(e)}'}), 500

@app.route('/api/difficulty-state/<user_id>', methods=['GET'])
@require_auth
def get_difficulty_state(user_id):
    """Get user's current difficulty state"""
    try:
        state = enhanced_adaptive_engine.get_difficulty_state(user_id)
        performance = enhanced_adaptive_engine.calculate_performance_metrics(user_id)
        
        return jsonify({
            'user_id': user_id,
            'difficulty_state': {
                'current_difficulty': state.current_difficulty,
                'confidence_level': state.confidence_level,
                'adaptation_rate': state.adaptation_rate,
                'success_target': state.success_target,
                'last_updated': state.last_updated.isoformat()
            },
            'performance_metrics': asdict(performance),
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get difficulty state: {str(e)}'}), 500

@app.route('/api/optimal-difficulty/<user_id>', methods=['GET'])
@require_auth  
def get_optimal_difficulty(user_id):
    """Get optimal problem difficulty for user"""
    try:
        concept = request.args.get('concept')
        optimal_difficulty = enhanced_adaptive_engine.get_optimal_problem_difficulty(user_id, concept)
        
        return jsonify({
            'user_id': user_id,
            'concept': concept,
            'optimal_difficulty': optimal_difficulty,
            'difficulty_scale': {
                '0.0-0.2': 'Very Easy',
                '0.2-0.4': 'Easy', 
                '0.4-0.6': 'Medium',
                '0.6-0.8': 'Hard',
                '0.8-1.0': 'Very Hard'
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get optimal difficulty: {str(e)}'}), 500

@app.route('/api/difficulty-progression/<user_id>', methods=['GET'])
@require_auth
def get_difficulty_progression(user_id):
    """Get difficulty progression plan for user"""
    try:
        concepts = request.args.getlist('concepts')
        if not concepts:
            concepts = ['algorithms', 'data_structures', 'recursion']
            
        progression_plan = enhanced_adaptive_engine.get_difficulty_progression_plan(user_id, concepts)
        
        return jsonify({
            'user_id': user_id,
            'target_concepts': concepts,
            'progression_plan': progression_plan,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate progression plan: {str(e)}'}), 500

@app.route('/api/adaptation-insights/<user_id>', methods=['GET'])
@require_auth
def get_adaptation_insights(user_id):
    """Get insights about user's adaptation history"""
    try:
        insights = enhanced_adaptive_engine.get_adaptation_insights(user_id)
        
        return jsonify({
            'user_id': user_id,
            'adaptation_insights': insights,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get adaptation insights: {str(e)}'}), 500

@app.route('/api/skill-assessment/<user_id>', methods=['GET'])
@require_auth
def assess_skills(user_id):
    """Get comprehensive skill assessment for user"""
    try:
        skill_levels = skill_analyzer.assess_user_skills(user_id)
        
        # Convert skill levels to serializable format
        serializable_skills = {}
        for concept, skill in skill_levels.items():
            serializable_skills[concept] = {
                'concept': skill.concept,
                'mastery_score': skill.mastery_score,
                'confidence_interval': skill.confidence_interval,
                'sample_size': skill.sample_size,
                'last_assessment': skill.last_assessment.isoformat(),
                'progression_rate': skill.progression_rate,
                'stability_score': skill.stability_score
            }
        
        return jsonify({
            'user_id': user_id,
            'skill_levels': serializable_skills,
            'total_concepts_assessed': len(skill_levels),
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to assess skills: {str(e)}'}), 500

@app.route('/api/skill-gaps/<user_id>', methods=['GET'])
@require_auth
def identify_skill_gaps(user_id):
    """Identify skill gaps and improvement opportunities"""
    try:
        gaps = skill_analyzer.identify_skill_gaps(user_id)
        
        # Convert gaps to serializable format
        serializable_gaps = []
        for gap in gaps:
            serializable_gaps.append({
                'concept': gap.concept,
                'gap_severity': gap.gap_severity,
                'current_level': gap.current_level,
                'target_level': gap.target_level,
                'blocking_dependencies': gap.blocking_dependencies,
                'prerequisite_gaps': gap.prerequisite_gaps,
                'evidence': gap.evidence,
                'impact_score': gap.impact_score,
                'difficulty_estimation': gap.difficulty_estimation,
                'time_investment_needed': gap.time_investment_needed
            })
        
        return jsonify({
            'user_id': user_id,
            'skill_gaps': serializable_gaps,
            'total_gaps_identified': len(gaps),
            'critical_gaps': len([g for g in gaps if g.gap_severity >= 0.8]),
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to identify skill gaps: {str(e)}'}), 500

@app.route('/api/improvement-path/<user_id>/<concept>', methods=['GET'])
@require_auth
def get_improvement_path(user_id, concept):
    """Get structured improvement path for specific concept"""
    try:
        improvement_path = skill_analyzer.generate_improvement_path(user_id, concept)
        
        # Convert to serializable format
        serializable_path = {
            'target_concept': improvement_path.target_concept,
            'learning_sequence': improvement_path.learning_sequence,
            'milestones': improvement_path.milestones,
            'total_time_estimate': improvement_path.total_time_estimate,
            'difficulty_curve': improvement_path.difficulty_curve,
            'success_criteria': improvement_path.success_criteria,
            'recommended_resources': improvement_path.recommended_resources,
            'practice_problems': improvement_path.practice_problems
        }
        
        return jsonify({
            'user_id': user_id,
            'target_concept': concept,
            'improvement_path': serializable_path,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate improvement path: {str(e)}'}), 500

@app.route('/api/learning-recommendations/<user_id>', methods=['GET'])
@require_auth
def get_learning_recommendations(user_id):
    """Get prioritized learning recommendations"""
    try:
        limit = request.args.get('limit', 10, type=int)
        recommendations = skill_analyzer.generate_learning_recommendations(user_id, limit)
        
        # Convert to serializable format
        serializable_recommendations = []
        for rec in recommendations:
            serializable_recommendations.append({
                'recommendation_type': rec.recommendation_type,
                'priority': rec.priority,
                'title': rec.title,
                'description': rec.description,
                'specific_actions': rec.specific_actions,
                'success_metrics': rec.success_metrics,
                'estimated_time': rec.estimated_time,
                'difficulty_level': rec.difficulty_level,
                'concepts_addressed': rec.concepts_addressed
            })
        
        return jsonify({
            'user_id': user_id,
            'recommendations': serializable_recommendations,
            'total_recommendations': len(recommendations),
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate learning recommendations: {str(e)}'}), 500

@app.route('/api/skill-roadmap/<user_id>', methods=['GET'])
@require_auth
def get_skill_roadmap(user_id):
    """Get comprehensive skill development roadmap"""
    try:
        target_level = request.args.get('target_level', 'advanced')
        roadmap = skill_analyzer.get_skill_development_roadmap(user_id, target_level)
        
        return jsonify({
            'user_id': user_id,
            'roadmap': roadmap,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate skill roadmap: {str(e)}'}), 500

@app.route('/api/ai-dashboard/<user_id>', methods=['GET'])
@require_auth
def get_ai_dashboard(user_id):
    """Get comprehensive AI-powered learning dashboard"""
    try:
        # Gather all AI insights
        patterns = learning_analytics.analyze_learning_patterns(user_id, 30)
        insights = learning_analytics.generate_learning_insights(user_id)
        recommendations = learning_analytics.get_personalized_recommendations(user_id)
        
        difficulty_state = enhanced_adaptive_engine.get_difficulty_state(user_id)
        performance_metrics = enhanced_adaptive_engine.calculate_performance_metrics(user_id)
        
        skill_levels = skill_analyzer.assess_user_skills(user_id)
        skill_gaps = skill_analyzer.identify_skill_gaps(user_id)
        learning_recs = skill_analyzer.generate_learning_recommendations(user_id, 5)
        
        # Create comprehensive dashboard
        dashboard = {
            'user_id': user_id,
            'learning_analytics': {
                'patterns': patterns,
                'insights_count': len(insights),
                'top_insights': [asdict(insight) for insight in insights[:3]]
            },
            'adaptive_difficulty': {
                'current_difficulty': difficulty_state.current_difficulty,
                'confidence_level': difficulty_state.confidence_level,
                'performance_score': enhanced_adaptive_engine._calculate_composite_performance_score(performance_metrics)
            },
            'skill_assessment': {
                'total_concepts': len(skill_levels),
                'mastered_concepts': len([s for s in skill_levels.values() if s.mastery_score >= 0.7]),
                'skill_gaps_count': len(skill_gaps),
                'critical_gaps': len([g for g in skill_gaps if g.gap_severity >= 0.8])
            },
            'ai_recommendations': {
                'immediate_actions': recommendations.get('immediate_actions', [])[:3],
                'study_plan': recommendations.get('study_plan', [])[:3],
                'priority_recommendations': [
                    {
                        'title': rec.title,
                        'priority': rec.priority,
                        'estimated_time': rec.estimated_time,
                        'concepts': rec.concepts_addressed
                    } for rec in learning_recs[:3]
                ]
            },
            'learning_velocity': patterns.get('learning_velocity', {}),
            'next_optimal_difficulty': enhanced_adaptive_engine.get_optimal_problem_difficulty(user_id),
            'generated_at': datetime.now().isoformat()
        }
        
        return jsonify(dashboard)
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate AI dashboard: {str(e)}'}), 500


# ===========================
# Phase 4: Advanced Analytics Dashboard API Endpoints
# ===========================

@app.route('/api/dashboard/comprehensive/<user_id>', methods=['GET'])
def get_comprehensive_dashboard(user_id):
    """Get comprehensive dashboard data for a user"""
    try:
        force_refresh = request.args.get('refresh', 'false').lower() == 'true'
        dashboard_data = dashboard_service.get_comprehensive_dashboard(user_id, force_refresh)
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': f'Failed to get dashboard data: {str(e)}'}), 500

@app.route('/api/dashboard/metrics/<user_id>', methods=['GET'])
def get_user_metrics(user_id):
    """Get comprehensive user metrics"""
    try:
        metrics = dashboard_service.get_user_metrics(user_id)
        return jsonify(asdict(metrics))
    except Exception as e:
        return jsonify({'error': f'Failed to get user metrics: {str(e)}'}), 500

@app.route('/api/dashboard/performance/<user_id>', methods=['GET'])
def get_performance_overview(user_id):
    """Get performance overview with charts"""
    try:
        overview = dashboard_service.get_performance_overview(user_id)
        return jsonify(overview)
    except Exception as e:
        return jsonify({'error': f'Failed to get performance overview: {str(e)}'}), 500

@app.route('/api/dashboard/progress/<user_id>', methods=['GET'])
def get_learning_progress_dashboard(user_id):
    """Get detailed learning progress for dashboard"""
    try:
        progress = dashboard_service.get_learning_progress(user_id)
        return jsonify(progress)
    except Exception as e:
        return jsonify({'error': f'Failed to get learning progress: {str(e)}'}), 500

@app.route('/api/dashboard/activity/<user_id>', methods=['GET'])
def get_activity_timeline(user_id):
    """Get user activity timeline"""
    try:
        days = int(request.args.get('days', 30))
        timeline = dashboard_service.get_activity_timeline(user_id, days)
        return jsonify({'timeline': timeline})
    except Exception as e:
        return jsonify({'error': f'Failed to get activity timeline: {str(e)}'}), 500

@app.route('/api/dashboard/alerts/<user_id>', methods=['GET'])
def get_user_alerts(user_id):
    """Get user alerts and notifications"""
    try:
        alerts = dashboard_service.get_user_alerts(user_id)
        return jsonify({'alerts': [asdict(alert) for alert in alerts]})
    except Exception as e:
        return jsonify({'error': f'Failed to get alerts: {str(e)}'}), 500

@app.route('/api/dashboard/trends/<user_id>', methods=['GET'])
def get_trend_analysis(user_id):
    """Get comprehensive trend analysis"""
    try:
        trends = dashboard_service.get_trend_analysis(user_id)
        return jsonify(trends)
    except Exception as e:
        return jsonify({'error': f'Failed to get trend analysis: {str(e)}'}), 500

@app.route('/api/dashboard/comparisons/<user_id>', methods=['GET'])
def get_peer_comparisons(user_id):
    """Get peer comparison data"""
    try:
        comparisons = dashboard_service.get_peer_comparisons(user_id)
        return jsonify(comparisons)
    except Exception as e:
        return jsonify({'error': f'Failed to get peer comparisons: {str(e)}'}), 500

@app.route('/api/dashboard/goals/<user_id>', methods=['GET'])
def get_learning_goals(user_id):
    """Get learning goals status"""
    try:
        goals = dashboard_service.get_learning_goals_status(user_id)
        return jsonify(goals)
    except Exception as e:
        return jsonify({'error': f'Failed to get learning goals: {str(e)}'}), 500

@app.route('/api/dashboard/cache/invalidate/<user_id>', methods=['POST'])
def invalidate_dashboard_cache(user_id):
    """Invalidate dashboard cache for a user"""
    try:
        dashboard_service.invalidate_user_cache(user_id)
        return jsonify({'message': 'Cache invalidated successfully'})
    except Exception as e:
        return jsonify({'error': f'Failed to invalidate cache: {str(e)}'}), 500

# Analytics Service Endpoints
@app.route('/api/analytics/performance/<user_id>', methods=['GET'])
def get_performance_metrics(user_id):
    """Get comprehensive performance metrics"""
    try:
        time_window_days = int(request.args.get('days', 30))
        time_window = timedelta(days=time_window_days)
        metrics = analytics_service.calculate_comprehensive_metrics(user_id, time_window)
        return jsonify(asdict(metrics))
    except Exception as e:
        return jsonify({'error': f'Failed to get performance metrics: {str(e)}'}), 500

@app.route('/api/analytics/trends/<user_id>/<metric_name>', methods=['GET'])
def get_performance_trends(user_id, metric_name):
    """Get performance trends for specific metrics"""
    try:
        time_period = request.args.get('period', '30_days')
        trend_analysis = analytics_service.analyze_performance_trends(user_id, metric_name, time_period)
        return jsonify(asdict(trend_analysis))
    except Exception as e:
        return jsonify({'error': f'Failed to get trends: {str(e)}'}), 500

@app.route('/api/analytics/comparison/<user_id>', methods=['GET'])
def get_performance_comparison(user_id):
    """Get performance comparison data"""
    try:
        comparison_type = request.args.get('type', 'peer')
        comparison = analytics_service.compare_performance(user_id, comparison_type)
        return jsonify(asdict(comparison))
    except Exception as e:
        return jsonify({'error': f'Failed to get comparison: {str(e)}'}), 500

@app.route('/api/analytics/concept/<user_id>/<concept>', methods=['GET'])
def get_concept_analysis(user_id, concept):
    """Get detailed analysis for a specific concept"""
    try:
        analysis = analytics_service.get_detailed_concept_analysis(user_id, concept)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': f'Failed to get concept analysis: {str(e)}'}), 500

@app.route('/api/analytics/velocity/<user_id>', methods=['GET'])
def get_learning_velocity(user_id):
    """Get learning velocity metrics"""
    try:
        velocity = analytics_service.calculate_learning_velocity(user_id)
        return jsonify(velocity)
    except Exception as e:
        return jsonify({'error': f'Failed to get learning velocity: {str(e)}'}), 500

@app.route('/api/analytics/insights/<user_id>', methods=['GET'])
def get_performance_insights(user_id):
    """Get actionable performance insights"""
    try:
        insights = analytics_service.generate_performance_insights(user_id)
        return jsonify({'insights': insights})
    except Exception as e:
        return jsonify({'error': f'Failed to get insights: {str(e)}'}), 500

# Prediction Models Endpoints
@app.route('/api/predictions/progress/<user_id>', methods=['GET'])
def predict_learning_progress(user_id):
    """Predict learning progress for a user"""
    try:
        time_horizon = int(request.args.get('days', 30))
        model_type = request.args.get('model', 'ensemble')
        
        try:
            model_enum = getattr(prediction_models.PredictionModel, model_type.upper())
        except AttributeError:
            model_enum = prediction_models.PredictionModel.ENSEMBLE
        
        prediction = prediction_models.predict_learning_progress(user_id, time_horizon, model_enum)
        return jsonify(asdict(prediction))
    except Exception as e:
        return jsonify({'error': f'Failed to predict progress: {str(e)}'}), 500

@app.route('/api/predictions/trajectory/<user_id>', methods=['GET'])
def predict_learning_trajectory(user_id):
    """Predict complete learning trajectory"""
    try:
        trajectory = prediction_models.predict_learning_trajectory(user_id)
        return jsonify(asdict(trajectory))
    except Exception as e:
        return jsonify({'error': f'Failed to predict trajectory: {str(e)}'}), 500

@app.route('/api/predictions/performance/<user_id>', methods=['GET'])
def forecast_performance(user_id):
    """Forecast future performance metrics"""
    try:
        metrics = request.args.getlist('metrics')
        if not metrics:
            metrics = ['accuracy', 'speed', 'consistency', 'overall_performance']
        
        forecasts = prediction_models.forecast_performance_metrics(user_id, metrics)
        return jsonify({'forecasts': [asdict(forecast) for forecast in forecasts]})
    except Exception as e:
        return jsonify({'error': f'Failed to forecast performance: {str(e)}'}), 500

@app.route('/api/predictions/concept/<user_id>/<concept>', methods=['GET'])
def predict_concept_mastery(user_id, concept):
    """Predict concept mastery timeline"""
    try:
        prediction = prediction_models.predict_concept_mastery(user_id, concept)
        return jsonify(prediction)
    except Exception as e:
        return jsonify({'error': f'Failed to predict concept mastery: {str(e)}'}), 500

@app.route('/api/predictions/schedule/<user_id>', methods=['GET'])
def predict_optimal_schedule(user_id):
    """Predict optimal study schedule"""
    try:
        schedule = prediction_models.predict_optimal_study_schedule(user_id)
        return jsonify(schedule)
    except Exception as e:
        return jsonify({'error': f'Failed to predict schedule: {str(e)}'}), 500

@app.route('/api/predictions/intervention/<user_id>', methods=['POST'])
def predict_intervention_outcomes(user_id):
    """Predict outcomes of learning interventions"""
    try:
        intervention = request.json
        if not intervention:
            return jsonify({'error': 'Intervention data required'}), 400
        
        outcomes = prediction_models.predict_learning_outcomes(user_id, intervention)
        return jsonify(outcomes)
    except Exception as e:
        return jsonify({'error': f'Failed to predict intervention outcomes: {str(e)}'}), 500

# Real-time Updates
@app.route('/api/dashboard/updates/<user_id>', methods=['GET'])
def get_real_time_updates(user_id):
    """Get recent real-time updates"""
    try:
        limit = int(request.args.get('limit', 10))
        updates = dashboard_service.get_recent_updates(user_id, limit)
        return jsonify({'updates': [asdict(update) for update in updates]})
    except Exception as e:
        return jsonify({'error': f'Failed to get updates: {str(e)}'}), 500

@app.route('/api/dashboard/updates/<user_id>', methods=['POST'])
def add_real_time_update(user_id):
    """Add a real-time update"""
    try:
        update_data = request.json
        dashboard_service.add_real_time_update(
            user_id,
            update_data['metric_type'],
            update_data['old_value'],
            update_data['new_value'],
            update_data.get('impact_level', 'medium')
        )
        return jsonify({'message': 'Update added successfully'})
    except Exception as e:
        return jsonify({'error': f'Failed to add update: {str(e)}'}), 500

# ===========================
# Real-time Dashboard API Endpoints
# ===========================

@app.route('/api/realtime/dashboard/<user_id>', methods=['GET'])
def get_realtime_dashboard_data(user_id):
    """Get comprehensive real-time dashboard data"""
    try:
        dashboard_data = dashboard_service.get_realtime_dashboard_data(user_id)
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': f'Failed to get real-time dashboard data: {str(e)}'}), 500

@app.route('/api/realtime/stats/<user_id>', methods=['GET'])
def get_live_user_stats(user_id):
    """Get live user statistics"""
    try:
        stats = dashboard_service.get_live_user_stats(user_id)
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': f'Failed to get live stats: {str(e)}'}), 500

@app.route('/api/realtime/activity/<user_id>', methods=['GET'])
def get_realtime_activity(user_id):
    """Get real-time activity feed"""
    try:
        limit = int(request.args.get('limit', 10))
        activities = dashboard_service.get_recent_activity(user_id, limit)
        return jsonify({'activities': activities})
    except Exception as e:
        return jsonify({'error': f'Failed to get activity feed: {str(e)}'}), 500

@app.route('/api/realtime/skills/<user_id>', methods=['GET'])
def get_realtime_skill_progress(user_id):
    """Get real-time skill progress"""
    try:
        skill_progress = dashboard_service.get_skill_progress_realtime(user_id)
        return jsonify(skill_progress)
    except Exception as e:
        return jsonify({'error': f'Failed to get skill progress: {str(e)}'}), 500

@app.route('/api/realtime/achievements/<user_id>', methods=['GET'])
def get_realtime_achievements(user_id):
    """Get recent achievements"""
    try:
        achievements = dashboard_service.get_recent_achievements(user_id)
        return jsonify({'achievements': achievements})
    except Exception as e:
        return jsonify({'error': f'Failed to get achievements: {str(e)}'}), 500

@app.route('/api/realtime/leaderboard/<user_id>', methods=['GET'])
def get_realtime_leaderboard(user_id):
    """Get real-time leaderboard position"""
    try:
        leaderboard_data = dashboard_service.get_user_leaderboard_position(user_id)
        return jsonify(leaderboard_data)
    except Exception as e:
        return jsonify({'error': f'Failed to get leaderboard data: {str(e)}'}), 500

@app.route('/api/realtime/notify-activity', methods=['POST'])
@require_auth
def notify_user_activity():
    """Notify of user activity for real-time updates"""
    try:
        data = request.json
        user_id = data.get('user_id')
        activity_type = data.get('activity_type')
        activity_data = data.get('activity_data', {})
        
        if not user_id or not activity_type:
            return jsonify({'error': 'user_id and activity_type required'}), 400
        
        # Send real-time notification
        realtime_service.send_activity_update(user_id, {
            'type': activity_type,
            'data': activity_data
        })
        
        return jsonify({'message': 'Activity notification sent'})
    except Exception as e:
        return jsonify({'error': f'Failed to notify activity: {str(e)}'}), 500

@app.route('/api/realtime/notify-achievement', methods=['POST'])
@require_auth
def notify_achievement():
    """Notify of achievement unlock for real-time updates"""
    try:
        data = request.json
        user_id = data.get('user_id')
        achievement_data = data.get('achievement_data', {})
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        # Send real-time achievement notification
        realtime_service.send_achievement_notification(user_id, achievement_data)
        
        return jsonify({'message': 'Achievement notification sent'})
    except Exception as e:
        return jsonify({'error': f'Failed to notify achievement: {str(e)}'}), 500

@app.route('/api/realtime/notify-progress', methods=['POST'])
@require_auth
def notify_progress_update():
    """Notify of progress update for real-time dashboard"""
    try:
        data = request.json
        user_id = data.get('user_id')
        progress_data = data.get('progress_data', {})
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        # Send real-time progress update
        realtime_service.send_progress_update(user_id, progress_data)
        
        return jsonify({'message': 'Progress notification sent'})
    except Exception as e:
        return jsonify({'error': f'Failed to notify progress: {str(e)}'}), 500

@app.route('/api/realtime/active-users', methods=['GET'])
def get_active_users():
    """Get list of currently active users"""
    try:
        active_users = realtime_service.get_active_users()
        user_count = realtime_service.get_user_count()
        
        return jsonify({
            'active_users': active_users,
            'total_count': user_count,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get active users: {str(e)}'}), 500


if __name__ == '__main__':
    # Use SocketIO's run method instead of app.run for WebSocket support
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)