import React,{ useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Admin from './Admin'
import Event from './Event'
import UserAuth from './UserAuth'
import './App.css'

function App() {


  return (
    <>
    <Router>
      <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/create-event" element={<Admin/>}/>
      <Route path="/events" element={<Event/>}/>
      <Route path="/login" element={<UserAuth mode="login"/>}/>
      <Route path="/register" element={<UserAuth mode="register"/>}/>
      </Routes>
    </Router>
      
    </>
  )
}

export default App
