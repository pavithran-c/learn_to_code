import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Code2, Menu, X, User, LogOut, ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link to="/" className="flex items-center">
            <Code2 className="h-8 w-8 mr-3 text-black" />
            <span className="text-2xl font-bold text-black">LearnToCode</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <Link 
                to="/dashboard" 
                className={`transition-colors ${
                  isActivePath('/dashboard') 
                    ? 'text-black font-medium' 
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Dashboard
              </Link>
            )}
            <Link 
              to="/practice" 
              className="text-gray-700 hover:text-black transition-colors"
            >
              Practice
            </Link>
            <Link 
              to="/problems" 
              className="text-gray-700 hover:text-black transition-colors"
            >
              Problems
            </Link>

            <div className="relative group">
              <span className="text-gray-700 hover:text-black transition-colors cursor-pointer">
                Quiz 
              </span>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link 
                  to="/quiz" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                >
                  Interactive Quiz
                </Link>
                <Link 
                  to="/programming-quiz" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                >
                  Programming Quiz
                </Link>
                <Link 
                  to="/competitive-quiz" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                >
                  Competitive Quiz
                </Link>
              </div>
            </div>

            <Link 
              to="/evaluations" 
              className="text-gray-700 hover:text-black transition-colors"
            >
              Evaluations
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors"
                >
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user.name || user.email.split('@')[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{user.name || user.email.split('@')[0]}</p>
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
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-black transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {user && (
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/practice"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Practice
                </Link>
                <Link
                  to="/problems"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Problems
                </Link>
                <Link
                  to="/quiz"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Interactive Quiz
                </Link>
                <Link
                  to="/programming-quiz"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Programming Quiz
                </Link>
                <Link
                  to="/competitive-quiz"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Competitive Quiz
                </Link>
                <Link
                  to="/evaluations"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Evaluations
                </Link>

                {user ? (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center px-3 py-2">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name || user.email.split('@')[0]}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium bg-black text-white hover:bg-gray-800 mx-3 mt-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
