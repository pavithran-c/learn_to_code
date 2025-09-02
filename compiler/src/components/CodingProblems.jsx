import React, { useState, useEffect, useRef } from 'react';
import { recordCodingResult } from '../utils/dashboardStorage';

const CodingProblems = () => {
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [language, setLanguage] = useState('python');
  const [activeTab, setActiveTab] = useState('description');
  const [leftWidth, setLeftWidth] = useState(50);
  const [bottomHeight, setBottomHeight] = useState(30);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);
  
  // Failure tracking states
  const [problemAttempts, setProblemAttempts] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [showRetakeOption, setShowRetakeOption] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/problems')
      .then(res => res.json())
      .then(setProblems);
  }, []);

  const selectProblem = async (id, lang = language) => {
    const res = await fetch(`http://localhost:5000/api/problem/${id}`);
    const data = await res.json();
    // If starter_code is an object, pick by language
    let starter = data.starter_code;
    if (starter && typeof starter === 'object') starter = starter[lang];
    setSelected(data);
    setCode(starter || '');
    setResults(null);
    setLanguage(lang);
    setStartTime(Date.now()); // Track start time
    setShowRetakeOption(false);
    
    // Initialize problem attempts if not exists
    if (!problemAttempts[id]) {
      setProblemAttempts(prev => ({
        ...prev,
        [id]: { failures: 0, totalTime: 0, lastAttempt: Date.now() }
      }));
    }
  };

  // Select a random problem by difficulty
  const selectRandomProblem = (lang = language) => {
    const filtered = problems.filter(p => p.difficulty === difficulty);
    if (filtered.length === 0) return;
    const randomIdx = Math.floor(Math.random() * filtered.length);
    selectProblem(filtered[randomIdx].id, lang);
  };

  // Retake current problem with fresh state
  const retakeProblem = () => {
    if (selected) {
      // Reset the problem attempts for this problem
      setProblemAttempts(prev => ({
        ...prev,
        [selected.id]: { failures: 0, totalTime: 0, lastAttempt: Date.now() }
      }));
      
      // Reset UI state
      setResults(null);
      setShowRetakeOption(false);
      setStartTime(Date.now());
      
      // Reset to starter code
      let starter = selected.starter_code;
      if (starter && typeof starter === 'object') starter = starter[language];
      setCode(starter || '');
    }
  };

  // Get current problem stats
  const getCurrentProblemStats = () => {
    if (!selected || !problemAttempts[selected.id]) return null;
    const stats = problemAttempts[selected.id];
    return {
      failures: stats.failures,
      timeSpent: Math.round(stats.totalTime),
      canRetake: stats.failures >= 3 || stats.totalTime > 600
    };
  };

  const submitCode = async () => {
    const timeSpent = startTime ? (Date.now() - startTime) / 1000 : 0; // Time in seconds
    
    const res = await fetch('http://localhost:5000/api/submit_code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_id: selected.id,
        code,
        language
      })
    });
    const data = await res.json();
    setResults(data);
    
    // Update problem attempts tracking
    const problemId = selected.id;
    const currentAttempts = problemAttempts[problemId] || { failures: 0, totalTime: 0, lastAttempt: Date.now() };
    
    if (!data.all_passed) {
      // Failed attempt
      const updatedAttempts = {
        failures: currentAttempts.failures + 1,
        totalTime: currentAttempts.totalTime + timeSpent,
        lastAttempt: Date.now()
      };
      
      setProblemAttempts(prev => ({
        ...prev,
        [problemId]: updatedAttempts
      }));
      
      // Check if user qualifies for retake option
      // Conditions: 3+ failures OR spent more than 10 minutes total
      if (updatedAttempts.failures >= 3 || updatedAttempts.totalTime > 600) {
        setShowRetakeOption(true);
      }
    } else {
      // Successful attempt - reset tracking
      setProblemAttempts(prev => ({
        ...prev,
        [problemId]: { failures: 0, totalTime: 0, lastAttempt: Date.now() }
      }));
      setShowRetakeOption(false);
    }
    
    // Record coding result for dashboard
    recordCodingResult(
      selected.title || `Problem ${problemId}`,
      data.all_passed,
      (problemAttempts[problemId]?.failures || 0) + (data.all_passed ? 0 : 1),
      timeSpent
    );
    
    setStartTime(Date.now()); // Reset start time for next attempt
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle horizontal resize
  const handleHorizontalResize = (e) => {
    if (!isResizing) return;
    const containerWidth = window.innerWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  // Handle vertical resize
  const handleVerticalResize = (e) => {
    if (!isResizing) return;
    const container = resizeRef.current?.parentElement;
    if (!container) return;
    const containerHeight = container.offsetHeight;
    const containerTop = container.getBoundingClientRect().top;
    const newBottomHeight = ((containerHeight - (e.clientY - containerTop)) / containerHeight) * 100;
    if (newBottomHeight >= 10 && newBottomHeight <= 60) {
      setBottomHeight(newBottomHeight);
    }
  };

  const startResize = () => setIsResizing(true);
  const stopResize = () => setIsResizing(false);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleHorizontalResize);
      document.addEventListener('mousemove', handleVerticalResize);
      document.addEventListener('mouseup', stopResize);
    }
    return () => {
      document.removeEventListener('mousemove', handleHorizontalResize);
      document.removeEventListener('mousemove', handleVerticalResize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing]);

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">CodeMaster</h1>
          <div className="flex gap-4 items-center">
            <select 
              value={difficulty} 
              onChange={e => setDifficulty(e.target.value)} 
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              onClick={() => selectRandomProblem(language)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Random Problem
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Details */}
        <div 
          className="border-r border-gray-700 flex flex-col overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          {selected ? (
            <>
              {/* Problem Header */}
              <div className="bg-gray-800 p-4 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold">{selected.id}. {selected.title}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selected.difficulty)}`}>
                    {selected.difficulty.charAt(0).toUpperCase() + selected.difficulty.slice(1)}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>✓ Accepted: 18,555,415</span>
                  <span>📊 Rate: 56.2%</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-800 border-b border-gray-700 flex-shrink-0">
                {['description', 'editorial', 'submissions'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 capitalize transition-colors ${
                      activeTab === tab 
                        ? 'text-blue-400 border-b-2 border-blue-400' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'description' && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-300 leading-relaxed">{selected.description}</p>
                    </div>

                    {/* Examples */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Examples</h3>
                      {selected.test_cases && selected.test_cases.map((tc, idx) => (
                        <div key={idx} className="bg-gray-800 rounded p-4 mb-4">
                          <div className="font-semibold text-sm text-gray-400 mb-2">Example {idx + 1}:</div>
                          <div className="font-mono text-sm space-y-1">
                            <div><span className="text-blue-400">Input:</span> {JSON.stringify(tc.input)}</div>
                            <div><span className="text-green-400">Output:</span> {JSON.stringify(tc.output)}</div>
                            {tc.type && (
                              <div><span className="text-yellow-400">Type:</span> {tc.type}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Constraints */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                      <div className="bg-gray-800 rounded p-4">
                        <ul className="font-mono text-sm text-gray-300 space-y-1">
                          <li>• 2 ≤ nums.length ≤ 10⁴</li>
                          <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                          <li>• -10⁹ ≤ target ≤ 10⁹</li>
                          <li>• Only one valid answer exists.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Follow-up */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Follow-up</h3>
                      <p className="text-gray-300">Can you come up with an algorithm that is less than O(n²) time complexity?</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🧩</div>
                <h2 className="text-xl mb-2">No problem selected</h2>
                <p>Click "Random Problem" to start coding!</p>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Resize Handle */}
        <div
          className="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize flex-shrink-0"
          onMouseDown={startResize}
        />

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected && (
            <>
              {/* Editor Header */}
              <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                <select 
                  value={language} 
                  onChange={e => {
                    setLanguage(e.target.value);
                    selectProblem(selected.id, e.target.value);
                  }} 
                  className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1"
                >
                  <option value="python">Python3</option>
                  <option value="java">Java</option>
                </select>
                <div className="text-sm text-gray-400">
                  Auto ✓ | Saved
                </div>
              </div>

              {/* Code Editor and Output Container */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Code Editor */}
                <div 
                  className="flex flex-col overflow-hidden" 
                  style={{ height: results ? `${100 - bottomHeight}%` : '100%' }}
                >
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="flex-1 bg-gray-900 text-white font-mono text-sm p-4 resize-none outline-none border-0 overflow-auto"
                    style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace' }}
                    placeholder={`Write your ${language} code here...`}
                  />
                </div>

                {/* Vertical Resize Handle (only show when results exist) */}
                {results && (
                  <div
                    ref={resizeRef}
                    className="h-1 bg-gray-700 hover:bg-gray-600 cursor-row-resize flex-shrink-0"
                    onMouseDown={startResize}
                  />
                )}

                {/* Test Cases / Output */}
                {results && (
                  <div 
                    className="bg-gray-800 border-t border-gray-700 overflow-auto flex-shrink-0"
                    style={{ height: `${bottomHeight}%` }}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-semibold">Testcase</span>
                        {results.all_passed ? (
                          <span className="text-green-400">✓ All tests passed</span>
                        ) : (
                          <span className="text-red-400">✗ Some tests failed</span>
                        )}
                      </div>
                      
                      {/* Retake Notification */}
                      {showRetakeOption && !results.all_passed && (
                        <div className="bg-yellow-900/30 border border-yellow-600 rounded p-3 mb-4">
                          <div className="flex items-center gap-2 text-yellow-400">
                            <span>💡</span>
                            <span className="text-sm">
                              Having trouble? You can now <strong>retake</strong> this problem with a fresh start!
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {results.results.map((r, idx) => (
                          <div key={idx} className="bg-gray-900 rounded p-3 border-l-4 border-l-gray-600">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Case {idx + 1}</span>
                              {r.passed ? (
                                <span className="text-green-400 text-sm">✓ Passed</span>
                              ) : (
                                <span className="text-red-400 text-sm">✗ Failed</span>
                              )}
                            </div>
                            <div className="font-mono text-xs space-y-1 text-gray-300">
                              <div><span className="text-gray-400">nums =</span> {JSON.stringify(r.input)}</div>
                              <div><span className="text-gray-400">Expected:</span> {JSON.stringify(r.expected)}</div>
                              <div><span className="text-gray-400">Output:</span> {JSON.stringify(r.output)}</div>
                              {r.stderr && r.stderr.trim() && (
                                <div className="text-red-400"><span className="text-gray-400">Error:</span> {r.stderr}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-800 p-4 border-t border-gray-700 flex-shrink-0">
                <div className="flex flex-col gap-3">
                  {/* Problem Stats */}
                  {getCurrentProblemStats() && (
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Attempts: {getCurrentProblemStats().failures}</span>
                      <span>Time: {Math.floor(getCurrentProblemStats().timeSpent / 60)}m {getCurrentProblemStats().timeSpent % 60}s</span>
                      {getCurrentProblemStats().canRetake && (
                        <span className="text-yellow-400">⚡ Retake Available</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={submitCode}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-medium"
                    >
                      ▶ Run
                    </button>
                    <button
                      onClick={submitCode}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
                    >
                      Submit
                    </button>
                    
                    {/* Retake Button - Show when conditions are met */}
                    {showRetakeOption && (
                      <button
                        onClick={retakeProblem}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors font-medium flex items-center gap-2"
                        title="Reset problem with fresh start"
                      >
                        🔄 Retake
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingProblems;