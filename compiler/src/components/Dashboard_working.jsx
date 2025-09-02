import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Trophy, Target, Clock, Star, TrendingUp, TrendingDown, 
  BarChart3, Activity, Calendar, Award, BookOpen, Code, 
  CheckCircle, XCircle, Zap, Globe, Brain, FileText, 
  PieChart, LineChart, ArrowUp, ArrowDown, Play, Pause,
  ChevronRight, Filter, Download, Settings, RefreshCw
} from 'lucide-react';
import { getDashboardStats, calculateRank, calculatePercentile, initializeDashboard, populateSampleData, resetUserData } from '../utils/dashboardStorage';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const data = initializeDashboard();
      // Enhanced sample data for better demonstration
      const enhancedData = {
        profile: {
          name: "Alex Thompson",
          avatar: "AT",
          rank: "#1,247",
          percentile: "94.5%",
          totalScore: 8750,
          level: "Advanced"
        },
        quickStats: {
          streak: 15,
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
          current: 15,
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
          { name: 'Advanced Algorithms Mock Test', date: 'Tomorrow', time: '10:00 AM', duration: '90 min' },
          { name: 'Database Design Assessment', date: 'Sept 1', time: '2:00 PM', duration: '75 min' },
          { name: 'System Design Interview Prep', date: 'Sept 3', time: '11:00 AM', duration: '120 min' }
        ],
        achievements: [
          { name: 'Speed Demon', description: 'Completed 50 timed tests', icon: '⚡', earned: true },
          { name: 'Perfect Score', description: 'Achieved 100% in any test', icon: '🎯', earned: true },
          { name: 'Streak Master', description: 'Maintained 30-day streak', icon: '🔥', earned: false },
          { name: 'Topic Expert', description: 'Mastered 10 topics', icon: '🧠', earned: true }
        ]
      };
      
      setUserData({...data, ...enhancedData});
      setIsLoading(false);
    }, 500);
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

  const loadDemoData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const data = populateSampleData();
      setUserData(data);
      setIsLoading(false);
    }, 500);
  };

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
          <motion.div variants={itemVariants} className="flex items-center justify-between">
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
                <span>Export</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Profile Section */}
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
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category Performance */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <h3 className="text-lg font-semibold mb-4">Subject Performance</h3>
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

              {/* Weekly Progress Chart */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {userData.weeklyProgress.map((day, index) => (
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
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Streaks Section */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <h3 className="text-lg font-semibold mb-4">Study Streak</h3>
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
                      <span className="text-sm font-medium">Weekly Goal</span>
                      <span className="text-sm text-gray-600">
                        {userData.streakData.current}/{userData.streakData.weeklyGoal} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(userData.streakData.current / userData.streakData.weeklyGoal) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="bg-green-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Tests */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <h3 className="text-lg font-semibold mb-4">Recent Tests</h3>
                <div className="space-y-3">
                  {userData.recentTests.map((test, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
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
                          <h4 className="font-medium text-sm">{test.name}</h4>
                          <p className="text-xs text-gray-500">{test.category} • {test.date}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Achievements */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                <div className="grid grid-cols-2 gap-3">
                  {userData.achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      whileHover={achievement.earned ? { scale: 1.05 } : {}}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        achievement.earned 
                          ? 'border-yellow-300 bg-yellow-50' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="text-xl mb-1">{achievement.icon}</div>
                      <h4 className="font-semibold text-xs">{achievement.name}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      {achievement.earned && (
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">Earned</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

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
              <span>Start Practice</span>
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
