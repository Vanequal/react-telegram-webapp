import React from 'react';
import { useNavigate } from 'react-router-dom';
import MindVaultHeader from '../components/UI/MindVaultHeader';

import userIcon from '../assets/img/userIcon.webp';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';

import '../styles/QuestionAnswerPage.scss';

const mockQuestion = {
  id: 1,
  text: 'Как правильно расположить инсектарий относительно сторон света?',
  created_at: '2025-05-01 12:34:56',
  likes: 12,
  dislikes: 2,
  views: 45,
  author: { first_name: 'Имя Пользователя' },
  comments: [{ id: 1, text: 'Фронт на юг.', likes: 3, dislikes: 0 }],
};

const additionalQuestion = {
  text: 'Как разработать новый вид опылителей-насекомых для теплиц?',
  author: { first_name: 'Имя Пользователя' },
  views: 18,
};

const QuestionChatPage = () => {
  const navigate = useNavigate();

  return (
    <div className="question-page">
      <MindVaultHeader
        onBackClick={() => navigate('/')}
        onDescriptionClick={() => navigate('/aboutpage')}
        bgColor="#EEEFF1"
        textColor="black"
        hideSectionTitle
        title="Чат вопросов"
      />

      <div className="question-page__container">
        {/* Первая карточка */}
        <div className="question-card">
          <div className="question-card__header">
            <img src={userIcon} alt="User" className="question-card__avatar" />
            <span className="question-card__username">{mockQuestion.author.first_name}</span>
          </div>
          <div className="question-card__text-wrapper">
            <div className="question-card__text"><strong>Вопрос:</strong> {mockQuestion.text}</div>
          </div>
          <div className="question-card__actions-container">
            <div className="question-card__reaction-badges">
              <div className="question-card__reaction-badge">
                <img src={likeIcon} alt="Like" />
                <span>{mockQuestion.likes}</span>
              </div>
              <div className="question-card__reaction-badge">
                <img src={dislikeIcon} alt="Dislike" />
                <span>{mockQuestion.dislikes}</span>
              </div>
            </div>
            <div className="question-card__timestamp">
              {mockQuestion.created_at.split(' ')[1]}
            </div>
          </div>
          <div className="question-card__divider" style={{ marginTop: '20px' }}></div>
          <div
            className="question-card__footer"
            onClick={() => navigate('/questionanswerpage')}
            style={{ cursor: 'pointer' }}
          >
            <img src={avatarStack} alt="Avatars" className="question-card__avatar-stack" />
            <span className="question-card__comments">
              {mockQuestion.comments.length > 0
                ? `${mockQuestion.comments.length} комментария`
                : 'Прокомментировать'}
            </span>
            <img src={donatIcon} alt="Donate" className="question-card__icon-donat" />
            <img src={eyeIcon} alt="Views" className="question-card__icon-eye" />
            <p className="question-card__views">{mockQuestion.views}</p>
          </div>
        </div>

        {/* Вторая карточка */}
        <div className="question-card" style={{ marginTop: '20px' }}>
          <div className="question-card__header">
            <img src={userIcon} alt="User" className="question-card__avatar" />
            <span className="question-card__username">{additionalQuestion.author.first_name}</span>
          </div>
          <div className="question-card__text-wrapper">
            <div className="question-card__text">
              <strong>Вопрос:</strong> {additionalQuestion.text}
            </div>
          </div>
          <div className="question-card__divider" style={{ marginTop: '20px' }}></div>
          <div
            className="question-card__footer"
            onClick={() => navigate('/questionanswerpage')}
            style={{ cursor: 'pointer' }}
          >
            <img src={avatarStack} alt="Avatars" className="question-card__avatar-stack" />
            <span className="question-card__comments">Ответить на вопрос</span>
            <img src={donatIcon} alt="Donate" className="question-card__icon-donat" />
            <img src={eyeIcon} alt="Views" className="question-card__icon-eye" />
            <p className="question-card__views">{additionalQuestion.views}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionChatPage;
