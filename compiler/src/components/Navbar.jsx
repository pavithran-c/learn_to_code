import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, Menu, X, Code, BarChart3, FileText, 
  Briefcase, Database, Trophy, Calculator, Brain, 
  Home, Settings, User
} from 'lucide-react';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Compiler', path: '/compiler', icon: Code },
    { name: 'Problems', path: '/problems', icon: FileText },
    { name: 'Evaluations', path: '/evaluations', icon: FileText },
    { name: 'Quiz', path: '/quiz', icon: Trophy },
    { name: 'Programming Quiz', path: '/programming-quiz', icon: Calculator },
    { name: 'Core Subjects', path: '/core-subjects', icon: Database },
    { name: 'Placements', path: '/placements', icon: Briefcase },
    { name: 'Adaptive Learning', path: '/adaptive-dashboard', icon: Brain },
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
              {navigationItems.slice(0, 6).map((item) => (
                <Link key={item.name} to={item.path}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    className={`flex items-center space-x-1 cursor-pointer transition-colors ${
                      isActivePath(item.path) 
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-600 hover:text-blue-600'
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
              <Search className="w-6 h-6 text-gray-600" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
              <User className="w-5 h-5" />
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
                  {navigationItems.map((item) => (
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
