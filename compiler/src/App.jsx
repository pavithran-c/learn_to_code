import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './Home'
import Compiler from './components/Compiler'
import Test from './components/Test'

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
      <Route path='/evaluations' element={<Test />} />
      <Route path='/evaluations/*' element={<Test />} />
    </Routes>
  )
}

export default App
