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
  
  // Compiler integration states
  const [compilerOutput, setCompilerOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showCompilerOutput, setShowCompilerOutput] = useState(false);
  
  // Failure tracking states
  const [problemAttempts, setProblemAttempts] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [showRetakeOption, setShowRetakeOption] = useState(false);
  
  // Learning curve and adaptive difficulty states
  const [userPerformance, setUserPerformance] = useState({
    easySuccess: 0,
    easyTotal: 0,
    mediumSuccess: 0,
    mediumTotal: 0,
    hardSuccess: 0,
    hardTotal: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalSolved: 0,
    averageTime: 0
  });
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState('easy');
  const [shuffledProblems, setShuffledProblems] = useState([]);
  const [learningMode, setLearningMode] = useState('adaptive'); // 'adaptive', 'manual', 'progressive'

  useEffect(() => {
    // Fetch questions from backend API (loads from coding_questions folder)
    const fetchProblems = async () => {
      try {
        console.log('Fetching problems from backend API...');
        const response = await fetch('http://localhost:5000/api/problems');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Loaded ${data.length} problems from coding_questions folder`);
        
        // Log sample problem IDs to debug
        const sampleIds = data.slice(0, 5).map(p => p.id);
        console.log('Sample problem IDs:', sampleIds);
        
        // Ensure problems have required fields for learning curve
        const processedProblems = data.map(problem => ({
          ...problem,
          difficulty: problem.difficulty || 'medium', // Default to medium if not specified
          topics: problem.topics || [],
          concepts: problem.concepts || problem.topics || []
        }));
        
        setProblems(processedProblems);
        shuffleProblemsBasedOnLearningCurve(processedProblems);
        
        // Log difficulty distribution
        const difficultyCount = processedProblems.reduce((acc, p) => {
          acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
          return acc;
        }, {});
        console.log('Problem difficulty distribution:', difficultyCount);
        
      } catch (error) {
        console.error('Error fetching problems:', error);
        
        // Show user-friendly error message
        const errorMsg = error.message.includes('fetch') 
          ? 'Cannot connect to backend server. Please make sure the Flask backend is running on http://localhost:5000'
          : `Failed to load problems: ${error.message}`;
        
        alert(`⚠️ ${errorMsg}\n\nTo fix this:\n1. Open terminal in Backend folder\n2. Run: python app.py\n3. Refresh this page`);
        
        // Set empty problems array as fallback
        setProblems([]);
      }
    };
    
    fetchProblems();
  }, []);

  // Calculate user's learning curve and recommended difficulty
  const calculateLearningCurve = () => {
    const { easySuccess, easyTotal, mediumSuccess, mediumTotal, hardSuccess, hardTotal, currentStreak } = userPerformance;
    
    // Calculate success rates
    const easyRate = easyTotal > 0 ? easySuccess / easyTotal : 0;
    const mediumRate = mediumTotal > 0 ? mediumSuccess / mediumTotal : 0;
    const hardRate = hardTotal > 0 ? hardSuccess / hardTotal : 0;
    
    // Adaptive difficulty logic
    if (easyRate >= 0.8 && easyTotal >= 3 && currentStreak >= 2) {
      // User is doing well on easy, move to medium
      return mediumRate >= 0.6 && mediumTotal >= 2 ? 'hard' : 'medium';
    } else if (mediumRate >= 0.7 && mediumTotal >= 2) {
      // User is doing well on medium, can try hard
      return 'hard';
    } else if (easyRate < 0.5 && easyTotal >= 2) {
      // User struggling with easy, stay on easy
      return 'easy';
    } else if (mediumRate < 0.4 && mediumTotal >= 2) {
      // User struggling with medium, go back to easy
      return 'easy';
    }
    
    // Default progression based on total solved
    if (userPerformance.totalSolved < 5) return 'easy';
    if (userPerformance.totalSolved < 15) return 'medium';
    return 'hard';
  };

  // Shuffle problems based on learning curve and difficulty progression
  const shuffleProblemsBasedOnLearningCurve = (problemsList = problems) => {
    if (!problemsList.length) return;
    
    const recommendedDiff = calculateLearningCurve();
    setAdaptiveDifficulty(recommendedDiff);
    
    // Separate problems by difficulty
    const easyProblems = problemsList.filter(p => p.difficulty === 'easy');
    const mediumProblems = problemsList.filter(p => p.difficulty === 'medium');
    const hardProblems = problemsList.filter(p => p.difficulty === 'hard');
    
    let shuffled = [];
    
    if (learningMode === 'adaptive') {
      // Adaptive mode: Focus on recommended difficulty with some variety
      if (recommendedDiff === 'easy') {
        shuffled = [
          ...shuffleArray(easyProblems).slice(0, 8),
          ...shuffleArray(mediumProblems).slice(0, 2)
        ];
      } else if (recommendedDiff === 'medium') {
        shuffled = [
          ...shuffleArray(easyProblems).slice(0, 3),
          ...shuffleArray(mediumProblems).slice(0, 6),
          ...shuffleArray(hardProblems).slice(0, 1)
        ];
      } else {
        shuffled = [
          ...shuffleArray(easyProblems).slice(0, 2),
          ...shuffleArray(mediumProblems).slice(0, 4),
          ...shuffleArray(hardProblems).slice(0, 4)
        ];
      }
    } else if (learningMode === 'progressive') {
      // Progressive mode: Gradual difficulty increase
      const totalSolved = userPerformance.totalSolved;
      if (totalSolved < 5) {
        shuffled = shuffleArray(easyProblems).slice(0, 10);
      } else if (totalSolved < 15) {
        shuffled = [
          ...shuffleArray(easyProblems).slice(0, 6),
          ...shuffleArray(mediumProblems).slice(0, 4)
        ];
      } else {
        shuffled = [
          ...shuffleArray(easyProblems).slice(0, 3),
          ...shuffleArray(mediumProblems).slice(0, 4),
          ...shuffleArray(hardProblems).slice(0, 3)
        ];
      }
    } else {
      // Manual mode: Use selected difficulty
      const filtered = problemsList.filter(p => p.difficulty === difficulty);
      shuffled = shuffleArray(filtered).slice(0, 10);
    }
    
    setShuffledProblems(shuffleArray(shuffled));
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get default code template based on language and problem
  const getDefaultTemplate = (lang, problem) => {
    const problemTitle = problem?.title || 'Solution';
    const functionName = problemTitle.toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'solve';

    if (lang === 'python') {
      return `def ${functionName}():
    """
    ${problem?.description?.substring(0, 100) || 'Solve the problem'}...
    """
    # Write your solution here
    pass

# Test your function
if __name__ == "__main__":
    # Add your test cases here
    result = ${functionName}()
    print("Result:", result)`;
    } else if (lang === 'java') {
      return `public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        // Add your test cases here
        // Example: int result = sol.${functionName}();
        // System.out.println("Result: " + result);
    }
    
    public int ${functionName}() {
        // Write your solution here
        return 0;
    }
}`;
    }
    return `// Write your ${lang} solution here...`;
  };

  const selectProblem = async (id, lang = language) => {
    try {
      console.log(`Fetching problem ${id} from backend...`);
      const response = await fetch(`http://localhost:5000/api/problem/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch problem ${id}: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Loaded problem: ${data.title} (${data.difficulty})`);
      
      // If starter_code is an object, pick by language
      let starter = data.starter_code;
      if (starter && typeof starter === 'object') {
        starter = starter[lang] || starter['python'] || ''; // Fallback to python if lang not available
      }
      
      // Ensure required fields exist
      const processedProblem = {
        ...data,
        description: data.description || data.statement_markdown || 'No description available',
        test_cases: data.test_cases || [],
        topics: data.topics || [],
        concepts: data.concepts || data.topics || [],
        time_limit_ms: data.time_limit_ms || 5000,
        memory_limit_mb: data.memory_limit_mb || 256
      };
      
      setSelected(processedProblem);
      setCode(starter || getDefaultTemplate(lang, processedProblem));
      setResults(null);
      setLanguage(lang);
      setStartTime(Date.now()); // Track start time
      setShowRetakeOption(false);
      
      // Clear compiler output when selecting new problem
      setCompilerOutput('');
      setShowCompilerOutput(false);
      
      // Initialize problem attempts if not exists
      if (!problemAttempts[id]) {
        setProblemAttempts(prev => ({
          ...prev,
          [id]: { failures: 0, totalTime: 0, lastAttempt: Date.now() }
        }));
      }
      
    } catch (error) {
      console.error('Error fetching problem:', error);
      // Could show error message to user
      alert(`Failed to load problem ${id}. Please try another problem.`);
    }
  };

  // Select a random problem based on learning curve and mode
  const selectRandomProblem = (lang = language) => {
    let targetProblems = [];
    
    if (learningMode === 'adaptive' && shuffledProblems.length > 0) {
      // Use shuffled problems from learning curve
      targetProblems = shuffledProblems;
    } else {
      // Fallback to difficulty-based selection
      targetProblems = problems.filter(p => p.difficulty === (learningMode === 'adaptive' ? adaptiveDifficulty : difficulty));
    }
    
    if (targetProblems.length === 0) {
      // Fallback to any available problems
      targetProblems = problems;
    }
    
    if (targetProblems.length === 0) return;
    
    const randomIdx = Math.floor(Math.random() * targetProblems.length);
    selectProblem(targetProblems[randomIdx].id, lang);
  };

  // Get next recommended problem based on learning curve
  const getNextRecommendedProblem = (lang = language) => {
    if (shuffledProblems.length === 0) {
      selectRandomProblem(lang);
      return;
    }
    
    // Find the next unsolved problem from shuffled list
    const unsolvedProblems = shuffledProblems.filter(p => 
      !problemAttempts[p.id] || problemAttempts[p.id].failures > 0
    );
    
    if (unsolvedProblems.length > 0) {
      selectProblem(unsolvedProblems[0].id, lang);
    } else {
      // All current problems solved, reshuffle
      shuffleProblemsBasedOnLearningCurve();
      selectRandomProblem(lang);
    }
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
    if (!selected) {
      alert('Please select a problem first!');
      return;
    }
    
    const timeSpent = startTime ? (Date.now() - startTime) / 1000 : 0; // Time in seconds
    
    try {
      console.log(`Submitting code for problem ${selected.id}...`);
      const response = await fetch('http://localhost:5000/api/submit_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: selected.id,
          code,
          language
        })
      });
      
      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Submission result:', data.all_passed ? 'PASSED' : 'FAILED');
      setResults(data);
    
    // Update problem attempts tracking
    const problemId = selected.id;
    const currentAttempts = problemAttempts[problemId] || { failures: 0, totalTime: 0, lastAttempt: Date.now() };
    
    // Update user performance tracking
    const problemDifficulty = selected.difficulty;
    const wasSuccess = data.all_passed;
    
    setUserPerformance(prev => {
      const newPerf = { ...prev };
      
      // Update difficulty-specific stats
      if (problemDifficulty === 'easy') {
        newPerf.easyTotal += 1;
        if (wasSuccess) newPerf.easySuccess += 1;
      } else if (problemDifficulty === 'medium') {
        newPerf.mediumTotal += 1;
        if (wasSuccess) newPerf.mediumSuccess += 1;
      } else if (problemDifficulty === 'hard') {
        newPerf.hardTotal += 1;
        if (wasSuccess) newPerf.hardSuccess += 1;
      }
      
      // Update streak and totals
      if (wasSuccess) {
        newPerf.currentStreak += 1;
        newPerf.bestStreak = Math.max(newPerf.bestStreak, newPerf.currentStreak);
        newPerf.totalSolved += 1;
      } else {
        newPerf.currentStreak = 0;
      }
      
      // Update average time (simple moving average)
      const totalAttempts = newPerf.easyTotal + newPerf.mediumTotal + newPerf.hardTotal;
      newPerf.averageTime = ((newPerf.averageTime * (totalAttempts - 1)) + timeSpent) / totalAttempts;
      
      return newPerf;
    });
    
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
      
      // Reshuffle problems based on updated performance
      setTimeout(() => shuffleProblemsBasedOnLearningCurve(), 500);
    }
    
    // Record coding result for dashboard
    recordCodingResult(
      selected.title || `Problem ${problemId}`,
      data.all_passed,
      (problemAttempts[problemId]?.failures || 0) + (data.all_passed ? 0 : 1),
      timeSpent
    );
    
    setStartTime(Date.now()); // Reset start time for next attempt
    
    } catch (error) {
      console.error('Error submitting code:', error);
      alert('Failed to submit code. Please check your connection and try again.');
      setResults({
        all_passed: false,
        results: [],
        error: 'Submission failed'
      });
    }
  };

  // Compiler functionality - Run code without submitting to problem tests
  const runCode = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setIsRunning(true);
    setCompilerOutput('Running...');
    setShowCompilerOutput(true);
    
    let endpoint = '';
    if (language === 'python') endpoint = '/run/python';
    else if (language === 'java') endpoint = '/run/java';
    else {
      setCompilerOutput('JavaScript execution is not supported in the backend.');
      setIsRunning(false);
      return;
    }

    try {
      console.log(`Running ${language} code...`);
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const output = (data.stdout ? data.stdout : '') + (data.stderr ? `\n${data.stderr}` : '');
      setCompilerOutput(output || 'No output generated.');
      
    } catch (error) {
      console.error('Error running code:', error);
      setCompilerOutput(`Error: ${error.message}\n\nMake sure the backend is running on http://localhost:5000`);
    }
    
    setIsRunning(false);
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      // Ctrl/Cmd + Shift + Enter to submit code
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        submitCode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [code, selected]);

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">CodeMaster</h1>
            {/* Performance Stats */}
            <div className="text-sm text-gray-400 hidden md:flex items-center gap-4">
              <span>Solved: {userPerformance.totalSolved}</span>
              <span>Streak: {userPerformance.currentStreak}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                adaptiveDifficulty === 'easy' ? 'bg-green-100 text-green-700' :
                adaptiveDifficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                Recommended: {adaptiveDifficulty}
              </span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {/* Learning Mode Selector */}
            <select 
              value={learningMode} 
              onChange={e => {
                setLearningMode(e.target.value);
                shuffleProblemsBasedOnLearningCurve();
              }} 
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1"
            >
              <option value="adaptive">🧠 Adaptive</option>
              <option value="progressive">📈 Progressive</option>
              <option value="manual">⚙️ Manual</option>
            </select>
            
            {/* Difficulty Selector (only show in manual mode) */}
            {learningMode === 'manual' && (
              <select 
                value={difficulty} 
                onChange={e => {
                  setDifficulty(e.target.value);
                  shuffleProblemsBasedOnLearningCurve();
                }} 
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            )}
            
            <button
              onClick={() => learningMode === 'adaptive' ? getNextRecommendedProblem(language) : selectRandomProblem(language)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              {learningMode === 'adaptive' ? '🎯 Next Problem' : '🎲 Random Problem'}
            </button>
            
            <button
              onClick={() => shuffleProblemsBasedOnLearningCurve()}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
              title="Reshuffle problems based on your learning curve"
            >
              🔄
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
                  Auto ✓ | Saved | Ctrl+Enter: Run | Ctrl+Shift+Enter: Submit
                </div>
              </div>

              {/* Code Editor and Output Container */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Code Editor */}
                <div 
                  className="flex flex-col overflow-hidden" 
                  style={{ height: (results || showCompilerOutput) ? `${100 - bottomHeight}%` : '100%' }}
                >
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="flex-1 bg-gray-900 text-white font-mono text-sm p-4 resize-none outline-none border-0 overflow-auto"
                    style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace' }}
                    placeholder={`Write your ${language} code here...`}
                  />
                </div>

                {/* Vertical Resize Handle (only show when results or compiler output exist) */}
                {(results || showCompilerOutput) && (
                  <div
                    ref={resizeRef}
                    className="h-1 bg-gray-700 hover:bg-gray-600 cursor-row-resize flex-shrink-0"
                    onMouseDown={startResize}
                  />
                )}

                {/* Output Area - Test Cases or Compiler Output */}
                {(results || showCompilerOutput) && (
                  <div 
                    className="bg-gray-800 border-t border-gray-700 overflow-auto flex-shrink-0"
                    style={{ height: `${bottomHeight}%` }}
                  >
                    <div className="p-4">
                      {/* Tab selector for output type */}
                      <div className="flex gap-2 mb-4">
                        {results && (
                          <button
                            onClick={() => setShowCompilerOutput(false)}
                            className={`px-3 py-1 rounded text-sm ${
                              !showCompilerOutput 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            Test Results
                          </button>
                        )}
                        {compilerOutput && (
                          <button
                            onClick={() => setShowCompilerOutput(true)}
                            className={`px-3 py-1 rounded text-sm ${
                              showCompilerOutput 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            Console Output
                          </button>
                        )}
                      </div>

                      {/* Show Test Results */}
                      {!showCompilerOutput && results && (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-semibold">Test Results</span>
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
                        </>
                      )}

                      {/* Show Compiler Output */}
                      {showCompilerOutput && compilerOutput && (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-semibold">Console Output</span>
                            <span className="text-green-400">🖥️ Code Execution</span>
                          </div>
                          <pre className="bg-gray-900 p-4 rounded border overflow-x-auto text-sm text-gray-300 font-mono whitespace-pre-wrap">
                            {compilerOutput}
                          </pre>
                        </>
                      )}
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
                      onClick={runCode}
                      disabled={isRunning}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-medium disabled:opacity-60 flex items-center gap-2"
                      title="Run code in compiler (test your logic)"
                    >
                      {isRunning ? (
                        <>⏳ Running...</>
                      ) : (
                        <>▶ Run Code</>
                      )}
                    </button>
                    <button
                      onClick={submitCode}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
                      title="Submit code for evaluation against test cases"
                    >
                      📋 Submit Solution
                    </button>
                    
                    {/* Clear outputs button */}
                    {(results || compilerOutput) && (
                      <button
                        onClick={() => {
                          setResults(null);
                          setCompilerOutput('');
                          setShowCompilerOutput(false);
                        }}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium"
                        title="Clear all outputs"
                      >
                        🗑️ Clear
                      </button>
                    )}
                    
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