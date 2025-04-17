import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authWithTelegram } from './store/slices/authSlice';

import Home from './pages/Home';
import HomeSimplified from './pages/HomeSimplified';
import MindVault from './pages/MindVault';
import AboutPage from './pages/AboutPage';
import DiscussionPage from './pages/DiscussionPage';

import './styles/global.scss';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

    if (initData) {
      dispatch(authWithTelegram(initData));
    } else {
      console.warn('initData отсутствует');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homesimplified" element={<HomeSimplified />} />
        <Route path="/mindvault" element={<MindVault />} />
        <Route path="/aboutpage" element={<AboutPage />} />
        <Route path="/discussion/:id" element={<DiscussionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
