import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Code, 
  Target, 
  Clock, 
  Star, 
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';
import { initializeDashboard, populateSampleData } from '../utils/dashboardStorage';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const data = initializeDashboard();
      setDashboardData(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const loadDemoData = () => {
    populateSampleData();
    const refreshedData = initializeDashboard();
    setDashboardData(refreshedData);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBg = (percentage) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Performance Dashboard</h1>
                <p className="text-gray-600 mt-1">Track your progress and improve your exam preparation</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadDemoData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Load Demo Data</span>
                </button>
                <Settings className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div>
          </motion.div>

          {/* Profile Overview */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{dashboardData.profile.name}</h2>
                <p className="text-gray-600">Student ID: {dashboardData.profile.studentId}</p>
                <p className="text-sm text-gray-500">Member since {dashboardData.profile.joinDate}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-semibold">Level {dashboardData.profile.level}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {dashboardData.profile.totalXP} XP
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${(dashboardData.profile.totalXP % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalQuizzes}</span>
              </div>
              <h3 className="font-semibold text-gray-700">Total Quizzes</h3>
              <p className="text-sm text-gray-500">Completed this month</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Code className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{dashboardData.stats.codingProblems}</span>
              </div>
              <h3 className="font-semibold text-gray-700">Coding Problems</h3>
              <p className="text-sm text-gray-500">Successfully solved</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">{dashboardData.stats.averageScore}%</span>
              </div>
              <h3 className="font-semibold text-gray-700">Average Score</h3>
              <p className="text-sm text-gray-500">Across all subjects</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">{dashboardData.stats.studyHours}h</span>
              </div>
              <h3 className="font-semibold text-gray-700">Study Hours</h3>
              <p className="text-sm text-gray-500">This week</p>
            </div>
          </motion.div>

          {/* Subject Performance & Progress Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Subject Performance</h3>
              <div className="space-y-4">
                {dashboardData.categoryPerformance.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{category.name}</span>
                      <span className={`font-semibold ${getPerformanceColor(category.score)}`}>
                        {category.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          category.score >= 80 ? 'bg-green-500' : 
                          category.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{category.completed} questions completed</span>
                      <span>{category.timeSpent} minutes</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weekly Progress */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h3>
              <div className="space-y-4">
                {dashboardData.weeklyProgress.map((day, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                    <div className="flex-1 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(day.score / 100) * 100}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-sm font-semibold text-gray-700">{day.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Streak & Test Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Study Streak */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Study Streak</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {dashboardData.streak.current}
                </div>
                <p className="text-gray-600">Days in a row</p>
                <p className="text-sm text-gray-500 mt-1">
                  Best streak: {dashboardData.streak.longest} days
                </p>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dashboardData.streak.weekData.map((day, index) => (
                  <div
                    key={index}
                    className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                      day.completed 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {day.day}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Test Insights */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Test Insights</h3>
              <div className="space-y-4">
                {dashboardData.testInsights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'strength' ? 'border-green-500 bg-green-50' :
                      insight.type === 'improvement' ? 'border-yellow-500 bg-yellow-50' :
                      'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {insight.type === 'strength' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                      {insight.type === 'improvement' && <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                      {insight.type === 'weakness' && <Target className="w-5 h-5 text-red-600 mt-0.5" />}
                      <div>
                        <p className="font-medium text-gray-900">{insight.title}</p>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Achievements & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
              <div className="grid grid-cols-2 gap-4">
                {dashboardData.achievements.map((achievement, index) => (
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

            {/* Recent Notifications */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {dashboardData.notifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
