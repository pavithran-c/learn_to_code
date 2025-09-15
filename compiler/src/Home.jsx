import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, Book, Trophy, Calendar, Users, Bell, Search, 
  BarChart2, Target, Clock, Star, Menu, X, Brain, FileText, 
  Briefcase, Calculator, MessageSquare, Database, Home as HomeIcon
} from 'lucide-react';
import Compiler from './components/Compiler'
// Exam and course data (same as previous)
const examCategories = {
  Engineering: [
    { name: 'JEE Main', purpose: 'Admission to NITs, IIITs, and other engineering colleges' },
    { name: 'JEE Advanced', purpose: 'Admission to IITs' },
    { name: 'BITSAT', purpose: 'Admission to BITS Pilani, Goa, Hyderabad' },
    { name: 'VITEEE', purpose: 'Admission to VIT University' },
    { name: 'SRMJEEE', purpose: 'Admission to SRM University' },
    { name: 'MET (Manipal)', purpose: 'Admission to Manipal Institute of Technology' },
    { name: 'WBJEE', purpose: 'West Bengal state engineering admission' },
    { name: 'MHT CET', purpose: 'Maharashtra engineering admission' },
    { name: 'COMEDK', purpose: 'Karnataka private engineering colleges' },
  ],
  Medical: [
    { name: 'NEET UG', purpose: 'Admission to MBBS/BDS across India' },
    { name: 'NEET PG', purpose: 'Admission to MD/MS (postgraduate) courses' },
    { name: 'AIIMS INI CET', purpose: 'Admission to AIIMS, PGIMER, JIPMER (PG)' },
    { name: 'FMGE', purpose: 'Licensing exam for foreign medical graduates' },
  ],
  Business: [
    { name: 'CAT', purpose: 'Admission to IIMs and top B-schools (MBA)' },
    { name: 'XAT', purpose: 'Admission to XLRI and other B-schools' },
    { name: 'MAT', purpose: 'Admission to various MBA colleges' },
    { name: 'CMAT', purpose: 'Conducted by NTA for MBA admission' },
    { name: 'NMAT', purpose: 'Admission to NMIMS and other B-schools' },
    { name: 'SNAP', purpose: 'Symbiosis MBA admission' },
    { name: 'IIFT', purpose: 'Admission to IIFT (MBA in International Business)' },
  ],
  Law: [
    { name: 'CLAT (UG/PG)', purpose: 'Admission to National Law Universities (LLB/LLM)' },
    { name: 'AILET', purpose: 'Admission to NLU Delhi' },
    { name: 'LSAT India', purpose: 'Admission to various private law colleges' },
    { name: 'SLAT', purpose: 'Symbiosis Law Admission Test' },
  ],
  Commerce: [
    { name: 'CA Foundation/Intermediate/Final', purpose: 'Chartered Accountancy' },
    { name: 'CMA (ICMAI)', purpose: 'Cost and Management Accountancy' },
    { name: 'CS (ICSI)', purpose: 'Company Secretaryship' },
    { name: 'CFA', purpose: 'Chartered Financial Analyst' },
    { name: 'ACCA', purpose: 'Global accounting certification' },
    { name: 'NISM/NIFM Exams', purpose: 'Securities/Investment certifications' },
  ],
  Government: [
    { name: 'UPSC CSE', purpose: 'Civil Services (IAS, IPS, IFS)' },
    { name: 'SSC CGL/CHSL/MTS', purpose: 'Central government jobs' },
    { name: 'RRB NTPC/Group D', purpose: 'Railway jobs' },
    { name: 'IBPS PO/Clerk/RRB', purpose: 'Bank jobs' },
    { name: 'SBI PO/Clerk', purpose: 'State Bank jobs' },
    { name: 'LIC AAO/ADO', purpose: 'Insurance sector jobs' },
    { name: 'NDA', purpose: 'Entry to National Defence Academy' },
    { name: 'CDS', purpose: 'Combined Defence Services' },
    { name: 'AFCAT', purpose: 'Indian Air Force jobs' },
    { name: 'CAPF', purpose: 'Assistant Commandants in paramilitary forces' },
    { name: 'State PSCs', purpose: 'State-level government jobs' },
  ],
  HigherEducation: [
    { name: 'CUET UG/PG', purpose: 'Admission to central universities' },
    { name: 'IGNOU OPENMAT', purpose: 'IGNOU MBA admission' },
    { name: 'TISSNET', purpose: 'Tata Institute of Social Sciences' },
    { name: 'DUET/JNUEE', purpose: 'Delhi University / JNU admission' },
    { name: 'ICAR AIEEA', purpose: 'Agriculture and allied sciences' },
  ],
  SchoolLevel: [
    { name: 'NTSE', purpose: 'Scholarship exam (10th standard)' },
    { name: 'KVPY', purpose: 'Research-based UG courses' },
    { name: 'Olympiads', purpose: 'Subject-wise competitions' },
    { name: 'Board Exams', purpose: '10th and 12th standard exams' },
    { name: 'IISER Aptitude Test', purpose: 'Admission to science institutes (IISERs)' },
  ],
  Placements: [
    { name: 'TCS NQT', purpose: 'TCS campus recruitment' },
    { name: 'Infosys Tests', purpose: 'Infosys campus recruitment' },
    { name: 'Wipro Tests', purpose: 'Wipro campus recruitment' },
    { name: 'Amazon SDE Test', purpose: 'Amazon software development roles' },
    { name: 'Microsoft IDC', purpose: 'Microsoft campus recruitment' },
  ],
  Aptitude: [
    { name: 'Quantitative Aptitude', purpose: 'Numerical reasoning practice' },
    { name: 'Logical Reasoning', purpose: 'Analytical and logical thinking' },
    { name: 'Verbal Ability', purpose: 'English language and comprehension' },
  ],
  CoreSubjects: [
    { name: 'DBMS', purpose: 'Database Management Systems crash course and exams' },
    { name: 'DAA', purpose: 'Design and Analysis of Algorithms crash course and exams' },
    { name: 'DSA', purpose: 'Data Structures and Algorithms crash course and exams' },
    { name: 'OS', purpose: 'Operating Systems crash course and exams' },
    { name: 'AI', purpose: 'Artificial Intelligence crash course and exams' },
    { name: 'Computer Networks', purpose: 'Networking concepts and exams' },
    { name: 'Machine Learning', purpose: 'ML concepts and practical exams' },
  ],
};

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Engineering');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const sidebarVariants = {
    open: { x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    closed: { x: '-100%', transition: { duration: 0.3, ease: 'easeIn' } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-blue-600 cursor-pointer"
              >
                LearnToCode
              </motion.div>
            </Link>
            <div className="hidden lg:flex items-center space-x-6">
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-1 cursor-pointer transition-colors text-gray-600 hover:text-blue-600">
                  <BarChart2 className="w-4 h-4" />
                  <span>Dashboard</span>
                </motion.div>
              </Link>
              <Link to="/compiler">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-1 cursor-pointer transition-colors text-gray-600 hover:text-blue-600">
                  <Code className="w-4 h-4" />
                  <span>Compiler</span>
                </motion.div>
              </Link>
              <Link to="/problems">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-1 cursor-pointer transition-colors text-gray-600 hover:text-blue-600">
                  <FileText className="w-4 h-4" />
                  <span>Problems</span>
                </motion.div>
              </Link>
              <Link to="/evaluations">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-1 cursor-pointer transition-colors text-gray-600 hover:text-blue-600">
                  <FileText className="w-4 h-4" />
                  <span>Evaluations</span>
                </motion.div>
              </Link>
              <Link to="/quiz">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-1 cursor-pointer transition-colors text-gray-600 hover:text-blue-600">
                  <Trophy className="w-4 h-4" />
                  <span>Quiz</span>
                </motion.div>
              </Link>
              <Link to="/placements">
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-1 cursor-pointer transition-colors text-gray-600 hover:text-blue-600">
                  <Briefcase className="w-4 h-4" />
                  <span>Placements</span>
                </motion.div>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1 }} className="relative cursor-pointer">
              <Search className="w-6 h-6 text-gray-600" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
              <Users className="w-5 h-5" />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-2xl font-bold text-blue-600">LearnToCode</div>
                  <button onClick={() => setIsSidebarOpen(false)}>
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
                
                <nav className="space-y-4">
                  <Link to="/" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <HomeIcon className="w-5 h-5" />
                      <span className="font-medium">Home</span>
                    </motion.div>
                  </Link>
                  <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <BarChart2 className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                    </motion.div>
                  </Link>
                  <Link to="/compiler" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <Code className="w-5 h-5" />
                      <span className="font-medium">Compiler</span>
                    </motion.div>
                  </Link>
                  <Link to="/problems" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">Problems</span>
                    </motion.div>
                  </Link>
                  <Link to="/evaluations" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">Evaluations</span>
                    </motion.div>
                  </Link>
                  <Link to="/quiz" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <Trophy className="w-5 h-5" />
                      <span className="font-medium">Quiz</span>
                    </motion.div>
                  </Link>
                  <Link to="/programming-quiz" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <Calculator className="w-5 h-5" />
                      <span className="font-medium">Programming Quiz</span>
                    </motion.div>
                  </Link>
                  <Link to="/core-subjects" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <Database className="w-5 h-5" />
                      <span className="font-medium">Core Subjects</span>
                    </motion.div>
                  </Link>
                  <Link to="/placements" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <Briefcase className="w-5 h-5" />
                      <span className="font-medium">Placements</span>
                    </motion.div>
                  </Link>
                  <Link to="/adaptive-dashboard" onClick={() => setIsSidebarOpen(false)}>
                    <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      <Brain className="w-5 h-5" />
                      <span className="font-medium">Adaptive Learning</span>
                    </motion.div>
                  </Link>
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Ace Your Exams & Placements with <span className="text-blue-600">ExamTrack</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive platform for exam preparation, placements, and core subject mastery.
            </p>
            <Link to="/compiler">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
              >
                Start Practicing
              </motion.button>
            </Link>
          </motion.div>

          {/* Exam & Course Categories */}
          <motion.div variants={containerVariants} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Explore Categories</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(examCategories).map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </motion.button>
              ))}
            </div>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {examCategories[selectedCategory].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-blue-600">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.purpose}</p>
                  <Link to={`/compiler?category=${selectedCategory.toLowerCase()}&exam=${item.name.replace(/\s/g, '-')}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      {selectedCategory === 'CoreSubjects' ? 'Start Course' : 'Practice Now'}
                    </motion.button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard Cards */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Code className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold">Practice Tests</h2>
              <p className="mt-2 text-gray-600">Mock exams for JEE, NEET, CAT, and more.</p>
              <Link to="/compiler">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Start Test
                </motion.button>
              </Link>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Briefcase className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold">Placement Prep</h2>
              <p className="mt-2 text-gray-600">Prepare for TCS, Infosys, Amazon, and more.</p>
              <Link to="/placements">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Explore Placements
                </motion.button>
              </Link>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Database className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold">Core Subjects</h2>
              <p className="mt-2 text-gray-600">Crash courses in DSA, DBMS, AI, and more.</p>
              <Link to="/core-subjects">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Start Learning
                </motion.button>
              </Link>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Users className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold">Mock Interviews & GD</h2>
              <p className="mt-2 text-gray-600">Simulate interviews and group discussions.</p>
              <Link to="/mock-interviews">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Schedule Now
                </motion.button>
              </Link>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Calculator className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold">Aptitude Practice</h2>
              <p className="mt-2 text-gray-600">Master quantitative, logical, and verbal skills.</p>
              <Link to="/aptitude">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Practice Now
                </motion.button>
              </Link>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Brain className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold">Performance Feedback</h2>
              <p className="mt-2 text-gray-600">Detailed feedback and improvement tips.</p>
              <Link to="/evaluations/feedback">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  View Feedback
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Progress Zone */}
          <motion.div variants={containerVariants} className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Exam Readiness</span>
                    <span className="text-blue-600">70%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '70%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="bg-blue-600 h-2.5 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Aptitude Skills</span>
                    <span className="text-blue-600">80%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '80%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="bg-blue-600 h-2.5 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Core Subject Mastery</span>
                    <span className="text-blue-600">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="bg-blue-600 h-2.5 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold">Streak: 7 Days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold">Rank: Top 10%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold">GD Score: 85/100</span>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600">Keep practicing exams, aptitude, and core subjects to climb the leaderboard!</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Evaluations */}
          <motion.div variants={containerVariants} className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Recent Evaluations</h2>
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">JEE Main Mock Test</h3>
                    <p className="text-gray-600">Score: 85/100 | Completed: July 18, 2025</p>
                  </div>
                </div>
                <Link to="/evaluations/engineering/jee-main/feedback">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-blue-600 hover:underline"
                  >
                    View Feedback
                  </motion.button>
                </Link>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">DSA Exam</h3>
                    <p className="text-gray-600">Score: 90/100 | Completed: July 17, 2025</p>
                  </div>
                </div>
                <Link to="/evaluations/core-subjects/dsa/feedback">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-blue-600 hover:underline"
                  >
                    View Feedback
                  </motion.button>
                </Link>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-4">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Group Discussion Practice</h3>
                    <p className="text-gray-600">Score: 88/100 | Completed: July 16, 2025</p>
                  </div>
                </div>
                <Link to="/mock-interviews/gd/feedback">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-blue-600 hover:underline"
                  >
                    View Feedback
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div variants={containerVariants} className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center space-x-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">TCS NQT Mock Test</h3>
                  <p className="text-gray-600">July 22, 2025 | 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Mock Interview: Technical</h3>
                  <p className="text-gray-600">July 23, 2025 | 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Database className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">DBMS Crash Course Webinar</h3>
                  <p className="text-gray-600">July 24, 2025 | 3:00 PM</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>© 2025 ExamTrack. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <Link to="/support">
              <motion.a whileHover={{ scale: 1.1 }} className="text-gray-300 hover:text-white">
                Support
              </motion.a>
            </Link>
            <Link to="/accessibility">
              <motion.a whileHover={{ scale: 1.1 }} className="text-gray-300 hover:text-white">
                Accessibility
              </motion.a>
            </Link>
            <Link to="/contact">
              <motion.a whileHover={{ scale: 1.1 }} className="text-gray-300 hover:text-white">
                Contact
              </motion.a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;