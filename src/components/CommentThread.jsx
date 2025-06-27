// components/CommentThread.jsx
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import userIcon from '../../assets/img/userIcon.webp';
import likeIcon from '../../assets/img/likeIcon.webp';
import dislikeIcon from '../../assets/img/dislikeIcon.webp';

const CommentThread = ({ comment, isNew }) => {
  const [showReplies, setShowReplies] = useState(true);

  const toggleReplies = useCallback(() => {
    setShowReplies(prev => !prev);
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-thread" id={isNew ? "new-comment" : undefined}>
      <div className="comment-item">
        <div className="comment-header">
          <img src={userIcon} alt="Avatar" className="comment-avatar" />
          <div className="comment-user">
            {comment.author?.first_name || 'Пользователь'}
          </div>
          <div className="comment-timestamp">
            {formatTimestamp(comment.created_at)}
          </div>
        </div>
        
        <div className="comment-content">{comment.text}</div>
        
        <div className="comment-actions-right">
          <div className="reaction-badge">
            <img src={likeIcon} alt="Like" />
            <span>{comment.reactions?.count_likes || 0}</span>
          </div>
          <div className="reaction-badge">
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
                  {reply.author?.first_name || 'Пользователь'}
                </div>
                <div className="comment-timestamp">
                  {formatTimestamp(reply.created_at)}
                </div>
              </div>
              <div className="comment-content">{reply.text}</div>
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
  isNew: PropTypes.bool
};

export default CommentThread;