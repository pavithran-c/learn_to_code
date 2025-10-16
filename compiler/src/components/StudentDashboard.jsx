import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Trophy, Target, Clock, Star, TrendingUp, TrendingDown,
  BarChart3, Activity, Calendar, Award, BookOpen, Code,
  CheckCircle, XCircle, Zap, Globe, Brain, FileText,
  PieChart, LineChart, ArrowUp, ArrowDown, Play, Pause,
  ChevronRight, Filter, Download, Settings, RefreshCw,
  Bell, AlertCircle, Users, Flame, Shield, Lightbulb,
  Coffee, Timer, Eye, ThumbsUp, MessageCircle, Bookmark,
  Hash, GitCommit, Cpu, Database, Cloud, Server, Monitor,
  Layers, Code2, Bug, CheckSquare, AlertTriangle, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activity, setActivity] = useState(null);
  const [trends, setTrends] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('7');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  
  const { user, token } = useAuth();

  const API_BASE_URL = 'http://localhost:5000';

  // Fetch dashboard data from backend
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.id || !token) return;

    try {
      setRefreshing(true);
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Use the new optimized student dashboard endpoint
      const response = await fetch(`${API_BASE_URL}/api/student/dashboard/${user.id}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        
        // Set all dashboard data from the single response
        setDashboardData(data);
        setMetrics(data.metrics);
        setPerformance(data.performance);
        setProgress(data.progress);
        setActivity(data.activity);
        setTrends(data.trends);
        setAlerts(data.alerts || []);
        
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch dashboard data:', response.statusText);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, token]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Calculate progress percentage
  const getProgressPercentage = (current, total) => {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };

  // Get trend icon and color
  const getTrendIcon = (trend) => {
    if (trend === 'improving' || trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'declining' || trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Target className="w-4 h-4 text-gray-500" />;
  };

  // Format time duration
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get alert icon based on severity
  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {dashboardData?.user_info?.name || user?.name || 'Student'}!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track your learning progress and achievements
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {alert.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Problems Solved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Problems Solved</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics?.total_problems_solved || 0}
                  </p>
                  {trends?.problems_trend && getTrendIcon(trends.problems_trend)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics?.problems_solved_today || 0} solved today
                </p>
              </div>
            </div>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Current Streak</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics?.streak_count || 0}
                  </p>
                  <span className="text-sm text-gray-500 ml-1">days</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Keep it up!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Overall Score</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(metrics?.overall_score || 0)}
                  </p>
                  {trends?.score_trend && getTrendIcon(trends.score_trend)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(metrics?.accuracy_rate || 0)}% accuracy
                </p>
              </div>
            </div>
          </motion.div>

          {/* Study Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Study Time</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(metrics?.study_time_today || 0)}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDuration(metrics?.total_study_time || 0)} total
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'progress', name: 'Progress', icon: TrendingUp },
              { id: 'concepts', name: 'Concepts', icon: BookOpen },
              { id: 'activity', name: 'Activity', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trend</h3>
                  {performance?.chart_data ? (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Performance chart visualization</p>
                        <p className="text-sm text-gray-400">Data available: {performance.chart_data.length} points</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <p>No performance data available yet</p>
                        <p className="text-sm">Start solving problems to see your progress!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Concept Mastery */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Concept Mastery</h3>
                  <div className="space-y-4">
                    {progress?.concept_progress?.slice(0, 5).map((concept, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{concept.name}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${concept.mastery_level}%` }}
                            />
                          </div>
                        </div>
                        <span className="ml-4 text-sm font-medium text-gray-900">
                          {concept.mastery_level}%
                        </span>
                      </div>
                    )) || (
                      <div className="text-center text-gray-500 py-8">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p>No concept data available</p>
                        <p className="text-sm">Complete problems to see concept mastery</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Learning Goals */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Progress</h3>
                  {progress?.skill_progress ? (
                    <div className="space-y-6">
                      {Object.entries(progress.skill_progress).map(([skill, data]) => (
                        <div key={skill} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 capitalize">{skill}</h4>
                            <span className="text-sm text-gray-500">
                              {data.solved}/{data.total} problems
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                              style={{ width: `${getProgressPercentage(data.solved, data.total)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {getProgressPercentage(data.solved, data.total)}% complete
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p>No progress data available</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Completion Rate</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(metrics?.completion_rate || 0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Avg. Time/Problem</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDuration(metrics?.average_time_per_problem || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Concepts Mastered</span>
                        <span className="text-sm font-medium text-gray-900">
                          {metrics?.concepts_mastered || 0} / {metrics?.total_concepts || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Confidence Score</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(metrics?.confidence_score || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {dashboardData?.recommendations?.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                          </div>
                          <p className="ml-2 text-sm text-gray-600">{rec}</p>
                        </div>
                      )) || (
                        <div className="text-center text-gray-500 py-4">
                          <p className="text-sm">No recommendations available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'concepts' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Concept Analysis</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Strongest:</span>
                    <span className="text-sm font-medium text-green-600">
                      {metrics?.strongest_concept || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500 ml-4">Weakest:</span>
                    <span className="text-sm font-medium text-red-600">
                      {metrics?.weakest_concept || 'N/A'}
                    </span>
                  </div>
                </div>

                {progress?.concept_breakdown ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(progress.concept_breakdown).map(([concept, data]) => (
                      <div key={concept} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2 capitalize">{concept}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Solved</span>
                            <span className="font-medium">{data.solved || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Attempted</span>
                            <span className="font-medium">{data.attempted || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Success Rate</span>
                            <span className="font-medium">
                              {data.attempted > 0 ? Math.round((data.solved / data.attempted) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${data.attempted > 0 ? (data.solved / data.attempted) * 100 : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p>No concept data available</p>
                    <p className="text-sm">Solve more problems to see detailed concept analysis</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  <select
                    value={selectedTimeFrame}
                    onChange={(e) => setSelectedTimeFrame(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                  </select>
                </div>

                {activity?.timeline && activity.timeline.length > 0 ? (
                  <div className="space-y-4">
                    {activity.timeline.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {item.type === 'problem_solved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {item.type === 'quiz_completed' && <Trophy className="w-4 h-4 text-yellow-600" />}
                            {item.type === 'login' && <User className="w-4 h-4 text-blue-600" />}
                            {!['problem_solved', 'quiz_completed', 'login'].includes(item.type) && 
                              <Activity className="w-4 h-4 text-gray-600" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {item.title || item.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                          {item.details && (
                            <p className="text-xs text-gray-400 mt-1">{item.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start solving problems to see your activity timeline</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentDashboard;