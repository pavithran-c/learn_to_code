import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Code, Trophy, Clock, Target, BarChart2, Users, 
  BookOpen, ChevronRight, Play, Award, Briefcase,
  ArrowLeft, CheckCircle, XCircle, Star
} from 'lucide-react';
import CodingProblems from './CodingProblems';
import CompetitiveQuiz from './CompetitiveQuiz';
import ProgrammingQuiz from './ProgrammingQuiz';

const placementCompanies = [
  {
    name: 'TCS NQT',
    logo: '🏢',
    difficulty: 'Easy-Medium',
    topics: ['Aptitude', 'Programming', 'English'],
    avgPackage: '3.5-7 LPA',
    testPattern: 'Online Test + Interview',
    color: 'bg-blue-500'
  },
  {
    name: 'Infosys Specialst',
    logo: '💼',
    difficulty: 'Medium',
    topics: ['DSA', 'OOPS', 'Database'],
    avgPackage: '4-9 LPA',
    testPattern: 'Coding + Technical Interview',
    color: 'bg-green-500'
  },
  {
    name: 'Wipro WILP',
    logo: '🌐',
    difficulty: 'Medium',
    topics: ['Coding', 'Aptitude', 'Verbal'],
    avgPackage: '3.5-8 LPA',
    testPattern: 'Online Assessment + HR',
    color: 'bg-purple-500'
  },
  {
    name: 'Amazon SDE',
    logo: '📦',
    difficulty: 'Hard',
    topics: ['DSA', 'System Design', 'Problem Solving'],
    avgPackage: '15-40 LPA',
    testPattern: 'OA + Multiple Technical Rounds',
    color: 'bg-orange-500'
  },
  {
    name: 'Microsoft IDC',
    logo: '🖥️',
    difficulty: 'Hard',
    topics: ['DSA', 'System Design', 'Architecture'],
    avgPackage: '18-50 LPA',
    testPattern: 'Coding + Design + Behavioral',
    color: 'bg-blue-600'
  },
  {
    name: 'Google SDE',
    logo: '🔍',
    difficulty: 'Hard',
    topics: ['Algorithms', 'Data Structures', 'Math'],
    avgPackage: '25-60 LPA',
    testPattern: 'Multiple Coding Rounds',
    color: 'bg-red-500'
  }
];

const practiceCategories = [
  {
    title: 'Coding Problems',
    description: 'LeetCode-style programming challenges',
    icon: <Code className="w-8 h-8" />,
    component: 'coding',
    color: 'bg-gradient-to-r from-blue-500 to-purple-600',
    stats: { problems: 150, solved: 45 }
  },
  {
    title: 'Aptitude Quiz',
    description: 'Quantitative, Logical & Verbal reasoning',
    icon: <BarChart2 className="w-8 h-8" />,
    component: 'aptitude',
    color: 'bg-gradient-to-r from-green-500 to-teal-600',
    stats: { questions: 500, accuracy: '78%' }
  },
  {
    title: 'Technical Quiz',
    description: 'Programming concepts & theory',
    icon: <BookOpen className="w-8 h-8" />,
    component: 'technical',
    color: 'bg-gradient-to-r from-orange-500 to-red-600',
    stats: { topics: 25, completed: 12 }
  }
];

const Placements = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const renderOverview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Placement <span className="text-blue-600">Preparation Hub</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive preparation platform for top tech companies and placement drives
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Problems Solved</p>
              <p className="text-3xl font-bold text-gray-900">45</p>
            </div>
            <Code className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Accuracy</p>
              <p className="text-3xl font-bold text-gray-900">78%</p>
            </div>
            <Target className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Study Streak</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
            <Trophy className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Global Rank</p>
              <p className="text-3xl font-bold text-gray-900">1,247</p>
            </div>
            <Award className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </motion.div>

      {/* Practice Categories */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Practice Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {practiceCategories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
              onClick={() => setActiveView(category.component)}
            >
              <div className={`${category.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  {category.icon}
                  <ChevronRight className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                <p className="text-white/80">{category.description}</p>
              </div>
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{Object.keys(category.stats)[0]}: {Object.values(category.stats)[0]}</span>
                  <span>{Object.keys(category.stats)[1]}: {Object.values(category.stats)[1]}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Company-wise Preparation */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Company-wise Preparation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placementCompanies.map((company, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
              onClick={() => setSelectedCompany(company)}
            >
              <div className="flex items-center mb-4">
                <div className={`${company.color} p-3 rounded-full text-white text-2xl mr-4`}>
                  {company.logo}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
                  <p className="text-gray-600">{company.avgPackage}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  Difficulty: {company.difficulty}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Topics: {company.topics.join(', ')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {company.testPattern}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Preparation
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <p className="font-semibold">Two Sum Problem</p>
                <p className="text-sm text-gray-600">Solved in 12 minutes</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-3" />
              <div>
                <p className="font-semibold">TCS Aptitude Quiz</p>
                <p className="text-sm text-gray-600">Scored 85/100</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <p className="font-semibold">Binary Tree Traversal</p>
                <p className="text-sm text-gray-600">Need more practice</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">2 days ago</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderPracticeView = () => {
    switch (activeView) {
      case 'coding':
        return <CodingProblems />;
      case 'aptitude':
        return <CompetitiveQuiz />;
      case 'technical':
        return <ProgrammingQuiz />;
      default:
        return renderOverview();
    }
  };

  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Home
              </motion.button>
            </Link>
            {activeView !== 'overview' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveView('overview')}
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Back to Overview
              </motion.button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-sm text-gray-500">Welcome back!</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                U
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (activeView !== 'overview') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}
        {renderPracticeView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderOverview()}
      </main>
    </div>
  );
};

export default Placements;
