import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Play, ArrowLeft, BookOpen, Database, Cpu, Network, Code2, Layers, Settings } from 'lucide-react';
import { recordQuizResult } from '../utils/dashboardStorage';

// Import JSON data
import subjectsConfig from '../data/subjectsConfig.json';
import dataStructuresData from '../data/dataStructures.json';
import algorithmsData from '../data/algorithms.json';
import operatingSystemsData from '../data/operatingSystems.json';
import databaseManagementData from '../data/databaseManagement.json';
import computerNetworksData from '../data/computerNetworks.json';
import softwareEngineeringData from '../data/softwareEngineering.json';

const CoreSubjectsQuiz = () => {
  const [currentSubject, setCurrentSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isAnswered, setIsAnswered] = useState(false);
  const [showSubjects, setShowSubjects] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Map subject names to their data
  const subjectDataMap = {
    'Data Structures': dataStructuresData,
    'Algorithms': algorithmsData,
    'Operating Systems': operatingSystemsData,
    'Database Management': databaseManagementData,
    'Computer Networks': computerNetworksData,
    'Software Engineering': softwareEngineeringData
  };

  // Icon component mapping
  const iconComponents = {
    Layers: <Layers className="w-6 h-6" />,
    Code2: <Code2 className="w-6 h-6" />,
    Settings: <Settings className="w-6 h-6" />,
    Database: <Database className="w-6 h-6" />,
    Network: <Network className="w-6 h-6" />,
    Cpu: <Cpu className="w-6 h-6" />
  };

  const getSubjectColor = (color) => {
    const colors = {
      blue: 'from-blue-400 to-blue-600',
      green: 'from-green-400 to-green-600',
      purple: 'from-purple-400 to-purple-600',
      orange: 'from-orange-400 to-orange-600',
      cyan: 'from-cyan-400 to-cyan-600',
      red: 'from-red-400 to-red-600',
    };
    return colors[color] || 'from-gray-400 to-gray-600';
  };

  const getBorderColor = (color) => {
    const colors = {
      blue: 'border-blue-200 hover:border-blue-300',
      green: 'border-green-200 hover:border-green-300',
      purple: 'border-purple-200 hover:border-purple-300',
      orange: 'border-orange-200 hover:border-orange-300',
      cyan: 'border-cyan-200 hover:border-cyan-300',
      red: 'border-red-200 hover:border-red-300',
    };
    return colors[color] || 'border-gray-200 hover:border-gray-300';
  };

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

  const selectSubject = (subjectName) => {
    setCurrentSubject(subjectName);
    setShowSubjects(false);
    setSessionStartTime(Date.now()); // Record session start time
    setScore({ correct: 0, total: 0 }); // Reset score for new session
    fetchQuestion(subjectName);
  };

  const fetchQuestion = (subjectName = currentSubject) => {
    setLoading(true);
    setFeedback('');
    setSelectedAnswer('');
    setIsAnswered(false);
    
    // Get data from the mapped subject data
    const subjectData = subjectDataMap[subjectName];
    if (subjectData && subjectData.questions) {
      const randomIndex = Math.floor(Math.random() * subjectData.questions.length);
      const q = subjectData.questions[randomIndex];
      
      setQuestion(q.question);
      setCorrectAnswer(q.correct);
      setChoices(shuffleArray([...q.choices]));
      setStartTime(Date.now());
      setTimeElapsed(0);
    }
    
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || isAnswered) return;
    setIsAnswered(true);
    
    const isCorrect = selectedAnswer === correctAnswer;
    const subjectData = subjectDataMap[currentSubject];
    const currentQ = subjectData?.questions.find(q => q.correct === correctAnswer);
    
    setFeedback(isCorrect ? 
      'Correct! ' + (currentQ?.explanation || '') : 
      `Incorrect! The correct answer is: ${correctAnswer}. ` + (currentQ?.explanation || '')
    );
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    setTimeout(() => {
      fetchQuestion();
    }, 4000);
    
    // Record quiz result after showing feedback
    if (sessionStartTime && score.total >= 0) {
      const timeSpent = (Date.now() - sessionStartTime) / 1000; // Convert to seconds
      recordQuizResult(currentSubject, score.correct + (isCorrect ? 1 : 0), score.total + 1, timeSpent);
    }
  };

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goBackToSubjects = () => {
    // Record quiz session if there were any questions attempted
    if (score.total > 0 && sessionStartTime) {
      const sessionTime = (Date.now() - sessionStartTime) / 1000; // in seconds
      recordQuizResult(currentSubject, score.correct, score.total, sessionTime);
    }
    
    setShowSubjects(true);
    setCurrentSubject('');
    setQuestion('');
    setFeedback('');
    setSelectedAnswer('');
    setIsAnswered(false);
    setScore({ correct: 0, total: 0 });
    setTimeElapsed(0);
    setSessionStartTime(null);
  };

  if (showSubjects) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">Core Subjects Quiz</h1>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Choose a subject to start
              </div>
            </div>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Core Subject</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Test your knowledge in fundamental computer science subjects. Each subject contains carefully crafted questions to evaluate your understanding.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(subjectsConfig.subjects).map(([subjectName, subjectInfo], index) => (
              <motion.div
                key={subjectName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => selectSubject(subjectName)}
                className={`bg-white rounded-lg border-2 ${getBorderColor(subjectDataMap[subjectName]?.color)} hover:shadow-lg transition-all cursor-pointer group overflow-hidden`}
              >
                <div className={`h-2 bg-gradient-to-r ${getSubjectColor(subjectDataMap[subjectName]?.color)}`} />
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${getSubjectColor(subjectDataMap[subjectName]?.color)} text-white`}>
                      {iconComponents[subjectInfo.icon]}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {subjectName}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {subjectInfo.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{subjectDataMap[subjectName]?.questions.length} Questions</span>
                    <span className="flex items-center">
                      Start Quiz <Play className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBackToSubjects}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Subjects
              </button>
              <div className="flex items-center space-x-3">
                {iconComponents[subjectsConfig.subjects[currentSubject]?.icon]}
                <h1 className="text-xl font-bold text-gray-900">{currentSubject}</h1>
              </div>
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
          <div className={`bg-gradient-to-r ${getSubjectColor(subjectDataMap[currentSubject]?.color)} text-white p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                  Question {score.total + 1}
                </span>
              </div>
              <BookOpen className="w-5 h-5 text-white/80" />
            </div>
            <h2 className="text-xl font-bold mb-4">{currentSubject} Quiz</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{question}</h3>
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
                        <span>{choice}</span>
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
              className={`mx-6 mb-6 p-4 rounded-lg ${
                feedback.includes('Correct') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-start">
                {feedback.includes('Correct') ? (
                  <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-sm leading-relaxed">{feedback}</span>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => fetchQuestion()}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Progress</h3>
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
        </motion.div>
      </div>
    </div>
  );
};

export default CoreSubjectsQuiz;
