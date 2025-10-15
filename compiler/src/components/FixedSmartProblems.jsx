import React, { useState, useEffect, useCallback } from 'react';
import { 
  Code2, Brain, Trophy, Clock, Star, Target, Zap, Filter,
  Search, SortAsc, SortDesc, ChevronRight, Play, CheckCircle,
  XCircle, AlertCircle, BookOpen, Award, TrendingUp, BarChart3,
  Lightbulb, Coffee, Timer, Activity, Users, Eye, Heart,
  Share, Bookmark, MessageCircle, ThumbsUp, ExternalLink,
  RefreshCw, Settings, Download, Upload, Globe, Shield,
  Flame, Rocket, PieChart, LineChart, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FixedSmartProblems = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [userStats, setUserStats] = useState({});
  const [selectedProblem, setSelectedProblem] = useState(null);
  
  const { user } = useAuth();

  // Memoized function to load problems from API
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
        console.log('Loaded problems from API:', data);
        
        // Process the problems data
        const processedProblems = Array.isArray(data) ? data : (data.problems || []);
        setProblems(processedProblems);
        setFilteredProblems(processedProblems);
      } else {
        console.log('API failed, using mock data');
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

  // Memoized function to filter problems
  const filterProblems = useCallback(() => {
    let filtered = [...problems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty?.toLowerCase() === selectedDifficulty);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sort
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
      default:
        break;
    }

    setFilteredProblems(filtered);
  }, [problems, selectedDifficulty, selectedCategory, searchTerm, sortBy]);

  // Generate mock problems if API fails
  const generateMockProblems = () => {
    return [
      {
        id: 1,
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "easy",
        category: "arrays",
        tags: ["array", "hash-table"],
        acceptance_rate: 89,
        ai_score: 95,
        likes: 1234,
        solved_count: 50000,
        canonical_solution: {
          Python: {
            code: `def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
            explanation: "Use hash map to store seen numbers and find complement"
          }
        }
      },
      {
        id: 2,
        title: "Add Two Numbers",
        description: "You are given two non-empty linked lists representing two non-negative integers.",
        difficulty: "medium",
        category: "linked-lists",
        tags: ["linked-list", "math"],
        acceptance_rate: 76,
        ai_score: 88,
        likes: 892,
        solved_count: 35000,
        canonical_solution: {
          Python: {
            code: `def add_two_numbers(l1, l2):
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
            explanation: "Simulate addition with carry"
          }
        }
      },
      {
        id: 3,
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "medium",
        category: "strings",
        tags: ["string", "sliding-window"],
        acceptance_rate: 82,
        ai_score: 91,
        likes: 1567,
        solved_count: 42000,
        canonical_solution: {
          Python: {
            code: `def length_of_longest_substring(s):
    char_map = {}
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        if s[right] in char_map:
            left = max(left, char_map[s[right]] + 1)
        char_map[s[right]] = right
        max_length = max(max_length, right - left + 1)
    
    return max_length`,
            explanation: "Use sliding window technique with hash map"
          }
        }
      },
      {
        id: 4,
        title: "Median of Two Sorted Arrays",
        description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        difficulty: "hard",
        category: "arrays",
        tags: ["array", "binary-search", "divide-and-conquer"],
        acceptance_rate: 45,
        ai_score: 85,
        likes: 789,
        solved_count: 15000,
        canonical_solution: {
          Python: {
            code: `def find_median_sorted_arrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    
    m, n = len(nums1), len(nums2)
    left, right = 0, m
    
    while left <= right:
        partition1 = (left + right) // 2
        partition2 = (m + n + 1) // 2 - partition1
        
        max_left1 = float('-inf') if partition1 == 0 else nums1[partition1 - 1]
        min_right1 = float('inf') if partition1 == m else nums1[partition1]
        
        max_left2 = float('-inf') if partition2 == 0 else nums2[partition2 - 1]
        min_right2 = float('inf') if partition2 == n else nums2[partition2]
        
        if max_left1 <= min_right2 and max_left2 <= min_right1:
            if (m + n) % 2 == 0:
                return (max(max_left1, max_left2) + min(min_right1, min_right2)) / 2
            else:
                return max(max_left1, max_left2)
        elif max_left1 > min_right2:
            right = partition1 - 1
        else:
            left = partition1 + 1`,
            explanation: "Use binary search to partition arrays optimally"
          }
        }
      },
      {
        id: 5,
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "easy",
        category: "strings",
        tags: ["string", "stack"],
        acceptance_rate: 91,
        ai_score: 93,
        likes: 2341,
        solved_count: 75000,
        canonical_solution: {
          Python: {
            code: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    
    return not stack`,
            explanation: "Use stack to match opening and closing brackets"
          }
        }
      }
    ];
  };

  // Load problems on component mount
  useEffect(() => {
    if (user?.id) {
      loadProblems();
    } else {
      // Load mock data for demo
      const mockProblems = generateMockProblems();
      setProblems(mockProblems);
      setFilteredProblems(mockProblems);
      setLoading(false);
    }
  }, [user?.id, loadProblems]);

  // Filter problems when dependencies change
  useEffect(() => {
    filterProblems();
  }, [filterProblems]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleProblemClick = (problem) => {
    setSelectedProblem(problem);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (selectedProblem) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedProblem(null)}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Problems
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{selectedProblem.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedProblem.difficulty)}`}>
                {selectedProblem.difficulty}
              </span>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{selectedProblem.description}</p>
            </div>

            {selectedProblem.canonical_solution?.Python && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Solution</h2>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
                    <code>{selectedProblem.canonical_solution.Python.code}</code>
                  </pre>
                </div>
                <p className="text-gray-600 mt-4">{selectedProblem.canonical_solution.Python.explanation}</p>
              </div>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {selectedProblem.solved_count?.toLocaleString()} solved
              </div>
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                {selectedProblem.likes} likes
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                {selectedProblem.acceptance_rate}% acceptance
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Problems
          </h1>
          <p className="text-gray-600">
            AI-powered problem recommendations tailored to your skill level
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="arrays">Arrays</option>
                <option value="strings">Strings</option>
                <option value="linked-lists">Linked Lists</option>
                <option value="trees">Trees</option>
                <option value="graphs">Graphs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recommended">AI Recommended</option>
                <option value="difficulty">Difficulty</option>
                <option value="acceptance">Acceptance Rate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          {filteredProblems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div 
                key={problem.id} 
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleProblemClick(problem)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-gray-900">{problem.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{problem.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {problem.solved_count?.toLocaleString()} solved
                    </div>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      {problem.acceptance_rate}% acceptance
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {problem.likes} likes
                    </div>
                  </div>

                  {problem.tags && (
                    <div className="flex items-center space-x-2">
                      {problem.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FixedSmartProblems;