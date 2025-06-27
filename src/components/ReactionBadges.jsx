import React from 'react';
import PropTypes from 'prop-types';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';
import '../styles/components/reaction-badges.scss';

const ReactionBadges = ({ likes, dislikes, userReaction, onReaction }) => {
  return (
    <div className="reaction-badges">
      <div
        className={`reaction-badge ${userReaction === 'like' ? 'reaction-badge--active' : ''}`}
        onClick={() => onReaction('like')}
      >
        <img src={likeIcon} alt="Like" />
        <span>{likes}</span>
      </div>

      <div
        className={`reaction-badge ${userReaction === 'dislike' ? 'reaction-badge--active' : ''}`}
        onClick={() => onReaction('dislike')}
      >
        <img src={dislikeIcon} alt="Dislike" />
        <span>{dislikes}</span>
      </div>
    </div>
  );
};

ReactionBadges.propTypes = {
  likes: PropTypes.number.isRequired,
  dislikes: PropTypes.number.isRequired,
  userReaction: PropTypes.oneOf(['like', 'dislike', null]),
  onReaction: PropTypes.func.isRequired
};

export default ReactionBadges;