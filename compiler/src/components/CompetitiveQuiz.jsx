import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Play, RotateCcw } from 'lucide-react';

const USER_ID = 'demo_user';

// Mock quiz data - no API calls needed
const mockQuizQuestions = [
  {
    question: "What is the time complexity of binary search?",
    choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correct_answer: "O(log n)",
    difficulty: "medium"
  },
  {
    question: "Which data structure uses LIFO principle?",
    choices: ["Queue", "Array", "Stack", "Linked List"],
    correct_answer: "Stack",
    difficulty: "easy"
  },
  {
    question: "What does SQL stand for?",
    choices: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"],
    correct_answer: "Structured Query Language",
    difficulty: "easy"
  },
  {
    question: "Which sorting algorithm has the best average time complexity?",
    choices: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"],
    correct_answer: "Quick Sort",
    difficulty: "medium"
  },
  {
    question: "What is the space complexity of merge sort?",
    choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correct_answer: "O(n)",
    difficulty: "hard"
  }
];

const CompetitiveQuiz = () => {
  console.log('🚀 CompetitiveQuiz loaded - offline mode, no API calls');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Quiz session tracking
  const [sessionStart, setSessionStart] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState('');
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  // Current question data
  const currentQuestion = shuffledQuestions[currentQuestionIndex] || {};
  const question = currentQuestion.question || '';
  const choices = currentQuestion.choices || [];
  const difficulty = currentQuestion.difficulty || 'medium';
  const correctAnswer = currentQuestion.correct_answer || '';

  // Shuffle array function
  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Initialize quiz
  const startQuiz = useCallback(() => {
    console.log('🎯 Starting competitive quiz...');
    const shuffled = shuffleArray(mockQuizQuestions);
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setQuizStarted(true);
    setSessionStart(Date.now());
    setStartTime(Date.now());
    setTimeElapsed(0);
    setScore({ correct: 0, total: 0 });
    setQuizAttempts([]);
    setCurrentQuestionId(`competitive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    setSelected('');
    setFeedback('');
    setIsAnswered(false);
  }, [shuffleArray]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (startTime && !isAnswered && quizStarted) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isAnswered, quizStarted]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelected('');
      setFeedback('');
      setIsAnswered(false);
      setStartTime(Date.now());
      setTimeElapsed(0);
      setCurrentQuestionId(`competitive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [currentQuestionIndex, shuffledQuestions.length]);

  const handleSubmit = useCallback(() => {
    if (!selected || isAnswered) return;
    setIsAnswered(true);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selected === correctAnswer;
    
    setFeedback(isCorrect ? 'Correct!' : `Incorrect! The correct answer is: ${correctAnswer}`);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    // Record attempt for quiz evaluation
    const attempt = {
      question_id: currentQuestionId,
      question_text: question,
      user_answer: selected,
      correct_answer: correctAnswer,
      difficulty: getDifficultyValue(difficulty),
      time_spent: timeTaken,
      question_type: 'multiple_choice'
    };
    
    setQuizAttempts(prev => [...prev, attempt]);
    
    // Auto-advance to next question after 3 seconds
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  }, [selected, isAnswered, startTime, correctAnswer, currentQuestionId, question, difficulty, nextQuestion]);

  const getDifficultyValue = (diffText) => {
    const diffMap = { easy: 0.3, medium: 0.6, hard: 1.0 };
    return diffMap[diffText?.toLowerCase()] || 0.5;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff) => {
    if (!diff) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch(diff.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show start screen if quiz hasn't started
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full mx-4"
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Competitive Quiz</h1>
            <p className="text-gray-600">Test your programming knowledge with timed questions</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Questions:</span>
              <span className="font-medium">{mockQuizQuestions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time per question:</span>
              <span className="font-medium">No limit</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Difficulty:</span>
              <span className="font-medium">Mixed</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
          >
            Start Quiz
          </motion.button>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Timer and Score Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Competitive Quiz</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(timeElapsed)}
              </div>
              <div className="text-sm text-gray-600">
                Score: {score.correct}/{score.total}
              </div>
              <div className="text-sm text-gray-600">
                Question: {currentQuestionIndex + 1}/{shuffledQuestions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Question Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border bg-white/20 text-white`}>
                  {difficulty || 'Loading...'}
                </span>
                <span className="text-purple-100">Question {currentQuestionIndex + 1}</span>
              </div>
              <div className="flex items-center space-x-2">
                {loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                )}
              </div>
            </div>
            <p className="text-lg leading-relaxed">{question}</p>
          </div>

          {/* Answer Choices */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {choices.map((choice, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selected === choice
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${isAnswered ? 'cursor-not-allowed opacity-75' : ''}`}
                    onClick={() => !isAnswered && setSelected(choice)}
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="choice"
                        value={choice}
                        checked={selected === choice}
                        onChange={() => setSelected(choice)}
                        disabled={loading || isAnswered}
                        className="mr-4 text-purple-600"
                      />
                      <span className="text-gray-800 text-lg">{choice}</span>
                    </label>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mx-6 mb-6 p-4 rounded-lg flex items-center ${
                feedback.includes('Correct') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {feedback.includes('Correct') ? (
                <CheckCircle className="w-5 h-5 mr-3" />
              ) : (
                <XCircle className="w-5 h-5 mr-3" />
              )}
              <span className="font-semibold text-lg">{feedback}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={nextQuestion}
              disabled={loading || !isAnswered}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {currentQuestionIndex >= shuffledQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
            <motion.button
              whileHover={{ scale: !selected || loading || isAnswered ? 1 : 1.05 }}
              whileTap={{ scale: !selected || loading || isAnswered ? 1 : 0.95 }}
              onClick={handleSubmit}
              disabled={!selected || loading || isAnswered}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                !selected || loading || isAnswered
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </motion.button>
          </div>
        </motion.div>

        {/* Progress Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Session Progress</h3>
            <div className="text-sm text-gray-600">
              {Math.round(((currentQuestionIndex + 1) / shuffledQuestions.length) * 100)}% Complete
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{score.correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{score.total - score.correct}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>
          {quizAttempts.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              {quizAttempts.length} questions completed • Session time: {formatTime(sessionStart ? Math.floor((Date.now() - sessionStart) / 1000) : 0)}
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompetitiveQuiz;
