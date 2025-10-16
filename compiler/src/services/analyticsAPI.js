// Analytics API Service for Dashboard
import quizAnalyticsService from './quizAnalyticsService';
import programmingAnalyticsService from './programmingAnalyticsService';

const API_BASE_URL = 'http://localhost:5000/api';

class AnalyticsAPIService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async fetchWithAuth(url, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }

  // Get comprehensive user analytics
  async getUserAnalytics(days = 30) {
    const url = `${API_BASE_URL}/auth/analytics?days=${days}`;
    return await this.fetchWithAuth(url);
  }

  // Get user progress data
  async getUserProgress() {
    const url = `${API_BASE_URL}/auth/progress`;
    return await this.fetchWithAuth(url);
  }

  // Get user submissions
  async getUserSubmissions(limit = 50, problemId = null) {
    let url = `${API_BASE_URL}/auth/submissions?limit=${limit}`;
    if (problemId) {
      url += `&problem_id=${problemId}`;
    }
    return await this.fetchWithAuth(url);
  }

  // Get skill analysis
  async getSkillAnalysis() {
    const url = `${API_BASE_URL}/auth/skill-analysis`;
    return await this.fetchWithAuth(url);
  }

  // Test authentication endpoint
  async testAuth() {
    const url = `${API_BASE_URL}/auth/test-auth`;
    return await this.fetchWithAuth(url);
  }

  // Get local quiz analytics data
  getLocalQuizData() {
    try {
      const quizData = quizAnalyticsService.getData();
      console.log('📊 Local quiz data:', quizData);
      return quizData;
    } catch (error) {
      console.error('Error getting local quiz data:', error);
      return null;
    }
  }

  // Get programming problem data from localStorage
  getLocalProgrammingData() {
    try {
      const programmingData = programmingAnalyticsService.getSummaryStats();
      console.log('💻 Local programming data:', programmingData);
      return programmingData;
    } catch (error) {
      console.error('Error getting programming data:', error);
      return null;
    }
  }

  // Get comprehensive dashboard analytics (preferred method)
  async getDashboardAnalytics(days = 30) {
    const url = `${API_BASE_URL}/auth/dashboard-analytics?days=${days}`;
    return await this.fetchWithAuth(url);
  }

  // Get quiz performance data
  async getQuizPerformance() {
    try {
      // Test authentication first
      console.log('🔐 Testing authentication...');
      const authTest = await this.testAuth();
      console.log('🔐 Auth test result:', authTest);
      
      // Get local quiz data
      console.log('📊 Getting local quiz analytics...');
      const localQuizData = this.getLocalQuizData();
      
      // Get local programming data
      console.log('💻 Getting local programming data...');
      const programmingData = this.getLocalProgrammingData();
      
      // Combine local data to create comprehensive analytics
      console.log('🔄 Processing combined analytics...');
      return this.processLocalData(localQuizData, programmingData);
      
    } catch (error) {
      console.error('❌ Error fetching quiz performance:', error);
      
      // Even if API fails, try to get local data
      try {
        const localQuizData = this.getLocalQuizData();
        const programmingData = this.getLocalProgrammingData();
        return this.processLocalData(localQuizData, programmingData);
      } catch (localError) {
        console.error('❌ Error getting local data:', localError);
        throw error;
      }
    }
  }

  // Process local quiz and programming data
  processLocalData(quizData, programmingData) {
    const quizStats = quizData?.userStats || {};
    const quizHistory = quizData?.quizHistory || [];
    
    // Calculate combined statistics
    const totalQuizzes = quizStats.totalQuizzes || 0;
    const totalProgrammingProblems = programmingData?.solvedProblems || 0;
    const totalProgrammingAttempts = programmingData?.totalProblems || 0;
    
    // Process quiz categories
    const quizCategories = this.processQuizCategories(quizStats.categoryStats || {}, quizHistory);
    
    // Process programming categories
    const programmingCategories = this.processProgrammingCategories(programmingData);
    
    // Combine categories
    const allCategories = [...quizCategories, ...programmingCategories];
    
    // Create recent scores timeline from quiz history
    const recentScores = this.createQuizScoreTimeline(quizHistory);
    
    // Generate recommendations based on actual data
    const recommendations = this.generateLocalRecommendations(quizStats, programmingData, allCategories);
    
    // Calculate streak from quiz data
    const quizStreak = this.calculateQuizStreak(quizHistory);
    const programmingStreak = programmingData?.currentStreak || 0;
    const combinedStreak = Math.max(quizStreak, programmingStreak);
    
    return {
      userStats: {
        totalQuizzes: totalQuizzes,
        problemsSolved: totalProgrammingProblems,
        currentStreak: combinedStreak,
        totalScore: Math.round(quizStats.averageScore || 0),
        averageAccuracy: Math.round(((quizStats.totalCorrect || 0) / Math.max(quizStats.totalQuestions || 1, 1)) * 100),
        studyHours: Math.round(((quizStats.totalTimeSpent || 0) + (programmingData?.totalTimeSpent || 0)) / 3600)
      },
      quizPerformance: {
        byCategory: allCategories,
        recentScores: recentScores
      },
      recommendations: recommendations,
      skillAnalysis: {
        quizStats: quizStats,
        programmingStats: programmingData
      },
      learningMetrics: {
        learningVelocity: this.calculateLearningVelocity(quizHistory),
        consistencyScore: this.calculateConsistency(quizHistory),
        dailyActivity: quizStats.weeklyProgress || []
      }
    };
  }

  // Process quiz categories from local data
  processQuizCategories(categoryStats, quizHistory) {
    const categories = [];
    
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const categoryQuizzes = quizHistory.filter(q => q.category === category);
      const totalQuestions = stats.totalQuestions || 0;
      const correctAnswers = stats.totalCorrect || 0;
      
      categories.push({
        name: stats.title || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        solved: categoryQuizzes.length,
        total: Math.max(categoryQuizzes.length, 10), // Assume 10 available quizzes per category
        accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        type: 'quiz'
      });
    });
    
    return categories;
  }

  // Process programming categories from local data
  processProgrammingCategories(programmingData) {
    if (!programmingData || !programmingData.languageStats) {
      return [];
    }
    
    const categories = [];
    
    Object.entries(programmingData.languageStats).forEach(([language, stats]) => {
      if (stats.attempted > 0 || stats.solved > 0) {
        categories.push({
          name: `${language.charAt(0).toUpperCase() + language.slice(1)} Programming`,
          score: stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0,
          totalQuestions: stats.attempted || 0,
          correct: stats.solved || 0,
          improvement: stats.improvement || 0,
          color: this.getProgrammingLanguageColor(language)
        });
      }
    });
    
    // Add difficulty-based categories if available
    if (programmingData.difficultyStats) {
      Object.entries(programmingData.difficultyStats).forEach(([difficulty, stats]) => {
        if (stats.attempted > 0 || stats.solved > 0) {
          categories.push({
            name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Problems`,
            score: stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0,
            totalQuestions: stats.attempted || 0,
            correct: stats.solved || 0,
            improvement: stats.improvement || 0,
            color: this.getDifficultyColor(difficulty)
          });
        }
      });
    }
    
    return categories;
  }

  // Create quiz score timeline
  createQuizScoreTimeline(quizHistory) {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayQuizzes = quizHistory.filter(q => {
        const quizDate = new Date(q.timestamp).toISOString().split('T')[0];
        return quizDate === dateStr;
      });
      
      const avgScore = dayQuizzes.length > 0 ?
        dayQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / dayQuizzes.length :
        0;
      
      last7Days.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        score: Math.round(avgScore)
      });
    }
    
    return last7Days;
  }

  // Calculate quiz streak
  calculateQuizStreak(quizHistory) {
    if (!quizHistory.length) return 0;
    
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasQuiz = quizHistory.some(q => {
        const quizDate = new Date(q.timestamp).toISOString().split('T')[0];
        return quizDate === dateStr;
      });
      
      if (hasQuiz) {
        streak++;
      } else if (i > 0) { // Allow missing today if it's still early
        break;
      }
    }
    
    return streak;
  }

  // Calculate learning velocity
  calculateLearningVelocity(quizHistory) {
    if (quizHistory.length < 4) return 0;
    
    const scores = quizHistory.map(q => q.score || 0);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return Math.round(secondAvg - firstAvg);
  }

  // Calculate consistency score
  calculateConsistency(quizHistory) {
    if (quizHistory.length < 2) return 100;
    
    const scores = quizHistory.map(q => q.score || 0);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.max(0, Math.round(100 - (stdDev * 2))); // Higher is more consistent
  }

  // Generate recommendations based on local data
  generateLocalRecommendations(quizStats, programmingData, categories) {
    const recommendations = [];
    
    // Find weakest categories
    const weakCategories = categories.filter(cat => cat.accuracy < 70 && cat.solved > 0);
    if (weakCategories.length > 0) {
      const weakest = weakCategories.sort((a, b) => a.accuracy - b.accuracy)[0];
      recommendations.push({
        type: 'weakness',
        title: `Improve ${weakest.name} Skills`,
        description: `Your accuracy in ${weakest.name} is ${weakest.accuracy}%. Focus on practicing more ${weakest.type === 'quiz' ? 'quizzes' : 'problems'} in this area.`,
        priority: 'high',
        action: `Practice ${weakest.name} ${weakest.type === 'quiz' ? 'Quizzes' : 'Problems'}`
      });
    }
    
    // Find strongest categories
    const strongCategories = categories.filter(cat => cat.accuracy > 85 && cat.solved > 2);
    if (strongCategories.length > 0) {
      const strongest = strongCategories.sort((a, b) => b.accuracy - a.accuracy)[0];
      recommendations.push({
        type: 'strength',
        title: `Excellent ${strongest.name} Performance`,
        description: `You're performing exceptionally well in ${strongest.name} with ${strongest.accuracy}% accuracy. Consider advancing to more challenging topics.`,
        priority: 'medium',
        action: `Try Advanced ${strongest.name}`
      });
    }
    
    // Streak recommendation
    const totalQuizzes = quizStats.totalQuizzes || 0;
    const totalProblems = programmingData?.solvedProblems || 0;
    
    if (totalQuizzes + totalProblems > 5) {
      recommendations.push({
        type: 'streak',
        title: 'Build Consistency',
        description: 'You\'re making good progress! Try to maintain a daily learning routine to build momentum.',
        priority: 'medium',
        action: 'Continue Daily Practice'
      });
    } else {
      recommendations.push({
        type: 'motivation',
        title: 'Get Started with Learning',
        description: 'Take more quizzes and solve programming problems to unlock detailed analytics and personalized recommendations.',
        priority: 'high',
        action: 'Take More Quizzes'
      });
    }
    
    // Programming vs Quiz balance
    if (totalQuizzes > totalProblems * 2) {
      recommendations.push({
        type: 'balance',
        title: 'Try More Programming Challenges',
        description: 'You\'ve been focusing on quizzes. Balance your learning by solving more programming problems.',
        priority: 'medium',
        action: 'Solve Programming Problems'
      });
    } else if (totalProblems > totalQuizzes * 2) {
      recommendations.push({
        type: 'balance',
        title: 'Take More Knowledge Quizzes',
        description: 'You\'ve been solving lots of problems. Strengthen your theoretical knowledge with quizzes.',
        priority: 'medium',
        action: 'Take Knowledge Quizzes'
      });
    }
    
    return recommendations;
  }

  // Process and combine data for dashboard
  processQuizData(analytics, submissions, skillAnalysis) {
    const analyticsData = analytics.analytics || {};
    const submissionsData = submissions.submissions || [];
    const skillsData = skillAnalysis.analysis || {};

    // Calculate basic stats
    const totalAttempts = analyticsData.total_attempts || 0;
    const successRate = analyticsData.success_rate || 0;
    const averageScore = analyticsData.average_score || 0;
    
    // Process submissions by category
    const categoryStats = this.processCategoryStats(submissionsData);
    
    // Create recent scores timeline
    const recentScores = this.createScoreTimeline(submissionsData);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      analyticsData,
      categoryStats,
      skillsData
    );

    // Calculate study metrics
    const studyMetrics = this.calculateStudyMetrics(submissionsData);

    return {
      userStats: {
        totalQuizzes: totalAttempts,
        problemsSolved: submissionsData.filter(s => s.status === 'accepted').length,
        currentStreak: this.calculateStreak(submissionsData),
        totalScore: Math.round(averageScore * totalAttempts),
        averageAccuracy: Math.round(successRate),
        studyHours: studyMetrics.totalHours
      },
      quizPerformance: {
        byCategory: categoryStats,
        recentScores: recentScores
      },
      recommendations: recommendations,
      skillAnalysis: skillsData,
      learningMetrics: {
        learningVelocity: analyticsData.learning_velocity || 0,
        consistencyScore: analyticsData.consistency_score || 0,
        dailyActivity: analyticsData.daily_activity || []
      }
    };
  }

  processCategoryStats(submissions) {
    const categories = {};
    
    submissions.forEach(submission => {
      const category = submission.problem_details?.category || 
                     submission.problem_details?.tags?.[0] || 
                     'General';
      
      if (!categories[category]) {
        categories[category] = {
          name: category,
          attempted: 0,
          solved: 0,
          total: 0,
          scores: []
        };
      }
      
      categories[category].attempted++;
      if (submission.status === 'accepted') {
        categories[category].solved++;
      }
      if (submission.score) {
        categories[category].scores.push(submission.score);
      }
    });

    // Convert to array and calculate accuracy
    return Object.values(categories).map(cat => ({
      name: cat.name,
      solved: cat.solved,
      total: Math.max(cat.attempted, 20), // Assume 20 problems per category minimum
      accuracy: cat.scores.length > 0 ? 
        Math.round(cat.scores.reduce((a, b) => a + b, 0) / cat.scores.length) : 0
    }));
  }

  createScoreTimeline(submissions) {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySubmissions = submissions.filter(s => {
        const subDate = new Date(s.timestamp).toISOString().split('T')[0];
        return subDate === dateStr;
      });
      
      const avgScore = daySubmissions.length > 0 ?
        daySubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / daySubmissions.length :
        0;
      
      last7Days.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        score: Math.round(avgScore)
      });
    }
    
    return last7Days;
  }

  calculateStreak(submissions) {
    if (!submissions.length) return 0;
    
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasActivity = submissions.some(s => {
        const subDate = new Date(s.timestamp).toISOString().split('T')[0];
        return subDate === dateStr;
      });
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) { // Allow missing today if it's still early
        break;
      }
    }
    
    return streak;
  }

  calculateStudyMetrics(submissions) {
    const totalSessions = submissions.length;
    const avgTimePerProblem = 15; // Assume 15 minutes per problem on average
    const totalHours = Math.round((totalSessions * avgTimePerProblem) / 60);
    
    return {
      totalHours,
      totalSessions,
      avgTimePerProblem
    };
  }

  generateRecommendations(analytics, categoryStats, skillsData) {
    const recommendations = [];
    
    // Find weakest category
    const weakestCategory = categoryStats.reduce((min, cat) => 
      cat.accuracy < min.accuracy ? cat : min, categoryStats[0] || { accuracy: 100 });
    
    if (weakestCategory && weakestCategory.accuracy < 70) {
      recommendations.push({
        type: 'weakness',
        title: `Improve ${weakestCategory.name} Skills`,
        description: `Your accuracy in ${weakestCategory.name} is ${weakestCategory.accuracy}%. Focus on fundamental concepts and practice more problems.`,
        priority: 'high',
        action: `Practice ${weakestCategory.name} Problems`
      });
    }
    
    // Find strongest category
    const strongestCategory = categoryStats.reduce((max, cat) => 
      cat.accuracy > max.accuracy ? cat : max, categoryStats[0] || { accuracy: 0 });
    
    if (strongestCategory && strongestCategory.accuracy > 85) {
      recommendations.push({
        type: 'strength',
        title: `Excellent ${strongestCategory.name} Performance`,
        description: `You're performing exceptionally well in ${strongestCategory.name} with ${strongestCategory.accuracy}% accuracy. Consider advanced topics.`,
        priority: 'medium',
        action: `Try Advanced ${strongestCategory.name}`
      });
    }
    
    // Streak recommendation
    const streak = this.calculateStreak([]);
    if (streak > 3) {
      recommendations.push({
        type: 'streak',
        title: 'Maintain Your Streak',
        description: `You're on a ${streak}-day streak! Keep it up by solving at least one problem daily.`,
        priority: 'medium',
        action: 'Continue Daily Practice'
      });
    } else {
      recommendations.push({
        type: 'motivation',
        title: 'Build a Learning Streak',
        description: 'Start a daily practice routine to improve consistency and retention.',
        priority: 'medium',
        action: 'Start Daily Practice'
      });
    }
    
    // Consistency recommendation
    if (analytics.consistency_score < 60) {
      recommendations.push({
        type: 'consistency',
        title: 'Improve Consistency',
        description: 'Your performance varies significantly. Focus on consistent daily practice to improve stability.',
        priority: 'high',
        action: 'Practice Regularly'
      });
    }
    
    return recommendations;
  }

  // Helper method for programming language colors
  getProgrammingLanguageColor(language) {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#f89820',
      cpp: '#00599c',
      c: '#a8b9cc',
      typescript: '#3178c6',
      go: '#00add8',
      rust: '#000000',
      php: '#777bb4',
      ruby: '#cc342d'
    };
    return colors[language.toLowerCase()] || '#8884d8';
  }

  // Helper method for difficulty colors
  getDifficultyColor(difficulty) {
    const colors = {
      easy: '#4ade80',
      medium: '#fbbf24',
      hard: '#ef4444'
    };
    return colors[difficulty.toLowerCase()] || '#8884d8';
  }
}

export default new AnalyticsAPIService();