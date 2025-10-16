import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Trophy, Target, Clock, Star, TrendingUp, 
  BarChart3, Activity, Calendar, Award, BookOpen, Code, 
  CheckCircle, XCircle, Zap, Brain, FileText, 
  PieChart, LineChart, ArrowUp, ArrowDown, Play,
  ChevronRight, Lightbulb, Coffee, Timer, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import analyticsAPI from '../services/analyticsAPI';
import { 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiTestResult, setApiTestResult] = useState(null);

  // Test API connection
  const testAPIConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      setApiTestResult('testing');
      
      const result = await analyticsAPI.testAuth();
      console.log('✅ API test successful:', result);
      setApiTestResult('success');
      
      // Now try to load real data
      const data = await analyticsAPI.getQuizPerformance();
      console.log('📊 Real data loaded:', data);
      setDashboardData(data);
      
    } catch (error) {
      console.error('❌ API test failed:', error);
      setApiTestResult('failed');
      setError(error.message);
    }
  };

  // Animation variants
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Load real analytics data from backend
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user) {
        console.log('⚠️ No user found, skipping analytics load');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Loading analytics data for user:', user.name || user.email);
        
        // Load real quiz and programming analytics
        const data = await analyticsAPI.getQuizPerformance();
        console.log('📊 Analytics data loaded:', data);
        setDashboardData(data);
        const fallbackData = {
          userStats: {
            totalQuizzes: 0,
            problemsSolved: 0,
            currentStreak: 0,
            totalScore: 0,
            averageAccuracy: 0,
            studyHours: 0
          },
          quizPerformance: {
            byCategory: [],
            recentScores: Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              return {
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                score: 0
              };
            })
          },
          recommendations: [
            {
              type: 'motivation',
              title: 'Welcome to Your Analytics Dashboard',
              description: 'Start taking quizzes and solving problems to see your personalized learning analytics and recommendations.',
              priority: 'high',
              action: 'Take Your First Quiz'
            },
            {
              type: 'info',
              title: 'Track Your Progress',
              description: 'Complete problems in different programming languages to unlock detailed performance analytics.',
              priority: 'medium',
              action: 'Explore Problems'
            },
            {
              type: 'streak',
              title: 'Build a Learning Habit',
              description: 'Establish a daily coding routine to maximize your learning potential and track consistency.',
              priority: 'medium',
              action: 'Start Daily Practice'
            }
          ]
        };
        
        console.log('� Using demonstration data structure');
        setDashboardData(fallbackData);
        
        // TODO: Enable real API calls once backend issues are resolved
        // const data = await analyticsAPI.getQuizPerformance();
        // console.log('📊 Analytics data loaded:', data);
        // setDashboardData(data);
        
      } catch (error) {
        console.error('❌ Error loading analytics data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user]); // Reload when user changes

  // Memoized calculations to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!dashboardData) return {};
    
    const categoryData = dashboardData.quizPerformance.byCategory.map(cat => ({
      name: cat.name,
      accuracy: cat.accuracy,
      solved: cat.solved,
      remaining: cat.total - cat.solved
    }));

    const pieData = dashboardData.quizPerformance.byCategory.map(cat => ({
      name: cat.name,
      value: cat.solved,
      total: cat.total
    }));

    return { categoryData, pieData };
  }, [dashboardData]);

  const hasData = dashboardData?.userStats?.totalQuizzes > 0 || 
                  dashboardData?.userStats?.problemsSolved > 0;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analytics...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing your quiz and problem-solving data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.name || user?.email || 'Student'}! Track your progress and get personalized recommendations.
              </p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <button 
                  onClick={testAPIConnection}
                  disabled={apiTestResult === 'testing'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    apiTestResult === 'testing' ? 'bg-gray-400 text-white cursor-not-allowed' :
                    apiTestResult === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    apiTestResult === 'failed' ? 'bg-red-600 hover:bg-red-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {apiTestResult === 'testing' ? 'Testing...' :
                   apiTestResult === 'success' ? 'API Connected ✓' :
                   apiTestResult === 'failed' ? 'API Failed ✗' :
                   'Test API Connection'}
                </button>
              </div>
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.userStats.totalQuizzes}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Code className="w-8 h-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Problems Solved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.userStats.problemsSolved}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Zap className="w-8 h-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.userStats.currentStreak} days
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.userStats.totalScore}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.userStats.averageAccuracy}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Study Hours</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.userStats.studyHours}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Performance Charts */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                Recent Quiz Scores
              </h3>
              {hasData && dashboardData.quizPerformance.recentScores.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={dashboardData.quizPerformance.recentScores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No quiz data available</p>
                    <p className="text-sm">Take some quizzes to see your progress</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                Problems by Category
              </h3>
              {hasData && chartData.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No category data available</p>
                    <p className="text-sm">Solve problems to see distribution</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Category Performance */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Category Performance
              </h3>
              {hasData && chartData.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={chartData.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy %" />
                    <Bar dataKey="solved" fill="#10B981" name="Problems Solved" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No performance data available</p>
                    <p className="text-sm">Complete more problems to see detailed analysis</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                Recommendations
              </h3>
              <div className="space-y-4">
                {dashboardData.recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                    rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-green-500 bg-green-50'
                  }`}>
                    <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center">
                      {rec.action}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Detailed Category Stats */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Detailed Performance by Category
              </h3>
              {hasData && dashboardData.quizPerformance.byCategory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Solved</th>
                        <th className="text-left py-3 px-4">Total</th>
                        <th className="text-left py-3 px-4">Progress</th>
                        <th className="text-left py-3 px-4">Accuracy</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.quizPerformance.byCategory.map((category, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{category.name}</td>
                          <td className="py-3 px-4">{category.solved}</td>
                          <td className="py-3 px-4">{category.total}</td>
                          <td className="py-3 px-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(category.solved / category.total) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round((category.solved / category.total) * 100)}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              category.accuracy >= 80 ? 'bg-green-100 text-green-800' :
                              category.accuracy >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {category.accuracy}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {category.accuracy >= 80 ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg mb-2">No detailed performance data yet</p>
                  <p className="text-sm">Start solving problems in different categories to see detailed analysis</p>
                  <div className="mt-6 space-x-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Take a Quiz
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Solve Problems
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;