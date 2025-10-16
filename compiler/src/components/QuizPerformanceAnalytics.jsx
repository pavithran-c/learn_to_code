import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, Clock, Trophy, Star,
  Brain, BookOpen, Award, Activity, Calendar, Filter,
  Download, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp,
  Lightbulb
} from 'lucide-react';

const QuizPerformanceAnalytics = ({ userStats, quizHistory = [] }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [activeChart, setActiveChart] = useState('overview');

  // Color schemes for different chart types
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];
  
  // Process quiz history data for analytics
  const processQuizData = () => {
    if (!quizHistory.length) return generateMockData();
    
    // Group data by category
    const categoryStats = {};
    quizHistory.forEach(quiz => {
      if (!categoryStats[quiz.category]) {
        categoryStats[quiz.category] = {
          attempts: 0,
          totalScore: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          timeSpent: 0,
          scores: []
        };
      }
      
      const stats = categoryStats[quiz.category];
      stats.attempts++;
      stats.totalScore += quiz.score;
      stats.totalQuestions += quiz.totalQuestions;
      stats.correctAnswers += quiz.correctAnswers;
      stats.timeSpent += quiz.timeSpent;
      stats.scores.push(quiz.score);
    });

    return categoryStats;
  };

  // Generate mock data for demonstration
  const generateMockData = () => ({
    programming_fundamentals: {
      attempts: 12,
      totalScore: 1080,
      totalQuestions: 120,
      correctAnswers: 108,
      timeSpent: 1440,
      scores: [85, 90, 78, 92, 88, 95, 82, 89, 91, 87, 93, 90]
    },
    data_structures: {
      attempts: 8,
      totalScore: 720,
      totalQuestions: 80,
      correctAnswers: 72,
      timeSpent: 960,
      scores: [88, 92, 85, 90, 87, 94, 89, 91]
    },
    algorithms: {
      attempts: 6,
      totalScore: 540,
      totalQuestions: 60,
      correctAnswers: 54,
      timeSpent: 720,
      scores: [90, 85, 92, 88, 91, 89]
    },
    web_development: {
      attempts: 10,
      totalScore: 850,
      totalQuestions: 100,
      correctAnswers: 85,
      timeSpent: 1200,
      scores: [82, 88, 85, 90, 87, 92, 84, 89, 86, 91]
    },
    machine_learning: {
      attempts: 4,
      totalScore: 320,
      totalQuestions: 40,
      correctAnswers: 32,
      timeSpent: 480,
      scores: [85, 90, 75, 88]
    },
    cybersecurity: {
      attempts: 5,
      totalScore: 425,
      totalQuestions: 50,
      correctAnswers: 42,
      timeSpent: 600,
      scores: [88, 82, 90, 85, 87]
    }
  });

  const quizData = processQuizData();

  // Calculate performance metrics
  const calculateMetrics = () => {
    const categories = Object.keys(quizData);
    let totalAttempts = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTime = 0;
    let totalScore = 0;

    categories.forEach(cat => {
      const data = quizData[cat];
      totalAttempts += data.attempts;
      totalQuestions += data.totalQuestions;
      totalCorrect += data.correctAnswers;
      totalTime += data.timeSpent;
      totalScore += data.totalScore;
    });

    return {
      overallAccuracy: totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0,
      averageScore: totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0,
      totalAttempts,
      averageTimePerQuestion: totalQuestions > 0 ? (totalTime / totalQuestions / 60).toFixed(1) : 0,
      strongestCategory: categories.reduce((best, cat) => {
        const accuracy = (quizData[cat].correctAnswers / quizData[cat].totalQuestions) * 100;
        const bestAccuracy = best ? (quizData[best].correctAnswers / quizData[best].totalQuestions) * 100 : 0;
        return accuracy > bestAccuracy ? cat : best;
      }, null),
      weakestCategory: categories.reduce((worst, cat) => {
        const accuracy = (quizData[cat].correctAnswers / quizData[cat].totalQuestions) * 100;
        const worstAccuracy = worst ? (quizData[worst].correctAnswers / quizData[worst].totalQuestions) * 100 : 100;
        return accuracy < worstAccuracy ? cat : worst;
      }, null)
    };
  };

  const metrics = calculateMetrics();

  // Prepare chart data
  const prepareChartData = () => {
    const categoryPerformance = Object.keys(quizData).map(category => {
      const data = quizData[category];
      const accuracy = (data.correctAnswers / data.totalQuestions) * 100;
      const avgScore = data.totalScore / data.attempts;
      const avgTime = data.timeSpent / data.totalQuestions / 60; // minutes

      return {
        category: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        accuracy: accuracy.toFixed(1),
        avgScore: avgScore.toFixed(1),
        attempts: data.attempts,
        avgTime: avgTime.toFixed(1),
        improvement: data.scores.length > 1 ? 
          ((data.scores[data.scores.length - 1] - data.scores[0]) / data.scores[0] * 100).toFixed(1) : 0
      };
    });

    // Progress over time data
    const progressData = [];
    let cumulativeScore = 0;
    let attemptCount = 0;

    Object.keys(quizData).forEach(category => {
      quizData[category].scores.forEach((score, index) => {
        attemptCount++;
        cumulativeScore += score;
        progressData.push({
          attempt: attemptCount,
          score,
          avgScore: (cumulativeScore / attemptCount).toFixed(1),
          category: category.replace(/_/g, ' ')
        });
      });
    });

    // Difficulty analysis
    const difficultyData = [
      { level: 'Easy', correct: 85, incorrect: 15, accuracy: 85 },
      { level: 'Medium', correct: 75, incorrect: 25, accuracy: 75 },
      { level: 'Hard', correct: 60, incorrect: 40, accuracy: 60 }
    ];

    // Time analysis
    const timeAnalysisData = Object.keys(quizData).map(category => {
      const data = quizData[category];
      return {
        category: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        avgTime: (data.timeSpent / data.totalQuestions / 60).toFixed(1),
        efficiency: ((data.correctAnswers / data.totalQuestions) / (data.timeSpent / data.totalQuestions / 60)).toFixed(2)
      };
    });

    return { categoryPerformance, progressData, difficultyData, timeAnalysisData };
  };

  const chartData = prepareChartData();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'accuracy' && '%'}
              {entry.name === 'avgTime' && ' min'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Quiz Performance Analytics</h2>
            <p className="text-blue-100">Comprehensive analysis of your quiz performance</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Overall Accuracy</p>
              <p className="text-2xl font-bold text-green-600">{metrics.overallAccuracy}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.averageScore}/100</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Attempts</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.totalAttempts}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Time/Question</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.averageTimePerQuestion}m</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart Navigation */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
            { id: 'categories', label: 'Categories', icon: Brain },
            { id: 'difficulty', label: 'Difficulty', icon: Target },
            { id: 'time', label: 'Time Analysis', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeChart === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Chart Content */}
        <div className="h-96">
          {activeChart === 'overview' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy %" />
                <Bar dataKey="attempts" fill="#10B981" name="Attempts" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'progress' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attempt" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Average Score"
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'categories' && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData.categoryPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Accuracy"
                  dataKey="accuracy"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'difficulty' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ level, accuracy }) => `${level}: ${accuracy}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="accuracy"
                >
                  {chartData.difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'time' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.timeAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="avgTime"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  name="Avg Time (min)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            Performance Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Strongest Area</p>
                  <p className="text-sm text-green-600">
                    {metrics.strongestCategory?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Focus Area</p>
                  <p className="text-sm text-red-600">
                    {metrics.weakestCategory?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Recent Quiz Activity
          </h3>
          <div className="space-y-3">
            {chartData.progressData.slice(-5).reverse().map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{activity.category}</p>
                  <p className="text-sm text-gray-600">Attempt #{activity.attempt}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{activity.score}%</p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          Personalized Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Practice Focus</h4>
            <p className="text-sm text-purple-100">
              Spend more time on {metrics.weakestCategory?.replace(/_/g, ' ') || 'challenging areas'} to improve overall performance.
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Time Management</h4>
            <p className="text-sm text-purple-100">
              Your average time per question is {metrics.averageTimePerQuestion}m. Consider practicing speed.
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <h4 className="font-medium mb-2">Next Goal</h4>
            <p className="text-sm text-purple-100">
              Aim for 95% accuracy in your strongest category to master it completely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPerformanceAnalytics;