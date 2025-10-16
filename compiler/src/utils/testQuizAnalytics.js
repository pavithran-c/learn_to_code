// Test script to populate some quiz data for analytics
import quizAnalyticsService from '../services/quizAnalyticsService.js';

// Generate sample quiz completion data
const generateSampleQuizData = () => {
  console.log('🔧 Generating sample quiz data for testing...');
  
  const categories = [
    'programming_fundamentals',
    'data_structures', 
    'algorithms',
    'web_development',
    'machine_learning'
  ];
  
  const categoryTitles = {
    'programming_fundamentals': 'Programming Fundamentals',
    'data_structures': 'Data Structures',
    'algorithms': 'Algorithms', 
    'web_development': 'Web Development',
    'machine_learning': 'Machine Learning'
  };

  // Generate 10 sample quiz attempts
  for (let i = 0; i < 10; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const totalQuestions = 10 + Math.floor(Math.random() * 8); // 10-18 questions
    const correctAnswers = Math.floor(totalQuestions * (0.6 + Math.random() * 0.4)); // 60-100% accuracy
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const timeSpent = 300 + Math.floor(Math.random() * 600); // 5-15 minutes
    
    const quizResult = {
      category: category,
      categoryTitle: categoryTitles[category],
      score: score,
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      timeSpent: timeSpent,
      answers: {},
      questionDetails: [],
      difficulty: 'mixed'
    };
    
    // Add some delay between attempts
    setTimeout(() => {
      quizAnalyticsService.recordQuizCompletion(quizResult);
    }, i * 100);
  }
  
  console.log('✅ Sample quiz data generated successfully!');
  console.log('📊 Analytics data:', quizAnalyticsService.getData());
};

// Export for use in browser console
window.generateSampleQuizData = generateSampleQuizData;
window.quizAnalyticsService = quizAnalyticsService;

console.log('🔧 Quiz Analytics Test Script Loaded');
console.log('📝 Run "generateSampleQuizData()" in console to create test data');
console.log('📊 Run "quizAnalyticsService.getData()" to view current data');