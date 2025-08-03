// components/QuestionDisplayCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ReactionBadges from './ReactionBadges';
import FileAttachments from './FileAttachments';
import userIcon from '../assets/img/userIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';

const QuestionDisplayCard = ({ question, onReaction }) => {
  // Получаем актуальные данные из Redux
  const posts = useSelector(state => state.post.posts);
  const currentPost = posts.find(p => p.id === question.id);
  const answers = useSelector(state => state.post.comments[question.id] || []);

  // Используем актуальные данные из Redux или fallback на переданные
  const currentLikes = currentPost?.reactions?.count_likes ?? 
                      currentPost?.likes ?? 
                      question.likes ?? 0;
  
  const currentDislikes = currentPost?.reactions?.count_dislikes ?? 
                         currentPost?.dislikes ?? 
                         question.dislikes ?? 0;
  
  const currentUserReaction = currentPost?.reactions?.user_reaction ?? 
                             currentPost?.user_reaction ?? 
                             question.userReaction ?? null;

  // Файлы (если есть)
  const questionFiles = question.attachments || currentPost?.attachments || [];

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting timestamp:', timestamp);
      return '';
    }
  };

  return (
    <div className="question-card">
      {/* Верхняя часть: аватар и имя */}
      <div className="question-card__header">
        <img src={userIcon} alt="User" className="question-card__avatar" />
        <span className="question-card__username">
          {question.author?.first_name || question.username || 'Имя Пользователя'}
        </span>
      </div>

      {/* Текст вопроса */}
      <div className="question-card__text-wrapper">
        <div className="question-card__text">
          <strong>Вопрос:</strong> {question.text || question.message_text || 'Нет текста'}
        </div>
      </div>

      {/* File Attachments */}
      {questionFiles?.length > 0 && (
        <div className="question-card__files">
          <FileAttachments files={questionFiles} />
        </div>
      )}

      {/* Лайки и дизлайки */}
      <div className="question-card__actions-container">
        <div className="question-card__reaction-badges">
          <ReactionBadges
            likes={currentLikes}
            dislikes={currentDislikes}
            userReaction={currentUserReaction}
            onReaction={onReaction}
            readOnly={false}
          />
        </div>
        <div className="question-card__timestamp">
          {formatTimestamp(question.created_at)}
        </div>
      </div>

      <div className="question-card__divider" style={{ marginTop: '20px' }}></div>

      {/* Футер карточки */}
      <div className="question-card__footer" style={{ cursor: 'pointer' }}>
        <img src={avatarStack} alt="Avatars" className="question-card__avatar-stack" />
        <span className="question-card__comments">
          {answers.length > 0
            ? `${answers.length} ответов`
            : 'Прокомментировать'}
        </span>
        <img src={donatIcon} alt="Donate" className="question-card__icon-donat" />
        <img src={eyeIcon} alt="Views" className="question-card__icon-eye" />
        <p className="question-card__views">{question.views || 0}</p>
      </div>

      <div className="question-card__divider" />
    </div>
  );
};

QuestionDisplayCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number,
    text: PropTypes.string,
    message_text: PropTypes.string,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    userReaction: PropTypes.string,
    created_at: PropTypes.string,
    views: PropTypes.number,
    attachments: PropTypes.array,
    author: PropTypes.object,
    username: PropTypes.string
  }).isRequired,
  onReaction: PropTypes.func.isRequired
};

export default QuestionDisplayCard;