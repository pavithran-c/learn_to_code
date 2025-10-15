import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const SmartProblems = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [attemptedProblems, setAttemptedProblems] = useState(new Set());
  const [bookmarkedProblems, setBookmarkedProblems] = useState(new Set());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  
  const { user } = useAuth();

  // Load problems and user data
  useEffect(() => {
    loadProblems();
    loadUserProfile();
    loadUserStats();
  }, [user]);

  // Filter problems based on search and filters
  useEffect(() => {
    filterProblems();
  }, [problems, selectedDifficulty, selectedCategory, searchTerm, sortBy]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      // Simulate API call to backend
      const response = await fetch('http://localhost:5000/api/problems', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems || []);
        setRecommendations(data.recommendations || []);
      } else {
        // Fallback to mock data
        const mockProblems = generateMockProblems();
        setProblems(mockProblems);
        generateRecommendations(mockProblems);
      }
    } catch (error) {
      console.error('Error loading problems:', error);
      // Fallback to mock data
      const mockProblems = generateMockProblems();
      setProblems(mockProblems);
      generateRecommendations(mockProblems);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
        setCompletedProblems(new Set(data.completed || []));
        setAttemptedProblems(new Set(data.attempted || []));
        setBookmarkedProblems(new Set(data.bookmarked || []));
      } else {
        // Mock user profile
        setUserProfile({
          skill_level: 'intermediate',
          preferred_topics: ['arrays', 'strings', 'dynamic_programming'],
          weak_areas: ['graphs', 'trees'],
          learning_style: 'visual'
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
        setCurrentStreak(data.current_streak || 0);
        setWeeklyProgress(data.weekly_solved || 0);
      } else {
        // Mock stats
        setUserStats({
          problems_solved: 127,
          total_attempts: 203,
          accuracy_rate: 85.3,
          average_time: 24.5,
          rank: 1247,
          points: 8750
        });
        setCurrentStreak(15);
        setWeeklyProgress(8);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const generateMockProblems = () => {
    const categories = ['Arrays', 'Strings', 'Dynamic Programming', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Math'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const companies = ['Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook', 'Netflix', 'Uber', 'LinkedIn'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      title: `Problem ${i + 1}`,
      description: `Solve this ${categories[i % categories.length].toLowerCase()} problem efficiently.`,
      difficulty: difficulties[i % 3],
      category: categories[i % categories.length],
      tags: [categories[i % categories.length].toLowerCase(), 'algorithm'],
      acceptance_rate: Math.floor(Math.random() * 50) + 30,
      likes: Math.floor(Math.random() * 1000) + 100,
      dislikes: Math.floor(Math.random() * 100) + 10,
      companies: [companies[i % companies.length]],
      estimated_time: Math.floor(Math.random() * 60) + 15,
      premium: i % 7 === 0,
      solved_count: Math.floor(Math.random() * 10000) + 1000,
      ai_score: Math.random() * 100,
      similarity_score: Math.random() * 100
    }));
  };

  const generateRecommendations = (problemsList) => {
    // AI-based recommendation logic
    const userLevel = userProfile?.skill_level || 'intermediate';
    const weakAreas = userProfile?.weak_areas || [];
    
    const recommended = problemsList
      .filter(p => {
        // Filter based on user level
        if (userLevel === 'beginner' && p.difficulty === 'Hard') return false;
        if (userLevel === 'advanced' && p.difficulty === 'Easy') return false;
        
        // Prioritize weak areas
        return weakAreas.some(area => p.category.toLowerCase().includes(area)) || 
               Math.random() > 0.5;
      })
      .sort((a, b) => b.ai_score - a.ai_score)
      .slice(0, 10);
    
    setRecommendations(recommended);
  };

  const filterProblems = () => {
    let filtered = [...problems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty.toLowerCase() === selectedDifficulty);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sort
    switch (sortBy) {
      case 'recommended':
        filtered.sort((a, b) => b.ai_score - a.ai_score);
        break;
      case 'difficulty':
        const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        filtered.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
        break;
      case 'acceptance':
        filtered.sort((a, b) => b.acceptance_rate - a.acceptance_rate);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      default:
        break;
    }

    setFilteredProblems(filtered);
  };

  const startProblem = (problemId) => {
    // Navigate to problem solving interface
    window.open(`/problem/${problemId}`, '_blank');
  };

  const toggleBookmark = (problemId) => {
    setBookmarkedProblems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(problemId)) {
        newSet.delete(problemId);
      } else {
        newSet.add(problemId);
      }
      return newSet;
    });
  };

  const StatsHeader = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 text-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Smart Problem Explorer</h1>
              <p className="text-blue-100">AI-curated coding challenges tailored to your skill level</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20 text-center">
              <div className="text-2xl font-bold">{userStats.problems_solved || 127}</div>
              <div className="text-xs text-blue-200">Solved</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20 text-center">
              <div className="text-2xl font-bold">{currentStreak}</div>
              <div className="text-xs text-blue-200">Day Streak</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20 text-center">
              <div className="text-2xl font-bold">{userStats.accuracy_rate || 85.3}%</div>
              <div className="text-xs text-blue-200">Accuracy</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20 text-center">
              <div className="text-2xl font-bold">#{userStats.rank || 1247}</div>
              <div className="text-xs text-blue-200">Global Rank</div>
            </div>
          </div>
        </div>
        
        {/* Weekly Progress */}
        <div className="mt-6 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Weekly Goal Progress</span>
            </div>
            <span className="text-sm">{weeklyProgress}/{weeklyGoal} problems</span>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(weeklyProgress / weeklyGoal) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const FilterSection = () => (
    <div className="bg-white/80 backdrop-blur-sm p-6 border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search problems by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
            >
              <option value="all">All Categories</option>
              <option value="arrays">Arrays</option>
              <option value="strings">Strings</option>
              <option value="dynamic programming">Dynamic Programming</option>
              <option value="trees">Trees</option>
              <option value="graphs">Graphs</option>
              <option value="sorting">Sorting</option>
              <option value="searching">Searching</option>
              <option value="math">Math</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
            >
              <option value="recommended">AI Recommended</option>
              <option value="difficulty">Difficulty</option>
              <option value="acceptance">Acceptance Rate</option>
              <option value="popularity">Popularity</option>
            </select>
            
            <motion.button
              onClick={loadProblems}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );

  const RecommendationsSection = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">AI Recommendations for You</h2>
          </div>
          <motion.button
            onClick={() => generateRecommendations(problems)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="w-4 h-4" />
            <span>Refresh AI Picks</span>
          </motion.button>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {recommendations.slice(0, 4).map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{problem.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{problem.description}</p>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{problem.category}</span>
                    <span className="text-xs text-gray-500">{problem.acceptance_rate}% acceptance</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {Math.round(problem.ai_score)}%
                  </div>
                  <div className="text-xs text-gray-500">AI Match</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{problem.estimated_time} min</span>
                  <ThumbsUp className="w-4 h-4 ml-2" />
                  <span>{problem.likes}</span>
                </div>
                <motion.button
                  onClick={() => startProblem(problem.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const ProblemCard = ({ problem, index }) => {
    const isCompleted = completedProblems.has(problem.id);
    const isAttempted = attemptedProblems.has(problem.id);
    const isBookmarked = bookmarkedProblems.has(problem.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{problem.title}</h3>
              {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
              {isAttempted && !isCompleted && <AlertCircle className="w-5 h-5 text-yellow-600" />}
              {problem.premium && <Star className="w-5 h-5 text-yellow-500" />}
            </div>
            <p className="text-gray-600 text-sm mb-3">{problem.description}</p>
            
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {problem.difficulty}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{problem.category}</span>
              {problem.companies?.map((company, i) => (
                <span key={i} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{company}</span>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{problem.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{problem.solved_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{problem.estimated_time} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>{problem.acceptance_rate}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <motion.button
              onClick={() => toggleBookmark(problem.id)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={() => startProblem(problem.id)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4 h-4" />
              <span>Solve</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Loading AI-curated problems...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <StatsHeader />
      <FilterSection />
      <RecommendationsSection />
      
      {/* Problems List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            All Problems ({filteredProblems.length})
          </h2>
          <div className="text-sm text-gray-600">
            Sorted by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
          </div>
        </div>
        
        <div className="grid gap-6">
          <AnimatePresence>
            {filteredProblems.map((problem, index) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {filteredProblems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No problems found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmartProblems;