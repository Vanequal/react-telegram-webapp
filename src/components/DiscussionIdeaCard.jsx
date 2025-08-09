// components/DiscussionIdeaCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ReactionBadges from './ReactionBadges';
import FileAttachments from './FileAttachments';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';

const DiscussionIdeaCard = ({ idea, onReaction }) => {
  // Получаем актуальные данные из Redux
  const posts = useSelector(state => state.post.posts);
  const currentPost = posts.find(p => p.id === idea.id);
  const comments = useSelector(state => state.post.comments[idea.id] || []);

  // Используем актуальные данные из Redux или fallback на переданные
  const currentLikes = currentPost?.reactions?.count_likes ?? 
                      currentPost?.likes ?? 
                      idea.likes ?? 0;
  
  const currentDislikes = currentPost?.reactions?.count_dislikes ?? 
                         currentPost?.dislikes ?? 
                         idea.dislikes ?? 0;
  
  const currentUserReaction = currentPost?.reactions?.user_reaction ?? 
                             currentPost?.user_reaction ?? 
                             idea.userReaction ?? null;

  // Файлы (если есть)
  const ideaFiles = idea.attachments || currentPost?.attachments || [];

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
    <div className="idea-card idea-card--no-header">
      <div className="idea-card__text-wrapper expanded">
        <div className="idea-card__text">
          {idea.text || idea.message_text || 'Нет текста'}
        </div>
      </div>

      {/* File Attachments */}
      {ideaFiles?.length > 0 && (
        <div className="idea-card__files">
          <FileAttachments files={ideaFiles} />
        </div>
      )}

      <div className="idea-card__actions-container">
        <ReactionBadges
          likes={currentLikes}
          dislikes={currentDislikes}
          userReaction={currentUserReaction}
          onReaction={onReaction}
          readOnly={false} // Теперь можно реагировать
        />
        <div className="idea-card__timestamp">
          {formatTimestamp(idea.created_at)}
        </div>
      </div>
    </div>
  );
};

DiscussionIdeaCard.propTypes = {
  idea: PropTypes.shape({
    id: PropTypes.number,
    text: PropTypes.string,
    message_text: PropTypes.string,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    userReaction: PropTypes.string,
    created_at: PropTypes.string,
    comments: PropTypes.number,
    views: PropTypes.number,
    attachments: PropTypes.array
  }).isRequired,
  onReaction: PropTypes.func.isRequired
};

export default DiscussionIdeaCard;