// components/CommentComposer.jsx
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';
import sendIconActive from '../assets/img/sendButtonActive.png';

const CommentComposer = ({ commentText, onCommentChange, onSubmit, isSubmitting }) => {
  const handleChange = useCallback((e) => {
    onCommentChange(e.target.value);
  }, [onCommentChange]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit]);

  const handleSubmit = useCallback(() => {
    if (commentText.trim() && !isSubmitting) {
      onSubmit();
    }
  }, [commentText, isSubmitting, onSubmit]);

  const isDisabled = !commentText.trim() || isSubmitting;

  return (
    <div className="discussion-footer">
      <img src={skrepkaIcon} alt="Attach" className="discussion-footer__icon" />
      <input
        type="text"
        className="discussion-footer__input"
        placeholder="Комментировать"
        value={commentText}
        onChange={handleChange}
        disabled={isSubmitting}
        onKeyPress={handleKeyPress}
      />
      <img
        src={isDisabled ? sendIcon : sendIconActive}
        alt="Send"
        className="discussion-footer__send"
        onClick={handleSubmit}
        style={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1
        }}
      />
    </div>
  );
};

CommentComposer.propTypes = {
  commentText: PropTypes.string.isRequired,
  onCommentChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};

export default CommentComposer;