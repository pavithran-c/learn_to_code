import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, Bell, Menu, X, Code, BarChart3, FileText, 
  Briefcase, Database, Trophy, Calculator, Brain, 
  Home, Settings, User, LogOut, ChevronDown, Target
} from 'lucide-react';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Practice', path: '/practice', icon: Target },
    { name: 'Problems', path: '/problems', icon: FileText },
    { name: 'Enhanced Problems', path: '/enhanced-problems', icon: Brain },
    { name: 'Evaluations', path: '/evaluations', icon: FileText },
    { name: 'Core Subjects', path: '/core-subjects', icon: Database },
    { name: 'Placements', path: '/placements', icon: Briefcase },
    { name: 'Adaptive Learning', path: '/adaptive-dashboard', icon: Brain },
    { name: 'AI Recommendations', path: '/ai-recommendations', icon: Brain },
    { name: 'Advanced Analytics', path: '/advanced-analytics', icon: BarChart3 },
  ];

  // Quiz items for dropdown
  const quizItems = [
    { name: 'Interactive Quiz', path: '/quiz', icon: Trophy },
    { name: 'Programming Quiz', path: '/programming-quiz', icon: Calculator },
    { name: 'Competitive Quiz', path: '/competitive-quiz', icon: Trophy },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    closed: { x: '-100%', transition: { duration: 0.3, ease: 'easeIn' } }
  };

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-black cursor-pointer"
              >
                LearnToCode
              </motion.div>
            </Link>
            <div className="hidden lg:flex items-center space-x-6">
              {navigationItems.slice(0, 3).map((item) => (
                <Link key={item.name} to={item.path}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    className={`flex items-center space-x-1 cursor-pointer transition-colors ${
                      isActivePath(item.path) 
                        ? 'text-black font-medium' 
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </motion.div>
                </Link>
              ))}
              
              {/* Quiz Dropdown */}
              <div className="relative group">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  className="flex items-center space-x-1 cursor-pointer transition-colors text-gray-600 hover:text-black"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Quiz</span>
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {quizItems.map((quiz) => (
                    <Link key={quiz.name} to={quiz.path}>
                      <div className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg">
                        <quiz.icon className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700 hover:text-black">{quiz.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {navigationItems.slice(3, 6).map((item) => (
                <Link key={item.name} to={item.path}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    className={`flex items-center space-x-1 cursor-pointer transition-colors ${
                      isActivePath(item.path) 
                        ? 'text-black font-medium' 
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1 }} className="relative cursor-pointer">
              <Search className="w-6 h-6 text-gray-600 hover:text-black transition-colors" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-gray-600 hover:text-black transition-colors" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </motion.div>
            
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:block text-gray-700 font-medium">{user.name || user.email}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
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
                  {navigationItems.slice(0, 3).map((item) => (
                    <Link 
                      key={item.name} 
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <motion.div 
                        whileHover={{ x: 5 }} 
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          isActivePath(item.path)
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </motion.div>
                    </Link>
                  ))}
                  
                  {/* Quiz Section */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3 p-3 text-gray-800 font-semibold">
                      <Trophy className="w-5 h-5" />
                      <span>Quiz</span>
                    </div>
                    {quizItems.map((quiz) => (
                      <Link 
                        key={quiz.name} 
                        to={quiz.path}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <motion.div 
                          whileHover={{ x: 5 }} 
                          className={`flex items-center space-x-3 p-3 pl-12 rounded-lg transition-colors ${
                            isActivePath(quiz.path)
                              ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          <quiz.icon className="w-4 h-4" />
                          <span className="font-medium">{quiz.name}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                  
                  {navigationItems.slice(3).map((item) => (
                    <Link 
                      key={item.name} 
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <motion.div 
                        whileHover={{ x: 5 }} 
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          isActivePath(item.path)
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </motion.div>
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
