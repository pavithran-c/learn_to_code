import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code, Play, Send, ChevronLeft, ChevronRight, Menu, X, Clock, CheckCircle, XCircle, Star, Flag, Copy, RotateCcw, Sun, Moon, Maximize, Minimize, BarChart2, FilePlus, Bug, Search, Sparkles } from 'lucide-react';
import Compiler from './Compiler';

// Simplified Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-600 rounded-lg">
          <h2>Error: {this.state.error?.message || 'Something went wrong'}</h2>
          <p>Please try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Mock question data
const mockQuestions = [
  {
    id: 1,
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of two numbers such that they add up to target.',
    constraints: '1 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', passed: null, runtime: null, memory: null },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', passed: null, runtime: null, memory: null },
    ],
    tags: ['Array', 'Hash Table'],
    difficulty: 'Easy',
    hints: ['Use a hash table to store complements.', 'Iterate through the array once for O(n) complexity.'],
  },
  {
    id: 2,
    title: 'Reverse String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters.',
    constraints: '1 <= s.length <= 10^5, s[i] is a printable ASCII character',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
    ],
    testCases: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', passed: null, runtime: null, memory: null },
    ],
    tags: ['String', 'Two Pointers'],
    difficulty: 'Easy',
    hints: ['Use two pointers to swap characters.', 'Consider in-place reversal for O(1) space.'],
  },
];

const codeTemplates = {
  python: 'def solution(nums, target):\n    # Your code here\n    pass',
  java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{0, 0};\n    }\n}',
  javascript: 'function solution(nums, target) {\n    // Your code here\n    return [0, 0];\n}',
};

const Test = () => {
  const [code, setCode] = useState(codeTemplates.python);
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testResults, setTestResults] = useState(mockQuestions.map(q => q.testCases.map(tc => ({ ...tc, passed: null, runtime: null, memory: null }))));
  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Run code
  const handleRun = async () => {
    setOutput('');
    setError('');
    try {
      // Mock response since backend might not be available
      setOutput('Mock output: [0,1]');
    } catch (err) {
      setError('Failed to connect to backend. Using mock output.');
      setOutput('Mock output: [0,1]');
    }
  };

  // Submit code
  const handleSubmit = async () => {
    setOutput('');
    setError('');
    const newResults = [...testResults];
    try {
      // Mock submission results
      for (let i = 0; i < mockQuestions[currentQuestion].testCases.length; i++) {
        newResults[currentQuestion][i] = {
          ...newResults[currentQuestion][i],
          passed: Math.random() > 0.3, // Random pass/fail for demo
          runtime: Math.floor(Math.random() * 100) + 'ms',
          memory: Math.floor(Math.random() * 1000) + 'KB',
        };
      }
      setTestResults(newResults);
    } catch (err) {
      setError('Failed to connect to backend.');
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  const sidebarVariants = {
    open: { x: 0, transition: { duration: 0.3 } },
    closed: { x: '-100%', transition: { duration: 0.3 } },
  };

  return (
    <ErrorBoundary>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
      >
        {/* Header */}
        <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md px-4 py-3`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <div className="text-2xl font-bold text-blue-600">ExamTrack</div>
              </Link>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold">Practice Test</h2>
                <Clock className="w-5 h-5 text-blue-600" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                className="md:hidden"
                onClick={() => setIsQuestionListOpen(!isQuestionListOpen)}
              >
                {isQuestionListOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <AnimatePresence>
            {(isQuestionListOpen || window.innerWidth >= 768) && (
              <motion.aside
                variants={sidebarVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className={`w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4 overflow-y-auto h-screen sticky top-0`}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Questions</h3>
                  <div className="space-y-2">
                    {mockQuestions.map((q, index) => (
                      <div
                        key={q.id}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between ${
                          currentQuestion === index ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setCurrentQuestion(index)}
                      >
                        <span className="flex-1 truncate">
                          {q.id}. {q.title} ({q.difficulty})
                        </span>
                        {testResults[index].every((tc) => tc.passed) && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Problem Area */}
            <section className={`w-1/2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} p-6 overflow-y-auto`}>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  {mockQuestions[currentQuestion].title}{' '}
                  <span className="text-sm text-gray-500">({mockQuestions[currentQuestion].difficulty})</span>
                </h3>
                
                <div>
                  <h4 className="text-lg font-semibold mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300">{mockQuestions[currentQuestion].description}</p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Examples</h4>
                  <div className="space-y-2">
                    {mockQuestions[currentQuestion].examples.map((ex, index) => (
                      <div key={index} className="border p-3 rounded-lg">
                        <p><strong>Input:</strong> {ex.input}</p>
                        <p><strong>Output:</strong> {ex.output}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">Test Cases</h4>
                  <div className="space-y-2">
                    {mockQuestions[currentQuestion].testCases.map((tc, index) => (
                      <div key={index} className="border p-3 rounded-lg">
                        <p><strong>Input:</strong> {tc.input}</p>
                        <p><strong>Expected Output:</strong> {tc.output}</p>
                        {testResults[currentQuestion][index].passed !== null && (
                          <div className="flex items-center space-x-2 mt-2">
                            <strong>Status:</strong>
                            {testResults[currentQuestion][index].passed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span>{testResults[currentQuestion][index].passed ? 'Passed' : 'Failed'}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Code Editor Area */}
            <section className={`w-1/2 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-6 flex flex-col`}>
              <Compiler initialCode={code} initialLanguage={language} />
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="p-4 border-t">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:bg-gray-400 flex items-center space-x-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            
            <div className="text-center">
              <p>Question {currentQuestion + 1} of {mockQuestions.length}</p>
            </div>
            
            <button
              onClick={() => setCurrentQuestion((prev) => Math.min(mockQuestions.length - 1, prev + 1))}
              disabled={currentQuestion === mockQuestions.length - 1}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:bg-gray-400 flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </motion.div>
    </ErrorBoundary>
  );
};

export default Test;