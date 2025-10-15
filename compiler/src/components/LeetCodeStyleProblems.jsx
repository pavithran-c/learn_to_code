import React, { useState, useEffect, useCallback } from 'react';
import { 
  Code2, Brain, Trophy, Clock, Star, Target, Zap, Filter,
  Search, SortAsc, SortDesc, ChevronRight, Play, CheckCircle,
  XCircle, AlertCircle, BookOpen, Award, TrendingUp, BarChart3,
  Lightbulb, Coffee, Timer, Activity, Users, Eye, Heart,
  Share, Bookmark, MessageCircle, ThumbsUp, ExternalLink,
  RefreshCw, Settings, Download, Upload, Globe, Shield,
  Flame, Rocket, PieChart, LineChart, ArrowUp, ArrowDown,
  X, ChevronLeft, ChevronDown, Menu, List, Grid, Shuffle,
  MousePointer, Bot, User, Layers, FileText, Terminal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LeetCodeStyleProblems = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [solvingMode, setSolvingMode] = useState('selective'); // 'selective' or 'ai-driven'
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [aiRecommendation, setAiRecommendation] = useState(null);
  
  const { user } = useAuth();

  // Problem view states
  const [activeTab, setActiveTab] = useState('description');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Load problems from API
  const loadProblems = useCallback(async () => {
    setLoading(true);
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
        setProblems(processedProblems);
        setFilteredProblems(processedProblems);
        
        // Load user stats
        loadUserStats();
      } else {
        const mockProblems = generateMockProblems();
        setProblems(mockProblems);
        setFilteredProblems(mockProblems);
      }
    } catch (error) {
      console.error('Error loading problems:', error);
      const mockProblems = generateMockProblems();
      setProblems(mockProblems);
      setFilteredProblems(mockProblems);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user statistics for AI recommendations
  const loadUserStats = useCallback(async () => {
    try {
      // Mock user stats - in real app, this would come from backend
      setUserStats({
        solvedProblems: 23,
        accuracy: 78,
        strongCategories: ['arrays', 'strings'],
        weakCategories: ['dynamic-programming', 'graphs'],
        averageTime: 15.5,
        currentStreak: 7,
        difficulty_distribution: {
          easy: 15,
          medium: 6,
          hard: 2
        }
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, []);

  // AI-driven problem recommendation
  const getAiRecommendation = useCallback(() => {
    if (!problems.length || !userStats.solvedProblems) return null;

    // Simple AI logic - recommend based on user's weak areas and progression
    const unsolvedProblems = problems.filter(p => !p.is_solved);
    
    // Prioritize weak categories
    let candidates = unsolvedProblems.filter(p => 
      userStats.weakCategories.includes(p.category?.toLowerCase())
    );
    
    // If no weak category problems, suggest next difficulty level
    if (candidates.length === 0) {
      const { easy, medium, hard } = userStats.difficulty_distribution;
      let targetDifficulty = 'easy';
      
      if (easy > 10 && medium < 5) targetDifficulty = 'medium';
      else if (medium > 5 && hard < 3) targetDifficulty = 'hard';
      
      candidates = unsolvedProblems.filter(p => 
        p.difficulty?.toLowerCase() === targetDifficulty
      );
    }
    
    // Return random from candidates or fallback to first unsolved
    const recommended = candidates.length > 0 
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : unsolvedProblems[0];
    
    return recommended;
  }, [problems, userStats]);

  // Filter problems based on current settings
  const filterProblems = useCallback(() => {
    let filtered = [...problems];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty?.toLowerCase() === selectedDifficulty);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sort problems
    switch (sortBy) {
      case 'recommended':
        filtered.sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));
        break;
      case 'difficulty':
        const diffOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
        filtered.sort((a, b) => (diffOrder[a.difficulty?.toLowerCase()] || 0) - (diffOrder[b.difficulty?.toLowerCase()] || 0));
        break;
      case 'acceptance':
        filtered.sort((a, b) => (b.acceptance_rate || 0) - (a.acceptance_rate || 0));
        break;
      case 'frequency':
        filtered.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
        break;
      default:
        break;
    }

    setFilteredProblems(filtered);
  }, [problems, selectedDifficulty, selectedCategory, searchTerm, sortBy]);

  // AI-driven mode: automatically select and show recommended problem
  useEffect(() => {
    if (solvingMode === 'ai-driven' && problems.length > 0 && userStats.solvedProblems !== undefined) {
      const recommended = getAiRecommendation();
      if (recommended) {
        setAiRecommendation(recommended);
        setSelectedProblem(recommended);
        setUserCode(getStarterCode(recommended, language));
      }
    }
  }, [solvingMode, problems, userStats, getAiRecommendation, language]);

  // Effect to filter problems when dependencies change
  useEffect(() => {
    filterProblems();
  }, [filterProblems]);

  // Load problems on component mount
  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  // Get starter code for problem
  const getStarterCode = (problem, lang) => {
    const starters = {
      python: `def solution():\n    # Write your code here\n    pass\n\n# Test your solution\nprint(solution())`,
      javascript: `function solution() {\n    // Write your code here\n}\n\n// Test your solution\nconsole.log(solution());`,
      java: `public class Solution {\n    public void solution() {\n        // Write your code here\n    }\n    \n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        sol.solution();\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Write your code here\n    }\n};\n\nint main() {\n    Solution sol;\n    sol.solution();\n    return 0;\n}`
    };
    return problem?.starter_code?.[lang] || starters[lang] || starters.python;
  };

  // Run code
  const runCode = async () => {
    setIsRunning(true);
    try {
      // Mock code execution - in real app, this would call backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResults({
        passed: Math.random() > 0.3,
        total_tests: 5,
        passed_tests: Math.floor(Math.random() * 5) + 1,
        execution_time: `${(Math.random() * 100).toFixed(0)}ms`,
        memory_used: `${(Math.random() * 50 + 10).toFixed(1)}MB`,
        output: "Test case 1: Passed\\nTest case 2: Passed\\nTest case 3: Failed"
      });
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit solution
  const submitSolution = async () => {
    setIsRunning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const passed = Math.random() > 0.2;
      setTestResults({
        passed,
        total_tests: 10,
        passed_tests: passed ? 10 : Math.floor(Math.random() * 8) + 1,
        execution_time: `${(Math.random() * 200).toFixed(0)}ms`,
        memory_used: `${(Math.random() * 80 + 20).toFixed(1)}MB`,
        output: passed ? "All test cases passed!" : "Some test cases failed.",
        accepted: passed
      });
      
      if (passed) {
        // Mark problem as solved
        setProblems(prev => prev.map(p => 
          p.id === selectedProblem.id ? { ...p, is_solved: true } : p
        ));
        
        // Update user stats
        setUserStats(prev => ({
          ...prev,
          solvedProblems: prev.solvedProblems + 1,
          currentStreak: prev.currentStreak + 1
        }));
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Generate mock problems
  const generateMockProblems = () => {
    return [
      {
        id: 1,
        title: "Two Sum",
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists.`,
        difficulty: "easy",
        category: "arrays",
        tags: ["array", "hash-table"],
        acceptance_rate: 89,
        ai_score: 95,
        likes: 1234,
        dislikes: 45,
        solved_count: 50000,
        frequency: 95,
        is_solved: false,
        companies: ["Amazon", "Google", "Microsoft", "Apple"],
        hints: [
          "Try using a hash map to store numbers you've seen before",
          "For each number, check if its complement (target - number) exists in the hash map"
        ],
        starter_code: {
          python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
          javascript: "function twoSum(nums, target) {\n    // Write your code here\n}",
          java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}",
          cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};"
        },
        canonical_solution: {
          python: {
            code: `def twoSum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
            explanation: "Use a hash map to store numbers and their indices. For each number, check if its complement exists in the map.",
            time_complexity: "O(n)",
            space_complexity: "O(n)"
          }
        }
      },
      {
        id: 2,
        title: "Add Two Numbers",
        description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

Example 1:
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.

Example 2:
Input: l1 = [0], l2 = [0]
Output: [0]

Example 3:
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]`,
        difficulty: "medium",
        category: "linked-lists",
        tags: ["linked-list", "math", "recursion"],
        acceptance_rate: 76,
        ai_score: 88,
        likes: 892,
        dislikes: 78,
        solved_count: 35000,
        frequency: 87,
        is_solved: true,
        companies: ["Amazon", "Microsoft", "Facebook", "Apple"],
        hints: [
          "Remember to handle the carry value when sum exceeds 9",
          "Create a dummy head node to simplify the logic"
        ],
        starter_code: {
          python: "def addTwoNumbers(l1, l2):\n    # Write your code here\n    pass",
          javascript: "function addTwoNumbers(l1, l2) {\n    // Write your code here\n}",
          java: "class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        // Write your code here\n    }\n}",
          cpp: "class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        // Write your code here\n    }\n};"
        },
        canonical_solution: {
          python: {
            code: `def addTwoNumbers(l1, l2):
    dummy = ListNode(0)
    current = dummy
    carry = 0
    
    while l1 or l2 or carry:
        val1 = l1.val if l1 else 0
        val2 = l2.val if l2 else 0
        total = val1 + val2 + carry
        
        carry = total // 10
        current.next = ListNode(total % 10)
        current = current.next
        
        if l1: l1 = l1.next
        if l2: l2 = l2.next
    
    return dummy.next`,
            explanation: "Simulate addition with carry, creating new nodes for the result linked list.",
            time_complexity: "O(max(m,n))",
            space_complexity: "O(max(m,n))"
          }
        }
      },
      {
        id: 3,
        title: "Longest Substring Without Repeating Characters",
        description: `Given a string s, find the length of the longest substring without repeating characters.

Example 1:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Example 2:
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Example 3:
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.`,
        difficulty: "medium",
        category: "strings",
        tags: ["string", "sliding-window", "hash-table"],
        acceptance_rate: 82,
        ai_score: 91,
        likes: 1567,
        dislikes: 92,
        solved_count: 42000,
        frequency: 79,
        is_solved: false,
        companies: ["Amazon", "Facebook", "Google", "Microsoft"],
        hints: [
          "Use sliding window technique",
          "Keep track of characters in current window using a hash set"
        ],
        starter_code: {
          python: "def lengthOfLongestSubstring(s):\n    # Write your code here\n    pass",
          javascript: "function lengthOfLongestSubstring(s) {\n    // Write your code here\n}",
          java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n    }\n}",
          cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n    }\n};"
        },
        canonical_solution: {
          python: {
            code: `def lengthOfLongestSubstring(s):
    char_map = {}
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        if s[right] in char_map:
            left = max(left, char_map[s[right]] + 1)
        char_map[s[right]] = right
        max_length = max(max_length, right - left + 1)
    
    return max_length`,
            explanation: "Use sliding window with hash map to track character positions.",
            time_complexity: "O(n)",
            space_complexity: "O(min(m,n))"
          }
        }
      },
      {
        id: 4,
        title: "Median of Two Sorted Arrays",
        description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

Example 1:
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.

Example 2:
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.`,
        difficulty: "hard",
        category: "arrays",
        tags: ["array", "binary-search", "divide-and-conquer"],
        acceptance_rate: 45,
        ai_score: 75,
        likes: 934,
        dislikes: 156,
        solved_count: 15000,
        frequency: 65,
        is_solved: false,
        companies: ["Google", "Amazon", "Microsoft", "Apple"],
        hints: [
          "Use binary search to find the correct partition",
          "Ensure the left partition has the right number of elements"
        ],
        starter_code: {
          python: "def findMedianSortedArrays(nums1, nums2):\n    # Write your code here\n    pass",
          javascript: "function findMedianSortedArrays(nums1, nums2) {\n    // Write your code here\n}",
          java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n    }\n}",
          cpp: "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your code here\n    }\n};"
        },
        canonical_solution: {
          python: {
            code: `def findMedianSortedArrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    
    m, n = len(nums1), len(nums2)
    low, high = 0, m
    
    while low <= high:
        partitionX = (low + high) // 2
        partitionY = (m + n + 1) // 2 - partitionX
        
        maxLeftX = float('-inf') if partitionX == 0 else nums1[partitionX - 1]
        minRightX = float('inf') if partitionX == m else nums1[partitionX]
        
        maxLeftY = float('-inf') if partitionY == 0 else nums2[partitionY - 1]
        minRightY = float('inf') if partitionY == n else nums2[partitionY]
        
        if maxLeftX <= minRightY and maxLeftY <= minRightX:
            if (m + n) % 2 == 0:
                return (max(maxLeftX, maxLeftY) + min(minRightX, minRightY)) / 2
            else:
                return max(maxLeftX, maxLeftY)
        elif maxLeftX > minRightY:
            high = partitionX - 1
        else:
            low = partitionX + 1`,
            explanation: "Use binary search to partition arrays such that left partition elements ≤ right partition elements.",
            time_complexity: "O(log(min(m,n)))",
            space_complexity: "O(1)"
          }
        }
      },
      {
        id: 5,
        title: "Valid Parentheses",
        description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false`,
        difficulty: "easy",
        category: "strings",
        tags: ["string", "stack"],
        acceptance_rate: 91,
        ai_score: 93,
        likes: 892,
        dislikes: 23,
        solved_count: 75000,
        frequency: 88,
        is_solved: false,
        companies: ["Amazon", "Microsoft", "Google", "Facebook"],
        hints: [
          "Use a stack data structure",
          "When you see an opening bracket, push it onto the stack"
        ],
        starter_code: {
          python: "def isValid(s):\n    # Write your code here\n    pass",
          javascript: "function isValid(s) {\n    // Write your code here\n}",
          java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n    }\n}",
          cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n    }\n};"
        },
        canonical_solution: {
          python: {
            code: `def isValid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    
    return not stack`,
            explanation: "Use stack to track opening brackets and match with closing brackets.",
            time_complexity: "O(n)",
            space_complexity: "O(n)"
          }
        }
      }
    ];
  };

  // Handle problem selection
  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setShowSolution(false);
    setUserCode(getStarterCode(problem, language));
    setTestResults(null);
    setActiveTab('description');
    
    // Load mock comments
    setComments([
      {
        id: 1,
        user: "coding_ninja",
        content: "Great problem for beginners! The hash map approach is very elegant.",
        likes: 12,
        timestamp: "2 hours ago"
      },
      {
        id: 2,
        user: "algo_master",
        content: "I solved this using a two-pointer approach initially, but hash map is much cleaner.",
        likes: 8,
        timestamp: "1 day ago"
      }
    ]);
  };

  // Handle mode change
  const handleModeChange = (mode) => {
    setSolvingMode(mode);
    if (mode === 'selective') {
      setSelectedProblem(null);
      setAiRecommendation(null);
    }
  };

  // Add comment
  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: user?.name || "Anonymous",
        content: newComment,
        likes: 0,
        timestamp: "now"
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problems...</p>
        </div>
      </div>
    );
  }

  // Problems list view
  if (!selectedProblem) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-black">Problems</h1>
              
              {/* Mode Toggle */}
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleModeChange('selective')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      solvingMode === 'selective'
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <MousePointer className="w-4 h-4 inline mr-2" />
                    Selective
                  </button>
                  <button
                    onClick={() => handleModeChange('ai-driven')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      solvingMode === 'ai-driven'
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Bot className="w-4 h-4 inline mr-2" />
                    AI-Driven
                  </button>
                </div>
              </div>
            </div>

            {/* AI Recommendation Banner */}
            {solvingMode === 'ai-driven' && aiRecommendation && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Bot className="w-6 h-6 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900">
                      AI Recommendation Based on Your Progress
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      We recommend "{aiRecommendation.title}" to strengthen your {aiRecommendation.category} skills.
                    </p>
                  </div>
                  <button
                    onClick={() => handleProblemSelect(aiRecommendation)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Start Problem
                  </button>
                </div>
              </div>
            )}

            {/* Filters - Only show in selective mode */}
            {solvingMode === 'selective' && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="arrays">Arrays</option>
                  <option value="strings">Strings</option>
                  <option value="linked-lists">Linked Lists</option>
                  <option value="trees">Trees</option>
                  <option value="graphs">Graphs</option>
                  <option value="dynamic-programming">Dynamic Programming</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="recommended">Recommended</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="acceptance">Acceptance Rate</option>
                  <option value="frequency">Frequency</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Problems List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div className="col-span-1">Status</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Acceptance</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredProblems.map((problem) => (
                <div
                  key={problem.id}
                  onClick={() => handleProblemSelect(problem)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="col-span-1 flex items-center">
                    {problem.is_solved ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="col-span-5">
                    <h3 className="font-medium text-black hover:text-blue-600 transition-colors">
                      {problem.title}
                    </h3>
                    <div className="flex items-center mt-1 space-x-2">
                      {problem.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <span className="text-gray-600 capitalize">{problem.category}</span>
                  </div>
                  
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-gray-600">{problem.acceptance_rate}%</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredProblems.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Problem solving view (LeetCode-style interface)
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedProblem(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-black">{selectedProblem.title}</h1>
          <span className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(selectedProblem.difficulty)}`}>
            {selectedProblem.difficulty}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bookmark className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('hints')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'hints'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Hints ({selectedProblem.hints?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Comments ({comments.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('solution');
                  setShowSolution(true);
                }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'solution'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Solution
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-black mb-4">{selectedProblem.title}</h2>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                      {selectedProblem.description}
                    </pre>
                  </div>
                </div>

                {/* Problem Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-black">{selectedProblem.acceptance_rate}%</div>
                    <div className="text-sm text-gray-600">Acceptance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-black">{selectedProblem.solved_count?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Solved</div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProblem.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Companies */}
                {selectedProblem.companies && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Similar Questions Asked By</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProblem.companies.map((company) => (
                        <span
                          key={company}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hints Tab */}
            {activeTab === 'hints' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">Hints</h3>
                {selectedProblem.hints?.map((hint, index) => (
                  <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{hint}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-600">No hints available for this problem.</p>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">Comments</h3>
                
                {/* Add Comment */}
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this problem..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    rows={3}
                  />
                  <button
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Comment
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-black">{comment.user}</span>
                          <span className="text-sm text-gray-500">{comment.timestamp}</span>
                        </div>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{comment.likes}</span>
                        </button>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solution Tab */}
            {activeTab === 'solution' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-black">Solution</h3>
                
                {showSolution ? (
                  <div className="space-y-4">
                    {/* Solution Code */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-black mb-3">Python Solution</h4>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{selectedProblem.canonical_solution?.python?.code}</code>
                      </pre>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-black">Explanation</h4>
                      <p className="text-gray-700">{selectedProblem.canonical_solution?.python?.explanation}</p>
                    </div>

                    {/* Complexity */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-900">Time Complexity</div>
                        <div className="text-blue-700">{selectedProblem.canonical_solution?.python?.time_complexity}</div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-900">Space Complexity</div>
                        <div className="text-blue-700">{selectedProblem.canonical_solution?.python?.space_complexity}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                      <h4 className="font-medium text-yellow-900 mb-2">Solution Hidden</h4>
                      <p className="text-yellow-700 mb-4">
                        Try solving the problem first. You can view the solution after you submit your attempt.
                      </p>
                      <button
                        onClick={() => setShowSolution(true)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Show Solution Anyway
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Code Editor Header */}
          <div className="border-b border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    setUserCode(getStarterCode(selectedProblem, e.target.value));
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                
                <button
                  onClick={() => setUserCode(getStarterCode(selectedProblem, language))}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Run</span>
                </button>
                
                <button
                  onClick={submitSolution}
                  disabled={isRunning}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none bg-gray-50"
                placeholder="Write your code here..."
                spellCheck={false}
              />
            </div>

            {/* Results Panel */}
            {(testResults || isRunning) && (
              <div className="border-t border-gray-200 bg-white">
                <div className="p-4">
                  <h4 className="font-medium text-black mb-3">
                    {isRunning ? 'Running...' : 'Results'}
                  </h4>
                  
                  {isRunning ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      <span className="text-gray-600">Executing your code...</span>
                    </div>
                  ) : testResults ? (
                    <div className="space-y-3">
                      {/* Test Status */}
                      <div className={`p-3 rounded-lg ${
                        testResults.accepted || testResults.passed 
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {testResults.accepted || testResults.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            testResults.accepted || testResults.passed ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {testResults.accepted ? 'Accepted' : testResults.passed ? 'Tests Passed' : 'Tests Failed'}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-700">
                          {testResults.passed_tests}/{testResults.total_tests} test cases passed
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Runtime:</span>
                          <span className="ml-2 font-medium">{testResults.execution_time}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Memory:</span>
                          <span className="ml-2 font-medium">{testResults.memory_used}</span>
                        </div>
                      </div>

                      {/* Output */}
                      {testResults.output && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Output:</h5>
                          <pre className="bg-gray-100 p-3 rounded-lg text-sm text-gray-800 overflow-x-auto">
                            {testResults.output}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeStyleProblems;