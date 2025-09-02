// Utility functions for managing student performance data in localStorage

const STORAGE_KEYS = {
  USER_PROFILE: 'examtrack_user_profile',
  QUIZ_RESULTS: 'examtrack_quiz_results',
  CODING_RESULTS: 'examtrack_coding_results',
  STREAK_DATA: 'examtrack_streak_data',
  ACHIEVEMENTS: 'examtrack_achievements'
};

// Initialize default data structure with realistic dummy data
const DEFAULT_USER_DATA = {
  profile: {
    name: "Alex Thompson",
    avatar: "AT",
    rank: "#1,247",
    percentile: "87%",
    totalScore: 8450,
    level: "Advanced"
  },
  quickStats: {
    streak: 12,
    testsCompleted: 47,
    avgAccuracy: 84.6,
    studyHours: 156,
    problemsSolved: 238,
    topicsMastered: 5
  },
  categoryPerformance: [
    { name: 'Data Structures', score: 92, total: 100, trend: 'up', color: '#3B82F6' },
    { name: 'Algorithms', score: 88, total: 100, trend: 'up', color: '#10B981' },
    { name: 'Database Systems', score: 79, total: 100, trend: 'stable', color: '#F59E0B' },
    { name: 'Operating Systems', score: 85, total: 100, trend: 'up', color: '#8B5CF6' },
    { name: 'Computer Networks', score: 76, total: 100, trend: 'down', color: '#EF4444' },
    { name: 'Software Engineering', score: 91, total: 100, trend: 'up', color: '#06B6D4' }
  ],
  streakData: {
    current: 12,
    longest: 25,
    weeklyGoal: 7,
    monthlyGoal: 30,
    practiceMinutes: 1650,
    target: 2000,
    lastActivity: new Date().toDateString()
  },
  recentTests: [
    { name: 'Advanced Data Structures Quiz', score: 94, date: '2 days ago', category: 'Data Structures', difficulty: 'Hard' },
    { name: 'Binary Search Trees Assessment', score: 89, date: '4 days ago', category: 'Data Structures', difficulty: 'Medium' },
    { name: 'SQL Complex Queries Test', score: 76, date: '5 days ago', category: 'Database Systems', difficulty: 'Hard' },
    { name: 'Process Synchronization Quiz', score: 92, date: '1 week ago', category: 'Operating Systems', difficulty: 'Medium' },
    { name: 'Graph Algorithms Challenge', score: 87, date: '1 week ago', category: 'Algorithms', difficulty: 'Hard' },
    { name: 'Software Design Patterns', score: 95, date: '2 weeks ago', category: 'Software Engineering', difficulty: 'Medium' },
    { name: 'Network Protocol Analysis', score: 73, date: '2 weeks ago', category: 'Computer Networks', difficulty: 'Hard' },
    { name: 'Dynamic Programming Quiz', score: 91, date: '3 weeks ago', category: 'Algorithms', difficulty: 'Medium' }
  ],
  achievements: [
    { name: 'First Steps', description: 'Complete your first quiz', icon: '🎯', earned: true },
    { name: 'Speed Demon', description: 'Complete 10 timed tests', icon: '⚡', earned: true },
    { name: 'Perfect Score', description: 'Achieve 100% in any test', icon: '🏆', earned: false },
    { name: 'Streak Master', description: 'Maintain 7-day streak', icon: '🔥', earned: true },
    { name: 'Topic Expert', description: 'Score 90%+ in all categories', icon: '🧠', earned: false },
    { name: 'Problem Solver', description: 'Solve 100+ coding problems', icon: '💻', earned: true },
    { name: 'Study Marathon', description: 'Study for 100+ hours', icon: '📚', earned: true },
    { name: 'Consistency King', description: 'Maintain 20-day streak', icon: '👑', earned: false }
  ]
};

// Get user data from localStorage or return default
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return userData ? JSON.parse(userData) : DEFAULT_USER_DATA;
  } catch (error) {
    console.error('Error reading user data:', error);
    return DEFAULT_USER_DATA;
  }
};

// Save user data to localStorage
export const saveUserData = (userData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Record quiz result and update performance
export const recordQuizResult = (category, score, totalQuestions, timeSpent) => {
  const userData = getUserData();
  const accuracy = (score / totalQuestions) * 100;
  
  // Update category performance
  const categoryIndex = userData.categoryPerformance.findIndex(
    cat => cat.name.toLowerCase().includes(category.toLowerCase())
  );
  
  if (categoryIndex !== -1) {
    const oldScore = userData.categoryPerformance[categoryIndex].score;
    const newScore = Math.round((oldScore + accuracy) / 2); // Simple average
    userData.categoryPerformance[categoryIndex].score = newScore;
    userData.categoryPerformance[categoryIndex].trend = newScore > oldScore ? 'up' : 
                                                       newScore < oldScore ? 'down' : 'stable';
  }
  
  // Update quick stats
  userData.quickStats.testsCompleted += 1;
  userData.quickStats.avgAccuracy = Math.round(
    (userData.quickStats.avgAccuracy * (userData.quickStats.testsCompleted - 1) + accuracy) / 
    userData.quickStats.testsCompleted
  );
  userData.quickStats.studyHours += Math.round(timeSpent / 60); // Convert to hours
  
  // Add to recent tests
  userData.recentTests.unshift({
    name: `${category} Quiz`,
    score: Math.round(accuracy),
    date: new Date().toLocaleDateString(),
    category: category,
    difficulty: accuracy > 80 ? 'Easy' : accuracy > 60 ? 'Medium' : 'Hard'
  });
  
  // Keep only last 10 tests
  userData.recentTests = userData.recentTests.slice(0, 10);
  
  // Update achievements
  updateAchievements(userData);
  
  // Update streak
  updateStreak(userData);
  
  saveUserData(userData);
};

// Record coding problem result
export const recordCodingResult = (problemName, solved, attempts, timeSpent) => {
  const userData = getUserData();
  
  if (solved) {
    userData.quickStats.problemsSolved += 1;
    
    // Update algorithms category
    const algoIndex = userData.categoryPerformance.findIndex(
      cat => cat.name.toLowerCase().includes('algorithm')
    );
    if (algoIndex !== -1) {
      userData.categoryPerformance[algoIndex].score = Math.min(100, userData.categoryPerformance[algoIndex].score + 2);
      userData.categoryPerformance[algoIndex].trend = 'up';
    }
  }
  
  userData.quickStats.studyHours += Math.round(timeSpent / 60);
  updateStreak(userData);
  updateAchievements(userData);
  
  saveUserData(userData);
};

// Update streak data
const updateStreak = (userData) => {
  const today = new Date().toDateString();
  const lastActivity = userData.streakData.lastActivity;
  
  if (lastActivity !== today) {
    if (lastActivity === new Date(Date.now() - 86400000).toDateString()) {
      // Yesterday - continue streak
      userData.streakData.current += 1;
    } else if (lastActivity) {
      // Gap in streak - reset
      userData.streakData.current = 1;
    } else {
      // First activity
      userData.streakData.current = 1;
    }
    
    userData.streakData.longest = Math.max(
      userData.streakData.longest, 
      userData.streakData.current
    );
    userData.streakData.lastActivity = today;
  }
  
  // Add practice minutes (estimate based on activity)
  userData.streakData.practiceMinutes += 15;
};

// Update achievements based on current stats
const updateAchievements = (userData) => {
  userData.achievements.forEach(achievement => {
    if (achievement.earned) return;
    
    switch (achievement.name) {
      case 'First Steps':
        achievement.earned = userData.quickStats.testsCompleted > 0;
        break;
      case 'Speed Demon':
        achievement.earned = userData.quickStats.testsCompleted >= 10;
        break;
      case 'Perfect Score':
        achievement.earned = userData.recentTests.some(test => test.score === 100);
        break;
      case 'Streak Master':
        achievement.earned = userData.streakData.current >= 7;
        break;
      case 'Topic Expert':
        achievement.earned = userData.categoryPerformance.every(cat => cat.score >= 90);
        break;
    }
  });
};

// Get dashboard statistics
export const getDashboardStats = () => {
  return getUserData();
};

// Reset all data (for testing purposes)
export const resetUserData = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.QUIZ_RESULTS);
  localStorage.removeItem(STORAGE_KEYS.CODING_RESULTS);
  localStorage.removeItem(STORAGE_KEYS.STREAK_DATA);
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
};

// Calculate user rank based on total score
export const calculateRank = (totalScore) => {
  // Simple ranking algorithm - in real app, this would query backend
  const ranks = [
    { threshold: 10000, rank: "Top 1%" },
    { threshold: 8000, rank: "Top 5%" },
    { threshold: 6000, rank: "Top 10%" },
    { threshold: 4000, rank: "Top 25%" },
    { threshold: 2000, rank: "Top 50%" },
    { threshold: 0, rank: "Getting Started" }
  ];
  
  return ranks.find(r => totalScore >= r.threshold)?.rank || "Unranked";
};

// Calculate percentile
export const calculatePercentile = (totalScore) => {
  // Simple percentile calculation
  const maxScore = 10000;
  return Math.min(100, Math.round((totalScore / maxScore) * 100));
};

// Populate dashboard with sample realistic data (for demo purposes)
export const populateSampleData = () => {
  const sampleData = {
    profile: {
      name: "Alex Thompson",
      avatar: "AT",
      rank: "#1,247",
      percentile: "87%",
      totalScore: 8450,
      level: "Advanced"
    },
    quickStats: {
      streak: 12,
      testsCompleted: 47,
      avgAccuracy: 84.6,
      studyHours: 156,
      problemsSolved: 238,
      topicsMastered: 5
    },
    categoryPerformance: [
      { name: 'Data Structures', score: 92, total: 100, trend: 'up', color: '#3B82F6' },
      { name: 'Algorithms', score: 88, total: 100, trend: 'up', color: '#10B981' },
      { name: 'Database Systems', score: 79, total: 100, trend: 'stable', color: '#F59E0B' },
      { name: 'Operating Systems', score: 85, total: 100, trend: 'up', color: '#8B5CF6' },
      { name: 'Computer Networks', score: 76, total: 100, trend: 'down', color: '#EF4444' },
      { name: 'Software Engineering', score: 91, total: 100, trend: 'up', color: '#06B6D4' }
    ],
    streakData: {
      current: 12,
      longest: 25,
      weeklyGoal: 7,
      monthlyGoal: 30,
      practiceMinutes: 1650,
      target: 2000,
      lastActivity: new Date().toDateString()
    },
    recentTests: [
      { name: 'Advanced Data Structures Quiz', score: 94, date: '2 days ago', category: 'Data Structures', difficulty: 'Hard' },
      { name: 'Binary Search Trees Assessment', score: 89, date: '4 days ago', category: 'Data Structures', difficulty: 'Medium' },
      { name: 'SQL Complex Queries Test', score: 76, date: '5 days ago', category: 'Database Systems', difficulty: 'Hard' },
      { name: 'Process Synchronization Quiz', score: 92, date: '1 week ago', category: 'Operating Systems', difficulty: 'Medium' },
      { name: 'Graph Algorithms Challenge', score: 87, date: '1 week ago', category: 'Algorithms', difficulty: 'Hard' },
      { name: 'Software Design Patterns', score: 95, date: '2 weeks ago', category: 'Software Engineering', difficulty: 'Medium' },
      { name: 'Network Protocol Analysis', score: 73, date: '2 weeks ago', category: 'Computer Networks', difficulty: 'Hard' },
      { name: 'Dynamic Programming Quiz', score: 91, date: '3 weeks ago', category: 'Algorithms', difficulty: 'Medium' }
    ],
    achievements: [
      { name: 'First Steps', description: 'Complete your first quiz', icon: '🎯', earned: true },
      { name: 'Speed Demon', description: 'Complete 10 timed tests', icon: '⚡', earned: true },
      { name: 'Perfect Score', description: 'Achieve 100% in any test', icon: '🏆', earned: false },
      { name: 'Streak Master', description: 'Maintain 7-day streak', icon: '🔥', earned: true },
      { name: 'Topic Expert', description: 'Score 90%+ in all categories', icon: '🧠', earned: false },
      { name: 'Problem Solver', description: 'Solve 100+ coding problems', icon: '💻', earned: true },
      { name: 'Study Marathon', description: 'Study for 100+ hours', icon: '📚', earned: true },
      { name: 'Consistency King', description: 'Maintain 20-day streak', icon: '👑', earned: false }
    ],
    weeklyProgress: [
      { day: 'Mon', practice: 3.5, quiz: 2.8, coding: 1.9 },
      { day: 'Tue', practice: 2.1, quiz: 3.2, coding: 2.7 },
      { day: 'Wed', practice: 4.8, quiz: 1.6, coding: 3.4 },
      { day: 'Thu', practice: 3.9, quiz: 2.9, coding: 2.1 },
      { day: 'Fri', practice: 5.3, quiz: 4.1, coding: 4.6 },
      { day: 'Sat', practice: 6.2, quiz: 3.7, coding: 2.8 },
      { day: 'Sun', practice: 4.1, quiz: 2.4, coding: 3.9 }
    ],
    upcomingTests: [
      { name: 'Advanced Algorithms Mock Test', date: 'Tomorrow', time: '10:00 AM', duration: '90 min' },
      { name: 'Database Design Assessment', date: 'Sept 1', time: '2:00 PM', duration: '75 min' },
      { name: 'System Design Interview Prep', date: 'Sept 3', time: '11:00 AM', duration: '120 min' },
      { name: 'Network Security Quiz', date: 'Sept 5', time: '3:30 PM', duration: '60 min' },
      { name: 'Full Stack Development Test', date: 'Sept 7', time: '9:00 AM', duration: '150 min' }
    ]
  };
  
  saveUserData(sampleData);
  return sampleData;
};

// Check if this is first time user and populate sample data
export const initializeDashboard = () => {
  const existingData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (!existingData) {
    return populateSampleData();
  }
  return getUserData();
};
