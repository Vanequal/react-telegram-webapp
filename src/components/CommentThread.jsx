// components/CommentThread.jsx
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { reactToPost } from '../store/slices/postSlice';
import userIcon from '../assets/img/userIcon.webp';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';

const CommentThread = ({ comment, isNew, sectionKey, themeId }) => {
  const dispatch = useDispatch();
  const [showReplies, setShowReplies] = useState(true);

  const toggleReplies = useCallback(() => {
    setShowReplies(prev => !prev);
  }, []);

  // Обработчик реакций на комментарий
  const handleCommentReaction = useCallback((reaction) => {
    dispatch(reactToPost({
      post_id: comment.id,
      reaction,
      section_key: sectionKey,
      theme_id: themeId
    }));
  }, [dispatch, comment.id, sectionKey, themeId]);

  // Обработчик реакций на ответы
  const handleReplyReaction = useCallback((replyId, reaction) => {
    dispatch(reactToPost({
      post_id: replyId,
      reaction,
      section_key: sectionKey,
      theme_id: themeId
    }));
  }, [dispatch, sectionKey, themeId]);

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
    <div className="comment-thread" id={isNew ? "new-comment" : undefined}>
      <div className="comment-item">
        <div className="comment-header">
          <img src={userIcon} alt="Avatar" className="comment-avatar" />
          <div className="comment-user">
            {comment.author?.first_name || comment.author?.username || 'Пользователь'}
          </div>
          <div className="comment-timestamp">
            {formatTimestamp(comment.created_at)}
          </div>
        </div>
        
        <div className="comment-content">{comment.text}</div>
        
        <div className="comment-actions-right">
          <div 
            className={`reaction-badge ${comment.reactions?.user_reaction === 'like' ? 'active' : ''}`}
            onClick={() => handleCommentReaction('like')}
            style={{ cursor: 'pointer' }}
          >
            <img src={likeIcon} alt="Like" />
            <span>{comment.reactions?.count_likes || 0}</span>
          </div>
          <div 
            className={`reaction-badge ${comment.reactions?.user_reaction === 'dislike' ? 'active' : ''}`}
            onClick={() => handleCommentReaction('dislike')}
            style={{ cursor: 'pointer' }}
          >
            <img src={dislikeIcon} alt="Dislike" />
            <span>{comment.reactions?.count_dislikes || 0}</span>
          </div>
        </div>
        
        {comment.replies?.length > 0 && (
          <div className="comment-actions-left">
            <button className="toggle-replies-button" onClick={toggleReplies}>
              {showReplies
                ? `Скрыть ответы (${comment.replies.length})`
                : `Показать ответы (${comment.replies.length})`}
            </button>
          </div>
        )}
      </div>

      {showReplies && comment.replies?.length > 0 && (
        <div className="replies-container">
          {comment.replies.map(reply => (
            <div key={reply.id} className="reply-thread">
              <div className="comment-header">
                <img src={userIcon} alt="Avatar" className="comment-avatar" />
                <div className="comment-user">
                  {reply.author?.first_name || reply.author?.username || 'Пользователь'}
                </div>
                <div className="comment-timestamp">
                  {formatTimestamp(reply.created_at)}
                </div>
              </div>
              <div className="comment-content">{reply.text}</div>
              
              <div className="comment-actions-right">
                <div 
                  className={`reaction-badge ${reply.reactions?.user_reaction === 'like' ? 'active' : ''}`}
                  onClick={() => handleReplyReaction(reply.id, 'like')}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={likeIcon} alt="Like" />
                  <span>{reply.reactions?.count_likes || 0}</span>
                </div>
                <div 
                  className={`reaction-badge ${reply.reactions?.user_reaction === 'dislike' ? 'active' : ''}`}
                  onClick={() => handleReplyReaction(reply.id, 'dislike')}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={dislikeIcon} alt="Dislike" />
                  <span>{reply.reactions?.count_dislikes || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CommentThread.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    author: PropTypes.object,
    text: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    reactions: PropTypes.object,
    replies: PropTypes.array
  }).isRequired,
  isNew: PropTypes.bool,
  sectionKey: PropTypes.string.isRequired,
  themeId: PropTypes.number.isRequired
};

export default CommentThread;