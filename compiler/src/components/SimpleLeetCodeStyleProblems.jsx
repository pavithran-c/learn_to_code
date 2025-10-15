import React, { useState, useEffect } from 'react';

const LeetCodeStyleProblems = () => {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isRandomized, setIsRandomized] = useState(false);

  // Load problems on component mount
  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async (randomize = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDifficulty !== 'all') {
        params.append('difficulty', selectedDifficulty);
      }
      if (randomize) {
        params.append('randomize', 'true');
      }
      
      const url = `http://localhost:5000/api/problems${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data);
        if (data.length > 0) {
          setSelectedProblem(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading problems:', error);
    }
    setLoading(false);
  };

  const shuffleProblems = async () => {
    if (problems.length === 0) return;
    
    try {
      const problemIds = problems.map(p => p.id);
      const response = await fetch('http://localhost:5000/api/problems/shuffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_ids: problemIds })
      });
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems);
        if (data.problems.length > 0) {
          setSelectedProblem(data.problems[0]);
        }
        setIsRandomized(true);
      }
    } catch (error) {
      console.error('Error shuffling problems:', error);
    }
  };

  const getRandomProblems = async (count = 20) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('count', count.toString());
      if (selectedDifficulty !== 'all') {
        params.append('difficulty', selectedDifficulty);
      }
      
      const response = await fetch(`http://localhost:5000/api/problems/random?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems);
        if (data.problems.length > 0) {
          setSelectedProblem(data.problems[0]);
        }
        setIsRandomized(true);
      }
    } catch (error) {
      console.error('Error getting random problems:', error);
    }
    setLoading(false);
  };

  const getDailyChallenge = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/problems/daily-challenge?user_id=guest');
      
      if (response.ok) {
        const data = await response.json();
        setSelectedProblem(data.problem);
        setProblems([data.problem]); // Set as single problem array
        alert(`Daily Challenge: ${data.problem.title} (${data.difficulty_reasoning})`);
      }
    } catch (error) {
      console.error('Error getting daily challenge:', error);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running...');
    let endpoint = '';
    if (language === 'python') endpoint = '/run/python';
    else if (language === 'java') endpoint = '/run/java';
    else {
      setOutput('JavaScript execution is not supported in the backend.');
      setIsRunning(false);
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
    setIsRunning(false);
  };

  const showSolution = () => {
    if (selectedProblem?.canonical_solution?.[language]) {
      setCode(selectedProblem.canonical_solution[language].code);
    } else if (selectedProblem?.canonical_solution?.Python) {
      setCode(selectedProblem.canonical_solution.Python.code);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center">Loading problems...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Coding Problems</h2>
        
        {/* Filters and Randomization Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setIsRandomized(false);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button
            onClick={() => loadProblems(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            🔄 Reload
          </button>

          <button
            onClick={shuffleProblems}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            🔀 Shuffle
          </button>

          <button
            onClick={() => getRandomProblems(20)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            🎲 Random 20
          </button>

          <button
            onClick={getDailyChallenge}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            ⭐ Daily Challenge
          </button>
        </div>
        
        <div className="flex items-center justify-between text-gray-600">
          <span>Showing {filteredProblems.length} of {problems.length} problems</span>
          {isRandomized && (
            <span className="text-purple-600 font-medium">
              🔀 Problems are randomized
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problems List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Problems</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                onClick={() => {
                  setSelectedProblem(problem);
                  setCode('');
                  setOutput('');
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedProblem?.id === problem.id
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">{problem.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                {problem.topics && (
                  <div className="text-xs text-gray-500 mt-1">
                    {problem.topics.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Problem Description & Code Editor */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProblem ? (
            <>
              {/* Problem Description */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{selectedProblem.title}</h3>
                  <span className={`px-2 py-1 text-sm font-medium rounded ${
                    selectedProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    selectedProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedProblem.difficulty}
                  </span>
                </div>
                
                <div className="text-gray-700 whitespace-pre-wrap mb-4">
                  {selectedProblem.statement_markdown || selectedProblem.description || 'No description available'}
                </div>
                
                {selectedProblem.constraints && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Constraints:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {Array.isArray(selectedProblem.constraints) ? (
                        selectedProblem.constraints.map((constraint, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>{constraint}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          <span>{selectedProblem.constraints}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Test Cases / Examples */}
                {selectedProblem.test_cases && selectedProblem.test_cases.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">Examples:</h4>
                    <div className="space-y-3">
                      {selectedProblem.test_cases
                        .filter(tc => tc.type === 'public' || tc.type === 'example' || !tc.type)
                        .slice(0, 3) // Show only first 3 examples
                        .map((testCase, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-blue-200">
                          <div className="text-sm font-medium text-blue-800 mb-2">Example {index + 1}:</div>
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-gray-700">Input: </span>
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                {JSON.stringify(testCase.input)}
                              </code>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Output: </span>
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
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

              {/* Code Editor */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Code Editor</h3>
                  <div className="flex items-center space-x-2">
                    <select 
                      value={language} 
                      onChange={e => setLanguage(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                    <button
                      onClick={showSolution}
                      className="px-3 py-2 bg-yellow-200 text-yellow-700 rounded-md hover:bg-yellow-300 text-sm"
                    >
                      💡 Show Solution
                    </button>
                  </div>
                </div>

                <textarea
                  rows={15}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Write your solution here..."
                  className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 mb-4"
                />

                <button 
                  onClick={handleRun}
                  disabled={isRunning}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60 mb-4"
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>

                {/* Output */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Output:</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    {output || 'No output yet... Run your code to see results here.'}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center text-gray-500">
                Select a problem from the list to start coding
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeetCodeStyleProblems;