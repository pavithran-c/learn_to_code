import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Brain, TrendingUp, Target, Clock, Award, BookOpen, 
  Code, Activity, BarChart3, ChevronRight, Star,
  Zap, Globe, FileText, PieChart, ArrowUp, ArrowDown,
  CheckCircle, XCircle, Play, Trophy, Calendar, User
} from 'lucide-react';

const AdaptiveLearningDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  useEffect(() => {
    if (user) {
      fetchAdaptiveDashboardData();
    }
  }, [user, selectedTimeframe]);

  const fetchAdaptiveDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch adaptive recommendations
      const recommendationsResponse = await fetch(
        'http://localhost:5000/api/adaptive/analytics/recommendations',
        { headers }
      );

      // Fetch skill progress
      const skillsResponse = await fetch(
        'http://localhost:5000/api/adaptive/skills/progress',
        { headers }
      );

      // Fetch learning analytics
      const analyticsResponse = await fetch(
        `http://localhost:5000/api/adaptive/analytics/learning?days=${selectedTimeframe}`,
        { headers }
      );

      // Fetch performance analytics
      const performanceResponse = await fetch(
        'http://localhost:5000/api/adaptive/analytics/performance',
        { headers }
      );

      if (recommendationsResponse.ok && skillsResponse.ok && analyticsResponse.ok && performanceResponse.ok) {
        const recommendations = await recommendationsResponse.json();
        const skills = await skillsResponse.json();
        const analytics = await analyticsResponse.json();
        const performance = await performanceResponse.json();

        setDashboardData({
          recommendations: recommendations.stats,
          skills: skills.progress,
          analytics: analytics.analytics,
          performance: performance.analytics
        });
      } else {
        // Fallback to sample data if APIs fail
        setDashboardData(getSampleAdaptiveData());
      }
    } catch (error) {
      console.error('Error fetching adaptive dashboard data:', error);
      setDashboardData(getSampleAdaptiveData());
    } finally {
      setLoading(false);
    }
  };

  const getSampleAdaptiveData = () => ({
    recommendations: {
      estimated_ability: 0.65,
      skill_mastery: {
        algorithms: 0.78,
        data_structures: 0.85,
        dynamic_programming: 0.45,
        graph_algorithms: 0.62
      },
      completion_rate: 73.5,
      total_solved: 87,
      learning_velocity: 1.2,
      weak_skills: ['dynamic_programming', 'graph_algorithms'],
      strong_skills: ['data_structures', 'algorithms']
    },
    skills: {
      overall_progress: 0.68,
      learning_velocity: 1.15,
      skills: {
        algorithms: { mastery_level: 0.78, total_attempts: 45 },
        data_structures: { mastery_level: 0.85, total_attempts: 52 },
        dynamic_programming: { mastery_level: 0.45, total_attempts: 23 },
        graph_algorithms: { mastery_level: 0.62, total_attempts: 18 }
      }
    },
    analytics: {
      activity_summary: {
        total_problems_attempted: 25,
        total_code_submissions: 47,
        success_rate: 68.0,
        average_score: 76.5
      }
    },
    performance: {
      ability_estimation: {
        current_ability: 0.65,
        ability_interpretation: "Intermediate - Developing solid programming foundation"
      }
    }
  });

  const getAbilityColor = (ability) => {
    if (ability < 0) return 'text-red-600';
    if (ability < 0.5) return 'text-yellow-600';
    if (ability < 1.0) return 'text-blue-600';
    return 'text-green-600';
  };

  const getMasteryColor = (mastery) => {
    if (mastery < 0.3) return 'bg-red-500';
    if (mastery < 0.6) return 'bg-yellow-500';
    if (mastery < 0.8) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your adaptive learning dashboard...</p>
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
            🧠 Adaptive Learning Dashboard
          </h1>
          <p className="text-gray-600">
            AI-powered insights and personalized recommendations for your learning journey
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['7', '30', '90'].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedTimeframe(days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Last {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Ability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <span className={`text-2xl font-bold ${getAbilityColor(dashboardData?.recommendations?.estimated_ability || 0)}`}>
                {((dashboardData?.recommendations?.estimated_ability || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Current Ability</h3>
            <p className="text-sm text-gray-600">
              {dashboardData?.performance?.ability_estimation?.ability_interpretation || "Building foundation"}
            </p>
          </motion.div>

          {/* Learning Velocity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {(dashboardData?.recommendations?.learning_velocity || 0).toFixed(1)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Learning Velocity</h3>
            <p className="text-sm text-gray-600">Problems/hour improvement rate</p>
          </motion.div>

          {/* Completion Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">
                {(dashboardData?.recommendations?.completion_rate || 0).toFixed(1)}%
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Completion Rate</h3>
            <p className="text-sm text-gray-600">Problems successfully solved</p>
          </motion.div>

          {/* Total Solved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">
                {dashboardData?.recommendations?.total_solved || 0}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Problems Solved</h3>
            <p className="text-sm text-gray-600">Total completed challenges</p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skill Mastery Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Skill Mastery Levels</h3>
            <div className="space-y-4">
              {Object.entries(dashboardData?.recommendations?.skill_mastery || {}).map(([skill, mastery]) => (
                <div key={skill} className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-medium text-gray-700 capitalize">
                    {skill.replace('_', ' ')}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getMasteryColor(mastery)}`}
                      style={{ width: `${mastery * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-gray-900">
                    {(mastery * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recommendations Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">AI Recommendations</h3>
            
            {/* Weak Skills */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center">
                <ArrowDown className="w-4 h-4 mr-2" />
                Focus Areas
              </h4>
              <div className="space-y-2">
                {(dashboardData?.recommendations?.weak_skills || []).slice(0, 3).map((skill) => (
                  <div key={skill} className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {skill.replace('_', ' ')}
                  </div>
                ))}
              </div>
            </div>

            {/* Strong Skills */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-green-600 mb-3 flex items-center">
                <ArrowUp className="w-4 h-4 mr-2" />
                Strong Areas
              </h4>
              <div className="space-y-2">
                {(dashboardData?.recommendations?.strong_skills || []).slice(0, 3).map((skill) => (
                  <div key={skill} className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                    {skill.replace('_', ' ')}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Get Adaptive Problems</span>
            </button>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData?.analytics?.activity_summary?.total_problems_attempted || 0}
              </div>
              <div className="text-sm text-gray-600">Problems Attempted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dashboardData?.analytics?.activity_summary?.total_code_submissions || 0}
              </div>
              <div className="text-sm text-gray-600">Code Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(dashboardData?.analytics?.activity_summary?.success_rate || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(dashboardData?.analytics?.activity_summary?.average_score || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdaptiveLearningDashboard;