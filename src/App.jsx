import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import EditProfilePage from './pages/EditProfilePage';
import HistoryPage from './pages/HistoryPage';
import DebatePage from './pages/DebatePage';

import './styles/global.scss';
import GraphPage from './pages/GraphPage';
import ResumePage from './pages/ResumePage';
import QuestionChatPage from './pages/QuestionChatPage';

function App() {
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;
    const token = sessionStorage.getItem('token');
  
    if (window.location.hostname === 'localhost') {
      sessionStorage.setItem('token', 'mock-token');
      setAuthReady(true);
      return;
    }
  
    if (!initData || token) {
      setAuthReady(true);
      return;
    }
  
    dispatch(authWithTelegram(initData)).finally(() => {
      setAuthReady(true);
    });
  }, [dispatch]);
  


  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentUser());
    }
  }, [user, dispatch]);

  if (!authReady) return <div>Загрузка...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homesimplified" element={<HomeSimplified />} />
        <Route path="/mindvault" element={<MindVault />} />
        <Route path="/aboutpage" element={<AboutPage />} />
        <Route path="/graphpage" element={<GraphPage />} />
        <Route path="/editideapage" element={<EditIdeaPage />} />
        <Route path="/editideapagegpt" element={<EditIdeaPageGPT />} />
        <Route path="/textgpteditpage" element={<TextGPTEditor />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/resumepage" element={<ResumePage />} />
        <Route path="/historypage" element={<HistoryPage />} />
        <Route path="/editprofilepage" element={<EditProfilePage />} />
        <Route path="/debatepage" element={<DebatePage />} />
        <Route path="/discussion/:id" element={<DiscussionPage />} />
        <Route path="/questionpage" element={<QuestionChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
