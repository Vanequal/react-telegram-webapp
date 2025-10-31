import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { authWithTelegram } from '../store/slices/authSlice'
import { fetchCurrentUser } from '../store/slices/meSlice'
import axios from '../shared/api/axios'

import Home from '@/pages/Home/Home'
import HomeSimplified from '@/pages/Home/HomeSimplified'
import MindVault from '@/features/mindvault/pages/MindVault'
import AboutPage from '@/pages/Home/AboutPage'
import GraphPage from '@/pages/Home/GraphPage'
import EditIdeaPage from '@/features/ideas/pages/EditIdeaPage'
import EditIdeaPageGPT from '@/features/ideas/pages/EditIdeaPageGPT'
import TextGPTEditor from '@/features/ideas/pages/TextGPTEditor'
import MenuPage from '@/pages/Home/MenuPage'
import MyProfile from '@/features/profile/pages/MyProfile'
import ResumePage from '@/pages/Home/ResumePage'
import HistoryPage from '@/pages/Home/HistoryPage'
import EditProfilePage from '@/features/profile/pages/EditProfilePage'
import DebatePage from '@/features/discussion/pages/DebatePage'
import DiscussionPage from '@/features/discussion/pages/DiscussionPage'
import QuestionAnswerPage from '@/features/questions/pages/QuestionAnswerPage'
import QuestionChatPage from '@/features/questions/pages/QuestionChatPage'
import ReloadPage from '@/pages/Home/ReloadPage'
import PublicationChatPage from '@/features/publications/pages/PublicationChatPage'
import PublicationPageList from '@/features/publications/pages/PublicationPageList'
import PublicationPage from '@/features/publications/pages/PublicationPage'
import TaskChatPage from '@/pages/Home/TaskChatPage'
import LaboratoryPage from '@/pages/Home/LaboratoryPage'

import '@/styles/global.scss'

function App() {
  const dispatch = useDispatch()
  const [authReady, setAuthReady] = useState(false)
  const user = useSelector(state => state.auth.user)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    const initData = tg?.initData
    const token = sessionStorage.getItem('token')

    if (window.location.hostname === 'localhost') {
      const mockToken = 'mock-token'
      sessionStorage.setItem('token', mockToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`
      setAuthReady(true)
      return
    }

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setAuthReady(true)
      return
    }

    if (initData && tg?.initDataUnsafe?.user) {
      dispatch(authWithTelegram(initData)).finally(() => {
        setAuthReady(true)
      })
    } else {
      setAuthReady(true)
    }
  }, [dispatch])

  useEffect(() => {
    if (sessionStorage.getItem('token')) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch])

  if (!authReady) return <div>Загрузка...</div>

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
        <Route path="/questionchatpage" element={<QuestionChatPage />} />
        <Route path="/reload" element={<ReloadPage />} />
        <Route path="/publicationchatpage" element={<PublicationChatPage />} />
        <Route path="/publicationlist" element={<PublicationPageList />} />
        <Route path="/publicationpage/:id" element={<PublicationPage />} />
        <Route path="/taskchatpage" element={<TaskChatPage />} />
        <Route path="/laboratorypage" element={<LaboratoryPage />} />
      </Routes>
    </Router>
  )
}

export default App
