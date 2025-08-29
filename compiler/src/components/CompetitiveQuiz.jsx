import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';

const USER_ID = 'demo_user';

const CompetitiveQuiz = () => {
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isAnswered, setIsAnswered] = useState(false);

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

  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback('');
    setSelected('');
    setIsAnswered(false);
    try {
      const res = await fetch('http://localhost:5000/api/next_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID }),
      });
      const data = await res.json();
      setQuestion(data.question);
      setChoices(shuffleArray(data.choices));
      setDifficulty(data.difficulty);
      setStartTime(Date.now());
      setTimeElapsed(0);
    } catch (error) {
      console.error('Error fetching question:', error);
      setFeedback('Error loading question. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleSubmit = async () => {
    if (!selected || isAnswered) return;
    setLoading(true);
    setIsAnswered(true);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const res = await fetch('http://localhost:5000/api/submit_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID, answer: selected, time_taken: timeTaken }),
      });
      const data = await res.json();
      
      const isCorrect = data.correct;
      setFeedback(isCorrect ? 'Correct!' : 'Incorrect.');
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
      
      setTimeout(() => {
        fetchQuestion();
      }, 2000);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback('Error submitting answer. Please try again.');
    }
    setLoading(false);
  };

  function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">Aptitude Quiz</h1>
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
          {/* Question Header */}
          <div className="bg-gray-800 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(difficulty)}`}>
                  {difficulty || 'Loading...'}
                </span>
                <span className="text-gray-300">Question {score.total + 1}</span>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                        ? 'border-blue-500 bg-blue-50'
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
                        className="mr-4 text-blue-600"
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
                feedback === 'Correct!' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {feedback === 'Correct!' ? (
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
              onClick={fetchQuestion}
              disabled={loading}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Skip Question
            </button>
            <motion.button
              whileHover={{ scale: !selected || loading || isAnswered ? 1 : 1.05 }}
              whileTap={{ scale: !selected || loading || isAnswered ? 1 : 0.95 }}
              onClick={handleSubmit}
              disabled={!selected || loading || isAnswered}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                !selected || loading || isAnswered
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompetitiveQuiz;
