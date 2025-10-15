import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdvancedAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchAdvancedDashboard();
      fetchPerformanceMetrics();
      fetchPredictions();
      fetchTrends();
    }
  }, [user?.id]);

  const fetchAdvancedDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/comprehensive/${user.id}`, {
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
      console.error('Error fetching advanced dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/performance/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPerformanceMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/predictions/trajectory/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPredictions(data);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/trends/${user.id}/overall_performance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrends(data);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/dashboard/cache/invalidate/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await fetchAdvancedDashboard();
      await fetchPerformanceMetrics();
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendDirection = (trend) => {
    if (trend === 'increasing') return '📈 Improving';
    if (trend === 'decreasing') return '📉 Declining';
    return '📊 Stable';
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Advanced Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive performance analytics, trends, and ML-powered predictions
            </p>
          </div>
          <button
            onClick={refreshDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Performance Overview', icon: '📊' },
              { id: 'metrics', label: 'Detailed Metrics', icon: '📈' },
              { id: 'predictions', label: 'ML Predictions', icon: '🔮' },
              { id: 'trends', label: 'Trend Analysis', icon: '📉' },
              { id: 'comparisons', label: 'Comparisons', icon: '⚖️' }
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

      {/* Performance Overview Tab */}
      {selectedTab === 'overview' && performanceMetrics && (
        <div className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Overall Performance</h3>
              <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics.overall_performance).split(' ')[0]}`}>
                {(performanceMetrics.overall_performance * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Composite score</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Accuracy Rate</h3>
              <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics.accuracy_score).split(' ')[0]}`}>
                {(performanceMetrics.accuracy_score * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                {performanceMetrics.correct_answers}/{performanceMetrics.total_attempts} correct
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Speed Score</h3>
              <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics.speed_score).split(' ')[0]}`}>
                {(performanceMetrics.speed_score * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                Avg: {performanceMetrics.average_time_per_problem.toFixed(0)}s
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Consistency</h3>
              <p className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics.consistency_score).split(' ')[0]}`}>
                {(performanceMetrics.consistency_score * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Performance stability</p>
            </div>
          </div>

          {/* Advanced Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Efficiency</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Learning Efficiency:</span>
                  <span className="font-medium">{(performanceMetrics.learning_efficiency * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retention Rate:</span>
                  <span className="font-medium">{(performanceMetrics.retention_rate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mastery Progression:</span>
                  <span className="font-medium">{(performanceMetrics.mastery_progression * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fastest Solve:</span>
                  <span className="font-medium">{performanceMetrics.fastest_solve_time.toFixed(0)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Slowest Solve:</span>
                  <span className="font-medium">{performanceMetrics.slowest_solve_time.toFixed(0)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Time:</span>
                  <span className="font-medium">{performanceMetrics.average_time_per_problem.toFixed(0)}s</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekly Trend:</span>
                  <span className="font-medium">{getTrendDirection(performanceMetrics.weekly_performance_trend)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Trend:</span>
                  <span className="font-medium">{getTrendDirection(performanceMetrics.monthly_performance_trend)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Reduction:</span>
                  <span className="font-medium">{(performanceMetrics.error_reduction_rate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Concept Performance */}
          {Object.keys(performanceMetrics.concept_mastery_levels).length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Concept Mastery Levels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(performanceMetrics.concept_mastery_levels).slice(0, 6).map(([concept, level]) => (
                  <div key={concept} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {concept.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-sm text-gray-500">{(level * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${level >= 0.7 ? 'bg-green-500' : level >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${level * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ML Predictions Tab */}
      {selectedTab === 'predictions' && predictions && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Trajectory Prediction</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(predictions.current_skill_level * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Current Skill Level</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {predictions.time_to_mastery} days
                </div>
                <div className="text-sm text-gray-500">Time to Mastery</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(predictions.completion_probability * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">Completion Probability</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Predicted Milestones</h4>
              <div className="space-y-2">
                {predictions.predicted_milestones?.slice(0, 5).map((milestone, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{milestone.description}</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {new Date(milestone.estimated_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(milestone.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 mb-3">Success Indicators</h4>
              <div className="space-y-2">
                {predictions.success_indicators?.map((indicator, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-700">{indicator}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
              <div className="space-y-2">
                {predictions.risk_factors?.map((risk, index) => (
                  <div key={index} className="flex items-center p-2 bg-red-50 rounded">
                    <span className="text-red-500 mr-2">⚠</span>
                    <span className="text-sm text-gray-700">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-medium text-gray-900 mb-3">Recommended Pace</h4>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              predictions.recommended_pace === 'accelerated' ? 'bg-green-100 text-green-800' :
              predictions.recommended_pace === 'normal' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {predictions.recommended_pace?.charAt(0).toUpperCase() + predictions.recommended_pace?.slice(1)} Pace
            </div>
          </div>
        </div>
      )}

      {/* Trend Analysis Tab */}
      {selectedTab === 'trends' && trends && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getTrendDirection(trends.trend_direction)}
                </div>
                <div className="text-sm text-gray-500">Trend Direction</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(trends.trend_strength * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Trend Strength</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(trends.r_squared * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Prediction Accuracy (R²)</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Future Projections</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">7-Day Projection:</div>
                  <div className="text-lg font-bold">{(trends.projection_7_days * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">30-Day Projection:</div>
                  <div className="text-lg font-bold">{(trends.projection_30_days * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Points Visualization */}
      {selectedTab === 'trends' && trends?.data_points && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-medium text-gray-900 mb-3">Performance Timeline</h4>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📈</div>
            <p>Performance chart visualization would be displayed here</p>
            <p className="text-sm">Data points: {trends.data_points.length}</p>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {(selectedTab === 'metrics' || selectedTab === 'comparisons') && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🚧</div>
            <p>Advanced {selectedTab} visualization coming soon!</p>
            <p className="text-sm">Enhanced analytics and interactive charts</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;