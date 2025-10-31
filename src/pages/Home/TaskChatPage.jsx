import React from 'react'
import { useNavigate } from 'react-router-dom'

import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'

import '@/styles/shared/components/TaskChatPage.scss'

const TaskChatPage = () => {
  const navigate = useNavigate()
  return (
    <div className="task-chat-page">
      <MindVaultHeader bgColor={'#EEEFF1'} textColor="black" title="Чат задач" hideSectionTitle onBackClick={() => navigate('/')} />

      <div className="task-chat-page__top-text">В [Заголовок раздела] ещё нет опубликованных задач.</div>

      <div className="task-chat-page__bottom-text">Придумайте заголовок и опишите суть задачи</div>

      <div className="task-footer">
        <img src={skrepkaIcon} alt="Attach" className="task-footer__icon" />
        <input type="text" className="publication-footer__input" placeholder="Назвать и сформулировать задачу" />
        <img src={sendIcon} alt="Send" className="task-footer__send" />
      </div>
    </div>
  )
}

export default TaskChatPage
