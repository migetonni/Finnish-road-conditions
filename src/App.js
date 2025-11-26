
import './App.css';
import React from "react";
import Map from "./components/Map";
import Dashboard from './components/DashBoard';
import ResponsiveAppBar from './components/NavBar';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {
  return (
    
    <Router>
      <ResponsiveAppBar/>
      <Routes>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/" element={<Map />} />
      </Routes>
    </Router>
  );
}

export default App;
