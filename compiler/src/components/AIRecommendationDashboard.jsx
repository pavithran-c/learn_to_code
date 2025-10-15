import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AIRecommendationDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [skillGaps, setSkillGaps] = useState([]);
  const [learningInsights, setLearningInsights] = useState([]);
  const [improvementPaths, setImprovementPaths] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchAIDashboard();
      fetchSkillGaps();
      fetchLearningInsights();
    }
  }, [user?.id]);

  const fetchAIDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ai-dashboard/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching AI dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillGaps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/skill-gaps/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSkillGaps(data.skill_gaps || []);
      }
    } catch (error) {
      console.error('Error fetching skill gaps:', error);
    }
  };

  const fetchLearningInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/learning-insights/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLearningInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error fetching learning insights:', error);
    }
  };

  const fetchImprovementPath = async (concept) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/improvement-path/${user.id}/${concept}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setImprovementPaths(prev => ({
          ...prev,
          [concept]: data.improvement_path
        }));
      }
    } catch (error) {
      console.error('Error fetching improvement path:', error);
    }
  };

  const triggerDifficultyAdaptation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/difficulty-adaptation/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchAIDashboard(); // Refresh dashboard
      }
    } catch (error) {
      console.error('Error triggering difficulty adaptation:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    if (difficulty < 0.2) return 'Very Easy';
    if (difficulty < 0.4) return 'Easy';
    if (difficulty < 0.6) return 'Medium';
    if (difficulty < 0.8) return 'Hard';
    return 'Very Hard';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 AI Learning Assistant
        </h1>
        <p className="text-gray-600">
          Personalized insights and recommendations powered by advanced learning analytics
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'skills', label: 'Skill Analysis', icon: '🎯' },
              { id: 'recommendations', label: 'AI Recommendations', icon: '💡' },
              { id: 'progression', label: 'Learning Path', icon: '🛤️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && dashboardData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Learning Velocity</h3>
              <p className="text-2xl font-bold text-blue-600">
                {((dashboardData.learning_velocity?.velocity || 0) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Improvement rate</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Current Difficulty</h3>
              <p className="text-2xl font-bold text-green-600">
                {getDifficultyLabel(dashboardData.adaptive_difficulty?.current_difficulty || 0.5)}
              </p>
              <p className="text-xs text-gray-500">
                Confidence: {((dashboardData.adaptive_difficulty?.confidence_level || 0) * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Concepts Mastered</h3>
              <p className="text-2xl font-bold text-purple-600">
                {dashboardData.skill_assessment?.mastered_concepts || 0}
              </p>
              <p className="text-xs text-gray-500">
                Out of {dashboardData.skill_assessment?.total_concepts || 0}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Skill Gaps</h3>
              <p className="text-2xl font-bold text-orange-600">
                {dashboardData.skill_assessment?.critical_gaps || 0}
              </p>
              <p className="text-xs text-gray-500">Critical areas</p>
            </div>
          </div>

          {/* AI Recommendations Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Priority Recommendations</h3>
              <button
                onClick={triggerDifficultyAdaptation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Adapt Difficulty
              </button>
            </div>
            
            <div className="space-y-3">
              {dashboardData.ai_recommendations?.priority_recommendations?.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600">
                      {rec.concepts?.join(', ')} • {rec.estimated_time} minutes
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Insights */}
          {learningInsights.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Insights</h3>
              <div className="space-y-4">
                {learningInsights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-gray-600 text-sm">{insight.description}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                        {insight.priority} priority
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        Confidence: {(insight.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills Tab */}
      {selectedTab === 'skills' && (
        <div className="space-y-6">
          {/* Skill Gaps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Identified Skill Gaps</h3>
            
            {skillGaps.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No skill gaps identified. Great work!</p>
            ) : (
              <div className="space-y-4">
                {skillGaps.map((gap, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {gap.concept.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          gap.gap_severity >= 0.8 ? 'text-red-600 bg-red-100' :
                          gap.gap_severity >= 0.6 ? 'text-orange-600 bg-orange-100' :
                          'text-yellow-600 bg-yellow-100'
                        }`}>
                          {gap.gap_severity >= 0.8 ? 'Critical' : gap.gap_severity >= 0.6 ? 'High' : 'Medium'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Impact: {(gap.impact_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Current Level:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${gap.current_level * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{(gap.current_level * 100).toFixed(0)}%</span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Time Investment:</span>
                        <p className="text-gray-600">{gap.time_investment_needed} hours</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Difficulty:</span>
                        <p className="text-gray-600">{getDifficultyLabel(gap.difficulty_estimation)}</p>
                      </div>
                    </div>
                    
                    {gap.blocking_dependencies?.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-700">Blocks:</span>
                        <p className="text-gray-600 text-sm">
                          {gap.blocking_dependencies.join(', ')}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => fetchImprovementPath(gap.concept)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Get Improvement Plan
                      </button>
                    </div>
                    
                    {/* Show improvement path if loaded */}
                    {improvementPaths[gap.concept] && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Learning Path:</h5>
                        <div className="flex flex-wrap gap-2">
                          {improvementPaths[gap.concept].learning_sequence.map((step, stepIndex) => (
                            <span
                              key={stepIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {step.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-blue-700 mt-2">
                          Estimated time: {improvementPaths[gap.concept].total_time_estimate} hours
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {selectedTab === 'recommendations' && dashboardData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Immediate Actions</h3>
            <div className="space-y-3">
              {dashboardData.ai_recommendations?.immediate_actions?.map((action, index) => (
                <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-500 mr-3">⚡</span>
                  <span className="text-gray-900">{action}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Plan</h3>
            <div className="space-y-3">
              {dashboardData.ai_recommendations?.study_plan?.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 mr-3">📚</span>
                  <span className="text-gray-900">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progression Tab */}
      {selectedTab === 'progression' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progression</h3>
            <p className="text-gray-600 mb-6">
              Your personalized learning path based on AI analysis of your skills and goals.
            </p>
            
            <div className="space-y-4">
              {/* This would be populated with actual progression data */}
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🚧</div>
                <p>Learning progression visualization coming soon!</p>
                <p className="text-sm">AI-powered roadmap based on your unique learning patterns</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendationDashboard;