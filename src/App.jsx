import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { authWithTelegram } from './store/slices/authSlice';
import { fetchCurrentUser } from './store/slices/meSlice';

import Home from './pages/Home';
import HomeSimplified from './pages/HomeSimplified';
import MindVault from './pages/MindVault';
import AboutPage from './pages/AboutPage';
import DiscussionPage from './pages/DiscussionPage';
import EditIdeaPage from './pages/EditIdeaPage';
import EditIdeaPageGPT from './pages/EditIdeaPageGPT';
import TextGPTEditor from './pages/TextGPTEditor';
import MenuPage from './pages/MenuPage';
import MyProfile from './pages/MyProfile';

import './styles/global.scss';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

    if (!initData) {
      console.warn('initData отсутствует');
      setAuthReady(true);
      return;
    }

    const storedInitHash = localStorage.getItem('authInitHash');
    const initHash = btoa(initData).substring(0, 64);

    if (storedInitHash !== initHash) {
      dispatch(authWithTelegram(initData)).then((res) => {
        if (!res.error) {
          localStorage.setItem('authInitHash', initHash);
        }
        setAuthReady(true);
      });
    } else {
      console.log('initData уже был отправлен');
      setAuthReady(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentUser());
    }
  }, [user, dispatch]);

  if (!authReady) {
    return <div>Загрузка...</div>; 
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homesimplified" element={<HomeSimplified />} />
        <Route path="/mindvault" element={<MindVault />} />
        <Route path="/aboutpage" element={<AboutPage />} />
        <Route path="/editideapage" element={<EditIdeaPage />} />
        <Route path="/editideapagegpt" element={<EditIdeaPageGPT />} />
        <Route path="/textgpteditor" element={<TextGPTEditor />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/discussion/:id" element={<DiscussionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
