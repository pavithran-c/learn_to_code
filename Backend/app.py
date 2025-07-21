from flask import Flask, request, jsonify
from Python_Compiler.python_executor import execute_python_code
from Java_Compiler.java_executor import execute_java_code
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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