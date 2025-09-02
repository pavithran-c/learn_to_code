import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Target, TrendingUp, BookOpen, Clock, Star, Trophy,
  Activity, BarChart3, PieChart, ArrowUp, ArrowDown, Play,
  CheckCircle, XCircle, Zap, AlertTriangle, Info, Lightbulb,
  Code, Timer, MemoryStick, Gauge, Award, TrendingDown
} from 'lucide-react';

const AdaptiveLearningDashboard = ({ userId = 'guest' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [conceptMastery, setConceptMastery] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchUserAnalytics();
    fetchConceptMastery();
  }, [userId]);

  const fetchUserAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/adaptive/user_analytics?user_id=${userId}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConceptMastery = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/adaptive/concept_mastery?user_id=${userId}`);
      const data = await response.json();
      setConceptMastery(data);
    } catch (error) {
      console.error('Error fetching concept mastery:', error);
    }
  };

  const generateLearningPath = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/adaptive/learning_path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          goal: 'general_improvement',
          timeline_days: 30
        })
      });
      const data = await response.json();
      setLearningPath(data);
    } catch (error) {
      console.error('Error generating learning path:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          Adaptive Learning Dashboard
        </h1>
        <p className="text-gray-600">AI-powered personalized learning insights and recommendations</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'mastery', label: 'Concept Mastery', icon: Target },
            { id: 'performance', label: 'Performance', icon: Activity },
            { id: 'path', label: 'Learning Path', icon: BookOpen }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                selectedTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && analytics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Skill Level"
              value={`θ = ${analytics.ability_estimate}`}
              subtitle={`${analytics.percentile_rank}th percentile`}
              icon={Brain}
              color="purple"
              trend={analytics.recent_performance_trend}
            />
            <StatCard
              title="ELO Rating"
              value={Math.round(analytics.elo_rating)}
              subtitle="Chess-style rating"
              icon={Trophy}
              color="yellow"
              trend={analytics.learning_velocity > 0 ? 'up' : 'down'}
            />
            <StatCard
              title="Accuracy"
              value={`${(analytics.accuracy * 100).toFixed(1)}%`}
              subtitle={`${analytics.total_attempts} attempts`}
              icon={Target}
              color="green"
              trend={analytics.accuracy > 0.7 ? 'up' : 'down'}
            />
            <StatCard
              title="Learning Velocity"
              value={analytics.learning_velocity > 0 ? '+' : ''}
              subtitle={`${(analytics.learning_velocity * 100).toFixed(1)}% improvement`}
              icon={TrendingUp}
              color="blue"
              trend={analytics.learning_velocity > 0.1 ? 'up' : 'down'}
            />
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Top Strengths
              </h3>
              <div className="space-y-3">
                {analytics.strengths.slice(0, 3).map((strength, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">{strength.concept}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-green-200 rounded-full">
                        <div
                          className="h-2 bg-green-500 rounded-full"
                          style={{ width: `${strength.mastery * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-green-600">
                        {(strength.mastery * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Areas to Improve
              </h3>
              <div className="space-y-3">
                {analytics.weaknesses.slice(0, 3).map((weakness, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-red-700 font-medium">{weakness.concept}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-red-200 rounded-full">
                        <div
                          className="h-2 bg-red-500 rounded-full"
                          style={{ width: `${weakness.mastery * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-red-600">
                        {(weakness.mastery * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Performance Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Performance Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.problem_types_attempted}
                </div>
                <div className="text-sm text-gray-600">Problem Types Attempted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.session_count}
                </div>
                <div className="text-sm text-gray-600">Active Learning Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(analytics.avg_time_per_problem / 1000)}s
                </div>
                <div className="text-sm text-gray-600">Avg Time per Problem</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Concept Mastery Tab */}
      {selectedTab === 'mastery' && conceptMastery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Overall Progress */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {conceptMastery.overall_progress.mastered_concepts}
                </div>
                <div className="text-sm text-gray-600">Mastered Concepts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {conceptMastery.overall_progress.learning_concepts}
                </div>
                <div className="text-sm text-gray-600">Learning Concepts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {conceptMastery.overall_progress.struggling_concepts}
                </div>
                <div className="text-sm text-gray-600">Struggling With</div>
              </div>
            </div>
          </div>

          {/* Concept Categories */}
          <div className="space-y-6">
            {Object.entries(conceptMastery.categorized_mastery).map(([category, data]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {data.total_concepts} concepts
                    </span>
                    <div className="text-sm font-medium">
                      Avg: {(data.avg_mastery * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.concepts.map((concept, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        concept.level === 'Mastered'
                          ? 'border-green-200 bg-green-50'
                          : concept.level === 'Proficient'
                          ? 'border-blue-200 bg-blue-50'
                          : concept.level === 'Learning'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="font-medium text-gray-800 mb-1">
                        {concept.concept.replace(/_/g, ' ')}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          concept.level === 'Mastered'
                            ? 'text-green-600'
                            : concept.level === 'Proficient'
                            ? 'text-blue-600'
                            : concept.level === 'Learning'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {concept.level}
                        </span>
                        <span className="text-sm text-gray-600">
                          {(concept.mastery * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            concept.level === 'Mastered'
                              ? 'bg-green-500'
                              : concept.level === 'Proficient'
                              ? 'bg-blue-500'
                              : concept.level === 'Learning'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${concept.mastery * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Learning Path Tab */}
      {selectedTab === 'path' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {!learningPath ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Generate Your Personalized Learning Path
              </h3>
              <p className="text-gray-600 mb-6">
                Get AI-powered recommendations based on your current skill level and goals.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateLearningPath}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Generate Learning Path
              </motion.button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Path Overview */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Your Personalized Learning Path</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Goal:</div>
                    <div className="opacity-90">{learningPath.goal.replace(/_/g, ' ')}</div>
                  </div>
                  <div>
                    <div className="font-medium">Timeline:</div>
                    <div className="opacity-90">{learningPath.timeline_days} days</div>
                  </div>
                  <div>
                    <div className="font-medium">Current Level:</div>
                    <div className="opacity-90">{learningPath.current_level}th percentile</div>
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" />
                  Priority Focus Areas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {learningPath.focus_areas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      {area.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Daily Plan */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Weekly Plan
                </h4>
                <div className="space-y-4">
                  {learningPath.daily_plan.map((day, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">Day {day.day}</h5>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {day.total_time_minutes} min
                        </div>
                      </div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Focus: </span>
                        {day.focus_concepts.map((concept, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs mr-1"
                          >
                            {concept.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {day.problems.map((problem, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{problem.title}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                problem.difficulty === 'easy'
                                  ? 'bg-green-100 text-green-800'
                                  : problem.difficulty === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {problem.difficulty}
                              </span>
                              <span className="text-gray-600">
                                {problem.estimated_time_minutes}min
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Learning Milestones
                </h4>
                <div className="space-y-3">
                  {learningPath.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-sm">
                          {milestone.week}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{milestone.goal}</div>
                        <div className="text-sm text-gray-600">
                          Target Accuracy: {milestone.target_accuracy}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Reusable StatCard component
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    red: 'bg-red-50 border-red-200 text-red-800'
  };

  const trendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : null;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`p-6 rounded-lg border-2 ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color === 'purple' ? 'text-purple-600' : 
          color === 'yellow' ? 'text-yellow-600' :
          color === 'green' ? 'text-green-600' :
          color === 'blue' ? 'text-blue-600' : 'text-red-600'}`} />
        {trendIcon && <trendIcon className={`w-5 h-5 ${trendColor}`} />}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs opacity-75 mt-1">{subtitle}</div>
    </motion.div>
  );
};

export default AdaptiveLearningDashboard;

import { Calendar } from 'lucide-react';
