import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Trophy, Target, Clock, Star, TrendingUp, TrendingDown,
  BarChart3, Activity, Calendar, Award, BookOpen, Code,
  CheckCircle, XCircle, Zap, Globe, Brain, FileText,
  PieChart, LineChart, ArrowUp, ArrowDown, Play, Pause,
  ChevronRight, Filter, Download, Settings, RefreshCw,
  Bell, AlertCircle, Users, Flame, Shield, Lightbulb,
  Coffee, Timer, Eye, ThumbsUp, MessageCircle, Bookmark
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PerformanceChart from './PerformanceChart';
import RecommendationEngine from './RecommendationEngine';

const Phase5Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { user, updateActivity } = useAuth();

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
    loadPerformanceData();
    loadNotifications();
    loadAchievements();
    
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
    
    // Enhanced mock user data
    const mockUserData = {
      profile: {
        name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Coding Enthusiast',
        avatar: user?.first_name?.[0] || 'U',
        level: 'Advanced',
        rank: '#1,247',
        percentile: '94.5%',
        totalScore: 8750,
        joinedDate: '2024-01-15',
        streakDays: 15
      },
      quickStats: {
        testsCompleted: 47,
        problemsSolved: 128,
        averageScore: 85.3,
        studyHours: 142,
        currentStreak: 15,
        longestStreak: 23,
        weeklyGoal: 10,
        weeklyProgress: 8
      },
      recentActivity: [
        { type: 'test_completed', title: 'Advanced Algorithms Test', score: 92, time: '2 hours ago' },
        { type: 'problem_solved', title: 'Binary Tree Traversal', difficulty: 'Medium', time: '4 hours ago' },
        { type: 'achievement', title: 'Speed Demon Badge Earned', time: '1 day ago' },
        { type: 'study_session', title: 'Dynamic Programming Study', duration: '45 min', time: '2 days ago' }
      ],
      weeklyProgress: [
        { day: 'Mon', practice: 3.5, quiz: 2.8, coding: 1.9 },
        { day: 'Tue', practice: 2.1, quiz: 3.2, coding: 2.7 },
        { day: 'Wed', practice: 4.8, quiz: 1.6, coding: 3.4 },
        { day: 'Thu', practice: 3.9, quiz: 2.9, coding: 2.1 },
        { day: 'Fri', practice: 5.3, quiz: 4.1, coding: 4.6 },
        { day: 'Sat', practice: 6.2, quiz: 3.7, coding: 2.8 },
        { day: 'Sun', practice: 4.1, quiz: 2.4, coding: 3.9 }
      ]
    };
    
    setTimeout(() => {
      setUserData(mockUserData);
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const loadPerformanceData = async () => {
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

  const loadAchievements = () => {
    const mockAchievements = [
      { id: 1, name: 'Problem Solver', description: 'Solved 100 problems', icon: '🧩', earned: true },
      { id: 2, name: 'Speed Demon', description: 'Completed test in under 30 min', icon: '⚡', earned: true },
      { id: 3, name: 'Consistency King', description: '30-day study streak', icon: '👑', earned: false },
      { id: 4, name: 'Algorithm Master', description: 'Mastered all algorithm topics', icon: '🎯', earned: false }
    ];
    
    setAchievements(mockAchievements);
  };

  const refreshRealTimeData = async () => {
    setRealTimeStats({
      activeUsers: Math.floor(Math.random() * 1000) + 500,
      problemsSolvedToday: Math.floor(Math.random() * 50) + 200,
      averageAccuracy: (Math.random() * 10 + 85).toFixed(1),
      trending: Math.random() > 0.5 ? 'up' : 'down'
    });
    
    setLastUpdated(new Date());
  };

  const QuickStatsCard = ({ icon: Icon, title, value, change, color = "blue" }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change.startsWith('+') ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const ActivityTimeline = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {userData?.recentActivity?.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4 p-3 bg-white/70 rounded-lg"
          >
            <div className={`p-2 rounded-lg ${
              activity.type === 'test_completed' ? 'bg-blue-100 text-blue-600' :
              activity.type === 'problem_solved' ? 'bg-green-100 text-green-600' :
              activity.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              {activity.type === 'test_completed' && <FileText className="h-4 w-4" />}
              {activity.type === 'problem_solved' && <Code className="h-4 w-4" />}
              {activity.type === 'achievement' && <Trophy className="h-4 w-4" />}
              {activity.type === 'study_session' && <BookOpen className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{activity.title}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {activity.score && <span>Score: {activity.score}%</span>}
                {activity.difficulty && <span>Difficulty: {activity.difficulty}</span>}
                {activity.duration && <span>Duration: {activity.duration}</span>}
                <span>•</span>
                <span>{activity.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white/70 text-gray-600 hover:bg-white hover:text-gray-800'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </motion.button>
  );

  if (isLoading) {
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
          <p className="text-gray-600 text-lg">Loading your personalized dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-6 mb-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Avatar */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white backdrop-blur-sm border border-white/30">
                  {userData?.profile?.avatar || user?.first_name?.[0] || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </motion.div>
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Welcome back, {userData?.profile?.name || 'Learner'}! 👋
                </h1>
                <p className="text-blue-100 text-lg mb-2">
                  Ready to continue your coding journey?
                </p>
                <div className="flex items-center space-x-4 text-sm text-blue-100">
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4" />
                    <span>Rank: {userData?.profile?.rank || '#1,247'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>Top {userData?.profile?.percentile || '94.5%'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Level: {userData?.profile?.level || 'Advanced'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              {/* Notifications */}
              <motion.div className="relative">
                <motion.button
                  className="p-3 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.some(n => n.unread) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </motion.button>
              </motion.div>
              
              {/* Quick Actions */}
              <motion.button
                className="px-4 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="h-4 w-4" />
                <span>Start Learning</span>
              </motion.button>
              
              <motion.button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-xl text-white transition-colors backdrop-blur-sm border border-white/30 ${
                  autoRefresh ? 'bg-green-500/20' : 'bg-white/20 hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
          
          {/* Real-time Stats Bar */}
          {realTimeStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">Active Users</p>
                    <p className="text-white font-bold">{realTimeStats.activeUsers}</p>
                  </div>
                  <Users className="h-5 w-5 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">Problems Today</p>
                    <p className="text-white font-bold">{realTimeStats.problemsSolvedToday}</p>
                  </div>
                  <Code className="h-5 w-5 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">Avg Accuracy</p>
                    <p className="text-white font-bold">{realTimeStats.averageAccuracy}%</p>
                  </div>
                  <Target className="h-5 w-5 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">Trending</p>
                    <div className="flex items-center space-x-1">
                      {realTimeStats.trending === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-white font-bold text-sm">
                        {realTimeStats.trending === 'up' ? 'UP' : 'DOWN'}
                      </span>
                    </div>
                  </div>
                  <Activity className="h-5 w-5 text-blue-200" />
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Last Updated */}
          <div className="mt-4 text-right">
            <p className="text-blue-100 text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-4 mb-8 overflow-x-auto pb-2"
        >
          <TabButton
            id="overview"
            label="Overview"
            icon={BarChart3}
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            id="analytics"
            label="Analytics"
            icon={LineChart}
            isActive={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
          <TabButton
            id="recommendations"
            label="AI Recommendations"
            icon={Brain}
            isActive={activeTab === 'recommendations'}
            onClick={() => setActiveTab('recommendations')}
          />
          <TabButton
            id="achievements"
            label="Achievements"
            icon={Trophy}
            isActive={activeTab === 'achievements'}
            onClick={() => setActiveTab('achievements')}
          />
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickStatsCard
                  icon={FileText}
                  title="Tests Completed"
                  value={userData?.quickStats?.testsCompleted || 0}
                  change="+3 this week"
                  color="blue"
                />
                <QuickStatsCard
                  icon={Code}
                  title="Problems Solved"
                  value={userData?.quickStats?.problemsSolved || 0}
                  change="+12 this week"
                  color="green"
                />
                <QuickStatsCard
                  icon={Target}
                  title="Average Score"
                  value={`${userData?.quickStats?.averageScore || 0}%`}
                  change="+2.3% this week"
                  color="purple"
                />
                <QuickStatsCard
                  icon={Flame}
                  title="Current Streak"
                  value={`${userData?.quickStats?.currentStreak || 0} days`}
                  change="Personal best!"
                  color="orange"
                />
              </div>

              {/* Performance Charts Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Performance Analytics</h3>
                    <p className="text-gray-600">Track your learning progress with detailed insights</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="px-4 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 3 months</option>
                      <option value="1y">Last year</option>
                    </select>
                    <motion.button
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={loadPerformanceData}
                    >
                      <RefreshCw className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
                
                {performanceData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Overall Performance Chart */}
                    <div className="bg-white/70 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                        Overall Performance
                      </h4>
                      <PerformanceChart
                        data={performanceData.overall}
                        type="line"
                        height={200}
                        color="#3B82F6"
                        animated={true}
                      />
                    </div>
                    
                    {/* Accuracy Trends */}
                    <div className="bg-white/70 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-green-600" />
                        Accuracy Trends
                      </h4>
                      <PerformanceChart
                        data={performanceData.accuracy}
                        type="area"
                        height={200}
                        color="#10B981"
                        animated={true}
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Recent Activity */}
              <ActivityTimeline />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {performanceData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Overall Performance */}
                  <div className="bg-white/70 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Overall Performance</h4>
                    <PerformanceChart
                      data={performanceData.overall}
                      type="line"
                      height={250}
                      color="#3B82F6"
                      animated={true}
                    />
                  </div>
                  
                  {/* Accuracy Trends */}
                  <div className="bg-white/70 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Accuracy Trends</h4>
                    <PerformanceChart
                      data={performanceData.accuracy}
                      type="area"
                      height={250}
                      color="#10B981"
                      animated={true}
                    />
                  </div>
                  
                  {/* Subject Performance */}
                  <div className="bg-white/70 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h4>
                    <PerformanceChart
                      data={performanceData.subjects}
                      type="bar"
                      height={250}
                      color="#8B5CF6"
                      animated={true}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RecommendationEngine 
                userProfile={userData?.profile}
                performanceData={performanceData}
                onSelectProblem={(problem) => {
                  console.log('Selected problem:', problem);
                  // Handle problem selection
                }}
              />
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Achievements & Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.05 }}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      achievement.earned
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-4xl mb-3 ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      {achievement.earned && (
                        <div className="flex items-center justify-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Earned</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Phase5Dashboard;