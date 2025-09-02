import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { 
  Play, Square, RotateCcw, Save, Download, Upload, Settings,
  CheckCircle, XCircle, Clock, MemoryStick, Zap, Target,
  TrendingUp, AlertTriangle, Lightbulb, Brain, Award,
  Code, Timer, Gauge, Activity, Star, BookOpen
} from 'lucide-react';

const Compiler = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [showAdaptiveRecommendation, setShowAdaptiveRecommendation] = useState(false);
  const [userId] = useState('student_' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (selectedProblem) {
      const starterCode = selectedProblem.starter_code[language] || '';
      setCode(starterCode);
    }
  }, [selectedProblem, language]);

  const fetchProblems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/problems');
      const data = await response.json();
      setProblems(data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const getNextAdaptiveProblem = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/adaptive/next_problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedProblem(data.problem);
        setShowAdaptiveRecommendation(true);
        
        // Show recommendation reason
        setTimeout(() => {
          alert(`Recommended: ${data.recommendation_reason}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting adaptive recommendation:', error);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      const endpoint = language === 'python' ? '/run/python' : '/run/java';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const result = await response.json();
      setOutput(result.stdout || result.stderr || 'No output');
    } catch (error) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!selectedProblem) {
      alert('Please select a problem first!');
      return;
    }

    setIsRunning(true);
    setTestResults(null);
    setEvaluationResults(null);

    try {
      const response = await fetch('http://localhost:5000/api/submit_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: selectedProblem.id,
          code: code,
          language: language,
          user_id: userId
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults(result);
        setEvaluationResults(result);
      } else {
        const error = await response.json();
        setOutput('Error: ' + (error.message || 'Submission failed'));
      }
    } catch (error) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const languageExtension = language === 'python' ? python() : java();

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-600" />
              Smart Code Compiler
            </h1>
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getNextAdaptiveProblem}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span>AI Recommend</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </motion.button>

            {selectedProblem && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={submitSolution}
                disabled={isRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Target className="w-4 h-4" />
                <span>Submit Solution</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Selection */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Problems</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {problems.map((problem) => (
              <motion.div
                key={problem.id}
                whileHover={{ x: 5 }}
                onClick={() => setSelectedProblem(problem)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedProblem?.id === problem.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{problem.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{problem.description}</p>
                {problem.concepts && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {problem.concepts.slice(0, 3).map((concept, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {concept.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Problem Details */}
          {selectedProblem && (
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900">{selectedProblem.title}</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedProblem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      selectedProblem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedProblem.difficulty}
                    </span>
                    {selectedProblem.time_limit_ms && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {selectedProblem.time_limit_ms / 1000}s
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{selectedProblem.description}</p>
                
                {/* Show adaptive recommendation */}
                <AnimatePresence>
                  {showAdaptiveRecommendation && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-800 font-medium">
                          AI Recommended based on your learning progress
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sample test cases */}
                {selectedProblem.test_cases && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-800 mb-2">Sample Test Cases:</h4>
                    <div className="space-y-2">
                      {selectedProblem.test_cases
                        .filter(tc => tc.type === 'public')
                        .slice(0, 2)
                        .map((testCase, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                          <div><strong>Input:</strong> {JSON.stringify(testCase.input)}</div>
                          <div><strong>Output:</strong> {JSON.stringify(testCase.output)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Code Editor and Results */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <div className="p-3 bg-gray-100 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Code Editor</span>
              </div>
              <div className="flex-1">
                <CodeMirror
                  value={code}
                  onChange={(val) => setCode(val)}
                  extensions={[languageExtension]}
                  theme={oneDark}
                  style={{
                    fontSize: '14px',
                    height: '100%'
                  }}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    dropCursor: false,
                    allowMultipleSelections: false
                  }}
                />
              </div>
            </div>

            {/* Results Panel */}
            <div className="w-1/2 border-l border-gray-200 bg-white flex flex-col">
              <div className="p-3 bg-gray-100 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Results & Analysis</span>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {/* Evaluation Results */}
                {evaluationResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 space-y-6"
                  >
                    {/* Score Overview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-3xl font-bold ${getScoreColor(evaluationResults.scores?.overall || 0)}`}>
                          {Math.round(evaluationResults.scores?.overall || 0)}
                        </div>
                        <div className="text-sm text-gray-600">Overall Score</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Correctness</span>
                          <span className={getScoreColor(evaluationResults.scores?.correctness || 0)}>
                            {Math.round(evaluationResults.scores?.correctness || 0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Efficiency</span>
                          <span className={getScoreColor(evaluationResults.scores?.efficiency || 0)}>
                            {Math.round(evaluationResults.scores?.efficiency || 0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Quality</span>
                          <span className={getScoreColor(evaluationResults.scores?.quality || 0)}>
                            {Math.round(evaluationResults.scores?.quality || 0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Test Results Summary */}
                    {evaluationResults.results && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Test Results
                        </h4>
                        <div className="space-y-2">
                          {evaluationResults.results.map((test, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg border ${
                                test.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  Test Case {index + 1}
                                </span>
                                {test.passed ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              {test.execution_time_ms && (
                                <div className="text-xs text-gray-600">
                                  Execution: {test.execution_time_ms}ms
                                </div>
                              )}
                              {!test.passed && test.error && (
                                <div className="text-xs text-red-600 mt-1">
                                  Error: {test.error}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hidden Tests */}
                    {evaluationResults.hidden_tests && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Hidden Test Cases
                        </h4>
                        <div className="text-sm text-blue-700">
                          Passed: {evaluationResults.hidden_tests.passed} / {evaluationResults.hidden_tests.total}
                          <span className="ml-2">
                            ({evaluationResults.hidden_tests.percentage}%)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {evaluationResults.performance && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-purple-600" />
                          Performance Analysis
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <Timer className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">Execution Time</span>
                            </div>
                            <span className="text-sm font-medium">
                              {evaluationResults.performance.execution_time_ms}ms
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <MemoryStick className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Memory Usage</span>
                            </div>
                            <span className="text-sm font-medium">
                              {evaluationResults.performance.memory_peak_mb}MB
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <Gauge className="w-4 h-4 text-purple-600" />
                              <span className="text-sm">Time Complexity</span>
                            </div>
                            <span className="text-sm font-medium">
                              {evaluationResults.performance.time_complexity}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Adaptive Learning Data */}
                    {evaluationResults.adaptive_data && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Learning Analytics
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-purple-700">Skill Level (θ)</div>
                            <div className="font-medium">{evaluationResults.adaptive_data.user_theta}</div>
                          </div>
                          <div>
                            <div className="text-purple-700">ELO Rating</div>
                            <div className="font-medium">{evaluationResults.adaptive_data.user_elo}</div>
                          </div>
                          <div>
                            <div className="text-purple-700">Accuracy</div>
                            <div className="font-medium">
                              {(evaluationResults.adaptive_data.accuracy * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-purple-700">Concepts</div>
                            <div className="font-medium">
                              {Object.keys(evaluationResults.adaptive_data.concept_mastery || {}).length}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {evaluationResults.feedback && evaluationResults.feedback.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                          Feedback
                        </h4>
                        <div className="space-y-2">
                          {evaluationResults.feedback.map((feedback, index) => (
                            <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                              {feedback}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hints */}
                    {evaluationResults.hints && evaluationResults.hints.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          Hints for Improvement
                        </h4>
                        <div className="space-y-2">
                          {evaluationResults.hints.map((hint, index) => (
                            <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                              {hint}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Regular Output */}
                {!evaluationResults && (
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Output</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                      {output || 'Run your code to see output here...'}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compiler;
