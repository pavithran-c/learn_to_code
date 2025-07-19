from flask import Flask, request, jsonify
from python_executor import execute_python_code
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/run/python', methods=['POST'])
def run_python():
    data = request.get_json()
    code = data.get('code', '')
    result = execute_python_code(code)
    return jsonify(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)