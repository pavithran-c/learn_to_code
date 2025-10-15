import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Play, Save, Download, Upload, Settings, Clock, Target,
  Zap, Trophy, Star, BookOpen, CheckCircle, XCircle, AlertCircle,
  RotateCcw, Share, Copy, ExternalLink, Lightbulb, Coffee,
  Timer, Activity, BarChart3, TrendingUp, Award, Flame,
  ChevronRight, RefreshCw, Terminal, FileCode, Palette,
  Eye, EyeOff, Volume2, VolumeX, Sun, Moon, Maximize2,
  Minimize2, PlusCircle, MinusCircle, SkipForward, SkipBack
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-themes-all';

const PracticeCompiler = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [practiceMode, setPracticeMode] = useState('freestyle');
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [allChallenges, setAllChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [practiceStats, setPracticeStats] = useState({
    totalTime: 0,
    linesWritten: 0,
    errorsFixed: 0,
    challenges: 0,
    streak: 0
  });
  const [sessionTime, setSessionTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [achievements, setAchievements] = useState([]);

  // Load challenges from API
  const loadChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const response = await fetch('http://localhost:5000/api/problems', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const processedProblems = Array.isArray(data) ? data : (data.problems || []);
        console.log(`Loaded ${processedProblems.length} challenges from API`);
        
        // Randomize the problems array
        const shuffledProblems = [...processedProblems].sort(() => Math.random() - 0.5);
        setAllChallenges(shuffledProblems);
        
        // Set first challenge if in challenge mode
        if (practiceMode === 'challenges' && shuffledProblems.length > 0) {
          setCurrentChallenge(shuffledProblems[0]);
          setCurrentChallengeIndex(0);
          setCode(getStarterCode(shuffledProblems[0], language));
        }
      } else {
        console.log('API failed, using generated challenges');
        const generatedChallenges = generateMockChallenges();
        setAllChallenges(generatedChallenges);
        if (practiceMode === 'challenges' && generatedChallenges.length > 0) {
          setCurrentChallenge(generatedChallenges[0]);
          setCurrentChallengeIndex(0);
          setCode(getStarterCode(generatedChallenges[0], language));
        }
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      const generatedChallenges = generateMockChallenges();
      setAllChallenges(generatedChallenges);
      if (practiceMode === 'challenges' && generatedChallenges.length > 0) {
        setCurrentChallenge(generatedChallenges[0]);
        setCurrentChallengeIndex(0);
        setCode(getStarterCode(generatedChallenges[0], language));
      }
    } finally {
      setLoadingChallenges(false);
    }
  };

  // Generate comprehensive mock challenges if API fails
  const generateMockChallenges = () => {
    return [
      {
        id: "E001",
        title: "Two Sum",
        difficulty: "Easy",
        category: "Array",
        topics: ["Array", "Hash Table"],
        points: 100,
        statement_markdown: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        input_format: "Line 1: Space-separated integers representing the array\nLine 2: Target integer",
        output_format: "Two space-separated integers representing the indices",
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists"
        ],
        test_cases: [
          {"input": [[2,7,11,15], 9], "output": [0,1], "type": "public"},
          {"input": [[3,2,4], 6], "output": [1,2], "type": "public"}
        ],
        canonical_solution: {
          Python: {
            code: "def two_sum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []",
            time_complexity: "O(n)",
            space_complexity: "O(n)"
          }
        },
        editorial: "Use a hash map to store each number and its index as we iterate through the array. For each number, check if its complement (target - current number) exists in the hash map.",
        hints: [
          "Think about what you need to find for each number",
          "Consider using a hash map to store previously seen numbers",
          "You only need one pass through the array"
        ]
      },
      {
        id: "E002",
        title: "Valid Parentheses",
        difficulty: "Easy",
        category: "String",
        topics: ["String", "Stack"],
        points: 100,
        statement_markdown: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n\nEvery close bracket has a corresponding open bracket of the same type.",
        input_format: "A string s consisting of brackets only",
        output_format: "Boolean value (true if valid, false otherwise)",
        constraints: [
          "1 <= s.length <= 10^4",
          "s consists of parentheses only '()[]{}'."
        ],
        test_cases: [
          {"input": ["()"], "output": true, "type": "public"},
          {"input": ["()[]{}"], "output": true, "type": "public"},
          {"input": ["(]"], "output": false, "type": "public"}
        ],
        canonical_solution: {
          Python: {
            code: "def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    \n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    \n    return not stack",
            time_complexity: "O(n)",
            space_complexity: "O(n)"
          }
        },
        editorial: "Use a stack data structure to keep track of opening brackets. When encountering a closing bracket, check if it matches the most recent opening bracket.",
        hints: [
          "Consider using a stack to track opening brackets",
          "Create a mapping of closing to opening brackets",
          "What should happen when you encounter a closing bracket?"
        ]
      },
      // Generate remaining challenges with proper structure
      ...Array.from({length: 203}, (_, i) => ({
        id: `G${String(i + 3).padStart(3, '0')}`,
        title: `Challenge ${i + 3}`,
        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
        category: ['Array', 'String', 'LinkedList', 'Tree', 'Graph'][Math.floor(Math.random() * 5)],
        topics: [['Array', 'Math'], ['String', 'Dynamic Programming'], ['Tree', 'Recursion']][Math.floor(Math.random() * 3)],
        points: 100 + (i * 10),
        statement_markdown: `This is practice challenge number ${i + 3}. Write a function to solve this coding problem.\n\nGiven some input, produce the expected output following the constraints.\n\nThis challenge will help you practice fundamental programming concepts.`,
        input_format: "Input format for challenge",
        output_format: "Output format for challenge",
        constraints: [
          `1 <= n <= 10^${Math.floor(Math.random() * 5) + 3}`,
          "All inputs are valid"
        ],
        test_cases: [
          {"input": [`sample_input_${i + 3}`], "output": `sample_output_${i + 3}`, "type": "public"}
        ],
        canonical_solution: {
          Python: {
            code: `def solution():\n    # Sample solution for Challenge ${i + 3}\n    return "Solution ${i + 3}"`,
            time_complexity: "O(n)",
            space_complexity: "O(1)"
          }
        },
        editorial: `This is the editorial explanation for Challenge ${i + 3}. The approach involves analyzing the problem requirements and implementing an efficient solution.`,
        hints: [
          `Hint 1 for Challenge ${i + 3}`,
          `Hint 2 for Challenge ${i + 3}`
        ]
      }))
    ];
  };

  // Get starter code for current challenge and language
  const getStarterCode = (challenge, lang) => {
    if (!challenge) return '';
    return challenge.starter_code?.[lang] || challenge.starter_code?.python || `# Challenge: ${challenge.title}\n# Write your solution here`;
  };

  // Navigation functions
  const goToNextChallenge = () => {
    if (currentChallengeIndex < allChallenges.length - 1) {
      const nextIndex = currentChallengeIndex + 1;
      setCurrentChallengeIndex(nextIndex);
      setCurrentChallenge(allChallenges[nextIndex]);
      setCode(getStarterCode(allChallenges[nextIndex], language));
      setOutput('');
    }
  };

  const goToPreviousChallenge = () => {
    if (currentChallengeIndex > 0) {
      const prevIndex = currentChallengeIndex - 1;
      setCurrentChallengeIndex(prevIndex);
      setCurrentChallenge(allChallenges[prevIndex]);
      setCode(getStarterCode(allChallenges[prevIndex], language));
      setOutput('');
    }
  };

  const shuffleChallenges = () => {
    const shuffled = [...allChallenges].sort(() => Math.random() - 0.5);
    setAllChallenges(shuffled);
    setCurrentChallengeIndex(0);
    setCurrentChallenge(shuffled[0]);
    setCode(getStarterCode(shuffled[0], language));
    setOutput('');
  };

  // Practice challenges
  const practiceChallenges = {
    beginner: [
      {
        id: 1,
        title: "Hello World",
        description: "Write a program that prints 'Hello, World!' to the console",
        difficulty: "Easy",
        timeLimit: 300, // 5 minutes
        points: 50,
        template: {
          python: "# Write your code here\n",
          javascript: "// Write your code here\n",
          java: "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}"
        },
        expectedOutput: "Hello, World!"
      },
      {
        id: 2,
        title: "Sum of Two Numbers",
        description: "Create a function that takes two numbers and returns their sum",
        difficulty: "Easy",
        timeLimit: 600,
        points: 75,
        template: {
          python: "def add_numbers(a, b):\n    # Write your code here\n    pass\n\n# Test your function\nresult = add_numbers(5, 3)\nprint(result)",
          javascript: "function addNumbers(a, b) {\n    // Write your code here\n}\n\n// Test your function\nconst result = addNumbers(5, 3);\nconsole.log(result);",
          java: "public class Main {\n    public static int addNumbers(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        int result = addNumbers(5, 3);\n        System.out.println(result);\n    }\n}"
        },
        expectedOutput: "8"
      }
    ],
    intermediate: [
      {
        id: 3,
        title: "Fibonacci Sequence",
        description: "Write a function that generates the first n numbers of the Fibonacci sequence",
        difficulty: "Medium",
        timeLimit: 900,
        points: 150,
        template: {
          python: "def fibonacci(n):\n    # Write your code here\n    pass\n\n# Test your function\nresult = fibonacci(10)\nprint(result)",
          javascript: "function fibonacci(n) {\n    // Write your code here\n}\n\n// Test your function\nconst result = fibonacci(10);\nconsole.log(result);",
          java: "import java.util.Arrays;\n\npublic class Main {\n    public static int[] fibonacci(int n) {\n        // Write your code here\n        return new int[0];\n    }\n    \n    public static void main(String[] args) {\n        int[] result = fibonacci(10);\n        System.out.println(Arrays.toString(result));\n    }\n}"
        },
        expectedOutput: "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]"
      }
    ],
    advanced: [
      {
        id: 4,
        title: "Binary Tree Traversal",
        description: "Implement in-order traversal of a binary tree",
        difficulty: "Hard",
        timeLimit: 1800,
        points: 300,
        template: {
          python: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef inorder_traversal(root):\n    # Write your code here\n    pass",
          javascript: "class TreeNode {\n    constructor(val, left, right) {\n        this.val = val === undefined ? 0 : val;\n        this.left = left === undefined ? null : left;\n        this.right = right === undefined ? null : right;\n    }\n}\n\nfunction inorderTraversal(root) {\n    // Write your code here\n}",
          java: "class TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n    TreeNode(int val, TreeNode left, TreeNode right) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n\npublic class Main {\n    public static List<Integer> inorderTraversal(TreeNode root) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}"
        },
        expectedOutput: "[1, 3, 2]"
      }
    ]
  };

  // Timer effect - Fixed to prevent continuous refreshing
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning]); // Only depend on isTimerRunning

  // Load challenges when component mounts or mode changes
  useEffect(() => {
    if (practiceMode === 'challenges') {
      loadChallenges();
      setIsTimerRunning(true); // Start timer when entering challenge mode
    } else {
      setIsTimerRunning(false); // Stop timer when leaving challenge mode
    }
  }, [practiceMode]);

  // Update code when language changes for current challenge
  useEffect(() => {
    if (currentChallenge && practiceMode === 'challenges') {
      setCode(getStarterCode(currentChallenge, language));
    }
  }, [language, currentChallenge]);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && code) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`practice_${language}`, code);
        playSound('save');
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [code, language, autoSave]);

  // Load saved code
  useEffect(() => {
    const savedCode = localStorage.getItem(`practice_${language}`);
    if (savedCode && practiceMode === 'freestyle') {
      setCode(savedCode);
    }
  }, [language, practiceMode]);

  const playSound = (type) => {
    if (!soundEnabled) return;
    // Web Audio API for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      save: 800,
      success: 1000,
      error: 300,
      achievement: 1200
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const runCode = async () => {
    setIsRunning(true);
    setIsTimerRunning(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: language,
          input: ''
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setOutput(result.output || 'Code executed successfully!');
        playSound('success');
        
        // Update practice stats
        setPracticeStats(prev => ({
          ...prev,
          linesWritten: prev.linesWritten + code.split('\n').length,
          streak: prev.streak + 1
        }));
        
        // Check if challenge is completed
        if (currentChallenge && result.output?.trim() === currentChallenge.expectedOutput) {
          handleChallengeSuccess();
        }
      } else {
        setOutput(`Error: ${result.error}`);
        playSound('error');
        setPracticeStats(prev => ({
          ...prev,
          errorsFixed: prev.errorsFixed + 1
        }));
      }
    } catch (error) {
      setOutput(`Network Error: ${error.message}`);
      playSound('error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleChallengeSuccess = () => {
    playSound('achievement');
    setPracticeStats(prev => ({
      ...prev,
      challenges: prev.challenges + 1
    }));
    
    // Add achievement
    const newAchievement = {
      id: Date.now(),
      title: `${currentChallenge.title} Completed!`,
      points: currentChallenge.points,
      time: new Date().toLocaleTimeString()
    };
    
    setAchievements(prev => [newAchievement, ...prev.slice(0, 4)]);
    
    // Auto-load next challenge after 3 seconds
    setTimeout(() => {
      loadNextChallenge();
    }, 3000);
  };

  const startChallenge = (difficulty) => {
    const challenges = practiceChallenges[difficulty];
    if (challenges && challenges.length > 0) {
      const challenge = challenges[0]; // Start with first challenge
      setCurrentChallenge(challenge);
      setCode(challenge.template[language] || '');
      setPracticeMode('challenge');
      setIsTimerRunning(true);
    }
  };

  const loadNextChallenge = () => {
    if (!currentChallenge) return;
    
    const allChallenges = [
      ...practiceChallenges.beginner,
      ...practiceChallenges.intermediate,
      ...practiceChallenges.advanced
    ];
    
    const currentIndex = allChallenges.findIndex(c => c.id === currentChallenge.id);
    const nextChallenge = allChallenges[currentIndex + 1];
    
    if (nextChallenge) {
      setCurrentChallenge(nextChallenge);
      setCode(nextChallenge.template[language] || '');
    } else {
      // All challenges completed
      setPracticeMode('freestyle');
      setCurrentChallenge(null);
      setCode('');
    }
  };

  const getLanguageExtension = () => {
    switch (language) {
      case 'python': return [python()];
      case 'javascript': return [javascript()];
      case 'java': return [java()];
      default: return [];
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const PracticeHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black text-white p-6"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Code2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Practice Arena</h1>
            <p className="text-gray-300">Level up your coding skills with interactive challenges</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Session Timer */}
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
            </div>
          </div>
          
          {/* Challenge Counter */}
          {practiceMode === 'challenges' && allChallenges.length > 0 && (
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span className="font-mono text-lg">
                  {currentChallengeIndex + 1} / {allChallenges.length}
                </span>
              </div>
            </div>
          )}
          
          {/* Practice Stats */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{practiceStats.challenges}</div>
              <div className="text-xs text-gray-300">Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{practiceStats.streak}</div>
              <div className="text-xs text-gray-300">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{practiceStats.linesWritten}</div>
              <div className="text-xs text-gray-300">Lines</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Challenge Navigation */}
      {practiceMode === 'challenges' && allChallenges.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={goToPreviousChallenge}
              disabled={currentChallengeIndex === 0}
              className="p-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SkipBack className="h-5 w-5" />
            </motion.button>
            
            <motion.button
              onClick={shuffleChallenges}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Shuffle Challenges"
            >
              <RefreshCw className="h-5 w-5" />
            </motion.button>
            
            <motion.button
              onClick={goToNextChallenge}
              disabled={currentChallengeIndex === allChallenges.length - 1}
              className="p-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SkipForward className="h-5 w-5" />
            </motion.button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {loadingChallenges ? 'Loading challenges...' : `${allChallenges.length} challenges loaded`}
            </span>
          </div>
        </div>
      )}
      
      {/* Current Challenge Banner */}
      {currentChallenge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold">{currentChallenge.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  currentChallenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  currentChallenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentChallenge.difficulty}
                </span>
                {currentChallenge.category && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {currentChallenge.category}
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentChallenge.description?.split('\n')[0]}
              </p>
            </div>
            <div className="text-right ml-4">
              <motion.button
                onClick={() => {
                  if (currentChallenge.canonical_solution?.[language]) {
                    setCode(currentChallenge.canonical_solution[language].code);
                  } else if (currentChallenge.canonical_solution?.python) {
                    setCode(currentChallenge.canonical_solution.python.code);
                  }
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Lightbulb className="h-4 w-4 inline mr-2" />
                Show Solution
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const PracticeModeSelector = () => (
    <div className="bg-white/80 backdrop-blur-sm p-4 border-b border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">Practice Mode:</span>
          <div className="flex space-x-2">
            <motion.button
              onClick={() => setPracticeMode('freestyle')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                practiceMode === 'freestyle'
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4" />
                <span>Freestyle</span>
              </div>
            </motion.button>
            
            <motion.button
              onClick={() => startChallenge('beginner')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                practiceMode === 'challenge'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Challenges</span>
              </div>
            </motion.button>
          </div>
        </div>
        
        {practiceMode === 'freestyle' && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Quick Start:</span>
            <div className="flex space-x-2">
              {Object.keys(practiceChallenges).map((difficulty) => (
                <motion.button
                  key={difficulty}
                  onClick={() => startChallenge(difficulty)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    difficulty === 'beginner' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                    difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                    'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ToolbarSection = () => (
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>
          
          {/* Run Button */}
          <motion.button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </motion.button>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Editor Settings */}
          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showLineNumbers ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </motion.button>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setFontSize(Math.max(10, fontSize - 2))}
              className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MinusCircle className="w-4 h-4" />
            </motion.button>
            <span className="text-sm font-mono min-w-[3rem] text-center">{fontSize}px</span>
            <motion.button
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusCircle className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );

  const AchievementToast = () => (
    <AnimatePresence>
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-4 right-4 z-50 space-y-2"
        >
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-black text-white p-4 rounded-lg shadow-2xl max-w-sm"
            >
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6" />
                <div>
                  <div className="font-bold">{achievement.title}</div>
                  <div className="text-sm opacity-90">+{achievement.points} points</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`min-h-screen ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <PracticeHeader />
      <PracticeModeSelector />
      <ToolbarSection />
      
      <div className="flex h-[calc(100vh-200px)]">
        {/* Problem Description Panel */}
        {practiceMode === 'challenges' && currentChallenge && (
          <div className="w-1/3 flex flex-col border-r border-gray-200 bg-white">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700 flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Problem Description</span>
              </h3>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              <div className="space-y-4">
                {/* Problem Title and Meta */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{currentChallenge.title}</h2>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      currentChallenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      currentChallenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentChallenge.difficulty}
                    </span>
                    {currentChallenge.category && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {currentChallenge.category}
                      </span>
                    )}
                    {currentChallenge.points && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        {currentChallenge.points} pts
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Problem Description */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {currentChallenge.statement_markdown || currentChallenge.description || "No description available for this challenge."}
                  </div>
                </div>
                
                {/* Input/Output Format */}
                {(currentChallenge.input_format || currentChallenge.output_format) && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Format</h3>
                    <div className="space-y-2">
                      {currentChallenge.input_format && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-1">Input Format</h4>
                          <div className="text-blue-700 text-sm whitespace-pre-wrap">
                            {currentChallenge.input_format}
                          </div>
                        </div>
                      )}
                      {currentChallenge.output_format && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-1">Output Format</h4>
                          <div className="text-green-700 text-sm whitespace-pre-wrap">
                            {currentChallenge.output_format}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Test Cases as Examples */}
                {currentChallenge.test_cases && currentChallenge.test_cases.filter(tc => tc.type === 'public').length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Examples</h3>
                    <div className="space-y-3">
                      {currentChallenge.test_cases
                        .filter(tc => tc.type === 'public')
                        .map((testCase, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm">
                            <div className="mb-1">
                              <span className="font-medium text-gray-700">Input:</span>
                              <code className="ml-2 bg-gray-200 px-1 rounded text-xs">
                                {JSON.stringify(testCase.input)}
                              </code>
                            </div>
                            <div className="mb-1">
                              <span className="font-medium text-gray-700">Output:</span>
                              <code className="ml-2 bg-gray-200 px-1 rounded text-xs">
                                {JSON.stringify(testCase.output)}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Constraints */}
                {currentChallenge.constraints && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Constraints</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <ul className="text-gray-600 text-sm space-y-1">
                        {Array.isArray(currentChallenge.constraints) ? (
                          currentChallenge.constraints.map((constraint, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-gray-400 mr-2">•</span>
                              <span>{constraint}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>{currentChallenge.constraints}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Hints */}
                {currentChallenge.hints && currentChallenge.hints.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Hints</h3>
                    <div className="space-y-2">
                      {currentChallenge.hints.map((hint, index) => (
                        <div key={index} className="bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                          <div className="text-blue-800 text-sm">💡 {hint}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Solution Section */}
                <div>
                  <motion.button
                    onClick={() => {
                      if (currentChallenge.canonical_solution?.[language]) {
                        setCode(currentChallenge.canonical_solution[language].code);
                      } else if (currentChallenge.canonical_solution?.Python) {
                        setCode(currentChallenge.canonical_solution.Python.code);
                      }
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Lightbulb className="h-4 w-4 inline mr-2" />
                    Show Solution
                  </motion.button>
                  
                  {/* Editorial/Explanation */}
                  {currentChallenge.editorial && (
                    <div className="mt-2 p-3 bg-yellow-50 rounded-lg border-l-2 border-yellow-300">
                      <h4 className="font-medium text-yellow-800 mb-1">Solution Explanation</h4>
                      <div className="text-yellow-700 text-sm whitespace-pre-wrap">
                        {currentChallenge.editorial}
                      </div>
                    </div>
                  )}
                  
                  {/* Time/Space Complexity */}
                  {currentChallenge.canonical_solution?.[language] && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {currentChallenge.canonical_solution[language].time_complexity && (
                        <div className="p-2 bg-blue-50 rounded text-center">
                          <div className="text-xs text-blue-600 font-medium">Time</div>
                          <div className="text-sm text-blue-800 font-mono">
                            {currentChallenge.canonical_solution[language].time_complexity}
                          </div>
                        </div>
                      )}
                      {currentChallenge.canonical_solution[language].space_complexity && (
                        <div className="p-2 bg-green-50 rounded text-center">
                          <div className="text-xs text-green-600 font-medium">Space</div>
                          <div className="text-sm text-green-800 font-mono">
                            {currentChallenge.canonical_solution[language].space_complexity}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Code Editor */}
        <div className={`flex-1 flex flex-col ${practiceMode === 'challenges' && currentChallenge ? '' : 'w-2/3'}`}>
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Code Editor</h3>
            <motion.button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>
          
          <div className="flex-1">
            <CodeMirror
              value={code}
              onChange={(value) => setCode(value)}
              extensions={getLanguageExtension()}
              theme={theme === 'dark' ? oneDark : githubLight}
              basicSetup={{
                lineNumbers: showLineNumbers,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightSelectionMatches: true,
                searchKeymap: true,
              }}
              style={{
                fontSize: `${fontSize}px`,
                height: '100%',
              }}
            />
          </div>
        </div>
        
        {/* Output Panel */}
        <div className="w-1/3 flex flex-col border-l border-gray-200">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700 flex items-center space-x-2">
              <Terminal className="w-4 h-4" />
              <span>Output</span>
            </h3>
          </div>
          
          <div className="flex-1 p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-auto">
            {output ? (
              <motion.pre
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-pre-wrap"
              >
                {output}
              </motion.pre>
            ) : (
              <div className="text-gray-500 italic">
                Run your code to see the output here...
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quick Actions:</span>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setCode('')}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Clear Code"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Copy Code"
                >
                  <Copy className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    const blob = new Blob([code], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `code.${language}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Download Code"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AchievementToast />
    </div>
  );
};

export default PracticeCompiler;