import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { authWithTelegram } from './store/slices/authSlice';
import { fetchCurrentUser } from './store/slices/meSlice';

import Home from './pages/Home';
import HomeSimplified from './pages/HomeSimplified';
import MindVault from './pages/MindVault';
import AboutPage from './pages/AboutPage';
import DiscussionPage from './pages/DiscussionPage';

import './styles/global.scss';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user); 

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

    if (initData) {
      dispatch(authWithTelegram(initData));
    } else {
      console.warn('initData отсутствует');
    }
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentUser()); 
    }
  }, [user, dispatch]);

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
