import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authWithTelegram } from './store/slices/authSlice';

import Home from './pages/Home';
import HomeSimplified from './pages/HomeSimplified';
import MindVault from './pages/MindVault';
import './styles/global.scss';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

    if (initData) {
      dispatch(authWithTelegram(initData));
    } else {
      console.warn('initData отсутствует — WebApp не инициализирован?');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homesimplified" element={<HomeSimplified />} />
        <Route path="/mindvault" element={<MindVault />} />
      </Routes>
    </Router>
  );
}

export default App;
