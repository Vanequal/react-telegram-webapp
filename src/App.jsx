import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authWithTelegram } from './store/slices/authSlice';
import Home from './pages/Home';
import HomeSimplified from './pages/HomeSimplified';
import MindVault from './pages/MindVault';
import './styles/global.scss';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const [initDataPresent, setInitDataPresent] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

    if (initData) {
      setInitDataPresent(true);
      dispatch(authWithTelegram(initData));
    } else {
      setInitDataPresent(false);
    }
  }, []);

  if (!initDataPresent || loading) {
    return null; 
  }

  if (!user) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          fontSize: '20px',
          color: 'red'
        }}
      >
         Доступ запрещён. Запустите WebApp из Telegram.
      </div>
    );
  }
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
