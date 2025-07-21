import subprocess
import tempfile
import os
import shutil
import re

def execute_java_code(code: str) -> dict:
    """
    Compiles and executes Java code in a Docker container and returns the output and errors.
    """
    # Extract class name from code
    match = re.search(r'public\s+class\s+(\w+)', code)
    class_name = match.group(1) if match else "Main"
    java_file = None
    temp_dir = tempfile.mkdtemp()
    java_file = os.path.join(temp_dir, f"{class_name}.java")
    with open(java_file, "w") as f:
        f.write(code)

    try:
        # Compile Java code inside Docker
        compile_result = subprocess.run(
            [
                'docker', 'run', '--rm',
                '-v', f'{temp_dir}:/usr/src/myapp',
                '--network', 'none',
                '--memory', '256m',
                '--cpus', '0.5',
                'openjdk:21-jdk',
                'sh', '-c', f'javac /usr/src/myapp/{class_name}.java'
            ],
            capture_output=True,
            text=True,
            timeout=10
        )

        if compile_result.returncode != 0:
            return {
                'stdout': '',
                'stderr': compile_result.stderr,
                'returncode': compile_result.returncode
            }

        # Run Java code inside Docker
        run_result = subprocess.run(
            [
                'docker', 'run', '--rm',
                '-v', f'{temp_dir}:/usr/src/myapp',
                '--network', 'none',
                '--memory', '256m',
                '--cpus', '0.5',
                'openjdk:21-jdk',
                'sh', '-c', f'cd /usr/src/myapp && java {class_name}'
            ],
            capture_output=True,
            text=True,
            timeout=10
        )

        return {
            'stdout': run_result.stdout,
            'stderr': run_result.stderr,
            'returncode': run_result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            'stdout': '',
            'stderr': 'Execution timed out.',
            'returncode': -1
        }
    finally:
        shutil.rmtree(temp_dir)