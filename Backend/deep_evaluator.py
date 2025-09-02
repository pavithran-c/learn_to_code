"""
Deep Code Evaluation System
Advanced analysis of submitted code including:
- Hidden test cases
- Time/Space complexity analysis
- Code quality metrics
- Security analysis
- Performance profiling
"""

import ast
import re
import time
import subprocess
import tempfile
import os
import json
import psutil
import platform

# Handle resource module availability (Unix-only)
try:
    import resource
    HAS_RESOURCE = True
except ImportError:
    HAS_RESOURCE = False
    # Create mock resource module for Windows
    class MockResource:
        RUSAGE_SELF = 0
        def getrusage(self, who):
            return type('usage', (), {'ru_maxrss': 0})()
    resource = MockResource()

from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import hashlib
import math

@dataclass
class CodeQualityMetrics:
    """Code quality and style metrics"""
    cyclomatic_complexity: int = 0
    lines_of_code: int = 0
    cognitive_complexity: int = 0
    maintainability_index: float = 0.0
    code_duplication: float = 0.0
    style_violations: List[str] = None
    security_issues: List[str] = None
    
    def __post_init__(self):
        if self.style_violations is None:
            self.style_violations = []
        if self.security_issues is None:
            self.security_issues = []

@dataclass
class PerformanceMetrics:
    """Runtime performance metrics"""
    execution_time_ms: int = 0
    memory_peak_mb: float = 0.0
    cpu_usage_percent: float = 0.0
    time_complexity_estimate: str = "Unknown"
    space_complexity_estimate: str = "Unknown"
    timeout_occurred: bool = False
    memory_limit_exceeded: bool = False

@dataclass
class TestResult:
    """Individual test case result"""
    test_id: str
    input_data: Any
    expected_output: Any
    actual_output: Any
    passed: bool
    execution_time_ms: int
    memory_used_mb: float
    error_message: str = ""
    test_type: str = "public"  # public, hidden, edge, stress, property

@dataclass
class EvaluationResult:
    """Complete evaluation result"""
    problem_id: str
    user_id: str
    language: str
    submission_time: str
    code_hash: str
    
    # Test Results
    public_tests: List[TestResult]
    hidden_tests: List[TestResult]
    edge_tests: List[TestResult]
    stress_tests: List[TestResult]
    
    # Metrics
    quality_metrics: CodeQualityMetrics
    performance_metrics: PerformanceMetrics
    
    # Scoring
    correctness_score: float = 0.0  # 0-100
    efficiency_score: float = 0.0   # 0-100
    quality_score: float = 0.0      # 0-100
    overall_score: float = 0.0      # 0-100
    
    # Feedback
    feedback: List[str] = None
    hints: List[str] = None
    
    def __post_init__(self):
        if self.feedback is None:
            self.feedback = []
        if self.hints is None:
            self.hints = []

class DeepCodeEvaluator:
    """Advanced code evaluation system"""
    
    def __init__(self):
        self.security_patterns = {
            'eval_usage': re.compile(r'\beval\s*\('),
            'exec_usage': re.compile(r'\bexec\s*\('),
            'import_os': re.compile(r'import\s+os'),
            'subprocess': re.compile(r'import\s+subprocess'),
            'file_operations': re.compile(r'open\s*\(.*["\']w'),
            'network_calls': re.compile(r'urllib|requests|socket'),
        }
        
        self.complexity_keywords = {
            'loops': ['for', 'while'],
            'conditions': ['if', 'elif', 'else'],
            'functions': ['def'],
            'recursion_indicators': [r'return.*recursive', r'self\(', r'function_name\(']
        }
    
    def calculate_code_hash(self, code: str) -> str:
        """Generate hash for plagiarism detection"""
        # Normalize code by removing comments and whitespace
        normalized = re.sub(r'#.*$', '', code, flags=re.MULTILINE)
        normalized = re.sub(r'\s+', ' ', normalized.strip())
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def analyze_code_quality(self, code: str, language: str = "python") -> CodeQualityMetrics:
        """Analyze code quality metrics"""
        metrics = CodeQualityMetrics()
        
        if language == "python":
            try:
                tree = ast.parse(code)
                metrics.lines_of_code = len([line for line in code.split('\n') if line.strip()])
                metrics.cyclomatic_complexity = self._calculate_cyclomatic_complexity(tree)
                metrics.cognitive_complexity = self._calculate_cognitive_complexity(tree)
                metrics.style_violations = self._check_python_style(code)
                metrics.security_issues = self._check_security_issues(code)
                
                # Calculate maintainability index (simplified)
                volume = metrics.lines_of_code * 4.5  # Simplified Halstead volume
                metrics.maintainability_index = max(0, 171 - 5.2 * math.log(volume) - 
                                                   0.23 * metrics.cyclomatic_complexity - 16.2 * math.log(metrics.lines_of_code))
                
            except SyntaxError as e:
                metrics.style_violations.append(f"Syntax Error: {str(e)}")
        
        return metrics
    
    def _calculate_cyclomatic_complexity(self, tree: ast.AST) -> int:
        """Calculate McCabe cyclomatic complexity"""
        complexity = 1  # Base complexity
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.AsyncFor)):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
            elif isinstance(node, (ast.ExceptHandler,)):
                complexity += 1
        
        return complexity
    
    def _calculate_cognitive_complexity(self, tree: ast.AST) -> int:
        """Calculate cognitive complexity (simplified)"""
        complexity = 0
        nesting_level = 0
        
        class CognitiveComplexityVisitor(ast.NodeVisitor):
            def __init__(self):
                self.complexity = 0
                self.nesting_level = 0
            
            def visit_If(self, node):
                self.complexity += 1 + self.nesting_level
                self.nesting_level += 1
                self.generic_visit(node)
                self.nesting_level -= 1
            
            def visit_For(self, node):
                self.complexity += 1 + self.nesting_level
                self.nesting_level += 1
                self.generic_visit(node)
                self.nesting_level -= 1
            
            def visit_While(self, node):
                self.complexity += 1 + self.nesting_level
                self.nesting_level += 1
                self.generic_visit(node)
                self.nesting_level -= 1
        
        visitor = CognitiveComplexityVisitor()
        visitor.visit(tree)
        return visitor.complexity
    
    def _check_python_style(self, code: str) -> List[str]:
        """Check Python style guidelines (simplified PEP 8)"""
        violations = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Line length
            if len(line) > 88:
                violations.append(f"Line {i}: Line too long ({len(line)} characters)")
            
            # Trailing whitespace
            if line.endswith(' ') or line.endswith('\t'):
                violations.append(f"Line {i}: Trailing whitespace")
            
            # Function naming (simplified)
            if re.search(r'def [A-Z]', line):
                violations.append(f"Line {i}: Function name should be lowercase with underscores")
            
            # Variable naming
            if re.search(r'[a-z][A-Z]', line) and 'def ' not in line:
                violations.append(f"Line {i}: Variable name should be lowercase with underscores")
        
        return violations[:10]  # Limit to first 10 violations
    
    def _check_security_issues(self, code: str) -> List[str]:
        """Check for potential security issues"""
        issues = []
        
        for issue_name, pattern in self.security_patterns.items():
            if pattern.search(code):
                if issue_name == 'eval_usage':
                    issues.append("Avoid using eval() - potential security risk")
                elif issue_name == 'exec_usage':
                    issues.append("Avoid using exec() - potential security risk")
                elif issue_name == 'import_os':
                    issues.append("OS module usage detected - ensure safe usage")
                elif issue_name == 'subprocess':
                    issues.append("Subprocess usage detected - potential security risk")
                elif issue_name == 'file_operations':
                    issues.append("File write operations detected - ensure safe usage")
                elif issue_name == 'network_calls':
                    issues.append("Network operations detected - ensure safe usage")
        
        return issues
    
    def estimate_time_complexity(self, code: str, test_results: List[TestResult]) -> str:
        """Estimate time complexity from code analysis and test performance"""
        # Static analysis hints
        nested_loops = len(re.findall(r'for.*for', code, re.DOTALL))
        single_loops = len(re.findall(r'\bfor\b', code)) - nested_loops * 2
        recursive_calls = len(re.findall(r'return.*\w+\(', code))
        
        # Performance analysis from test results
        if len(test_results) >= 3:
            # Sort test results by input size (if available)
            input_sizes = []
            times = []
            
            for test in test_results:
                if isinstance(test.input_data, (list, str)):
                    size = len(test.input_data) if hasattr(test.input_data, '__len__') else 1
                elif isinstance(test.input_data, (int, float)):
                    size = abs(test.input_data)
                else:
                    size = 1
                
                input_sizes.append(size)
                times.append(test.execution_time_ms)
            
            if len(set(input_sizes)) >= 3:  # Need different input sizes
                # Simple heuristic based on time growth
                max_size_idx = input_sizes.index(max(input_sizes))
                min_size_idx = input_sizes.index(min(input_sizes))
                
                if input_sizes[max_size_idx] > input_sizes[min_size_idx] * 2:
                    time_ratio = times[max_size_idx] / max(1, times[min_size_idx])
                    size_ratio = input_sizes[max_size_idx] / max(1, input_sizes[min_size_idx])
                    
                    if time_ratio > size_ratio ** 1.5:
                        return "O(n²) or worse"
                    elif time_ratio > size_ratio * 1.2:
                        return "O(n log n)"
                    elif time_ratio > 1.2:
                        return "O(n)"
                    else:
                        return "O(1)"
        
        # Fallback to static analysis
        if nested_loops >= 2:
            return "O(n³) or worse"
        elif nested_loops == 1:
            return "O(n²)"
        elif single_loops > 0:
            return "O(n)"
        elif recursive_calls > 0:
            if 'fibonacci' in code.lower() or 'fib' in code.lower():
                return "O(2ⁿ)"
            else:
                return "O(n) or O(log n)"
        else:
            return "O(1)"
    
    def run_test_case(self, code: str, test_input: Any, expected_output: Any, 
                     language: str = "python", timeout: int = 5) -> TestResult:
        """Run a single test case with performance monitoring"""
        test_id = f"test_{hash((str(test_input), str(expected_output))) % 10000}"
        
        if language == "python":
            return self._run_python_test(code, test_input, expected_output, test_id, timeout)
        elif language == "java":
            return self._run_java_test(code, test_input, expected_output, test_id, timeout)
        else:
            return TestResult(
                test_id=test_id,
                input_data=test_input,
                expected_output=expected_output,
                actual_output=None,
                passed=False,
                execution_time_ms=0,
                memory_used_mb=0,
                error_message=f"Language {language} not supported"
            )
    
    def _run_python_test(self, code: str, test_input: Any, expected_output: Any, 
                        test_id: str, timeout: int) -> TestResult:
        """Run Python test case with monitoring"""
        import sys
        from io import StringIO
        import threading
        import tracemalloc
        
        # Prepare test execution
        old_stdout = sys.stdout
        sys.stdout = captured_output = StringIO()
        
        result = TestResult(
            test_id=test_id,
            input_data=test_input,
            expected_output=expected_output,
            actual_output=None,
            passed=False,
            execution_time_ms=0,
            memory_used_mb=0
        )
        
        try:
            # Start memory tracing
            tracemalloc.start()
            
            # Extract function name from code
            func_name = "solution"
            if "def " in code:
                func_name = re.search(r'def (\w+)', code).group(1)
            
            # Prepare execution environment
            exec_globals = {}
            
            start_time = time.time()
            
            # Execute the code
            exec(code, exec_globals)
            
            # Call the function
            if func_name in exec_globals:
                if isinstance(test_input, (list, tuple)):
                    actual_output = exec_globals[func_name](*test_input)
                else:
                    actual_output = exec_globals[func_name](test_input)
            else:
                # Fallback: execute code with input and capture output
                test_code = f"{code}\nresult = {func_name}({test_input})\nprint(result)"
                exec(test_code, exec_globals)
                actual_output = captured_output.getvalue().strip()
                try:
                    actual_output = ast.literal_eval(actual_output)
                except:
                    pass
            
            end_time = time.time()
            
            # Get memory usage
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop()
            
            result.actual_output = actual_output
            result.execution_time_ms = int((end_time - start_time) * 1000)
            result.memory_used_mb = peak / 1024 / 1024
            result.passed = self._compare_outputs(actual_output, expected_output)
            
        except Exception as e:
            result.error_message = str(e)
            result.actual_output = f"Error: {str(e)}"
            
        finally:
            sys.stdout = old_stdout
            if tracemalloc.is_tracing():
                tracemalloc.stop()
        
        return result
    
    def _compare_outputs(self, actual: Any, expected: Any, tolerance: float = 1e-9) -> bool:
        """Compare outputs with tolerance for floating point numbers"""
        if type(actual) != type(expected):
            # Try to convert if possible
            try:
                if isinstance(expected, (int, float)) and isinstance(actual, str):
                    actual = float(actual)
                elif isinstance(expected, str) and isinstance(actual, (int, float)):
                    actual = str(actual)
            except:
                return False
        
        if isinstance(actual, float) and isinstance(expected, float):
            return abs(actual - expected) < tolerance
        elif isinstance(actual, (list, tuple)) and isinstance(expected, (list, tuple)):
            if len(actual) != len(expected):
                return False
            return all(self._compare_outputs(a, e, tolerance) for a, e in zip(actual, expected))
        else:
            return actual == expected
    
    def generate_hidden_tests(self, problem_config: Dict) -> List[Tuple[Any, Any]]:
        """Generate additional hidden test cases based on problem type"""
        hidden_tests = []
        problem_type = problem_config.get('type', 'general')
        
        if problem_type == 'array_manipulation':
            # Add edge cases for arrays
            hidden_tests.extend([
                ([], problem_config.get('empty_result', [])),
                ([1], problem_config.get('single_result', [1])),
                ([-1, -2, -3], problem_config.get('negative_result', [-3, -2, -1]))
            ])
        
        elif problem_type == 'string_processing':
            # Add edge cases for strings
            hidden_tests.extend([
                ("", problem_config.get('empty_result', "")),
                ("a", problem_config.get('single_result', "a")),
                ("   ", problem_config.get('whitespace_result', "   "))
            ])
        
        elif problem_type == 'numerical':
            # Add edge cases for numbers
            hidden_tests.extend([
                (0, problem_config.get('zero_result', 0)),
                (-1, problem_config.get('negative_result', -1)),
                (1000000, problem_config.get('large_result', 1000000))
            ])
        
        return hidden_tests
    
    def evaluate_submission(self, problem_id: str, user_id: str, code: str, 
                          language: str, test_cases: List[Dict], 
                          problem_config: Dict = None) -> EvaluationResult:
        """Complete evaluation of a code submission"""
        
        if problem_config is None:
            problem_config = {}
        
        result = EvaluationResult(
            problem_id=problem_id,
            user_id=user_id,
            language=language,
            submission_time=datetime.now().isoformat(),
            code_hash=self.calculate_code_hash(code),
            public_tests=[],
            hidden_tests=[],
            edge_tests=[],
            stress_tests=[],
            quality_metrics=self.analyze_code_quality(code, language),
            performance_metrics=PerformanceMetrics()
        )
        
        all_tests = []
        
        # Run public tests
        for test_case in test_cases:
            test_result = self.run_test_case(
                code, test_case['input'], test_case['output'], language
            )
            test_result.test_type = test_case.get('type', 'public')
            
            if test_result.test_type == 'public':
                result.public_tests.append(test_result)
            elif test_result.test_type == 'hidden':
                result.hidden_tests.append(test_result)
            elif test_result.test_type in ['edge', 'stress']:
                result.edge_tests.append(test_result)
            
            all_tests.append(test_result)
        
        # Generate and run additional hidden tests
        hidden_test_cases = self.generate_hidden_tests(problem_config)
        for test_input, expected_output in hidden_test_cases:
            test_result = self.run_test_case(code, test_input, expected_output, language)
            test_result.test_type = 'hidden'
            result.hidden_tests.append(test_result)
            all_tests.append(test_result)
        
        # Calculate performance metrics
        if all_tests:
            result.performance_metrics.execution_time_ms = max(t.execution_time_ms for t in all_tests)
            result.performance_metrics.memory_peak_mb = max(t.memory_used_mb for t in all_tests)
            result.performance_metrics.time_complexity_estimate = self.estimate_time_complexity(code, all_tests)
        
        # Calculate scores
        result.correctness_score = self._calculate_correctness_score(all_tests)
        result.efficiency_score = self._calculate_efficiency_score(result.performance_metrics, problem_config)
        result.quality_score = self._calculate_quality_score(result.quality_metrics)
        result.overall_score = self._calculate_overall_score(result)
        
        # Generate feedback
        result.feedback = self._generate_feedback(result)
        result.hints = self._generate_hints(result, all_tests)
        
        return result
    
    def _calculate_correctness_score(self, tests: List[TestResult]) -> float:
        """Calculate correctness score based on test results"""
        if not tests:
            return 0.0
        
        # Weight different test types
        weights = {'public': 0.3, 'hidden': 0.5, 'edge': 0.15, 'stress': 0.05}
        total_weight = 0
        weighted_score = 0
        
        for test in tests:
            weight = weights.get(test.test_type, 0.3)
            total_weight += weight
            if test.passed:
                weighted_score += weight
        
        return (weighted_score / total_weight * 100) if total_weight > 0 else 0.0
    
    def _calculate_efficiency_score(self, metrics: PerformanceMetrics, config: Dict) -> float:
        """Calculate efficiency score based on performance"""
        score = 100.0
        
        # Time penalty
        time_limit = config.get('time_limit_ms', 1000)
        if metrics.execution_time_ms > time_limit:
            score -= 30
        elif metrics.execution_time_ms > time_limit * 0.8:
            score -= 15
        elif metrics.execution_time_ms > time_limit * 0.5:
            score -= 5
        
        # Memory penalty
        memory_limit = config.get('memory_limit_mb', 128)
        if metrics.memory_peak_mb > memory_limit:
            score -= 20
        elif metrics.memory_peak_mb > memory_limit * 0.8:
            score -= 10
        
        # Complexity penalty
        if "O(2ⁿ)" in metrics.time_complexity_estimate or "O(n³)" in metrics.time_complexity_estimate:
            score -= 25
        elif "O(n²)" in metrics.time_complexity_estimate and config.get('expected_complexity') == 'O(n)':
            score -= 15
        
        return max(0.0, score)
    
    def _calculate_quality_score(self, metrics: CodeQualityMetrics) -> float:
        """Calculate code quality score"""
        score = 100.0
        
        # Style violations
        score -= min(30, len(metrics.style_violations) * 3)
        
        # Security issues
        score -= min(25, len(metrics.security_issues) * 5)
        
        # Complexity penalties
        if metrics.cyclomatic_complexity > 10:
            score -= 15
        elif metrics.cyclomatic_complexity > 6:
            score -= 5
        
        if metrics.cognitive_complexity > 15:
            score -= 10
        
        return max(0.0, score)
    
    def _calculate_overall_score(self, result: EvaluationResult) -> float:
        """Calculate overall weighted score"""
        # Default weights
        correctness_weight = 0.6
        efficiency_weight = 0.25
        quality_weight = 0.15
        
        return (result.correctness_score * correctness_weight +
                result.efficiency_score * efficiency_weight +
                result.quality_score * quality_weight)
    
    def _generate_feedback(self, result: EvaluationResult) -> List[str]:
        """Generate personalized feedback"""
        feedback = []
        
        # Correctness feedback
        total_tests = len(result.public_tests) + len(result.hidden_tests) + len(result.edge_tests)
        passed_tests = sum(1 for tests in [result.public_tests, result.hidden_tests, result.edge_tests] 
                          for test in tests if test.passed)
        
        if passed_tests == total_tests:
            feedback.append("🎉 Excellent! All test cases passed.")
        elif passed_tests > total_tests * 0.8:
            feedback.append("✅ Good job! Most test cases passed. Check edge cases.")
        elif passed_tests > total_tests * 0.5:
            feedback.append("⚠️ Several test cases failed. Review your logic carefully.")
        else:
            feedback.append("❌ Many test cases failed. Consider a different approach.")
        
        # Performance feedback
        if result.performance_metrics.execution_time_ms > 1000:
            feedback.append("⏰ Your solution is slower than expected. Try to optimize.")
        
        if result.performance_metrics.memory_peak_mb > 128:
            feedback.append("💾 High memory usage detected. Consider more efficient data structures.")
        
        # Quality feedback
        if result.quality_metrics.style_violations:
            feedback.append(f"📝 Style issues found: {len(result.quality_metrics.style_violations)} violations.")
        
        if result.quality_metrics.security_issues:
            feedback.append("🔒 Security concerns detected in your code.")
        
        return feedback
    
    def _generate_hints(self, result: EvaluationResult, tests: List[TestResult]) -> List[str]:
        """Generate helpful hints based on failed tests"""
        hints = []
        
        failed_tests = [t for t in tests if not t.passed]
        
        if failed_tests:
            # Analyze failure patterns
            edge_failures = [t for t in failed_tests if t.test_type in ['edge', 'hidden']]
            
            if edge_failures:
                hints.append("💡 Consider edge cases like empty inputs, negative numbers, or boundary values.")
            
            # Check for common patterns in failures
            for test in failed_tests[:3]:  # Limit to first 3 failed tests
                if test.error_message:
                    if "index" in test.error_message.lower():
                        hints.append("💡 Check array bounds and indexing logic.")
                    elif "type" in test.error_message.lower():
                        hints.append("💡 Verify data types and type conversions.")
                    elif "recursion" in test.error_message.lower():
                        hints.append("💡 Check recursion base cases and depth limits.")
        
        # Performance hints
        if "O(2ⁿ)" in result.performance_metrics.time_complexity_estimate:
            hints.append("💡 Consider using dynamic programming or memoization.")
        elif "O(n²)" in result.performance_metrics.time_complexity_estimate:
            hints.append("💡 Look for opportunities to reduce nested loops.")
        
        return hints[:5]  # Limit to 5 hints

# Example usage
if __name__ == "__main__":
    evaluator = DeepCodeEvaluator()
    
    # Example code submission
    code = """
def sum_two(a, b):
    return a + b
"""
    
    test_cases = [
        {"input": [2, 3], "output": 5, "type": "public"},
        {"input": [-1, 1], "output": 0, "type": "hidden"},
        {"input": [0, 0], "output": 0, "type": "edge"}
    ]
    
    result = evaluator.evaluate_submission(
        problem_id="sum_two",
        user_id="test_user",
        code=code,
        language="python",
        test_cases=test_cases
    )
    
    print("Evaluation Result:")
    print(f"Overall Score: {result.overall_score:.1f}/100")
    print(f"Correctness: {result.correctness_score:.1f}/100")
    print(f"Efficiency: {result.efficiency_score:.1f}/100")
    print(f"Quality: {result.quality_score:.1f}/100")
    print("\nFeedback:")
    for feedback in result.feedback:
        print(f"  {feedback}")
    print("\nHints:")
    for hint in result.hints:
        print(f"  {hint}")
