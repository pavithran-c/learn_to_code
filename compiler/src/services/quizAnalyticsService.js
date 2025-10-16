// Quiz Analytics Service - Handles performance tracking and data analysis
class QuizAnalyticsService {
  constructor() {
    this.storageKey = 'quiz_performance_data';
    this.initializeStorage();
  }

  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        quizHistory: [],
        userStats: {
          totalQuizzes: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          bestScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          categoryStats: {},
          difficultyStats: {
            easy: { attempted: 0, correct: 0 },
            medium: { attempted: 0, correct: 0 },
            hard: { attempted: 0, correct: 0 }
          },
          achievements: [],
          weeklyProgress: this.generateWeeklyTemplate(),
          monthlyProgress: this.generateMonthlyTemplate()
        },
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
    
    // Add some sample data for testing if no data exists
    this.addSampleDataIfEmpty();
  }

  addSampleDataIfEmpty() {
    const data = this.getData();
    if (data && data.userStats.totalQuizzes === 0) {
      console.log('📊 Adding sample quiz data for demonstration...');
      
      // Add sample quiz attempts
      const sampleQuizzes = [
        {
          category: 'programming_fundamentals',
          categoryTitle: 'Programming Fundamentals',
          score: 85,
          totalQuestions: 15,
          correctAnswers: 13,
          timeSpent: 900,
          difficulty: 'mixed'
        },
        {
          category: 'data_structures',
          categoryTitle: 'Data Structures',
          score: 92,
          totalQuestions: 18,
          correctAnswers: 17,
          timeSpent: 1080,
          difficulty: 'mixed'
        },
        {
          category: 'web_development',
          categoryTitle: 'Web Development',
          score: 78,
          totalQuestions: 12,
          correctAnswers: 9,
          timeSpent: 720,
          difficulty: 'mixed'
        },
        {
          category: 'algorithms',
          categoryTitle: 'Algorithms',
          score: 88,
          totalQuestions: 10,
          correctAnswers: 9,
          timeSpent: 600,
          difficulty: 'mixed'
        },
        {
          category: 'machine_learning',
          categoryTitle: 'Machine Learning',
          score: 75,
          totalQuestions: 8,
          correctAnswers: 6,
          timeSpent: 480,
          difficulty: 'mixed'
        }
      ];

      sampleQuizzes.forEach((quiz, index) => {
        // Add some delay to create realistic timestamps
        setTimeout(() => {
          this.recordQuizCompletion({
            ...quiz,
            answers: {},
            questionDetails: []
          });
        }, index * 50);
      });
      
      console.log('✅ Sample quiz data added successfully!');
    }
  }

  generateWeeklyTemplate() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      quizzes: 0,
      questions: 0,
      correct: 0,
      timeSpent: 0,
      avgScore: 0
    }));
  }

  generateMonthlyTemplate() {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.unshift({
        month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
        quizzes: 0,
        questions: 0,
        correct: 0,
        avgScore: 0,
        improvement: 0
      });
    }
    return months;
  }

  // Record a completed quiz
  recordQuizCompletion(quizResult) {
    const data = this.getData();
    const timestamp = new Date();
    
    // Create quiz record
    const quizRecord = {
      id: `quiz_${timestamp.getTime()}`,
      category: quizResult.category,
      categoryTitle: quizResult.categoryTitle || quizResult.category,
      score: quizResult.score,
      totalQuestions: quizResult.totalQuestions,
      correctAnswers: quizResult.correctAnswers,
      incorrectAnswers: quizResult.totalQuestions - quizResult.correctAnswers,
      timeSpent: quizResult.timeSpent,
      accuracy: (quizResult.correctAnswers / quizResult.totalQuestions) * 100,
      difficulty: quizResult.difficulty || 'mixed',
      timestamp: timestamp.toISOString(),
      answers: quizResult.answers || [],
      questionDetails: quizResult.questionDetails || []
    };

    // Add to history
    data.quizHistory.unshift(quizRecord);
    
    // Keep only last 100 records to prevent storage overflow
    if (data.quizHistory.length > 100) {
      data.quizHistory = data.quizHistory.slice(0, 100);
    }

    // Update user stats
    this.updateUserStats(data, quizRecord);
    
    // Update category stats
    this.updateCategoryStats(data, quizRecord);
    
    // Update difficulty stats
    this.updateDifficultyStats(data, quizRecord);
    
    // Update time-based progress
    this.updateTimeBasedProgress(data, quizRecord, timestamp);
    
    // Check for achievements
    this.checkAchievements(data, quizRecord);
    
    // Save updated data
    data.lastUpdated = timestamp.toISOString();
    this.saveData(data);
    
    return quizRecord;
  }

  updateUserStats(data, quizRecord) {
    const stats = data.userStats;
    
    // Basic stats
    stats.totalQuizzes++;
    stats.totalQuestions += quizRecord.totalQuestions;
    stats.totalCorrect += quizRecord.correctAnswers;
    stats.totalTimeSpent += quizRecord.timeSpent;
    
    // Calculate new average
    stats.averageScore = ((stats.averageScore * (stats.totalQuizzes - 1)) + quizRecord.score) / stats.totalQuizzes;
    
    // Update best score
    if (quizRecord.score > stats.bestScore) {
      stats.bestScore = quizRecord.score;
    }
    
    // Update streak
    if (quizRecord.accuracy >= 70) { // Consider 70% as passing
      stats.currentStreak++;
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
    } else {
      stats.currentStreak = 0;
    }
  }

  updateCategoryStats(data, quizRecord) {
    const category = quizRecord.category;
    if (!data.userStats.categoryStats[category]) {
      data.userStats.categoryStats[category] = {
        attempts: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        bestScore: 0,
        scores: [],
        lastAttempted: null,
        improvement: 0
      };
    }

    const categoryStats = data.userStats.categoryStats[category];
    
    // Update category stats
    categoryStats.attempts++;
    categoryStats.totalQuestions += quizRecord.totalQuestions;
    categoryStats.totalCorrect += quizRecord.correctAnswers;
    categoryStats.totalTimeSpent += quizRecord.timeSpent;
    categoryStats.lastAttempted = quizRecord.timestamp;
    
    // Calculate new average
    categoryStats.averageScore = ((categoryStats.averageScore * (categoryStats.attempts - 1)) + quizRecord.score) / categoryStats.attempts;
    
    // Update best score
    if (quizRecord.score > categoryStats.bestScore) {
      categoryStats.bestScore = quizRecord.score;
    }
    
    // Track score progression
    categoryStats.scores.push(quizRecord.score);
    if (categoryStats.scores.length > 10) {
      categoryStats.scores = categoryStats.scores.slice(-10); // Keep last 10 scores
    }
    
    // Calculate improvement (compare first and last 3 attempts)
    if (categoryStats.scores.length >= 6) {
      const firstThree = categoryStats.scores.slice(0, 3).reduce((a, b) => a + b) / 3;
      const lastThree = categoryStats.scores.slice(-3).reduce((a, b) => a + b) / 3;
      categoryStats.improvement = ((lastThree - firstThree) / firstThree) * 100;
    }
  }

  updateDifficultyStats(data, quizRecord) {
    // For now, we'll estimate difficulty based on accuracy
    let difficulty;
    if (quizRecord.accuracy >= 80) difficulty = 'easy';
    else if (quizRecord.accuracy >= 60) difficulty = 'medium';
    else difficulty = 'hard';

    if (quizRecord.difficulty && ['easy', 'medium', 'hard'].includes(quizRecord.difficulty)) {
      difficulty = quizRecord.difficulty;
    }

    const diffStats = data.userStats.difficultyStats[difficulty];
    diffStats.attempted += quizRecord.totalQuestions;
    diffStats.correct += quizRecord.correctAnswers;
  }

  updateTimeBasedProgress(data, quizRecord, timestamp) {
    // Update weekly progress
    const dayOfWeek = timestamp.getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0
    
    const weeklyDay = data.userStats.weeklyProgress[dayIndex];
    weeklyDay.quizzes++;
    weeklyDay.questions += quizRecord.totalQuestions;
    weeklyDay.correct += quizRecord.correctAnswers;
    weeklyDay.timeSpent += quizRecord.timeSpent;
    weeklyDay.avgScore = ((weeklyDay.avgScore * (weeklyDay.quizzes - 1)) + quizRecord.score) / weeklyDay.quizzes;

    // Update monthly progress
    const currentMonth = timestamp.toLocaleString('default', { month: 'long', year: 'numeric' });
    const monthData = data.userStats.monthlyProgress.find(m => m.month === currentMonth);
    
    if (monthData) {
      monthData.quizzes++;
      monthData.questions += quizRecord.totalQuestions;
      monthData.correct += quizRecord.correctAnswers;
      monthData.avgScore = ((monthData.avgScore * (monthData.quizzes - 1)) + quizRecord.score) / monthData.quizzes;
    }
  }

  checkAchievements(data, quizRecord) {
    const achievements = data.userStats.achievements;
    const stats = data.userStats;
    
    // First quiz achievement
    if (stats.totalQuizzes === 1) {
      achievements.push({
        id: 'first_quiz',
        title: 'Getting Started',
        description: 'Completed your first quiz',
        icon: '🎯',
        unlockedAt: new Date().toISOString(),
        category: 'milestone'
      });
    }
    
    // Perfect score achievement
    if (quizRecord.accuracy === 100) {
      achievements.push({
        id: 'perfect_score',
        title: 'Perfect Score',
        description: 'Achieved 100% accuracy in a quiz',
        icon: '🏆',
        unlockedAt: new Date().toISOString(),
        category: 'performance'
      });
    }
    
    // Streak achievements
    if (stats.currentStreak === 5) {
      achievements.push({
        id: 'streak_5',
        title: 'On Fire',
        description: 'Maintained a 5-quiz winning streak',
        icon: '🔥',
        unlockedAt: new Date().toISOString(),
        category: 'streak'
      });
    }
    
    // Volume achievements
    if (stats.totalQuizzes === 10) {
      achievements.push({
        id: 'quiz_10',
        title: 'Quiz Master',
        description: 'Completed 10 quizzes',
        icon: '📚',
        unlockedAt: new Date().toISOString(),
        category: 'milestone'
      });
    }
    
    // Speed achievements
    if (quizRecord.timeSpent > 0) {
      const avgTimePerQuestion = quizRecord.timeSpent / quizRecord.totalQuestions;
      if (avgTimePerQuestion < 30 && quizRecord.accuracy >= 80) { // Less than 30 seconds per question with good accuracy
        achievements.push({
          id: 'speed_demon',
          title: 'Speed Demon',
          description: 'Completed quiz quickly with high accuracy',
          icon: '⚡',
          unlockedAt: new Date().toISOString(),
          category: 'performance'
        });
      }
    }
    
    // Remove duplicate achievements
    data.userStats.achievements = achievements.filter((achievement, index, self) =>
      index === self.findIndex(a => a.id === achievement.id)
    );
  }

  // Get performance data
  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Get quiz history with filters
  getQuizHistory(filters = {}) {
    const data = this.getData();
    let history = data.quizHistory || [];

    // Apply filters
    if (filters.category) {
      history = history.filter(quiz => quiz.category === filters.category);
    }
    
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      history = history.filter(quiz => {
        const quizDate = new Date(quiz.timestamp);
        return quizDate >= start && quizDate <= end;
      });
    }
    
    if (filters.limit) {
      history = history.slice(0, filters.limit);
    }

    return history;
  }

  // Get user statistics
  getUserStats() {
    const data = this.getData();
    return data?.userStats || {};
  }

  // Get category performance analysis
  getCategoryAnalysis() {
    const data = this.getData();
    const categoryStats = data?.userStats?.categoryStats || {};
    
    return Object.keys(categoryStats).map(category => {
      const stats = categoryStats[category];
      const accuracy = stats.totalQuestions > 0 ? (stats.totalCorrect / stats.totalQuestions) * 100 : 0;
      const avgTimePerQuestion = stats.totalQuestions > 0 ? stats.totalTimeSpent / stats.totalQuestions : 0;
      
      return {
        category,
        accuracy: accuracy.toFixed(1),
        averageScore: stats.averageScore.toFixed(1),
        attempts: stats.attempts,
        improvement: stats.improvement.toFixed(1),
        avgTimePerQuestion: (avgTimePerQuestion / 60).toFixed(1), // Convert to minutes
        lastAttempted: stats.lastAttempted,
        trend: this.calculateTrend(stats.scores)
      };
    });
  }

  calculateTrend(scores) {
    if (scores.length < 3) return 'stable';
    
    const recent = scores.slice(-3);
    const earlier = scores.slice(-6, -3);
    
    if (earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b) / earlier.length;
    
    const difference = recentAvg - earlierAvg;
    
    if (difference > 5) return 'up';
    if (difference < -5) return 'down';
    return 'stable';
  }

  // Get learning insights and recommendations
  getLearningInsights() {
    const data = this.getData();
    const stats = data?.userStats;
    const history = data?.quizHistory || [];
    
    if (!stats || history.length === 0) {
      return {
        insights: [],
        recommendations: [],
        goals: []
      };
    }

    const insights = [];
    const recommendations = [];
    const goals = [];

    // Analyze performance trends
    if (history.length >= 5) {
      const recentScores = history.slice(0, 5).map(q => q.score);
      const averageRecent = recentScores.reduce((a, b) => a + b) / recentScores.length;
      
      if (averageRecent > stats.averageScore) {
        insights.push({
          type: 'positive',
          title: 'Improving Performance',
          description: `Your recent quiz scores (${averageRecent.toFixed(1)}%) are above your overall average (${stats.averageScore.toFixed(1)}%)`
        });
      } else if (averageRecent < stats.averageScore - 10) {
        insights.push({
          type: 'warning',
          title: 'Performance Dip',
          description: `Your recent scores are below your average. Consider reviewing fundamentals.`
        });
        recommendations.push({
          priority: 'high',
          title: 'Review Core Concepts',
          description: 'Focus on fundamental concepts in your weakest categories',
          action: 'practice_fundamentals'
        });
      }
    }

    // Category-specific insights
    const categoryAnalysis = this.getCategoryAnalysis();
    const weakestCategory = categoryAnalysis.reduce((worst, current) => 
      parseFloat(current.accuracy) < parseFloat(worst?.accuracy || 100) ? current : worst
    , null);
    
    const strongestCategory = categoryAnalysis.reduce((best, current) => 
      parseFloat(current.accuracy) > parseFloat(best?.accuracy || 0) ? current : best
    , null);

    if (weakestCategory) {
      recommendations.push({
        priority: 'medium',
        title: `Improve ${weakestCategory.category.replace(/_/g, ' ')}`,
        description: `Your accuracy in this area is ${weakestCategory.accuracy}%. Focus on practice.`,
        action: 'practice_category',
        category: weakestCategory.category
      });
    }

    if (strongestCategory && parseFloat(strongestCategory.accuracy) > 90) {
      insights.push({
        type: 'positive',
        title: 'Category Mastery',
        description: `You've mastered ${strongestCategory.category.replace(/_/g, ' ')} with ${strongestCategory.accuracy}% accuracy`
      });
    }

    // Time-based insights
    const totalMinutes = stats.totalTimeSpent / 60;
    const avgMinutesPerQuestion = totalMinutes / stats.totalQuestions;
    
    if (avgMinutesPerQuestion > 2) {
      recommendations.push({
        priority: 'low',
        title: 'Speed Practice',
        description: 'Consider practicing under time pressure to improve your speed',
        action: 'speed_practice'
      });
    }

    // Set goals based on current performance
    goals.push({
      id: 'accuracy_goal',
      title: 'Accuracy Target',
      description: `Achieve 90% accuracy overall (current: ${((stats.totalCorrect / stats.totalQuestions) * 100).toFixed(1)}%)`,
      target: 90,
      current: (stats.totalCorrect / stats.totalQuestions) * 100,
      type: 'accuracy'
    });

    if (stats.currentStreak < 5) {
      goals.push({
        id: 'streak_goal',
        title: 'Winning Streak',
        description: `Maintain a 5-quiz winning streak (current: ${stats.currentStreak})`,
        target: 5,
        current: stats.currentStreak,
        type: 'streak'
      });
    }

    return { insights, recommendations, goals };
  }

  // Export data for analysis
  exportData() {
    const data = this.getData();
    return {
      exportDate: new Date().toISOString(),
      ...data
    };
  }

  // Reset all data (for testing or fresh start)
  resetData() {
    localStorage.removeItem(this.storageKey);
    this.initializeStorage();
  }

  // Debug method to log current state
  debugData() {
    const data = this.getData();
    console.log('🔍 Quiz Analytics Debug:', data);
    return data;
  }

  // Method to force add sample data
  addSampleData() {
    this.resetData();
    // The addSampleDataIfEmpty will be called automatically in initializeStorage
    console.log('🔧 Sample data added. Current data:', this.getData());
  }
}

// Create singleton instance
const quizAnalyticsService = new QuizAnalyticsService();

// Add debug methods to window for testing
if (typeof window !== 'undefined') {
  window.quizAnalyticsService = quizAnalyticsService;
  console.log('🔧 Quiz Analytics Service available at window.quizAnalyticsService');
}

export default quizAnalyticsService;