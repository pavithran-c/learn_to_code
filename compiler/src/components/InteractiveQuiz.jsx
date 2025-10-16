import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Clock, Trophy, Target, Star, CheckCircle, XCircle,
  Play, ArrowRight, ArrowLeft, Code2, BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import quizAnalyticsService from '../services/quizAnalyticsService';
import QuizPerformanceAnalytics from './QuizPerformanceAnalytics';

// Comprehensive Quiz Data - All programming concepts and questions
const comprehensiveQuizData = {
  // Programming Fundamentals
  programming_fundamentals: {
    id: 'programming_fundamentals',
    title: 'Programming Fundamentals',
    description: 'Core programming concepts and syntax',
    timeLimit: 900, // 15 minutes (increased for more questions)
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
      },
      {
        id: 6,
        question: "Which of the following is a mutable data type in Python?",
        options: ['String', 'Tuple', 'List', 'Integer'],
        correct_answer: 'List',
        explanation: 'Lists in Python are mutable, meaning you can modify them after creation. Strings, tuples, and integers are immutable.',
        difficulty: 'easy',
        points: 10,
        topic: 'Data Types'
      },
      {
        id: 7,
        question: "What is the output of this C++ code?\n\n```cpp\nint x = 5;\nint &y = x;\ny = 10;\ncout << x;\n```",
        options: ['5', '10', 'Error', 'Undefined'],
        correct_answer: '10',
        explanation: 'y is a reference to x, so changing y also changes x. Both variables point to the same memory location.',
        difficulty: 'medium',
        points: 15,
        topic: 'References'
      },
      {
        id: 8,
        question: "Which principle is NOT part of Object-Oriented Programming?",
        options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Compilation'],
        correct_answer: 'Compilation',
        explanation: 'The four main OOP principles are Encapsulation, Inheritance, Polymorphism, and Abstraction. Compilation is not an OOP principle.',
        difficulty: 'easy',
        points: 10,
        topic: 'OOP Concepts'
      },
      {
        id: 9,
        question: "What is the time complexity of accessing an element in an array by index?",
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct_answer: 'O(1)',
        explanation: 'Array elements can be accessed directly using their index in constant time, regardless of array size.',
        difficulty: 'easy',
        points: 10,
        topic: 'Time Complexity'
      },
      {
        id: 10,
        question: "In Python, what does the 'self' parameter represent?",
        options: [
          'A global variable',
          'The current instance of the class',
          'A static method',
          'The class itself'
        ],
        correct_answer: 'The current instance of the class',
        explanation: 'self refers to the current instance of the class and is used to access instance variables and methods.',
        difficulty: 'medium',
        points: 15,
        topic: 'Class Methods'
      },
      {
        id: 11,
        question: "What is the difference between 'let' and 'var' in JavaScript?",
        options: [
          'No difference',
          'let has block scope, var has function scope',
          'var has block scope, let has function scope',
          'let is faster than var'
        ],
        correct_answer: 'let has block scope, var has function scope',
        explanation: 'let variables are scoped to the nearest enclosing block, while var variables are scoped to the function.',
        difficulty: 'medium',
        points: 15,
        topic: 'Variable Scope'
      },
      {
        id: 12,
        question: "Which sorting algorithm has the best worst-case time complexity?",
        options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Selection Sort'],
        correct_answer: 'Merge Sort',
        explanation: 'Merge Sort has O(n log n) time complexity in all cases (best, average, worst), making it consistent.',
        difficulty: 'medium',
        points: 15,
        topic: 'Sorting Algorithms'
      },
      {
        id: 13,
        question: "What is a closure in programming?",
        options: [
          'A way to close a program',
          'A function that has access to outer scope variables',
          'A loop termination condition',
          'A class destructor'
        ],
        correct_answer: 'A function that has access to outer scope variables',
        explanation: 'A closure is a function that retains access to variables from its outer (enclosing) scope even after the outer function returns.',
        difficulty: 'hard',
        points: 20,
        topic: 'Closures'
      },
      {
        id: 14,
        question: "In SQL, what does the INNER JOIN do?",
        options: [
          'Returns all records from both tables',
          'Returns records that have matching values in both tables',
          'Returns records from the left table only',
          'Returns records from the right table only'
        ],
        correct_answer: 'Returns records that have matching values in both tables',
        explanation: 'INNER JOIN returns only the rows where there is a match in both tables based on the join condition.',
        difficulty: 'medium',
        points: 15,
        topic: 'SQL Joins'
      },
      {
        id: 15,
        question: "What is the purpose of the 'static' keyword in Java?",
        options: [
          'Makes variables immutable',
          'Belongs to the class rather than instance',
          'Prevents inheritance',
          'Enables multithreading'
        ],
        correct_answer: 'Belongs to the class rather than instance',
        explanation: 'static members belong to the class itself rather than any specific instance, shared across all objects.',
        difficulty: 'medium',
        points: 15,
        topic: 'Static Members'
      }
    ]
  },

  // Data Structures & Algorithms
  data_structures: {
    id: 'data_structures',
    title: 'Data Structures & Algorithms',
    description: 'Arrays, trees, graphs, and algorithmic thinking',
    timeLimit: 1200, // 20 minutes (increased for more questions)
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
        explanation: 'Chaining resolves collisions by storing multiple key-value pairs in a linked list at the same index.',
        difficulty: 'medium',
        points: 15,
        topic: 'Hash Tables'
      },
      {
        id: 5,
        question: "What is the space complexity of merge sort?",
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct_answer: 'O(n)',
        explanation: 'Merge sort requires O(n) additional space for the temporary arrays used during merging.',
        difficulty: 'medium',
        points: 15,
        topic: 'Space Complexity'
      },
      {
        id: 6,
        question: "Which traversal method visits nodes in a binary tree level by level?",
        options: ['Inorder', 'Preorder', 'Postorder', 'Level-order'],
        correct_answer: 'Level-order',
        explanation: 'Level-order traversal (also called breadth-first traversal) visits nodes level by level from left to right.',
        difficulty: 'easy',
        points: 10,
        topic: 'Tree Traversal'
      },
      {
        id: 7,
        question: "What is the worst-case time complexity of Quick Sort?",
        options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
        correct_answer: 'O(n²)',
        explanation: 'Quick Sort has O(n²) worst-case time complexity when the pivot is always the smallest or largest element.',
        difficulty: 'medium',
        points: 15,
        topic: 'Quick Sort'
      },
      {
        id: 8,
        question: "In a heap, what is the relationship between a parent node and its children?",
        options: [
          'Parent is always smaller than children',
          'Parent is always larger than children (max heap)',
          'No specific relationship',
          'Children are always equal'
        ],
        correct_answer: 'Parent is always larger than children (max heap)',
        explanation: 'In a max heap, each parent node is greater than or equal to its children. In a min heap, it\'s the opposite.',
        difficulty: 'medium',
        points: 15,
        topic: 'Heap Data Structure'
      },
      {
        id: 9,
        question: "What algorithm is used to find the shortest path in a weighted graph?",
        options: ['BFS', 'DFS', 'Dijkstra\'s Algorithm', 'Linear Search'],
        correct_answer: 'Dijkstra\'s Algorithm',
        explanation: 'Dijkstra\'s algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph.',
        difficulty: 'medium',
        points: 15,
        topic: 'Graph Algorithms'
      },
      {
        id: 10,
        question: "What is the time complexity of inserting an element at the beginning of a linked list?",
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct_answer: 'O(1)',
        explanation: 'Inserting at the beginning of a linked list takes constant time as you only need to update the head pointer.',
        difficulty: 'easy',
        points: 10,
        topic: 'Linked Lists'
      },
      {
        id: 11,
        question: "Which data structure would be most efficient for implementing a function call stack?",
        options: ['Array', 'Queue', 'Stack', 'Hash Table'],
        correct_answer: 'Stack',
        explanation: 'Function calls follow LIFO principle - the most recent function called is the first to return, making stack ideal.',
        difficulty: 'easy',
        points: 10,
        topic: 'Stack Applications'
      },
      {
        id: 12,
        question: "What is a complete binary tree?",
        options: [
          'A tree where all nodes have two children',
          'A tree where all levels are filled except possibly the last',
          'A tree where all leaves are at the same level',
          'A tree with exactly 2^n nodes'
        ],
        correct_answer: 'A tree where all levels are filled except possibly the last',
        explanation: 'A complete binary tree has all levels filled except possibly the last level, which is filled from left to right.',
        difficulty: 'medium',
        points: 15,
        topic: 'Binary Trees'
      },
      {
        id: 13,
        question: "What is the primary advantage of using a trie data structure?",
        options: [
          'Fast numerical calculations',
          'Efficient string search and prefix matching',
          'Memory optimization for integers',
          'Fast sorting operations'
        ],
        correct_answer: 'Efficient string search and prefix matching',
        explanation: 'Tries excel at string operations, especially prefix matching and autocomplete functionality.',
        difficulty: 'hard',
        points: 20,
        topic: 'Trie Data Structure'
      },
      {
        id: 14,
        question: "In dynamic programming, what does memoization mean?",
        options: [
          'Forgetting previous calculations',
          'Storing results of expensive function calls',
          'Using more memory than needed',
          'Optimizing memory usage'
        ],
        correct_answer: 'Storing results of expensive function calls',
        explanation: 'Memoization stores the results of expensive function calls to avoid redundant calculations.',
        difficulty: 'hard',
        points: 20,
        topic: 'Dynamic Programming'
      },
      {
        id: 15,
        question: "What is the time complexity of finding the maximum element in an unsorted array?",
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct_answer: 'O(n)',
        explanation: 'To find the maximum in an unsorted array, you must examine each element at least once, giving O(n) complexity.',
        difficulty: 'easy',
        points: 10,
        topic: 'Array Operations'
      },
      {
        id: 16,
        question: "Which algorithm is best for detecting cycles in a linked list?",
        options: ['Linear Search', 'Binary Search', 'Floyd\'s Cycle Detection', 'Merge Sort'],
        correct_answer: 'Floyd\'s Cycle Detection',
        explanation: 'Floyd\'s algorithm (tortoise and hare) uses two pointers moving at different speeds to detect cycles efficiently.',
        difficulty: 'hard',
        points: 20,
        topic: 'Cycle Detection'
      },
      {
        id: 17,
        question: "What is the main benefit of using a balanced binary search tree over an unbalanced one?",
        options: [
          'Uses less memory',
          'Guarantees O(log n) operations',
          'Easier to implement',
          'Supports more operations'
        ],
        correct_answer: 'Guarantees O(log n) operations',
        explanation: 'Balanced BSTs maintain their height at O(log n), ensuring efficient search, insert, and delete operations.',
        difficulty: 'medium',
        points: 15,
        topic: 'Balanced Trees'
      },
      {
        id: 18,
        question: "In graph theory, what is a strongly connected component?",
        options: [
          'A component with the most edges',
          'A maximal set of vertices where every vertex is reachable from every other',
          'A component with no cycles',
          'The largest component in a graph'
        ],
        correct_answer: 'A maximal set of vertices where every vertex is reachable from every other',
        explanation: 'A strongly connected component is a maximal set of vertices where there is a path from each vertex to every other vertex.',
        difficulty: 'hard',
        points: 20,
        topic: 'Graph Theory'
      }
    ]
  },

  // Web Development
  web_development: {
    id: 'web_development',
    title: 'Web Development',
    description: 'Frontend, backend, and full-stack concepts',
    timeLimit: 900, // 15 minutes (increased for more questions)
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
      },
      {
        id: 6,
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: [
          'No difference',
          '=== checks type and value, == only checks value',
          '== is faster than ===',
          '=== is for strings only'
        ],
        correct_answer: '=== checks type and value, == only checks value',
        explanation: '=== performs strict equality comparison (type and value), while == performs type coercion.',
        difficulty: 'medium',
        points: 15,
        topic: 'JavaScript Operators'
      },
      {
        id: 7,
        question: "What is the purpose of the viewport meta tag?",
        options: [
          'To set page title',
          'To control layout on mobile browsers',
          'To load external stylesheets',
          'To define character encoding'
        ],
        correct_answer: 'To control layout on mobile browsers',
        explanation: 'The viewport meta tag controls layout on mobile browsers by setting the viewport width and initial scale.',
        difficulty: 'medium',
        points: 15,
        topic: 'Responsive Design'
      },
      {
        id: 8,
        question: "What is a RESTful API?",
        options: [
          'A database management system',
          'An architectural style for web services',
          'A JavaScript framework',
          'A CSS preprocessor'
        ],
        correct_answer: 'An architectural style for web services',
        explanation: 'REST is an architectural style that defines principles for designing networked applications.',
        difficulty: 'medium',
        points: 15,
        topic: 'API Design'
      },
      {
        id: 9,
        question: "What is the purpose of webpack?",
        options: [
          'To create web components',
          'To bundle and optimize web assets',
          'To test web applications',
          'To deploy web applications'
        ],
        correct_answer: 'To bundle and optimize web assets',
        explanation: 'Webpack is a module bundler that processes and bundles JavaScript, CSS, and other assets.',
        difficulty: 'medium',
        points: 15,
        topic: 'Build Tools'
      },
      {
        id: 10,
        question: "What is the difference between client-side and server-side rendering?",
        options: [
          'No difference',
          'Client-side renders in browser, server-side on server',
          'Client-side is always faster',
          'Server-side uses more bandwidth'
        ],
        correct_answer: 'Client-side renders in browser, server-side on server',
        explanation: 'Client-side rendering happens in the browser using JavaScript, while server-side rendering happens on the server.',
        difficulty: 'medium',
        points: 15,
        topic: 'Rendering Strategies'
      },
      {
        id: 11,
        question: "What is the purpose of semantic HTML?",
        options: [
          'To improve styling',
          'To provide meaning and structure to content',
          'To reduce file size',
          'To enable animations'
        ],
        correct_answer: 'To provide meaning and structure to content',
        explanation: 'Semantic HTML uses meaningful elements to describe content structure, improving accessibility and SEO.',
        difficulty: 'easy',
        points: 10,
        topic: 'HTML Semantics'
      },
      {
        id: 12,
        question: "What is a Promise in JavaScript?",
        options: [
          'A type of variable',
          'An object representing eventual completion of an async operation',
          'A CSS property',
          'A HTML element'
        ],
        correct_answer: 'An object representing eventual completion of an async operation',
        explanation: 'Promises represent asynchronous operations and their eventual completion or failure.',
        difficulty: 'medium',
        points: 15,
        topic: 'Asynchronous JavaScript'
      }
    ]
  },

  // Machine Learning & AI
  machine_learning: {
    id: 'machine_learning',
    title: 'Machine Learning & AI',
    description: 'ML algorithms, neural networks, and AI concepts',
    timeLimit: 900, // 15 minutes
    questions: [
      {
        id: 1,
        question: "What is supervised learning?",
        options: [
          'Learning without any data',
          'Learning with labeled training data',
          'Learning from unlabeled data',
          'Learning from reinforcement'
        ],
        correct_answer: 'Learning with labeled training data',
        explanation: 'Supervised learning uses labeled training data to learn a mapping from inputs to outputs.',
        difficulty: 'easy',
        points: 10,
        topic: 'ML Fundamentals'
      },
      {
        id: 2,
        question: "What is overfitting in machine learning?",
        options: [
          'Model performs well on training and test data',
          'Model performs poorly on both training and test data',
          'Model performs well on training but poorly on test data',
          'Model takes too long to train'
        ],
        correct_answer: 'Model performs well on training but poorly on test data',
        explanation: 'Overfitting occurs when a model learns the training data too well and fails to generalize to new data.',
        difficulty: 'medium',
        points: 15,
        topic: 'Model Evaluation'
      },
      {
        id: 3,
        question: "What is the purpose of a validation set?",
        options: [
          'To train the model',
          'To test final performance',
          'To tune hyperparameters',
          'To store backup data'
        ],
        correct_answer: 'To tune hyperparameters',
        explanation: 'Validation sets are used to tune hyperparameters and select the best model without touching the test set.',
        difficulty: 'medium',
        points: 15,
        topic: 'Data Splitting'
      },
      {
        id: 4,
        question: "What is the difference between precision and recall?",
        options: [
          'They are the same metric',
          'Precision: TP/(TP+FP), Recall: TP/(TP+FN)',
          'Precision is for classification, recall for regression',
          'Precision is always higher than recall'
        ],
        correct_answer: 'Precision: TP/(TP+FP), Recall: TP/(TP+FN)',
        explanation: 'Precision measures how many predicted positives are correct, recall measures how many actual positives were found.',
        difficulty: 'hard',
        points: 20,
        topic: 'Classification Metrics'
      },
      {
        id: 5,
        question: "What is gradient descent?",
        options: [
          'A data preprocessing technique',
          'An optimization algorithm to minimize loss functions',
          'A neural network architecture',
          'A feature selection method'
        ],
        correct_answer: 'An optimization algorithm to minimize loss functions',
        explanation: 'Gradient descent iteratively updates parameters to minimize the loss function by following the negative gradient.',
        difficulty: 'medium',
        points: 15,
        topic: 'Optimization'
      },
      {
        id: 6,
        question: "What is a neural network activation function?",
        options: [
          'A function to preprocess data',
          'A function that determines neuron output',
          'A function to split data',
          'A function to save models'
        ],
        correct_answer: 'A function that determines neuron output',
        explanation: 'Activation functions determine whether a neuron should be activated based on weighted input sum.',
        difficulty: 'medium',
        points: 15,
        topic: 'Neural Networks'
      },
      {
        id: 7,
        question: "What is the purpose of regularization?",
        options: [
          'To increase model complexity',
          'To prevent overfitting',
          'To speed up training',
          'To increase accuracy'
        ],
        correct_answer: 'To prevent overfitting',
        explanation: 'Regularization techniques add constraints to prevent the model from becoming too complex and overfitting.',
        difficulty: 'medium',
        points: 15,
        topic: 'Regularization'
      },
      {
        id: 8,
        question: "What is the difference between classification and regression?",
        options: [
          'No difference',
          'Classification predicts categories, regression predicts continuous values',
          'Classification is unsupervised, regression is supervised',
          'Classification is faster than regression'
        ],
        correct_answer: 'Classification predicts categories, regression predicts continuous values',
        explanation: 'Classification tasks predict discrete categories/classes, while regression predicts continuous numerical values.',
        difficulty: 'easy',
        points: 10,
        topic: 'Problem Types'
      }
    ]
  },

  // Cybersecurity
  cybersecurity: {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Security principles, threats, and protection mechanisms',
    timeLimit: 900, // 15 minutes
    questions: [
      {
        id: 1,
        question: "What is the principle of least privilege?",
        options: [
          'Give users maximum access for convenience',
          'Give users minimum access required for their job',
          'Remove all user privileges',
          'Give everyone admin access'
        ],
        correct_answer: 'Give users minimum access required for their job',
        explanation: 'Least privilege means granting only the minimum access rights necessary to perform required tasks.',
        difficulty: 'easy',
        points: 10,
        topic: 'Security Principles'
      },
      {
        id: 2,
        question: "What is a SQL injection attack?",
        options: [
          'Injecting malicious code into database queries',
          'Stealing SQL database files',
          'Breaking SQL server hardware',
          'Encrypting SQL databases'
        ],
        correct_answer: 'Injecting malicious code into database queries',
        explanation: 'SQL injection involves inserting malicious SQL code into application queries to manipulate database operations.',
        difficulty: 'medium',
        points: 15,
        topic: 'Web Security'
      },
      {
        id: 3,
        question: "What is two-factor authentication (2FA)?",
        options: [
          'Using two passwords',
          'Logging in twice',
          'Using two different authentication factors',
          'Having two user accounts'
        ],
        correct_answer: 'Using two different authentication factors',
        explanation: '2FA combines two different factors (something you know, have, or are) for stronger authentication.',
        difficulty: 'easy',
        points: 10,
        topic: 'Authentication'
      },
      {
        id: 4,
        question: "What is a DDoS attack?",
        options: [
          'Distributed Denial of Service',
          'Direct Database of Service',
          'Dynamic Domain of Security',
          'Dedicated Deployment of Systems'
        ],
        correct_answer: 'Distributed Denial of Service',
        explanation: 'DDoS attacks overwhelm a target with traffic from multiple sources to disrupt service availability.',
        difficulty: 'medium',
        points: 15,
        topic: 'Network Security'
      },
      {
        id: 5,
        question: "What is encryption?",
        options: [
          'Compressing data to save space',
          'Converting data into unreadable format',
          'Backing up data',
          'Deleting sensitive data'
        ],
        correct_answer: 'Converting data into unreadable format',
        explanation: 'Encryption transforms readable data into an unreadable format that can only be decoded with the proper key.',
        difficulty: 'easy',
        points: 10,
        topic: 'Cryptography'
      },
      {
        id: 6,
        question: "What is the difference between symmetric and asymmetric encryption?",
        options: [
          'No difference',
          'Symmetric uses one key, asymmetric uses two keys',
          'Symmetric is faster, asymmetric is slower',
          'Both symmetric uses one key and asymmetric uses two keys, and symmetric is faster'
        ],
        correct_answer: 'Both symmetric uses one key and asymmetric uses two keys, and symmetric is faster',
        explanation: 'Symmetric encryption uses one shared key, while asymmetric uses a key pair (public/private). Symmetric is typically faster.',
        difficulty: 'medium',
        points: 15,
        topic: 'Encryption Types'
      },
      {
        id: 7,
        question: "What is a firewall?",
        options: [
          'Software to prevent computer overheating',
          'Network security system that monitors traffic',
          'Backup storage system',
          'Virus scanning software'
        ],
        correct_answer: 'Network security system that monitors traffic',
        explanation: 'Firewalls monitor and control incoming and outgoing network traffic based on predetermined security rules.',
        difficulty: 'easy',
        points: 10,
        topic: 'Network Security'
      },
      {
        id: 8,
        question: "What is social engineering in cybersecurity?",
        options: [
          'Building secure software',
          'Manipulating people to divulge confidential information',
          'Engineering social media platforms',
          'Creating user communities'
        ],
        correct_answer: 'Manipulating people to divulge confidential information',
        explanation: 'Social engineering exploits human psychology to trick people into revealing sensitive information or performing actions.',
        difficulty: 'medium',
        points: 15,
        topic: 'Human Factors'
      }
    ]
  },

  // Mobile Development
  mobile_development: {
    id: 'mobile_development',
    title: 'Mobile Development',
    description: 'iOS, Android, and cross-platform development',
    timeLimit: 900, // 15 minutes
    questions: [
      {
        id: 1,
        question: "What is React Native?",
        options: [
          'A web framework',
          'A cross-platform mobile development framework',
          'A database system',
          'A testing tool'
        ],
        correct_answer: 'A cross-platform mobile development framework',
        explanation: 'React Native allows developers to build mobile apps for iOS and Android using JavaScript and React.',
        difficulty: 'easy',
        points: 10,
        topic: 'Cross-Platform Development'
      },
      {
        id: 2,
        question: "What is the main programming language for native iOS development?",
        options: ['Java', 'Kotlin', 'Swift', 'JavaScript'],
        correct_answer: 'Swift',
        explanation: 'Swift is Apple\'s modern programming language for iOS, macOS, watchOS, and tvOS development.',
        difficulty: 'easy',
        points: 10,
        topic: 'iOS Development'
      },
      {
        id: 3,
        question: "What is the main programming language for native Android development?",
        options: ['Swift', 'Kotlin', 'C#', 'Python'],
        correct_answer: 'Kotlin',
        explanation: 'Kotlin is Google\'s preferred language for Android development, though Java is also supported.',
        difficulty: 'easy',
        points: 10,
        topic: 'Android Development'
      },
      {
        id: 4,
        question: "What is Flutter?",
        options: [
          'A database management system',
          'Google\'s UI toolkit for cross-platform development',
          'An iOS-only framework',
          'A web server'
        ],
        correct_answer: 'Google\'s UI toolkit for cross-platform development',
        explanation: 'Flutter is Google\'s framework for building natively compiled applications across multiple platforms from a single codebase.',
        difficulty: 'medium',
        points: 15,
        topic: 'Cross-Platform Development'
      },
      {
        id: 5,
        question: "What is the purpose of mobile app lifecycle methods?",
        options: [
          'To handle memory management',
          'To manage app state transitions',
          'To optimize performance',
          'All of the above'
        ],
        correct_answer: 'All of the above',
        explanation: 'Lifecycle methods help manage app states, memory, and performance during various app state transitions.',
        difficulty: 'medium',
        points: 15,
        topic: 'App Lifecycle'
      },
      {
        id: 6,
        question: "What is responsive design in mobile development?",
        options: [
          'Fast app response time',
          'Adapting UI to different screen sizes',
          'Quick server responses',
          'Real-time data updates'
        ],
        correct_answer: 'Adapting UI to different screen sizes',
        explanation: 'Responsive design ensures that the user interface adapts gracefully to different screen sizes and orientations.',
        difficulty: 'easy',
        points: 10,
        topic: 'UI/UX Design'
      }
    ]
  },

  // Database Systems
  databases: {
    id: 'databases',
    title: 'Database Systems',
    description: 'SQL, NoSQL, and database design principles',
    timeLimit: 900, // 15 minutes (increased for more questions)
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
  },

  // Operating Systems
  operating_systems: {
    id: 'operating_systems',
    title: 'Operating Systems',
    description: 'OS concepts, processes, memory management',
    timeLimit: 900, // 15 minutes
    questions: [
      {
        id: 1,
        question: "What is a process in an operating system?",
        options: [
          'A running program with allocated resources',
          'A static program file',
          'A system command',
          'A hardware component'
        ],
        correct_answer: 'A running program with allocated resources',
        explanation: 'A process is an instance of a program in execution, with allocated memory, CPU time, and other system resources.',
        difficulty: 'easy',
        points: 10,
        topic: 'Process Management'
      },
      {
        id: 2,
        question: "What is the difference between a process and a thread?",
        options: [
          'No difference',
          'Processes share memory, threads don\'t',
          'Threads share memory within a process',
          'Threads are faster than processes'
        ],
        correct_answer: 'Threads share memory within a process',
        explanation: 'Threads are lightweight execution units within a process that share memory space, while processes have separate memory spaces.',
        difficulty: 'medium',
        points: 15,
        topic: 'Threads vs Processes'
      },
      {
        id: 3,
        question: "What is virtual memory?",
        options: [
          'Memory that doesn\'t exist',
          'RAM simulation using disk space',
          'Memory for virtual machines only',
          'Compressed memory'
        ],
        correct_answer: 'RAM simulation using disk space',
        explanation: 'Virtual memory allows the system to use disk space as an extension of RAM, providing more memory than physically available.',
        difficulty: 'medium',
        points: 15,
        topic: 'Memory Management'
      },
      {
        id: 4,
        question: "What is a deadlock?",
        options: [
          'A crashed process',
          'Two or more processes waiting for each other indefinitely',
          'A locked file',
          'System shutdown'
        ],
        correct_answer: 'Two or more processes waiting for each other indefinitely',
        explanation: 'Deadlock occurs when two or more processes are blocked forever, each waiting for the other to release resources.',
        difficulty: 'hard',
        points: 20,
        topic: 'Synchronization'
      },
      {
        id: 5,
        question: "What is the purpose of a scheduler in an OS?",
        options: [
          'To schedule meetings',
          'To decide which process runs next',
          'To schedule system updates',
          'To manage file operations'
        ],
        correct_answer: 'To decide which process runs next',
        explanation: 'The scheduler allocates CPU time to different processes, determining the order and duration of process execution.',
        difficulty: 'medium',
        points: 15,
        topic: 'CPU Scheduling'
      },
      {
        id: 6,
        question: "What is the difference between preemptive and non-preemptive scheduling?",
        options: [
          'No difference',
          'Preemptive can interrupt running processes',
          'Non-preemptive is faster',
          'Preemptive uses more memory'
        ],
        correct_answer: 'Preemptive can interrupt running processes',
        explanation: 'Preemptive scheduling can forcibly remove a process from CPU, while non-preemptive waits for process to yield control.',
        difficulty: 'medium',
        points: 15,
        topic: 'Scheduling Types'
      }
    ]
  },

  // Computer Networks
  computer_networks: {
    id: 'computer_networks',
    title: 'Computer Networks',
    description: 'Network protocols, architecture, and security',
    timeLimit: 900, // 15 minutes
    questions: [
      {
        id: 1,
        question: "What does TCP stand for?",
        options: [
          'Transfer Control Protocol',
          'Transmission Control Protocol',
          'Transport Control Protocol',
          'Terminal Control Protocol'
        ],
        correct_answer: 'Transmission Control Protocol',
        explanation: 'TCP (Transmission Control Protocol) is a reliable, connection-oriented protocol that ensures data delivery.',
        difficulty: 'easy',
        points: 10,
        topic: 'Network Protocols'
      },
      {
        id: 2,
        question: "What is the difference between TCP and UDP?",
        options: [
          'TCP is faster than UDP',
          'UDP is more reliable than TCP',
          'TCP is connection-oriented, UDP is connectionless',
          'No significant difference'
        ],
        correct_answer: 'TCP is connection-oriented, UDP is connectionless',
        explanation: 'TCP establishes connections and guarantees delivery, while UDP is connectionless and faster but unreliable.',
        difficulty: 'medium',
        points: 15,
        topic: 'Protocol Comparison'
      },
      {
        id: 3,
        question: "What is the purpose of DNS?",
        options: [
          'To encrypt data',
          'To translate domain names to IP addresses',
          'To compress network traffic',
          'To monitor network performance'
        ],
        correct_answer: 'To translate domain names to IP addresses',
        explanation: 'DNS (Domain Name System) converts human-readable domain names into IP addresses that computers can understand.',
        difficulty: 'easy',
        points: 10,
        topic: 'Domain Name System'
      },
      {
        id: 4,
        question: "What is the OSI model?",
        options: [
          'A network security framework',
          'A 7-layer network communication model',
          'A type of router',
          'A programming language for networks'
        ],
        correct_answer: 'A 7-layer network communication model',
        explanation: 'The OSI model is a conceptual framework that standardizes network communication into 7 layers.',
        difficulty: 'medium',
        points: 15,
        topic: 'Network Models'
      },
      {
        id: 5,
        question: "What is a subnet mask?",
        options: [
          'A security feature',
          'A way to divide IP networks into smaller segments',
          'A type of firewall',
          'A network monitoring tool'
        ],
        correct_answer: 'A way to divide IP networks into smaller segments',
        explanation: 'A subnet mask determines which part of an IP address represents the network and which part represents the host.',
        difficulty: 'medium',
        points: 15,
        topic: 'IP Addressing'
      },
      {
        id: 6,
        question: "What is the difference between a hub and a switch?",
        options: [
          'No difference',
          'Hub operates at physical layer, switch at data link layer',
          'Switch is older technology',
          'Hub is more secure'
        ],
        correct_answer: 'Hub operates at physical layer, switch at data link layer',
        explanation: 'Hubs operate at Layer 1 (physical) and broadcast to all ports, while switches operate at Layer 2 (data link) and learn MAC addresses.',
        difficulty: 'hard',
        points: 20,
        topic: 'Network Devices'
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
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);
  
  const { user } = useAuth();

  // Available quiz categories
  const quizCategories = [
    {
      id: 'programming_fundamentals',
      title: 'Programming Fundamentals',
      icon: '💻',
      description: 'Core programming concepts, syntax, and language basics',
      questionCount: 15,
      timeLimit: '15 min',
      difficulty: 'Beginner to Intermediate'
    },
    {
      id: 'data_structures',
      title: 'Data Structures & Algorithms',
      icon: '🌳',
      description: 'Arrays, trees, graphs, sorting, and algorithmic thinking',
      questionCount: 18,
      timeLimit: '20 min',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'web_development',
      title: 'Web Development',
      icon: '🌐',
      description: 'Frontend, backend, HTTP, CSS, and web technologies',
      questionCount: 12,
      timeLimit: '15 min',
      difficulty: 'Beginner to Advanced'
    },
    {
      id: 'machine_learning',
      title: 'Machine Learning & AI',
      icon: '🤖',
      description: 'ML algorithms, neural networks, and AI concepts',
      questionCount: 8,
      timeLimit: '15 min',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity',
      icon: '🔐',
      description: 'Security principles, threats, and protection mechanisms',
      questionCount: 8,
      timeLimit: '15 min',
      difficulty: 'Beginner to Advanced'
    },
    {
      id: 'mobile_development',
      title: 'Mobile Development',
      icon: '📱',
      description: 'iOS, Android, and cross-platform development',
      questionCount: 6,
      timeLimit: '15 min',
      difficulty: 'Beginner to Intermediate'
    },
    {
      id: 'databases',
      title: 'Database Systems',
      icon: '🗄️',
      description: 'SQL, NoSQL, database design, and data management',
      questionCount: 5,
      timeLimit: '15 min',
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
    },
    {
      id: 'operating_systems',
      title: 'Operating Systems',
      icon: '💻',
      description: 'OS concepts, processes, memory management',
      questionCount: 6,
      timeLimit: '15 min',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'computer_networks',
      title: 'Computer Networks',
      icon: '🌐',
      description: 'Network protocols, architecture, and security',
      questionCount: 6,
      timeLimit: '15 min',
      difficulty: 'Intermediate to Advanced'
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
    
    // Calculate score and time
    let correctAnswers = 0;
    let totalPoints = 0;
    const quizEndTime = Date.now();
    const totalTimeSpent = quizStartTime ? Math.floor((quizEndTime - quizStartTime) / 1000) : 0;
    
    // Create detailed answer records
    const answerDetails = quizData.questions.map((question, index) => ({
      questionId: question.id,
      question: question.question,
      selectedAnswer: answers[index],
      correctAnswer: question.correct_answer,
      isCorrect: answers[index] === question.correct_answer,
      difficulty: question.difficulty,
      topic: question.topic,
      points: question.points || 10
    }));
    
    quizData.questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correctAnswers++;
        totalPoints += question.points || 10;
      }
    });
    
    // Calculate percentage score
    const maxPossiblePoints = quizData.questions.reduce((sum, q) => sum + (q.points || 10), 0);
    const percentageScore = Math.round((totalPoints / maxPossiblePoints) * 100);
    
    setScore(percentageScore);
    
    // Record quiz completion in analytics
    const quizResult = {
      category: selectedCategory,
      categoryTitle: quizData.title,
      score: percentageScore,
      totalQuestions: quizData.questions.length,
      correctAnswers: correctAnswers,
      timeSpent: totalTimeSpent,
      answers: answers,
      questionDetails: answerDetails,
      difficulty: 'mixed' // Could be enhanced to calculate based on question difficulties
    };
    
    try {
      quizAnalyticsService.recordQuizCompletion(quizResult);
      console.log('📊 Quiz performance recorded successfully');
    } catch (error) {
      console.error('Failed to record quiz performance:', error);
    }
    
    setShowResults(true);
  }, [quizData, answers, showResults, selectedCategory, quizStartTime]);

  // Start quiz function
  const startQuiz = useCallback(() => {
    console.log('🚀 Starting comprehensive quiz...', selectedCategory);
    
    const categoryData = comprehensiveQuizData[selectedCategory];
    if (!categoryData) {
      console.error('Category not found:', selectedCategory);
      return;
    }

    // Record start time for analytics
    setQuizStartTime(Date.now());

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

  // Show analytics view
  if (showAnalytics) {
    const analyticsData = quizAnalyticsService.getData();
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quiz Performance Analytics</h1>
            <button
              onClick={() => setShowAnalytics(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Quiz
            </button>
          </div>
          
          {/* Analytics Component */}
          <QuizPerformanceAnalytics 
            userStats={analyticsData?.userStats || {}}
            quizHistory={analyticsData?.quizHistory || []}
          />
        </div>
      </div>
    );
  }

  // Show category selection screen
  if (showCategorySelection && !showAnalytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with Analytics Button */}
          <div className="flex justify-between items-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🧠 Interactive Quiz System
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Test your programming knowledge across multiple domains
              </p>
              <p className="text-sm text-gray-500">
                Choose a category below to start your learning journey
              </p>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowAnalytics(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-lg"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Analytics</span>
            </motion.button>
          </div>
          
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