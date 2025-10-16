import React, { useState, useEffect } from 'react';
import quizAnalyticsService from '../services/quizAnalyticsService';
import QuizPerformanceAnalytics from '../components/QuizPerformanceAnalytics';

const TestAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Load analytics data
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    try {
      console.log('🔧 Loading analytics data...');
      const data = quizAnalyticsService.getData();
      setAnalyticsData(data);
      setDebugInfo(JSON.stringify(data, null, 2));
      console.log('✅ Analytics data loaded:', data);
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  const addSampleData = () => {
    try {
      console.log('🔧 Adding sample data...');
      quizAnalyticsService.addSampleData();
      loadAnalyticsData();
    } catch (error) {
      console.error('❌ Error adding sample data:', error);
    }
  };

  const resetData = () => {
    try {
      console.log('🔧 Resetting data...');
      quizAnalyticsService.resetData();
      loadAnalyticsData();
    } catch (error) {
      console.error('❌ Error resetting data:', error);
    }
  };

  const testQuizCompletion = () => {
    try {
      console.log('🔧 Testing quiz completion...');
      const testQuiz = {
        category: 'programming_fundamentals',
        categoryTitle: 'Programming Fundamentals',
        score: 90,
        totalQuestions: 10,
        correctAnswers: 9,
        timeSpent: 600,
        answers: {},
        questionDetails: [],
        difficulty: 'mixed'
      };
      
      quizAnalyticsService.recordQuizCompletion(testQuiz);
      loadAnalyticsData();
      console.log('✅ Test quiz completion recorded');
    } catch (error) {
      console.error('❌ Error recording test quiz:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Analytics Test Page</h1>
          
          {/* Control Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={loadAnalyticsData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reload Data
            </button>
            <button
              onClick={addSampleData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Sample Data
            </button>
            <button
              onClick={testQuizCompletion}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Quiz Completion
            </button>
            <button
              onClick={resetData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reset Data
            </button>
          </div>

          {/* Data Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h2 className="text-xl font-semibold mb-4">Analytics Data Summary</h2>
            {analyticsData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.userStats?.totalQuizzes || 0}
                  </div>
                  <div className="text-sm text-blue-800">Total Quizzes</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.userStats?.totalQuestions || 0}
                  </div>
                  <div className="text-sm text-green-800">Total Questions</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.userStats?.totalCorrect || 0}
                  </div>
                  <div className="text-sm text-purple-800">Correct Answers</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {analyticsData.userStats?.averageScore?.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-orange-800">Average Score</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No analytics data available</p>
            )}
          </div>

          {/* Debug Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-64">
              {debugInfo || 'Loading...'}
            </pre>
          </div>
        </div>

        {/* Analytics Component */}
        {analyticsData && analyticsData.userStats?.totalQuizzes > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Quiz Performance Analytics</h2>
            <QuizPerformanceAnalytics 
              userStats={analyticsData.userStats || {}}
              quizHistory={analyticsData.quizHistory || []}
            />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Quiz Data Available</h3>
            <p className="text-yellow-700 mb-4">
              Click "Add Sample Data" to generate some test data for the analytics component.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAnalytics;