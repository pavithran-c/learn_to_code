import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, Book, Trophy, Calendar, Users, Bell, Search, 
  BarChart2, Target, Clock, Star, Menu, X 
} from 'lucide-react';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        staggerChildren: 0.2 
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-blue-600"
            >
              SkillTrack
            </motion.div>
            <div className="hidden md:flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} className="text-gray-600 hover:text-blue-600 cursor-pointer">Dashboard</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-gray-600 hover:text-blue-600 cursor-pointer">Tests</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-gray-600 hover:text-blue-600 cursor-pointer">Interviews</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-gray-600 hover:text-blue-600 cursor-pointer">Resources</motion.div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1 }} className="relative">
              <Search className="w-6 h-6 text-gray-600 cursor-pointer" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="relative">
              <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              JD
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 md:hidden"
          >
            <div className="p-4 space-y-4">
              <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-2 text-blue-600">
                <BarChart2 className="w-5 h-5" />
                <span>Dashboard</span>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <Code className="w-5 h-5" />
                <span>Daily Tests</span>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <Calendar className="w-5 h-5" />
                <span>Weekly Tests</span>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <Users className="w-5 h-5" />
                <span>Mock Interviews</span>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <Book className="w-5 h-5" />
                <span>Resources</span>
              </motion.div>
            </div>
          </motion.aside>
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
              Master Your Skills with <span className="text-blue-600">SkillTrack</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Your one-stop platform for performance tracking, mock interviews, and placement success.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
            >
              Start Practicing
            </motion.button>
          </motion.div>

          {/* Dashboard Cards */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Code className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold">Daily Coding Tests</h2>
              <p className="mt-2 text-gray-600">Practice daily coding challenges to boost your problem-solving skills.</p>
              <Link to="/compiler">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Start Now
                </motion.button>
              </Link>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Users className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold">Mock Interviews</h2>
              <p className="mt-2 text-gray-600">Simulate real interviews with AI-driven feedback and tips.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mt-4 text-blue-600 hover:underline"
              >
                Schedule Now
              </motion.button>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <Trophy className="w-10 h-10 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold">Placement Prep</h2>
              <p className="mt-2 text-gray-600">Access resources and strategies for top-tier company placements.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mt-4 text-blue-600 hover:underline"
              >
                Explore Resources
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Progress Zone */}
          <motion.div variants={containerVariants} className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Coding Skills</span>
                    <span className="text-blue-600">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="bg-blue-600 h-2.5 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Interview Readiness</span>
                    <span className="text-blue-600">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="bg-blue-600 h-2.5 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold">Streak: 5 Days</span>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600">Keep up your daily practice to unlock rewards!</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div variants={containerVariants} className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center space-x-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Weekly Coding Challenge</h3>
                  <p className="text-gray-600">July 22, 2025 | 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Mock Interview Session</h3>
                  <p className="text-gray-600">July 23, 2025 | 2:00 PM</p>
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
            <p>© 2025 SkillTrack. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              className="text-gray-300 hover:text-white"
            >
              Support
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              className="text-gray-300 hover:text-white"
            >
              Accessibility
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              className="text-gray-300 hover:text-white"
            >
              Contact
            </motion.a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;