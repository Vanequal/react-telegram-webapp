import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HomeSimplified from './pages/HomeSimplified';
import './styles/global.scss';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homesimplified" element={<HomeSimplified />} />
      </Routes>
    </Router>
  );
}

export default App;