import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './Home'
import Compiler from './components/Compiler'
import EnhancedCompiler from './components/EnhancedCompiler'
import Test from './components/Test'
import CompetitiveQuiz from './components/CompetitiveQuiz'
import ProgrammingQuiz from './components/ProgrammingQuiz'
import CodingProblems from './components/CodingProblems'
import Placements from './components/Placements'
import CoreSubjectsQuiz from './components/CoreSubjectsQuiz'
import Dashboard from './components/Dashboard'
import AdaptiveLearningDashboard from './components/AdaptiveLearningDashboard'
import Evaluations from './components/Evaluations'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Home page without navbar (has its own header) */}
        <Route path='/' element={<Home />} />
        
        {/* All other pages with navbar */}
        <Route path='/*' element={
          <>
            <Navbar />
            <Routes>
              <Route path='/compiler' element={<EnhancedCompiler />} />
              <Route path='/compiler-simple' element={<Compiler />} />
              <Route path='/adaptive-dashboard' element={<AdaptiveLearningDashboard />} />
              <Route path='/test' element={<Test />} />
              <Route path='/quiz' element={<CompetitiveQuiz />} />
              <Route path='/programming-quiz' element={<ProgrammingQuiz />} />
              <Route path='/evaluations' element={<Evaluations />} />
              <Route path='/evaluations/*' element={<Evaluations />} />
              <Route path='/problems' element={<CodingProblems />} />
              <Route path='/placements' element={<Placements />} />
              <Route path='/core-subjects' element={<CoreSubjectsQuiz />} />
              <Route path='/dashboard' element={<Dashboard />} />
            </Routes>
          </>
        } />
      </Routes>
    </div>
  )
}

export default App
