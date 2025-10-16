// Programming Analytics Service - Tracks coding problem solving progress
class ProgrammingAnalyticsService {
  constructor() {
    this.storageKey = 'programming_analytics_data';
    this.initializeStorage();
  }

  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        problemHistory: [],
        userStats: {
          totalProblems: 0,
          solvedProblems: 0,
          totalSubmissions: 0,
          totalTimeSpent: 0,
          averageTimePerProblem: 0,
          bestStreak: 0,
          currentStreak: 0,
          languageStats: {},
          difficultyStats: {
            easy: { attempted: 0, solved: 0, averageTime: 0 },
            medium: { attempted: 0, solved: 0, averageTime: 0 },
            hard: { attempted: 0, solved: 0, averageTime: 0 }
          },
          categoryStats: {},
          achievements: [],
          weeklyProgress: this.generateWeeklyTemplate(),
          recentSubmissions: []
        },
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
    
    // Add sample data if none exists
    this.addSampleDataIfEmpty();
  }

  addSampleDataIfEmpty() {
    const data = this.getData();
    if (data && data.userStats.totalProblems === 0) {
      console.log('💻 Adding sample programming data for demonstration...');
      
      const sampleProblems = [
        {
          problemId: 'two-sum',
          title: 'Two Sum',
          difficulty: 'easy',
          language: 'javascript',
          category: 'arrays',
          solved: true,
          timeSpent: 1800, // 30 minutes
          attempts: 2
        },
        {
          problemId: 'reverse-string',
          title: 'Reverse String',
          difficulty: 'easy',
          language: 'python',
          category: 'strings',
          solved: true,
          timeSpent: 900, // 15 minutes
          attempts: 1
        },
        {
          problemId: 'valid-parentheses',
          title: 'Valid Parentheses',
          difficulty: 'easy',
          language: 'javascript',
          category: 'stacks',
          solved: true,
          timeSpent: 1200, // 20 minutes
          attempts: 3
        },
        {
          problemId: 'binary-search',
          title: 'Binary Search',
          difficulty: 'medium',
          language: 'python',
          category: 'algorithms',
          solved: true,
          timeSpent: 2400, // 40 minutes
          attempts: 4
        },
        {
          problemId: 'merge-intervals',
          title: 'Merge Intervals',
          difficulty: 'medium',
          language: 'java',
          category: 'arrays',
          solved: false,
          timeSpent: 1800, // 30 minutes
          attempts: 2
        },
        {
          problemId: 'longest-substring',
          title: 'Longest Substring Without Repeating Characters',
          difficulty: 'medium',
          language: 'cpp',
          category: 'strings',
          solved: true,
          timeSpent: 3000, // 50 minutes
          attempts: 5
        }
      ];

      sampleProblems.forEach((problem, index) => {
        setTimeout(() => {
          this.recordProblemAttempt(problem);
        }, index * 100);
      });
      
      console.log('✅ Sample programming data added successfully!');
    }
  }

  generateWeeklyTemplate() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      problems: 0,
      solved: 0,
      timeSpent: 0,
      languages: []
    }));
  }

  // Record a problem attempt
  recordProblemAttempt(problemData) {
    const data = this.getData();
    const timestamp = new Date();
    
    const problemRecord = {
      id: `problem_${timestamp.getTime()}`,
      problemId: problemData.problemId,
      title: problemData.title,
      difficulty: problemData.difficulty,
      language: problemData.language,
      category: problemData.category,
      solved: problemData.solved,
      timeSpent: problemData.timeSpent,
      attempts: problemData.attempts || 1,
      timestamp: timestamp.toISOString(),
      dayOfWeek: timestamp.toLocaleDateString('en', { weekday: 'long' })
    };
    
    // Add to history
    data.problemHistory.push(problemRecord);
    
    // Update user stats
    this.updateUserStats(data, problemRecord);
    
    // Update weekly progress
    this.updateWeeklyProgress(data, problemRecord);
    
    // Save data
    data.lastUpdated = timestamp.toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    
    console.log('📝 Programming problem recorded:', problemRecord.title);
    return problemRecord;
  }

  updateUserStats(data, problemRecord) {
    const stats = data.userStats;
    
    // Basic stats
    stats.totalProblems++;
    stats.totalSubmissions += problemRecord.attempts;
    stats.totalTimeSpent += problemRecord.timeSpent;
    
    if (problemRecord.solved) {
      stats.solvedProblems++;
    }
    
    stats.averageTimePerProblem = Math.round(stats.totalTimeSpent / stats.totalProblems);
    
    // Language stats
    if (!stats.languageStats[problemRecord.language]) {
      stats.languageStats[problemRecord.language] = {
        attempted: 0,
        solved: 0,
        totalTime: 0,
        averageTime: 0
      };
    }
    
    const langStats = stats.languageStats[problemRecord.language];
    langStats.attempted++;
    langStats.totalTime += problemRecord.timeSpent;
    langStats.averageTime = Math.round(langStats.totalTime / langStats.attempted);
    
    if (problemRecord.solved) {
      langStats.solved++;
    }
    
    // Difficulty stats
    const diffStats = stats.difficultyStats[problemRecord.difficulty];
    if (diffStats) {
      diffStats.attempted++;
      if (problemRecord.solved) {
        diffStats.solved++;
      }
      diffStats.averageTime = Math.round(
        (diffStats.averageTime * (diffStats.attempted - 1) + problemRecord.timeSpent) / diffStats.attempted
      );
    }
    
    // Category stats
    if (!stats.categoryStats[problemRecord.category]) {
      stats.categoryStats[problemRecord.category] = {
        attempted: 0,
        solved: 0,
        totalTime: 0
      };
    }
    
    const catStats = stats.categoryStats[problemRecord.category];
    catStats.attempted++;
    catStats.totalTime += problemRecord.timeSpent;
    
    if (problemRecord.solved) {
      catStats.solved++;
    }
    
    // Update recent submissions
    stats.recentSubmissions.unshift(problemRecord);
    if (stats.recentSubmissions.length > 10) {
      stats.recentSubmissions = stats.recentSubmissions.slice(0, 10);
    }
    
    // Calculate streak
    this.updateStreak(data);
  }

  updateWeeklyProgress(data, problemRecord) {
    const dayName = problemRecord.dayOfWeek;
    const dayProgress = data.userStats.weeklyProgress.find(d => d.day === dayName);
    
    if (dayProgress) {
      dayProgress.problems++;
      dayProgress.timeSpent += problemRecord.timeSpent;
      
      if (problemRecord.solved) {
        dayProgress.solved++;
      }
      
      if (!dayProgress.languages.includes(problemRecord.language)) {
        dayProgress.languages.push(problemRecord.language);
      }
    }
  }

  updateStreak(data) {
    const history = data.problemHistory;
    if (history.length === 0) return;
    
    // Calculate current streak
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasActivity = history.some(p => {
        const problemDate = new Date(p.timestamp).toISOString().split('T')[0];
        return problemDate === dateStr && p.solved;
      });
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) { // Allow missing today
        break;
      }
    }
    
    data.userStats.currentStreak = streak;
    data.userStats.bestStreak = Math.max(data.userStats.bestStreak, streak);
  }

  // Get all data
  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting programming analytics data:', error);
      return null;
    }
  }

  // Get summary statistics
  getSummaryStats() {
    const data = this.getData();
    if (!data) return null;
    
    return {
      ...data.userStats,
      recentActivity: data.problemHistory.slice(-5),
      topLanguages: this.getTopLanguages(data.userStats.languageStats),
      topCategories: this.getTopCategories(data.userStats.categoryStats)
    };
  }

  getTopLanguages(languageStats) {
    return Object.entries(languageStats)
      .map(([lang, stats]) => ({
        language: lang,
        solved: stats.solved,
        attempted: stats.attempted,
        accuracy: stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0
      }))
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 5);
  }

  getTopCategories(categoryStats) {
    return Object.entries(categoryStats)
      .map(([cat, stats]) => ({
        category: cat,
        solved: stats.solved,
        attempted: stats.attempted,
        accuracy: stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0
      }))
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 5);
  }

  // Clear all data
  clearData() {
    localStorage.removeItem(this.storageKey);
    this.initializeStorage();
  }

  // Export data
  exportData() {
    return this.getData();
  }

  // Import data
  importData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}

export default new ProgrammingAnalyticsService();