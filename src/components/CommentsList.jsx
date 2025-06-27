import React from 'react';
import PropTypes from 'prop-types';

const CommentsList = ({ comments }) => {
  return (
    <div className="comments-list">
      {comments.map(comment => (
        <div key={comment.id} className="comment-item">
          <strong>{comment.author?.first_name || 'Аноним'}:</strong> {comment.text}
        </div>
      ))}
    </div>
  );
};

CommentsList.propTypes = {
  comments: PropTypes.array.isRequired
};

export default CommentsList;