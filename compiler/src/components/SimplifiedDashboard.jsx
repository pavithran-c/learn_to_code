import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Trophy, Target, Clock, Star, TrendingUp, TrendingDown,
  BarChart3, Activity, Calendar, Award, BookOpen, Code,
  CheckCircle, XCircle, Zap, Globe, Brain, FileText,
  PieChart, LineChart, ArrowUp, ArrowDown, Play, Pause,
  ChevronRight, Filter, Download, Settings, RefreshCw,
  Bell, AlertCircle, Users, Flame, Shield, Lightbulb,
  Coffee, Timer, Eye, ThumbsUp, MessageCircle, Bookmark,
  Hash, GitCommit, Cpu, Database, Cloud, Server
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SimplifiedDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [realtimeStats, setRealtimeStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const { user } = useAuth();

  // Load mock data for now to prevent API errors
  useEffect(() => {
    if (user?.id) {
      // Set mock data immediately
      setUserData({
        name: user?.name || 'Demo User',
        email: user?.email || 'demo@example.com',
        level: 15,
        experience: 2850,
        nextLevelExp: 3000
      });

      setRealtimeStats({
        problemsSolved: 47,
        streakDays: 12,
        totalScore: 3840,
        averageAccuracy: 87,
        codeExecutions: 156,
        timeSpent: 28.5
      });

      setLoading(false);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome back, {userData?.name || 'Learner'}!
          </h1>
          <p className="text-gray-600">
            Here's your learning progress and achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Problems Solved</p>
                <p className="text-2xl font-bold text-black">{realtimeStats.problemsSolved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Flame className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Current Streak</p>
                <p className="text-2xl font-bold text-black">{realtimeStats.streakDays} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Score</p>
                <p className="text-2xl font-bold text-gray-900">{realtimeStats.totalScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{realtimeStats.averageAccuracy}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Level {userData?.level}</span>
                    <span>{userData?.experience}/{userData?.nextLevelExp} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(userData?.experience / userData?.nextLevelExp) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Completed "Two Sum" problem</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <Code className="h-5 w-5 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Practiced Java algorithms</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Earned "Problem Solver" badge</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Code className="h-4 w-4 mr-2" />
                  Start Coding
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Take Quiz
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Leaderboard
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
              <div className="space-y-3">
                <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Problem Solver</p>
                    <p className="text-xs text-gray-500">Solved 50 problems</p>
                  </div>
                </div>
                <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Streak Master</p>
                    <p className="text-xs text-gray-500">10-day coding streak</p>
                  </div>
                </div>
                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                  <Star className="h-6 w-6 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fast Learner</p>
                    <p className="text-xs text-gray-500">High accuracy rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedDashboard;