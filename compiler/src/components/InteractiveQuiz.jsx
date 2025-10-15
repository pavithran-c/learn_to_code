import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Clock, Trophy, Target, Star, CheckCircle, XCircle,
  Play, ArrowRight, ArrowLeft, Code2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Comprehensive Quiz Data - All programming concepts and questions
const comprehensiveQuizData = {
  // Programming Fundamentals
  programming_fundamentals: {
    id: 'programming_fundamentals',
    title: 'Programming Fundamentals',
    description: 'Core programming concepts and syntax',
    timeLimit: 600, // 10 minutes
    questions: [
      {
        id: 1,
        question: "What is the output of the following Python code?\n\n```python\nprint('Hello' + ' ' + 'World')\n```",
        options: ['Hello World', 'HelloWorld', 'Hello', 'Error'],
        correct_answer: 'Hello World',
        explanation: 'String concatenation with + operator joins the strings together with spaces preserved.',
        difficulty: 'easy',
        points: 10,
        topic: 'String Operations'
      },
      {
        id: 2,
        question: "Which of the following is NOT a valid variable name in Python?",
        options: ['_var', 'var_1', '1var', 'var1'],
        correct_answer: '1var',
        explanation: 'Variable names cannot start with a number in Python. They must start with a letter or underscore.',
        difficulty: 'easy',
        points: 10,
        topic: 'Variable Naming'
      },
      {
        id: 3,
        question: "What does the following JavaScript code output?\n\n```javascript\nconsole.log(typeof null);\n```",
        options: ['null', 'undefined', 'object', 'string'],
        correct_answer: 'object',
        explanation: 'This is a well-known quirk in JavaScript. typeof null returns "object" due to historical reasons.',
        difficulty: 'medium',
        points: 15,
        topic: 'JavaScript Types'
      },
      {
        id: 4,
        question: "In Java, what is the difference between == and .equals()?",
        options: [
          '== compares values, .equals() compares references',
          '== compares references, .equals() compares values',
          'They are identical',
          '== is faster than .equals()'
        ],
        correct_answer: '== compares references, .equals() compares values',
        explanation: '== compares object references (memory addresses), while .equals() compares the actual content/values of objects.',
        difficulty: 'medium',
        points: 15,
        topic: 'Object Comparison'
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
        explanation: 'volatile ensures that changes to a variable are visible across all threads by preventing CPU caching.',
        difficulty: 'hard',
        points: 20,
        topic: 'Concurrency'
      }
    ]
  },

  // Data Structures & Algorithms
  data_structures: {
    id: 'data_structures',
    title: 'Data Structures & Algorithms',
    description: 'Arrays, trees, graphs, and algorithmic thinking',
    timeLimit: 900, // 15 minutes
    questions: [
      {
        id: 1,
        question: "What is the time complexity of searching in a balanced binary search tree?",
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct_answer: 'O(log n)',
        explanation: 'In a balanced BST, the height is log n, so search operations take O(log n) time.',
        difficulty: 'medium',
        points: 15,
        topic: 'Binary Search Trees'
      },
      {
        id: 2,
        question: "Which data structure uses LIFO (Last In First Out) principle?",
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correct_answer: 'Stack',
        explanation: 'Stack follows LIFO principle where the last element added is the first one to be removed.',
        difficulty: 'easy',
        points: 10,
        topic: 'Stack Data Structure'
      },
      {
        id: 3,
        question: "What is the best average-case time complexity for sorting algorithms?",
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correct_answer: 'O(n log n)',
        explanation: 'Comparison-based sorting algorithms like merge sort and heap sort achieve O(n log n) average case.',
        difficulty: 'medium',
        points: 15,
        topic: 'Sorting Algorithms'
      },
      {
        id: 4,
        question: "In a hash table with chaining, what happens when two keys hash to the same index?",
        options: [
          'The second key overwrites the first',
          'An error occurs',
          'Both keys are stored in a linked list at that index',
          'The table is resized'
        ],
        correct_answer: 'Both keys are stored in a linked list at that index',
        explanation: 'Chaining resolves hash collisions by storing multiple elements in a linked list at the same index.',
        difficulty: 'medium',
        points: 15,
        topic: 'Hash Tables'
      },
      {
        id: 5,
        question: "What is the space complexity of the recursive implementation of Fibonacci sequence?",
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(2^n)'],
        correct_answer: 'O(n)',
        explanation: 'Due to the call stack depth, recursive Fibonacci has O(n) space complexity (with memoization) or O(n) maximum stack depth.',
        difficulty: 'hard',
        points: 20,
        topic: 'Recursion & Dynamic Programming'
      }
    ]
  },

  // Web Development
  web_development: {
    id: 'web_development',
    title: 'Web Development',
    description: 'Frontend, backend, and full-stack concepts',
    timeLimit: 600, // 10 minutes
    questions: [
      {
        id: 1,
        question: "What does HTTP status code 404 mean?",
        options: ['Server Error', 'Not Found', 'Unauthorized', 'Bad Request'],
        correct_answer: 'Not Found',
        explanation: 'HTTP 404 indicates that the requested resource could not be found on the server.',
        difficulty: 'easy',
        points: 10,
        topic: 'HTTP Status Codes'
      },
      {
        id: 2,
        question: "Which HTTP method is idempotent and safe?",
        options: ['POST', 'PUT', 'GET', 'DELETE'],
        correct_answer: 'GET',
        explanation: 'GET is both idempotent (multiple calls have same effect) and safe (no side effects).',
        difficulty: 'medium',
        points: 15,
        topic: 'HTTP Methods'
      },
      {
        id: 3,
        question: "What is the purpose of CSS specificity?",
        options: [
          'To determine loading order',
          'To resolve conflicting CSS rules',
          'To optimize performance',
          'To enable animations'
        ],
        correct_answer: 'To resolve conflicting CSS rules',
        explanation: 'CSS specificity determines which styles are applied when multiple rules target the same element.',
        difficulty: 'medium',
        points: 15,
        topic: 'CSS Concepts'
      },
      {
        id: 4,
        question: "What is the difference between localStorage and sessionStorage?",
        options: [
          'localStorage is faster',
          'sessionStorage persists across browser sessions',
          'localStorage persists across browser sessions',
          'They are identical'
        ],
        correct_answer: 'localStorage persists across browser sessions',
        explanation: 'localStorage data persists until explicitly cleared, while sessionStorage is cleared when the tab is closed.',
        difficulty: 'medium',
        points: 15,
        topic: 'Browser Storage'
      },
      {
        id: 5,
        question: "What is the purpose of CORS (Cross-Origin Resource Sharing)?",
        options: [
          'To improve performance',
          'To enable secure cross-origin requests',
          'To compress data',
          'To cache resources'
        ],
        correct_answer: 'To enable secure cross-origin requests',
        explanation: 'CORS allows servers to specify which origins can access their resources, enabling secure cross-origin requests.',
        difficulty: 'hard',
        points: 20,
        topic: 'Web Security'
      }
    ]
  },

  // Database Systems
  databases: {
    id: 'databases',
    title: 'Database Systems',
    description: 'SQL, NoSQL, and database design principles',
    timeLimit: 600, // 10 minutes
    questions: [
      {
        id: 1,
        question: "What does SQL stand for?",
        options: ['Structured Query Language', 'Simple Query Language', 'System Query Language', 'Standard Query Language'],
        correct_answer: 'Structured Query Language',
        explanation: 'SQL stands for Structured Query Language, used for managing relational databases.',
        difficulty: 'easy',
        points: 10,
        topic: 'SQL Basics'
      },
      {
        id: 2,
        question: "Which SQL command is used to retrieve data from a database?",
        options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'],
        correct_answer: 'SELECT',
        explanation: 'SELECT is the SQL command used to query and retrieve data from database tables.',
        difficulty: 'easy',
        points: 10,
        topic: 'SQL Commands'
      },
      {
        id: 3,
        question: "What is a primary key in a database?",
        options: [
          'The first column in a table',
          'A unique identifier for each row',
          'The most important data',
          'A foreign key reference'
        ],
        correct_answer: 'A unique identifier for each row',
        explanation: 'A primary key uniquely identifies each row in a table and cannot contain null values.',
        difficulty: 'medium',
        points: 15,
        topic: 'Database Keys'
      },
      {
        id: 4,
        question: "What is the difference between INNER JOIN and LEFT JOIN?",
        options: [
          'No difference',
          'INNER JOIN returns all rows, LEFT JOIN returns matching rows',
          'LEFT JOIN returns all rows from left table, INNER JOIN returns only matching rows',
          'LEFT JOIN is faster'
        ],
        correct_answer: 'LEFT JOIN returns all rows from left table, INNER JOIN returns only matching rows',
        explanation: 'LEFT JOIN includes all rows from the left table even if no match in right table, INNER JOIN only returns matching rows.',
        difficulty: 'medium',
        points: 15,
        topic: 'SQL Joins'
      },
      {
        id: 5,
        question: "What is database normalization?",
        options: [
          'Making database faster',
          'Organizing data to reduce redundancy',
          'Creating indexes',
          'Backing up data'
        ],
        correct_answer: 'Organizing data to reduce redundancy',
        explanation: 'Normalization is the process of organizing database tables to minimize data redundancy and improve data integrity.',
        difficulty: 'hard',
        points: 20,
        topic: 'Database Design'
      }
    ]
  },

  // System Design
  system_design: {
    id: 'system_design',
    title: 'System Design',
    description: 'Scalability, architecture, and distributed systems',
    timeLimit: 900, // 15 minutes
    questions: [
      {
        id: 1,
        question: "What is the main benefit of using a load balancer?",
        options: [
          'Reduces server costs',
          'Distributes incoming requests across multiple servers',
          'Increases security',
          'Improves code quality'
        ],
        correct_answer: 'Distributes incoming requests across multiple servers',
        explanation: 'Load balancers distribute incoming network traffic across multiple servers to ensure no single server is overwhelmed.',
        difficulty: 'medium',
        points: 15,
        topic: 'Load Balancing'
      },
      {
        id: 2,
        question: "What is the CAP theorem in distributed systems?",
        options: [
          'Consistency, Availability, Performance',
          'Consistency, Availability, Partition tolerance',
          'Cache, API, Performance',
          'Compute, Access, Persistence'
        ],
        correct_answer: 'Consistency, Availability, Partition tolerance',
        explanation: 'CAP theorem states that distributed systems can only guarantee two out of three: Consistency, Availability, and Partition tolerance.',
        difficulty: 'hard',
        points: 20,
        topic: 'Distributed Systems'
      },
      {
        id: 3,
        question: "What is the purpose of caching in system design?",
        options: [
          'To reduce memory usage',
          'To improve data retrieval speed',
          'To increase security',
          'To reduce code complexity'
        ],
        correct_answer: 'To improve data retrieval speed',
        explanation: 'Caching stores frequently accessed data in fast storage to reduce latency and improve system performance.',
        difficulty: 'medium',
        points: 15,
        topic: 'Caching Strategies'
      },
      {
        id: 4,
        question: "What is microservices architecture?",
        options: [
          'Using very small code files',
          'Breaking application into small, independent services',
          'Optimizing for mobile devices',
          'Using minimal server resources'
        ],
        correct_answer: 'Breaking application into small, independent services',
        explanation: 'Microservices architecture decomposes applications into small, loosely coupled services that can be developed and deployed independently.',
        difficulty: 'hard',
        points: 20,
        topic: 'Architecture Patterns'
      },
      {
        id: 5,
        question: "What is eventual consistency in distributed databases?",
        options: [
          'Data is always consistent',
          'Data becomes consistent over time',
          'Data is never consistent',
          'Data consistency is not important'
        ],
        correct_answer: 'Data becomes consistent over time',
        explanation: 'Eventual consistency means the system will become consistent over time, but may be temporarily inconsistent.',
        difficulty: 'hard',
        points: 20,
        topic: 'Database Consistency'
      }
    ]
  }
};

const InteractiveQuiz = () => {
  console.log('🎯 InteractiveQuiz loaded - comprehensive quiz system with all concepts');
  
  // Quiz state
  const [quizData, setQuizData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('programming_fundamentals');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showCategorySelection, setShowCategorySelection] = useState(true);
  
  const { user } = useAuth();

  // Available quiz categories
  const quizCategories = [
    {
      id: 'programming_fundamentals',
      title: 'Programming Fundamentals',
      icon: '💻',
      description: 'Core programming concepts, syntax, and language basics',
      questionCount: 5,
      timeLimit: '10 min',
      difficulty: 'Beginner to Intermediate'
    },
    {
      id: 'data_structures',
      title: 'Data Structures & Algorithms',
      icon: '🌳',
      description: 'Arrays, trees, graphs, sorting, and algorithmic thinking',
      questionCount: 5,
      timeLimit: '15 min',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'web_development',
      title: 'Web Development',
      icon: '🌐',
      description: 'Frontend, backend, HTTP, CSS, and web technologies',
      questionCount: 5,
      timeLimit: '10 min',
      difficulty: 'Beginner to Advanced'
    },
    {
      id: 'databases',
      title: 'Database Systems',
      icon: '🗄️',
      description: 'SQL, NoSQL, database design, and data management',
      questionCount: 5,
      timeLimit: '10 min',
      difficulty: 'Beginner to Intermediate'
    },
    {
      id: 'system_design',
      title: 'System Design',
      icon: '🏗️',
      description: 'Scalability, architecture, distributed systems',
      questionCount: 5,
      timeLimit: '15 min',
      difficulty: 'Advanced'
    }
  ];

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
    console.log('🚀 Starting comprehensive quiz...', selectedCategory);
    
    const categoryData = comprehensiveQuizData[selectedCategory];
    if (!categoryData) {
      console.error('Category not found:', selectedCategory);
      return;
    }

    // Shuffle questions for variety
    const shuffledQuestions = [...categoryData.questions].sort(() => Math.random() - 0.5);
    
    const quiz = {
      ...categoryData,
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
    setShowCategorySelection(false);
  }, [selectedCategory]);

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

  // Show category selection screen
  if (showCategorySelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Programming Quiz</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Test your knowledge across all major programming concepts. Choose a category to begin your journey!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {quizCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'border-purple-500 bg-purple-50 shadow-xl'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Questions:</span>
                      <span className="font-medium">{category.questionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span className="font-medium">{category.timeLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Level:</span>
                      <span className="font-medium">{category.difficulty}</span>
                    </div>
                  </div>

                  {selectedCategory === category.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4"
                    >
                      <CheckCircle className="w-8 h-8 text-purple-600 mx-auto" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startQuiz}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-12 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
            >
              <Play className="w-6 h-6 mr-3 inline" />
              Start {quizCategories.find(c => c.id === selectedCategory)?.title} Quiz
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Show start screen
  if (!quizStarted) {
    const currentCategory = quizCategories.find(c => c.id === selectedCategory);
    
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentCategory?.title}</h1>
            <p className="text-gray-600">{currentCategory?.description}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Questions:</span>
              <span className="font-medium">{currentCategory?.questionCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time Limit:</span>
              <span className="font-medium">{currentCategory?.timeLimit}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Difficulty:</span>
              <span className="font-medium">{currentCategory?.difficulty}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Topics Covered:</span>
              <span className="font-medium">Core Concepts</span>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCategorySelection(true)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Change Category
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startQuiz}
              className="flex-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show results screen
  if (showResults && quizData) {
    const correctAnswers = quizData.questions.filter((q, index) => answers[index] === q.correct_answer).length;
    const accuracy = Math.round((correctAnswers / quizData.questions.length) * 100);
    const currentCategory = quizCategories.find(c => c.id === selectedCategory);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
              <p className="text-gray-600 mb-2">{currentCategory?.title} - Great job!</p>
              <p className="text-sm text-gray-500">You've completed the {currentCategory?.title.toLowerCase()} assessment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{score}</div>
                <div className="text-blue-700">Total Points</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{accuracy}%</div>
                <div className="text-green-700">Accuracy</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{correctAnswers}/{quizData.questions.length}</div>
                <div className="text-purple-700">Correct</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{formatTime(quizData.timeLimit - timeLeft)}</div>
                <div className="text-orange-700">Time Used</div>
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Topics Mastered</h4>
                  <div className="space-y-1">
                    {quizData.questions
                      .filter((q, index) => answers[index] === q.correct_answer)
                      .map((q, index) => (
                        <div key={index} className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {q.topic}
                        </div>
                      ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Areas to Review</h4>
                  <div className="space-y-1">
                    {quizData.questions
                      .filter((q, index) => answers[index] !== q.correct_answer)
                      .map((q, index) => (
                        <div key={index} className="text-sm text-red-600 flex items-center">
                          <XCircle className="w-4 h-4 mr-2" />
                          {q.topic}
                        </div>
                      ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Difficulty Breakdown</h4>
                  <div className="space-y-1">
                    {['easy', 'medium', 'hard'].map(difficulty => {
                      const questionsInDifficulty = quizData.questions.filter(q => q.difficulty === difficulty);
                      const correctInDifficulty = questionsInDifficulty.filter((q, i) => {
                        const originalIndex = quizData.questions.indexOf(q);
                        return answers[originalIndex] === q.correct_answer;
                      });
                      return (
                        <div key={difficulty} className="text-sm flex justify-between">
                          <span className="capitalize">{difficulty}:</span>
                          <span className="font-medium">{correctInDifficulty.length}/{questionsInDifficulty.length}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setQuizStarted(false);
                  setShowResults(false);
                  setQuizData(null);
                  setShowCategorySelection(false);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Retake This Quiz
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setQuizStarted(false);
                  setShowResults(false);
                  setQuizData(null);
                  setShowCategorySelection(true);
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Try Different Category
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
              <div className="flex items-center space-x-3">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {currentQ.difficulty?.charAt(0).toUpperCase() + currentQ.difficulty?.slice(1)} • {currentQ.points} pts
                </span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                  {currentQ.topic}
                </span>
              </div>
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