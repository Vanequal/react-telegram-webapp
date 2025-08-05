import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authWithTelegram } from './store/slices/authSlice';
import { fetchCurrentUser } from './store/slices/meSlice';
import axios from './api/axios';

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
import GraphPage from './pages/GraphPage';
import ResumePage from './pages/ResumePage';
import QuestionAnswerPage from './pages/QuestionAnswerPage';
import QuestionChatPage from './pages/QuestionChatPage';
import ReloadPage from './pages/ReloadPage';
import PublicationChatPage from './pages/PublicationChatPage';
import PublicationPage from './pages/PublicationPage';
import TaskChatPage from './pages/TaskChatPage';
import LaboratoryPage from './pages/LaboratoryPage';

import './styles/global.scss';

function App() {
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;
    const token = sessionStorage.getItem('token');

    if (window.location.hostname === 'localhost') {
      const mockToken = 'mock-token';
      sessionStorage.setItem('token', mockToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
      setAuthReady(true);
      return;
    }

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthReady(true);
      return;
    }

    if (initData && tg?.initDataUnsafe?.user) {
      dispatch(authWithTelegram(initData)).finally(() => {
        setAuthReady(true);
      });
    } else {
      setAuthReady(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (sessionStorage.getItem('token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

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
        <Route path="/questionanswerpage/:id" element={<QuestionAnswerPage />} />
        <Route path="/questionchat" element={<QuestionChatPage />} />
        <Route path="/reload" element={<ReloadPage />} />
        <Route path="/publicationchatpage" element={<PublicationChatPage />} />
        <Route path="/publicationpage" element={<PublicationPage />} />
        <Route path="/taskchatpage" element={<TaskChatPage />} />
        <Route path="/laboratorypage" element={<LaboratoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
