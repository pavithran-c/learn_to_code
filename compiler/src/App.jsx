import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './Home'
import Compiler from './components/Compiler'
import Test from './components/Test'
import CompetitiveQuiz from './components/CompetitiveQuiz'
import ProgrammingQuiz from './components/ProgrammingQuiz'
import CodingProblems from './components/CodingProblems'
import Placements from './components/Placements';

function App() {
  return (
    <Routes>
      <Route path='/' element={
        <>
          <Home />
        </>
      } />
  <Route path='/compiler' element={<Compiler />} />
  <Route path='/test' element={<Test />} />
  <Route path='/quiz' element={<CompetitiveQuiz />} />
  <Route path='/programming-quiz' element={<ProgrammingQuiz />} />
  <Route path='/evaluations' element={<Test />} />
  <Route path='/evaluations/*' element={<Test />} />
  <Route path='/problems' element={<CodingProblems />} />
  <Route path='/placements' element={<Placements />} />
    </Routes>
  )
}

export default App
