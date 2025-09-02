import json
import ast
from flask import Flask, request, jsonify
from Python_Compiler.python_executor import execute_python_code
from Java_Compiler.java_executor import execute_java_code
from flask_cors import CORS
import requests
import time

app = Flask(__name__)
CORS(app)
# Load problems from JSON
with open('problems.json', 'r') as f:
    problems = json.load(f)

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

@app.route('/api/problem/<int:pid>', methods=['GET'])
def get_problem(pid):
    for p in problems:
        if p['id'] == pid:
            return jsonify(p)
    return jsonify({'error': 'Problem not found'}), 404

@app.route('/api/submit_code', methods=['POST'])
def submit_code():
    data = request.get_json()
    pid = data.get('problem_id')
    code = data.get('code')
    lang = data.get('language', 'python')
    # Find problem
    problem = next((p for p in problems if p['id'] == pid), None)
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    
    # Get starter code for the specific language
    starter_code = problem['starter_code']
    if isinstance(starter_code, dict):
        starter_code = starter_code.get(lang, '')
    
    # Prepare code for execution
    results = []
    for tc in problem['test_cases']:
        # For Python, build code to run function and check output
        if lang == 'python':
            # Extract function name from starter code
            if 'def ' in starter_code:
                func_name = starter_code.split('def ')[1].split('(')[0]
            else:
                # Fallback: try to extract from user code
                func_name = code.split('def ')[1].split('(')[0] if 'def ' in code else 'main'
            
            test_code = code + f"\nresult = {func_name}(*{tc['input']})\nprint(result)"
            exec_result = execute_python_code(test_code)
            # Try to parse output
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
        elif lang == 'java':
            # For Java, we need to modify the code to include test inputs
            # Extract method name from starter code
            if 'public ' in starter_code and '(' in starter_code:
                method_match = starter_code.split('public ')[1].split('(')[0].split()[-1]
                method_name = method_match
            else:
                method_name = 'solve'  # fallback method name
            
            # Create a test wrapper for Java
            java_test_code = code + f"""
public static void main(String[] args) {{
    Solution sol = new Solution();
    // Call the method with test inputs
    {method_name}({', '.join(str(inp) for inp in tc['input'])});
}}
"""
            # For now, let's use a simpler approach for Java
            exec_result = execute_java_code(java_test_code)
            try:
                output = ast.literal_eval(exec_result['stdout'].strip()) if exec_result['stdout'].strip() else None
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
        else:
            results.append({'error': f'Language {lang} not supported yet'})
    
    all_passed = all(r.get('passed', False) for r in results)
    return jsonify({'results': results, 'all_passed': all_passed})


# In-memory user progress (for demo)
user_progress = {}

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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)