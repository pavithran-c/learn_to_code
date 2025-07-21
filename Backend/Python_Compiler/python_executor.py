import subprocess
import tempfile
import os
import sys

def execute_python_code(code: str) -> dict:
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, dir=None) as temp:
        temp.write(code)
        temp_filename = temp.name
        temp_dir = os.path.dirname(temp_filename)
        file_name = os.path.basename(temp_filename)

    # Convert Windows path to Docker path
    docker_dir = temp_dir.replace("\\", "/")
    if sys.platform == "win32" and docker_dir[1] == ":":
        docker_dir = f"/{docker_dir[0].lower()}{docker_dir[2:]}"

    try:
        result = subprocess.run(
            [
                'docker', 'run', '--rm',
                '-v', f'{docker_dir}:/tmp',
                '--network', 'none',
                '--memory', '128m',
                '--cpus', '0.5',
                'pavithranc/my-java21:latest',
                'python3', f'/tmp/{file_name}'
            ],
            capture_output=True,
            text=True,
            timeout=5
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