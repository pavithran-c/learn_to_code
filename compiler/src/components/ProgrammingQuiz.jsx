import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Play, Code, BookOpen } from 'lucide-react';

const USER_ID = 'demo_user';

const ProgrammingQuiz = () => {
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Quiz session tracking
  const [sessionStart, setSessionStart] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState('');

  // Timer effect
  useEffect(() => {
    let interval;
    if (startTime && !isAnswered) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isAnswered]);

  // Fetch programming question from API
  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback('');
    setSelectedAnswer('');
    setIsAnswered(false);
    
    try {
      // Use Open Trivia Database for technical questions
      const response = await fetch('https://opentdb.com/api.php?amount=1&category=18&type=multiple');
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const q = data.results[0];
        setQuestion(q.question);
        setCorrectAnswer(q.correct_answer);
        setCurrentQuestionId(`prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        
        // Shuffle answers
        const allAnswers = [...q.incorrect_answers, q.correct_answer];
        setChoices(shuffleArray(allAnswers));
        setDifficulty(q.difficulty);
        setStartTime(Date.now());
        setTimeElapsed(0);
        
        // Initialize session start time on first question
        if (!sessionStart) {
          setSessionStart(Date.now());
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setFeedback('Error loading question. Please try again.');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || isAnswered) return;
    setLoading(true);
    setIsAnswered(true);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedAnswer === correctAnswer;
    
    setFeedback(isCorrect ? 'Correct answer!' : `Incorrect! The correct answer was: ${correctAnswer}`);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    // Record attempt for quiz evaluation
    const attempt = {
      question_id: currentQuestionId,
      question_text: question,
      user_answer: selectedAnswer,
      correct_answer: correctAnswer,
      difficulty: getDifficultyValue(difficulty),
      time_spent: timeTaken,
      question_type: 'multiple_choice'
    };
    
    setQuizAttempts(prev => [...prev, attempt]);
    
    setTimeout(() => {
      fetchQuestion();
    }, 3000);
    setLoading(false);
  };

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const getDifficultyValue = (diffText) => {
    const diffMap = { easy: 0.3, medium: 0.6, hard: 1.0 };
    return diffMap[diffText?.toLowerCase()] || 0.5;
  };

  const submitQuizSession = async () => {
    if (quizAttempts.length === 0) return;
    
    const sessionDuration = sessionStart ? Math.floor((Date.now() - sessionStart) / 1000) : 0;
    
    try {
      const response = await fetch('http://localhost:5000/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: USER_ID,
          quiz_type: 'programming',
          subject: 'Computer Science',
          attempts: quizAttempts,
          session_duration: sessionDuration
        })
      });
      
      if (response.ok) {
        const evaluation = await response.json();
        console.log('Quiz evaluation completed:', evaluation);
        // You could show a modal with detailed results here
      }
    } catch (error) {
      console.error('Error submitting quiz session:', error);
    }
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

  const handleLanguageChange = (newLang) => {
    // This function is no longer needed for quiz format
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Timer and Score Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Technical Quiz</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(timeElapsed)}
              </div>
              <div className="text-sm text-gray-600">
                Score: {score.correct}/{score.total}
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
          <div className="bg-gray-800 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(difficulty)}`}>
                  {difficulty || 'Loading...'}
                </span>
                <span className="text-gray-300">Question {score.total + 1}</span>
              </div>
              <BookOpen className="w-5 h-5 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold mb-4">Technical Quiz</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4" 
                      dangerouslySetInnerHTML={{ __html: question }} />
                </div>
                
                {/* Answer Choices */}
                <div className="space-y-3">
                  {choices.map((choice, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                      whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                      onClick={() => !isAnswered && setSelectedAnswer(choice)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedAnswer === choice
                          ? isAnswered
                            ? choice === correctAnswer
                              ? 'bg-green-50 border-green-500 text-green-800'
                              : 'bg-red-50 border-red-500 text-red-800'
                            : 'bg-blue-50 border-blue-500 text-blue-800'
                          : isAnswered && choice === correctAnswer
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-800'
                      } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mr-3">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: choice }} />
                        {isAnswered && choice === correctAnswer && (
                          <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                        )}
                        {isAnswered && selectedAnswer === choice && choice !== correctAnswer && (
                          <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
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
              <span className="font-semibold">{feedback}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={fetchQuestion}
              disabled={loading}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Skip Question
            </button>
            <motion.button
              whileHover={{ scale: !selectedAnswer || loading || isAnswered ? 1 : 1.05 }}
              whileTap={{ scale: !selectedAnswer || loading || isAnswered ? 1 : 0.95 }}
              onClick={handleSubmit}
              disabled={!selectedAnswer || loading || isAnswered}
              className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center ${
                !selectedAnswer || loading || isAnswered
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Play className="w-4 h-4 mr-2" />
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
            {quizAttempts.length >= 3 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={submitQuizSession}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Session for Evaluation
              </motion.button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{score.correct}</div>
              <div className="text-sm text-gray-600">Solved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{score.total - score.correct}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-gray-600">Current Time</div>
            </div>
          </div>
          {quizAttempts.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              {quizAttempts.length} questions completed • Session time: {formatTime(sessionStart ? Math.floor((Date.now() - sessionStart) / 1000) : 0)}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProgrammingQuiz;
