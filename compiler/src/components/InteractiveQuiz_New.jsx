import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Clock, Trophy, Target, Star, CheckCircle, XCircle,
  Play, ArrowRight, ArrowLeft, Code2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Mock quiz data - completely offline, no API calls
const mockQuizData = {
  id: 'programming_fundamentals',
  title: 'Programming Fundamentals',
  description: 'Test your programming knowledge',
  timeLimit: 300, // 5 minutes
  questions: [
    {
      id: 1,
      question: "What is the output of the following Python code?\n\nprint('Hello' + ' ' + 'World')",
      options: ['Hello World', 'HelloWorld', 'Hello', 'Error'],
      correct_answer: 'Hello World',
      explanation: 'String concatenation with + operator joins the strings together.',
      difficulty: 'easy',
      points: 10
    },
    {
      id: 2,
      question: "Which of the following is NOT a valid variable name in Python?",
      options: ['_var', 'var_1', '1var', 'var1'],
      correct_answer: '1var',
      explanation: 'Variable names cannot start with a number in Python.',
      difficulty: 'easy',
      points: 10
    },
    {
      id: 3,
      question: "What is the time complexity of searching in a balanced binary search tree?",
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correct_answer: 'O(log n)',
      explanation: 'In a balanced BST, the height is log n, so search takes O(log n) time.',
      difficulty: 'medium',
      points: 15
    },
    {
      id: 4,
      question: "Which design pattern ensures a class has only one instance?",
      options: ['Factory', 'Observer', 'Singleton', 'Strategy'],
      correct_answer: 'Singleton',
      explanation: 'The Singleton pattern restricts instantiation to a single object.',
      difficulty: 'medium',
      points: 15
    },
    {
      id: 5,
      question: "What does the 'volatile' keyword do in Java?",
      options: [
        'Makes a variable constant',
        'Prevents variable caching by threads',
        'Makes a variable private',
        'Enables garbage collection'
      ],
      correct_answer: 'Prevents variable caching by threads',
      explanation: 'volatile ensures that changes to a variable are visible across all threads.',
      difficulty: 'hard',
      points: 20
    }
  ]
};

const InteractiveQuiz = () => {
  console.log('🎯 InteractiveQuiz loaded - offline mode, stable rendering');
  
  // Quiz state
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  
  const { user } = useAuth();

  // Timer effect - optimized to prevent re-renders
  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            finishQuiz();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, showResults]);

  // Finish quiz function
  const finishQuiz = useCallback(() => {
    if (!quizData || showResults) return;
    
    console.log('🏁 Finishing quiz...');
    setIsActive(false);
    
    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    
    quizData.questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correctAnswers++;
        totalPoints += question.points || 10;
      }
    });
    
    setScore(totalPoints);
    setShowResults(true);
  }, [quizData, answers, showResults]);

  // Start quiz function
  const startQuiz = useCallback(() => {
    console.log('🚀 Starting interactive quiz...');
    
    // Shuffle questions
    const shuffledQuestions = [...mockQuizData.questions].sort(() => Math.random() - 0.5);
    
    const quiz = {
      ...mockQuizData,
      questions: shuffledQuestions
    };

    setQuizData(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setTimeLeft(quiz.timeLimit);
    setIsActive(true);
    setShowResults(false);
    setScore(0);
    setQuizStarted(true);
  }, []);

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer) => {
    if (showResults) return;
    
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  }, [currentQuestion, showResults]);

  // Navigation functions
  const nextQuestion = useCallback(() => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || null);
    } else {
      finishQuiz();
    }
  }, [currentQuestion, quizData, answers, finishQuiz]);

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
    }
  }, [currentQuestion, answers]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Quiz</h1>
            <p className="text-gray-600">Test your knowledge with our adaptive quiz system</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Questions:</span>
              <span className="font-medium">{mockQuizData.questions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time Limit:</span>
              <span className="font-medium">5 minutes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">Programming Fundamentals</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Quiz
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Show results screen
  if (showResults && quizData) {
    const correctAnswers = quizData.questions.filter((q, index) => answers[index] === q.correct_answer).length;
    const accuracy = Math.round((correctAnswers / quizData.questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
              <p className="text-gray-600">Great job on completing the quiz</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{score}</div>
                <div className="text-blue-700">Total Points</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{accuracy}%</div>
                <div className="text-green-700">Accuracy</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">{correctAnswers}/{quizData.questions.length}</div>
                <div className="text-purple-700">Correct</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setQuizStarted(false);
                  setShowResults(false);
                  setQuizData(null);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Take Another Quiz
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show quiz interface
  if (!quizData) return null;

  const currentQ = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">{quizData.title}</h1>
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-lg font-semibold text-indigo-600">
                <Clock className="w-5 h-5 mr-2" />
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                Score: {score}
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Question */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {currentQ.difficulty?.charAt(0).toUpperCase() + currentQ.difficulty?.slice(1)} • {currentQ.points} pts
              </span>
              <div className="text-white/80">
                {currentQuestion + 1} / {quizData.questions.length}
              </div>
            </div>
            <h2 className="text-xl font-semibold leading-relaxed whitespace-pre-line">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="p-8">
            <div className="grid gap-4">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedAnswer === option
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium mr-4">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </motion.button>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextQuestion}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                {currentQuestion === quizData.questions.length - 1 ? (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Finish Quiz
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveQuiz;