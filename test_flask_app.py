
import json
import os
from flask import Flask, jsonify

app = Flask(__name__)

# Change to Backend directory for file access
os.chdir('Backend')

# Load questions
try:
    with open('problems.json', 'r', encoding='utf-8') as f:
        problems = json.load(f)
    print(f"✅ Loaded {len(problems)} questions successfully")
except Exception as e:
    print(f"❌ Error loading questions: {e}")
    problems = []

@app.route('/api/problems')
def get_problems():
    return jsonify({
        'success': True,
        'count': len(problems),
        'problems': problems[:10]  # Return first 10 for testing
    })

@app.route('/api/problems/<int:problem_id>')
def get_problem(problem_id):
    problem = next((p for p in problems if p['id'] == problem_id), None)
    if problem:
        return jsonify({'success': True, 'problem': problem})
    else:
        return jsonify({'success': False, 'error': 'Problem not found'}), 404

@app.route('/test')
def test_endpoint():
    return jsonify({
        'message': 'Randomized questions API is working!',
        'total_questions': len(problems),
        'sample_question': problems[0] if problems else None
    })

if __name__ == '__main__':
    print("🚀 Starting Flask test server...")
    app.run(debug=True, host='127.0.0.1', port=5000)
