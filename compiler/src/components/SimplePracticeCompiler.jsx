import React, { useState, useEffect } from 'react';

const PracticeCompiler = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [practiceMode, setPracticeMode] = useState('freestyle'); // 'freestyle' or 'challenges'
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [allChallenges, setAllChallenges] = useState([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [loadingChallenges, setLoadingChallenges] = useState(false);

  // Load challenges on component mount
  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async (randomize = false) => {
    setLoadingChallenges(true);
    try {
      const params = new URLSearchParams();
      if (randomize) {
        params.append('randomize', 'true');
      }
      
      const url = `http://localhost:5000/api/problems${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const challenges = await response.json();
        setAllChallenges(challenges);
        if (challenges.length > 0) {
          setCurrentChallenge(challenges[0]);
          setCurrentChallengeIndex(0);
        }
      } else {
        // Fallback to mock data if API fails
        const mockChallenges = generateMockChallenges();
        setAllChallenges(mockChallenges);
        setCurrentChallenge(mockChallenges[0]);
        setCurrentChallengeIndex(0);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      // Fallback to mock data
      const mockChallenges = generateMockChallenges();
      setAllChallenges(mockChallenges);
      setCurrentChallenge(mockChallenges[0]);
      setCurrentChallengeIndex(0);
    }
    setLoadingChallenges(false);
  };

  const shuffleChallenges = async () => {
    if (allChallenges.length === 0) return;
    
    try {
      const challengeIds = allChallenges.map(c => c.id);
      const response = await fetch('http://localhost:5000/api/problems/shuffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_ids: challengeIds })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllChallenges(data.problems);
        setCurrentChallengeIndex(0);
        setCurrentChallenge(data.problems[0]);
        setCode('');
        setOutput('');
      }
    } catch (error) {
      console.error('Error shuffling challenges:', error);
      // Fallback to simple array shuffle
      const shuffled = [...allChallenges].sort(() => Math.random() - 0.5);
      setAllChallenges(shuffled);
      setCurrentChallengeIndex(0);
      setCurrentChallenge(shuffled[0]);
      setCode('');
      setOutput('');
    }
  };

  const getRandomChallenges = async (count = 20) => {
    try {
      const response = await fetch(`http://localhost:5000/api/problems/random?count=${count}`);
      
      if (response.ok) {
        const data = await response.json();
        setAllChallenges(data.problems);
        setCurrentChallengeIndex(0);
        setCurrentChallenge(data.problems[0]);
        setCode('');
        setOutput('');
      }
    } catch (error) {
      console.error('Error getting random challenges:', error);
    }
  };

  const getDailyChallenge = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/problems/daily-challenge?user_id=guest');
      
      if (response.ok) {
        const data = await response.json();
        setAllChallenges([data.problem]);
        setCurrentChallenge(data.problem);
        setCurrentChallengeIndex(0);
        setCode('');
        setOutput('');
        alert(`Daily Challenge: ${data.problem.title}\n${data.difficulty_reasoning}\nBonus Points: ${data.bonus_points}`);
      }
    } catch (error) {
      console.error('Error getting daily challenge:', error);
    }
  };

  const generateMockChallenges = () => {
    return [
      {
        id: "E001",
        title: "Two Sum",
        difficulty: "Easy",
        statement_markdown: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        canonical_solution: {
          Python: {
            code: "def two_sum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []"
          }
        }
      },
      {
        id: "E002", 
        title: "Valid Parentheses",
        difficulty: "Easy",
        statement_markdown: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        canonical_solution: {
          Python: {
            code: "def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    return not stack"
          }
        }
      }
    ];
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput('Running...');
    let endpoint = '';
    if (language === 'python') endpoint = '/run/python';
    else if (language === 'java') endpoint = '/run/java';
    else {
      setOutput('JavaScript execution is not supported in the backend.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setOutput(
        (data.stdout ? data.stdout : '') +
        (data.stderr ? `\n${data.stderr}` : '')
      );
    } catch (err) {
      setOutput('Error connecting to backend.');
    }
    setLoading(false);
  };

  const goToNextChallenge = () => {
    if (currentChallengeIndex < allChallenges.length - 1) {
      const nextIndex = currentChallengeIndex + 1;
      setCurrentChallengeIndex(nextIndex);
      setCurrentChallenge(allChallenges[nextIndex]);
      setCode('');
      setOutput('');
    }
  };

  const goToPreviousChallenge = () => {
    if (currentChallengeIndex > 0) {
      const prevIndex = currentChallengeIndex - 1;
      setCurrentChallengeIndex(prevIndex);
      setCurrentChallenge(allChallenges[prevIndex]);
      setCode('');
      setOutput('');
    }
  };

  const showSolution = () => {
    if (currentChallenge?.canonical_solution?.[language]) {
      setCode(currentChallenge.canonical_solution[language].code);
    } else if (currentChallenge?.canonical_solution?.Python) {
      setCode(currentChallenge.canonical_solution.Python.code);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Practice Arena</h2>
        
        {/* Mode Selector */}
        <div className="mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setPracticeMode('freestyle')}
              className={`px-4 py-2 rounded-md transition-colors ${
                practiceMode === 'freestyle' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Freestyle Practice
            </button>
            <button
              onClick={() => setPracticeMode('challenges')}
              className={`px-4 py-2 rounded-md transition-colors ${
                practiceMode === 'challenges' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Coding Challenges ({allChallenges.length})
            </button>
          </div>
        </div>

        {/* Challenge Navigation */}
        {practiceMode === 'challenges' && allChallenges.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-blue-800">
                Challenge {currentChallengeIndex + 1} of {allChallenges.length}: {currentChallenge?.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                currentChallenge?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                currentChallenge?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentChallenge?.difficulty}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <button
                onClick={goToPreviousChallenge}
                disabled={currentChallengeIndex === 0}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ← Previous
              </button>
              
              <button
                onClick={shuffleChallenges}
                className="px-3 py-1 bg-purple-200 text-purple-700 rounded hover:bg-purple-300 text-sm"
                title="Shuffle all challenges"
              >
                🔀 Shuffle
              </button>
              
              <button
                onClick={() => getRandomChallenges(20)}
                className="px-3 py-1 bg-green-200 text-green-700 rounded hover:bg-green-300 text-sm"
                title="Get 20 random challenges"
              >
                🎲 Random 20
              </button>
              
              <button
                onClick={getDailyChallenge}
                className="px-3 py-1 bg-yellow-200 text-yellow-700 rounded hover:bg-yellow-300 text-sm"
                title="Get daily challenge based on your level"
              >
                ⭐ Daily
              </button>
              
              <button
                onClick={goToNextChallenge}
                disabled={currentChallengeIndex === allChallenges.length - 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next →
              </button>
              
              <button
                onClick={showSolution}
                className="px-3 py-1 bg-blue-200 text-blue-700 rounded hover:bg-blue-300 text-sm ml-4"
              >
                💡 Show Solution
              </button>
            </div>
            
            {currentChallenge?.statement_markdown && (
              <div className="text-gray-700 text-sm bg-white p-3 rounded border">
                <strong>Problem:</strong>
                <div className="mt-1 whitespace-pre-wrap">{currentChallenge.statement_markdown}</div>
              </div>
            )}

            {/* Test Cases / Examples */}
            {currentChallenge?.test_cases && currentChallenge.test_cases.length > 0 && (
              <div className="text-gray-700 text-sm bg-blue-50 p-3 rounded border border-blue-200 mt-3">
                <strong className="text-blue-800">Examples:</strong>
                <div className="mt-2 space-y-2">
                  {currentChallenge.test_cases
                    .filter(tc => tc.type === 'public' || tc.type === 'example' || !tc.type)
                    .slice(0, 2) // Show only first 2 examples
                    .map((testCase, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      <div className="font-medium text-blue-700 mb-1">Example {index + 1}:</div>
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="font-medium">Input: </span>
                          <code className="bg-gray-100 px-1 rounded">
                            {JSON.stringify(testCase.input)}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Output: </span>
                          <code className="bg-gray-100 px-1 rounded">
                            {JSON.stringify(testCase.output)}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Code Editor</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Language:
            </label>
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Write Your Code:
            </label>
            <textarea
              rows={20}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          <button 
            onClick={handleRun}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60 font-medium"
          >
            {loading ? 'Running...' : 'Run Code'}
          </button>
        </div>

        {/* Output Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Output</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm h-96 overflow-auto">
            <pre className="whitespace-pre-wrap">
              {output || 'No output yet... Run your code to see results here.'}
            </pre>
          </div>
          
          {practiceMode === 'challenges' && currentChallenge && (
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Challenge Progress:</span>
                <span className="font-medium">
                  {currentChallengeIndex + 1} / {allChallenges.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentChallengeIndex + 1) / allChallenges.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeCompiler;