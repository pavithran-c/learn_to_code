import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Navbar from './components/Navbar'
import SimplifiedProfessionalHome from './SimplifiedProfessionalHome'
import SimplePracticeCompiler from './components/SimplePracticeCompiler'
import SimpleLeetCodeStyleProblems from './components/SimpleLeetCodeStyleProblems'
import EnhancedCodingProblems from './components/EnhancedCodingProblems'
import InteractiveQuiz from './components/InteractiveQuiz'
import ProgrammingQuiz from './components/ProgrammingQuiz'
import CompetitiveQuiz from './components/CompetitiveQuiz'
import CoreSubjectsQuiz from './components/CoreSubjectsQuiz'
import RealTimeDashboard from './components/SimplifiedDashboard'
import StudentDashboard from './components/StudentDashboard'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import TestAnalytics from './components/TestAnalytics'

// Component to handle navbar visibility
function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/login', '/register'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* Public routes - accessible without authentication */}
        <Route path='/' element={<SimplifiedProfessionalHome />} />
        <Route path='/home' element={<SimplifiedProfessionalHome />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        
        {/* Demo routes - accessible without authentication for showcasing */}
        <Route path='/practice' element={<SimplePracticeCompiler />} />
        <Route path='/problems-demo' element={<SimpleLeetCodeStyleProblems />} />
        <Route path='/enhanced-problems' element={<EnhancedCodingProblems />} />
        <Route path='/quiz-demo' element={<InteractiveQuiz />} />
        <Route path='/programming-quiz-demo' element={<ProgrammingQuiz />} />
        <Route path='/competitive-quiz-demo' element={<CompetitiveQuiz />} />
        <Route path='/core-subjects-quiz-demo' element={<CoreSubjectsQuiz />} />
        <Route path='/evaluations' element={<RealTimeDashboard />} />
        <Route path='/test-analytics' element={<TestAnalytics />} />
        
        {/* Protected routes - require authentication */}
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } />
        <Route path='/evaluations' element={
          <ProtectedRoute>
            <RealTimeDashboard />
          </ProtectedRoute>
        } />
        <Route path='/problems' element={
          <ProtectedRoute>
            <SimpleLeetCodeStyleProblems />
          </ProtectedRoute>
        } />
        <Route path='/quiz' element={
          <ProtectedRoute>
            <InteractiveQuiz />
          </ProtectedRoute>
        } />
        <Route path='/programming-quiz' element={
          <ProtectedRoute>
            <ProgrammingQuiz />
          </ProtectedRoute>
        } />
        <Route path='/competitive-quiz' element={
          <ProtectedRoute>
            <CompetitiveQuiz />
          </ProtectedRoute>
        } />
        <Route path='/core-subjects-quiz' element={
          <ProtectedRoute>
            <CoreSubjectsQuiz />
          </ProtectedRoute>
        } />
        
        {/* Redirect any unknown routes to home */}
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
