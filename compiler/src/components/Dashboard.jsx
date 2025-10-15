import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  User, Trophy, Target, Clock, Star, TrendingUp, TrendingDown, 
  BarChart3, Activity, Calendar, Award, BookOpen, Code, 
  CheckCircle, XCircle, Zap, Globe, Brain, FileText, 
  PieChart, LineChart, ArrowUp, ArrowDown, Play, Pause,
  ChevronRight, Filter, Download, Settings, RefreshCw,
  Bell, AlertCircle, TrendingDown as TrendDown, Users,
  Flame, Shield, Lightbulb, Coffee, Timer
} from 'lucide-react';
import { getDashboardStats, calculateRank, calculatePercentile, initializeDashboard, populateSampleData, resetUserData } from '../utils/dashboardStorage';
import PerformanceChart from './PerformanceChart';
import { useAuth } from '../contexts/AuthContext';

// Default mock data for demonstration when no real data exists
const defaultMockData = {
  profile: {
    name: "John Doe",
    avatar: "JD",
    rank: "#1,247",
    percentile: "94.5%",
    totalScore: 8750,
    level: "Advanced"
  },
  quickStats: {
    streak: 5,
    testsCompleted: 127,
    avgAccuracy: 89.3,
    studyHours: 245,
    problemsSolved: 892,
    topicsMastered: 34
  },
  categoryPerformance: [
    { name: 'Data Structures', score: 92, total: 100, trend: 'up', color: '#3B82F6' },
    { name: 'Algorithms', score: 87, total: 100, trend: 'up', color: '#10B981' },
    { name: 'Database Systems', score: 76, total: 100, trend: 'down', color: '#F59E0B' },
    { name: 'Operating Systems', score: 89, total: 100, trend: 'up', color: '#8B5CF6' },
    { name: 'Computer Networks', score: 82, total: 100, trend: 'stable', color: '#EF4444' },
    { name: 'Software Engineering', score: 94, total: 100, trend: 'up', color: '#06B6D4' }
  ],
  weeklyProgress: [
    { day: 'Mon', practice: 3.2, quiz: 2.1, coding: 1.8 },
    { day: 'Tue', practice: 2.8, quiz: 3.4, coding: 2.3 },
    { day: 'Wed', practice: 4.1, quiz: 1.9, coding: 3.1 },
    { day: 'Thu', practice: 3.7, quiz: 2.8, coding: 2.6 },
    { day: 'Fri', practice: 5.2, quiz: 3.6, coding: 4.2 },
    { day: 'Sat', practice: 6.1, quiz: 4.3, coding: 3.8 },
    { day: 'Sun', practice: 4.8, quiz: 2.7, coding: 3.5 }
  ],
  streakData: {
    current: 5,
    longest: 28,
    weeklyGoal: 7,
    monthlyGoal: 30,
    practiceMinutes: 1847,
    target: 2000
  },
  recentTests: [
    { name: 'Advanced DSA Quiz', score: 94, date: '2 days ago', category: 'Data Structures', difficulty: 'Hard' },
    { name: 'DBMS Fundamentals', score: 78, date: '4 days ago', category: 'Database', difficulty: 'Medium' },
    { name: 'OS Concepts Test', score: 92, date: '1 week ago', category: 'Operating Systems', difficulty: 'Medium' },
    { name: 'Network Protocols', score: 85, date: '1 week ago', category: 'Networks', difficulty: 'Hard' }
  ],
  upcomingTests: [
    { name: 'Algorithms Mock Test', date: 'Tomorrow', time: '10:00 AM', duration: '90 min' },
    { name: 'Software Engineering Quiz', date: 'Dec 23', time: '2:00 PM', duration: '60 min' },
    { name: 'Full Stack Assessment', date: 'Dec 25', time: '9:00 AM', duration: '120 min' }
  ],
  achievements: [
    { name: 'Speed Demon', description: 'Completed 50 timed tests', icon: '⚡', earned: true },
    { name: 'Perfect Score', description: 'Achieved 100% in any test', icon: '🎯', earned: true },
    { name: 'Streak Master', description: 'Maintained 30-day streak', icon: '🔥', earned: false },
    { name: 'Topic Expert', description: 'Mastered 10 topics', icon: '🧠', earned: true }
  ]
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { user, updateActivity } = useAuth();

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
    loadPerformanceData();
    loadNotifications();
    
    // Set up auto-refresh interval
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshRealTimeData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Update activity tracking
  useEffect(() => {
    updateActivity?.();
  }, [updateActivity]);

  const loadUserData = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const data = initializeDashboard();
      // Enhance profile data with calculated values
      data.profile.rank = calculateRank(data.quickStats.testsCompleted * 100 + data.quickStats.problemsSolved * 50);
      data.profile.percentile = `${calculatePercentile(data.quickStats.testsCompleted * 100)}%`;
      data.profile.totalScore = data.quickStats.testsCompleted * 100 + data.quickStats.problemsSolved * 50;
      
      setUserData(data);
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const loadPerformanceData = async () => {
    // Simulate fetching performance analytics from backend
    const mockPerformanceData = {
      overall: [
        { x: 0, y: 78, label: 'Mon' },
        { x: 1, y: 82, label: 'Tue' },
        { x: 2, y: 85, label: 'Wed' },
        { x: 3, y: 79, label: 'Thu' },
        { x: 4, y: 88, label: 'Fri' },
        { x: 5, y: 92, label: 'Sat' },
        { x: 6, y: 87, label: 'Sun' }
      ],
      accuracy: [
        { x: 0, y: 85, label: 'Mon' },
        { x: 1, y: 87, label: 'Tue' },
        { x: 2, y: 90, label: 'Wed' },
        { x: 3, y: 88, label: 'Thu' },
        { x: 4, y: 91, label: 'Fri' },
        { x: 5, y: 94, label: 'Sat' },
        { x: 6, y: 89, label: 'Sun' }
      ],
      subjects: [
        { label: 'Data Structures', y: 92 },
        { label: 'Algorithms', y: 87 },
        { label: 'Databases', y: 76 },
        { label: 'Networks', y: 82 }
      ]
    };
    
    setPerformanceData(mockPerformanceData);
  };

  const loadNotifications = () => {
    const mockNotifications = [
      {
        id: 1,
        type: 'achievement',
        title: 'New Achievement Unlocked!',
        message: 'You\'ve solved 50 coding problems',
        time: '2 hours ago',
        unread: true,
        icon: Trophy
      },
      {
        id: 2,
        type: 'reminder',
        title: 'Daily Goal Reminder',
        message: 'You\'re 2 problems away from today\'s goal',
        time: '4 hours ago',
        unread: true,
        icon: Target
      },
      {
        id: 3,
        type: 'streak',
        title: 'Streak Alert',
        message: 'Keep your 15-day streak alive!',
        time: '1 day ago',
        unread: false,
        icon: Flame
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const refreshRealTimeData = async () => {
    // Simulate real-time data updates
    setRealTimeStats({
      activeUsers: Math.floor(Math.random() * 1000) + 500,
      problemsSolvedToday: Math.floor(Math.random() * 50) + 200,
      averageAccuracy: (Math.random() * 10 + 85).toFixed(1),
      trending: Math.random() > 0.5 ? 'up' : 'down'
    });
    
    setLastUpdated(new Date());
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const cardVariants = {
    hover: { y: -5, transition: { duration: 0.2 } }
  };

  const refreshData = () => {
    loadUserData();
  };

  const loadDemoData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const data = populateSampleData();
      setUserData(data);
      setIsLoading(false);
    }, 500);
  };

  // Show loading state
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const ProfileSection = () => (
    <motion.div
      variants={itemVariants}
      className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
            {userData.profile.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{userData.profile.name}</h2>
            <p className="text-blue-100">Rank: {userData.profile.rank} • {userData.profile.percentile} Percentile</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4" />
                <span className="text-sm">Score: {userData.profile.totalScore.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span className="text-sm">Level: {userData.profile.level}</span>
              </div>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={refreshData}
          className="p-2 bg-white bg-opacity-20 rounded-lg"
          disabled={isLoading}
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>
    </motion.div>
  );

  const QuickStatsGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[
        { label: 'Current Streak', value: userData.quickStats.streak, unit: 'days', icon: Zap, color: 'text-orange-600' },
        { label: 'Tests Completed', value: userData.quickStats.testsCompleted, unit: '', icon: CheckCircle, color: 'text-green-600' },
        { label: 'Avg Accuracy', value: userData.quickStats.avgAccuracy, unit: '%', icon: Target, color: 'text-blue-600' },
        { label: 'Study Hours', value: userData.quickStats.studyHours, unit: 'hrs', icon: Clock, color: 'text-purple-600' },
        { label: 'Problems Solved', value: userData.quickStats.problemsSolved, unit: '', icon: Code, color: 'text-indigo-600' },
        { label: 'Topics Mastered', value: userData.quickStats.topicsMastered, unit: '', icon: Brain, color: 'text-pink-600' }
      ].map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={cardVariants.hover}
          className="bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <ArrowUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stat.value}{stat.unit}
          </div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );

  const CategoryPerformance = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Category Performance</h3>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border rounded-lg text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 3 months</option>
        </select>
      </div>
      <div className="space-y-4">
        {userData.categoryPerformance.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium">{category.name}</span>
                {category.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
                {category.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
              </div>
              <span className="text-sm text-gray-600">{category.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${category.score}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const ProgressChart = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Performance Analytics</h3>
          <p className="text-sm text-gray-600">Track your learning progress over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 bg-white/70 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">3 months</option>
          </select>
          <motion.button
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadPerformanceData}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
      
      {performanceData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Overall Performance */}
          <div className="bg-white/70 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
              Overall Performance
            </h4>
            <PerformanceChart
              data={performanceData.overall}
              type="line"
              height={150}
              color="#3B82F6"
              animated={true}
            />
          </div>
          
          {/* Accuracy Trends */}
          <div className="bg-white/70 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2 text-green-600" />
              Accuracy Trends
            </h4>
            <PerformanceChart
              data={performanceData.accuracy}
              type="area"
              height={150}
              color="#10B981"
              animated={true}
            />
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500">Loading performance data...</p>
          </div>
        </div>
      )}
      
      {/* Weekly Activity Bar Chart */}
      <div className="bg-white/70 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <Activity className="h-4 w-4 mr-2 text-purple-600" />
          Weekly Activity
        </h4>
        <div className="h-48 flex items-end justify-between space-x-2">
          {userData?.weeklyProgress?.map((day, index) => (
            <div key={index} className="flex-1 space-y-1">
              <div className="text-xs text-center text-gray-500 mb-2">{day.day}</div>
              <div className="flex flex-col space-y-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.coding * 20}px` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-blue-500 rounded-sm"
                  title={`Coding: ${day.coding}h`}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.quiz * 20}px` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                  className="bg-green-500 rounded-sm"
                  title={`Quiz: ${day.quiz}h`}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.practice * 20}px` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
                  className="bg-purple-500 rounded-sm"
                  title={`Practice: ${day.practice}h`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span>Coding</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span>Quiz</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-sm" />
            <span>Practice</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const StreaksSection = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <h3 className="text-lg font-semibold mb-4">Streaks & Goals</h3>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Streak</span>
            <span className="text-2xl font-bold text-orange-600">
              {userData.streakData.current} days
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>Longest: {userData.streakData.longest} days</span>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Weekly Goal Progress</span>
            <span className="text-sm text-gray-600">
              {userData.streakData.current}/{userData.streakData.weeklyGoal} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (userData.streakData.current / userData.streakData.weeklyGoal) * 100)}%` }}
              transition={{ duration: 1 }}
              className="bg-green-500 h-2 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Practice Minutes</span>
            <span className="text-sm text-gray-600">
              {userData.streakData.practiceMinutes}/{userData.streakData.target}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (userData.streakData.practiceMinutes / userData.streakData.target) * 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-blue-500 h-2 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const TestInsights = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <h3 className="text-lg font-semibold mb-4">Recent Test Performance</h3>
      <div className="space-y-4">
        {userData.recentTests.length > 0 ? userData.recentTests.map((test, index) => (
          <motion.div
            key={index}
            whileHover={{ x: 5 }}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                test.score >= 90 ? 'bg-green-500' :
                test.score >= 80 ? 'bg-blue-500' :
                test.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {test.score}
              </div>
              <div>
                <h4 className="font-medium">{test.name}</h4>
                <p className="text-sm text-gray-500">
                  {test.category} • {test.difficulty} • {test.date}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No tests completed yet</p>
            <p className="text-sm">Start taking quizzes to see your performance here!</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const UpcomingTests = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <h3 className="text-lg font-semibold mb-4">Upcoming Tests</h3>
      <div className="space-y-3">
        {userData.upcomingTests.map((test, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="font-medium">{test.name}</h4>
                <p className="text-sm text-gray-500">{test.date} • {test.time} • {test.duration}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
            >
              Start
            </motion.button>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const Notifications = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <h3 className="text-lg font-semibold mb-4">Recent Activity & Tips</h3>
      <div className="space-y-3">
        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm font-medium text-blue-800">Great job on your streak! 🔥</p>
            <p className="text-xs text-blue-600">You've maintained a 12-day learning streak. Keep it up!</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm font-medium text-green-800">New Achievement Unlocked! 🏆</p>
            <p className="text-xs text-green-600">You've completed 47 tests and earned "Speed Demon" badge.</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm font-medium text-yellow-800">Improvement Suggestion 💡</p>
            <p className="text-xs text-yellow-600">Focus on Computer Networks - you can improve by 10+ points!</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm font-medium text-purple-800">Study Reminder 📚</p>
            <p className="text-xs text-purple-600">You're 350 minutes away from your monthly study goal!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const Achievements = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white p-6 rounded-lg shadow-sm border"
    >
      <h3 className="text-lg font-semibold mb-4">Achievements</h3>
      <div className="grid grid-cols-2 gap-4">
        {userData.achievements.map((achievement, index) => (
          <motion.div
            key={index}
            whileHover={achievement.earned ? { scale: 1.05 } : {}}
            className={`p-4 rounded-lg border-2 transition-all ${
              achievement.earned 
                ? 'border-yellow-300 bg-yellow-50' 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            <div className="text-2xl mb-2">{achievement.icon}</div>
            <h4 className="font-semibold text-sm">{achievement.name}</h4>
            <p className="text-xs text-gray-600">{achievement.description}</p>
            {achievement.earned && (
              <div className="flex items-center space-x-1 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">Earned</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Performance Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your progress and improve your exam preparation</p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={loadDemoData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Load Demo Data</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </motion.button>
            </div>
          </div>

          {/* Profile Section */}
          <ProfileSection />

          {/* Quick Stats */}
          <QuickStatsGrid />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <CategoryPerformance />
              <ProgressChart />
              <TestInsights />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <StreaksSection />
              <UpcomingTests />
              <Achievements />
            </div>
          </div>

          {/* Notifications Row */}
          <motion.div variants={itemVariants}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Recent Activity & Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Great job on your streak! 🔥</p>
                    <p className="text-xs text-blue-600">You've maintained a 12-day learning streak. Keep it up!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-green-800">New Achievement Unlocked! 🏆</p>
                    <p className="text-xs text-green-600">You've completed 47 tests and earned "Speed Demon" badge.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Improvement Suggestion 💡</p>
                    <p className="text-xs text-yellow-600">Focus on Computer Networks - you can improve by 10+ points!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-purple-800">Study Reminder 📚</p>
                    <p className="text-xs text-purple-600">You're 350 minutes away from your monthly study goal!</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              <Play className="w-5 h-5" />
              <span>Start Practice Session</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg"
            >
              <FileText className="w-5 h-5" />
              <span>Take Mock Test</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg"
            >
              <Brain className="w-5 h-5" />
              <span>Review Weak Areas</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
