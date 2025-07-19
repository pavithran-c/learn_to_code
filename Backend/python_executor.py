import subprocess
import tempfile
import os

def execute_python_code(code: str) -> dict:
    """
    Executes Python code in a temporary file and returns the output and errors.
    """
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp:
        temp.write(code)
        temp_filename = temp.name

    try:
        result = subprocess.run(
            ['python', temp_filename],
            capture_output=True,
            text=True,
            timeout=5  # prevent infinite loops
        )
        return {
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            'stdout': '',
            'stderr': 'Execution timed out.',
            'returncode': -1
        }
    finally:
        os.remove(temp_filename)