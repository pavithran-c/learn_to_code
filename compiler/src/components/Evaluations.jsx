import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, Clock, Trophy, TrendingUp, TrendingDown,
  Code, Target, Award, BarChart3, Calendar, Filter, Search,
  Eye, Download, RefreshCw, Star, Zap, AlertTriangle, Info
} from 'lucide-react';
import axios from 'axios';

const Evaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [quizEvaluations, setQuizEvaluations] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, passed, failed
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all, code, quiz
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const evaluationsPerPage = 10;
  
  // Mock user ID - in real app, get from auth context
  const userId = 'demo_user';

  useEffect(() => {
    fetchEvaluations();
    fetchQuizEvaluations();
    fetchUserProgress();
    fetchLeaderboard();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/evaluations/user/${userId}?limit=50`);
      setEvaluations(response.data.evaluations || []);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      setEvaluations(generateMockEvaluations());
    }
  };

  const fetchQuizEvaluations = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quiz/user/${userId}/evaluations?limit=50`);
      setQuizEvaluations(response.data.evaluations || []);
    } catch (error) {
      console.error('Error fetching quiz evaluations:', error);
      setQuizEvaluations(generateMockQuizEvaluations());
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/evaluations/progress/${userId}`);
      setUserProgress(response.data);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      setUserProgress({
        user_id: userId,
        total_solved: 15,
        total_attempts: 42,
        average_score: 78.5,
        solved_problems: [],
        attempted_problems: []
      });
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/evaluations/leaderboard?limit=10');
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const generateMockEvaluations = () => {
    return [
      {
        _id: '1',
        problem_id: '1',
        problem_title: 'Two Sum',
        problem_difficulty: 'easy',
        language: 'python',
        submission_time: new Date(Date.now() - 86400000).toISOString(),
        all_passed: true,
        scores: { correctness: 100, efficiency: 85, quality: 90, overall: 92 },
        performance: { execution_time_ms: 45, memory_peak_mb: 8.2, time_complexity: 'O(n)' }
      }
    ];
  };

  const generateMockQuizEvaluations = () => {
    return [
      {
        _id: 'quiz_1',
        type: 'quiz_session',
        quiz_type: 'competitive',
        subject: 'General Knowledge',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        overall_score: 85,
        accuracy: 80,
        total_questions: 10,
        total_correct: 8,
        session_duration: 300,
        performance_metrics: {
          avg_time_per_question: 30,
          difficulty_distribution: { easy: 0.4, medium: 0.4, hard: 0.2 },
          streak: 5
        },
        knowledge_updates: {
          'General Knowledge': { theta: 0.5, mastery: 0.75, elo_rating: 1250 }
        }
      }
    ];
  };

  const getFilteredEvaluations = () => {
    let allEvaluations = [];
    
    // Combine code evaluations and quiz evaluations
    if (filterType === 'all' || filterType === 'code') {
      const codeEvals = evaluations.map(evaluation => ({ ...evaluation, evaluation_type: 'code' }));
      allEvaluations = [...allEvaluations, ...codeEvals];
    }
    
    if (filterType === 'all' || filterType === 'quiz') {
      const quizEvals = quizEvaluations.map(evaluation => ({ ...evaluation, evaluation_type: 'quiz' }));
      allEvaluations = [...allEvaluations, ...quizEvals];
    }

    // Sort by timestamp (newest first)
    allEvaluations.sort((a, b) => new Date(b.timestamp || b.submission_time) - new Date(a.timestamp || a.submission_time));

    // Filter by status
    if (filterStatus === 'passed') {
      allEvaluations = allEvaluations.filter(evaluation => 
        evaluation.evaluation_type === 'code' ? evaluation.all_passed : evaluation.accuracy >= 70
      );
    } else if (filterStatus === 'failed') {
      allEvaluations = allEvaluations.filter(evaluation => 
        evaluation.evaluation_type === 'code' ? !evaluation.all_passed : evaluation.accuracy < 70
      );
    }

    // Filter by difficulty (only for code evaluations)
    if (filterDifficulty !== 'all') {
      allEvaluations = allEvaluations.filter(evaluation => 
        evaluation.evaluation_type === 'code' && evaluation.problem_difficulty === filterDifficulty
      );
    }

    // Filter by search term
    if (searchTerm) {
      allEvaluations = allEvaluations.filter(evaluation => {
        if (evaluation.evaluation_type === 'code') {
          return evaluation.problem_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 evaluation.language.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return evaluation.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 evaluation.quiz_type.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }

    return allEvaluations;
  };

  const getPaginatedEvaluations = () => {
    const filtered = getFilteredEvaluations();
    const startIndex = (currentPage - 1) * evaluationsPerPage;
    const endIndex = startIndex + evaluationsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredEvaluations().length / evaluationsPerPage);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading evaluations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Code & Quiz Evaluations</h1>
              <p className="mt-1 text-lg text-gray-600">
                Track your progress across coding problems and quiz sessions
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchEvaluations();
                fetchQuizEvaluations();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </motion.button>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        {/* Progress Overview */}
        {userProgress && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{userProgress.total_solved}</span>
              </div>
              <h3 className="font-semibold text-gray-700">Problems Solved</h3>
              <p className="text-sm text-gray-500">Out of {userProgress.total_attempts} attempts</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round(userProgress.average_score)}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-700">Average Score</h3>
              <p className="text-sm text-gray-500">Across all submissions</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Code className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">{userProgress.total_attempts}</span>
              </div>
              <h3 className="font-semibold text-gray-700">Total Attempts</h3>
              <p className="text-sm text-gray-500">Keep practicing!</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {userProgress.total_attempts > 0 ? Math.round((userProgress.total_solved / userProgress.total_attempts) * 100) : 0}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-700">Success Rate</h3>
              <p className="text-sm text-gray-500">Problems solved successfully</p>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="code">Code Evaluations</option>
              <option value="quiz">Quiz Evaluations</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
            
            {filterType !== 'quiz' && (
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            )}
            
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search evaluations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Evaluations List */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Evaluations</h2>
          
          {getPaginatedEvaluations().length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations found</h3>
              <p className="text-gray-500">
                {getFilteredEvaluations().length === 0 
                  ? "Start solving problems or taking quizzes to see your evaluations here!"
                  : "Try adjusting your filters to see more results."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getPaginatedEvaluations().map((evaluation, index) => (
                <motion.div
                  key={evaluation._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEvaluation(evaluation)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {evaluation.evaluation_type === 'code' ? (
                          evaluation.all_passed ? (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          ) : (
                            <XCircle className="w-8 h-8 text-red-600" />
                          )
                        ) : (
                          evaluation.accuracy >= 70 ? (
                            <Trophy className="w-8 h-8 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                          )
                        )}
                      </div>
                      <div>
                        {evaluation.evaluation_type === 'code' ? (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {evaluation.problem_title}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(evaluation.submission_time)}
                              </span>
                              <span className="flex items-center">
                                <Code className="w-4 h-4 mr-1" />
                                {evaluation.language}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(evaluation.problem_difficulty)}`}>
                                {evaluation.problem_difficulty}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {evaluation.quiz_type.charAt(0).toUpperCase() + evaluation.quiz_type.slice(1)} Quiz: {evaluation.subject}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(evaluation.timestamp)}
                              </span>
                              <span className="flex items-center">
                                <Target className="w-4 h-4 mr-1" />
                                {evaluation.total_correct}/{evaluation.total_questions} correct
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {Math.floor(evaluation.session_duration / 60)}m {evaluation.session_duration % 60}s
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {evaluation.evaluation_type === 'code' ? (
                        <div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${evaluation.scores?.overall >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.round(evaluation.scores?.overall || 0)}%
                            </div>
                            <div className="text-sm text-gray-500">Overall Score</div>
                          </div>
                          
                          <div className="flex space-x-2 mt-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium border ${getScoreColor(evaluation.scores?.correctness || 0)}`}>
                              C: {Math.round(evaluation.scores?.correctness || 0)}%
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium border ${getScoreColor(evaluation.scores?.efficiency || 0)}`}>
                              E: {Math.round(evaluation.scores?.efficiency || 0)}%
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium border ${getScoreColor(evaluation.scores?.quality || 0)}`}>
                              Q: {Math.round(evaluation.scores?.quality || 0)}%
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${evaluation.overall_score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.round(evaluation.overall_score)}%
                            </div>
                            <div className="text-sm text-gray-500">Quiz Score</div>
                          </div>
                          
                          <div className="flex space-x-2 mt-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium border ${getScoreColor(evaluation.accuracy)}`}>
                              Accuracy: {Math.round(evaluation.accuracy)}%
                            </div>
                            <div className="px-2 py-1 rounded text-xs font-medium border border-blue-200 bg-blue-50 text-blue-800">
                              Streak: {evaluation.performance_metrics?.streak || 0}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: getTotalPages() }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Evaluation Detail Modal */}
      <AnimatePresence>
        {selectedEvaluation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvaluation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedEvaluation.evaluation_type === 'code' 
                        ? selectedEvaluation.problem_title
                        : `${selectedEvaluation.quiz_type} Quiz: ${selectedEvaluation.subject}`
                      }
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {formatDate(selectedEvaluation.timestamp || selectedEvaluation.submission_time)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEvaluation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Score Overview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Score Breakdown</h3>
                    {selectedEvaluation.evaluation_type === 'code' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Correctness:</span>
                          <span className="font-semibold">{Math.round(selectedEvaluation.scores?.correctness || 0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efficiency:</span>
                          <span className="font-semibold">{Math.round(selectedEvaluation.scores?.efficiency || 0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality:</span>
                          <span className="font-semibold">{Math.round(selectedEvaluation.scores?.quality || 0)}%</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Overall:</span>
                          <span>{Math.round(selectedEvaluation.scores?.overall || 0)}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Questions Correct:</span>
                          <span className="font-semibold">{selectedEvaluation.total_correct}/{selectedEvaluation.total_questions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-semibold">{Math.round(selectedEvaluation.accuracy)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Session Duration:</span>
                          <span className="font-semibold">{Math.floor(selectedEvaluation.session_duration / 60)}m {selectedEvaluation.session_duration % 60}s</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Overall Score:</span>
                          <span>{Math.round(selectedEvaluation.overall_score)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Performance Metrics</h3>
                    {selectedEvaluation.evaluation_type === 'code' && selectedEvaluation.performance ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Execution Time:</span>
                          <span className="font-semibold">{selectedEvaluation.performance.execution_time_ms}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory Usage:</span>
                          <span className="font-semibold">{selectedEvaluation.performance.memory_peak_mb}MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time Complexity:</span>
                          <span className="font-semibold">{selectedEvaluation.performance.time_complexity}</span>
                        </div>
                      </div>
                    ) : selectedEvaluation.evaluation_type === 'quiz' && selectedEvaluation.performance_metrics ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Avg Time/Question:</span>
                          <span className="font-semibold">{selectedEvaluation.performance_metrics.avg_time_per_question}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Longest Streak:</span>
                          <span className="font-semibold">{selectedEvaluation.performance_metrics.streak}</span>
                        </div>
                        {selectedEvaluation.knowledge_updates && Object.keys(selectedEvaluation.knowledge_updates).map(subject => (
                          <div key={subject} className="border-t pt-2">
                            <div className="text-sm font-medium text-gray-700">{subject}:</div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Skill Level: {selectedEvaluation.knowledge_updates[subject].theta?.toFixed(2)}</div>
                              <div>Mastery: {(selectedEvaluation.knowledge_updates[subject].mastery * 100)?.toFixed(1)}%</div>
                              <div>Elo Rating: {selectedEvaluation.knowledge_updates[subject].elo_rating}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No performance metrics available</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Evaluations;
