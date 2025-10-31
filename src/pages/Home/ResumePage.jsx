import React from 'react'
import { useNavigate } from 'react-router-dom'

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'

import historyUser from '@/assets/images/resumeUser.png'

import '@/styles/shared/components/ResumePage.scss'

const ResumePage = () => {
  const navigate = useNavigate()

  return (
    <div className="resume-page">
      <MindVaultHeader onBackClick={() => navigate('/')} hideSectionTitle hideDescription bgColor="#EEEFF1" title="Резюме Проекта" textColor="black" />
      <div className="resume-content">
        <strong>Резюме</strong>
        <p>[Заголовок Раздела]</p>
        <br />
        <div className="project-info">
          <div className="info-row">
            <p>
              Проект инициирован / дата / <span>автор</span>
            </p>
            <img src={historyUser} alt="автор" className="author-avatar" />
          </div>
          <br />
          <div className="info-row">
            <p>
              Куратор Проекта <span>Азуан А.А</span>
            </p>
            <img src={historyUser} alt="автор" className="author-avatar" />
          </div>
          <br />
          <div className="info-row">
            <p>
              Координатор <span>Тощенко Ж.Т</span>
            </p>
            <img src={historyUser} alt="автор" className="author-avatar" />
          </div>
          <br />
          <div className="info-row">
            <p>Эксперты</p>
            <img src={historyUser} alt="автор" className="author-avatar" />
            <img src={historyUser} alt="автор" className="author-avatar" />
            <img src={historyUser} alt="автор" className="author-avatar" />
          </div>
          <br />
          <div className="info-row">
            <p>Модераторы</p>
            <img src={historyUser} alt="автор" className="author-avatar" />
            <img src={historyUser} alt="автор" className="author-avatar" />
            <img src={historyUser} alt="автор" className="author-avatar" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumePage
