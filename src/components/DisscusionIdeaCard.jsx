// components/DiscussionIdeaCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import ReactionBadges from './ReactionBadges';
import avatarStack from '../../assets/img/avatarStack.webp';
import donatIcon from '../../assets/img/donatIcon.webp';
import eyeIcon from '../../assets/img/eyeIcon.webp';

const DiscussionIdeaCard = ({ idea }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.split(' ')[1] || '';
  };

  return (
    <div className="idea-card idea-card--no-header">
      <div className="idea-card__text-wrapper expanded">
        <div className="idea-card__text">{idea.message_text}</div>
      </div>

      <div className="idea-card__actions-container">
        <ReactionBadges
          likes={idea.likes || 0}
          dislikes={idea.dislikes || 0}
          userReaction={null}
          onReaction={() => {}} // Read-only in discussion view
          readOnly={true}
        />
        <div className="idea-card__timestamp">
          {formatTimestamp(idea.created_at)}
        </div>
      </div>

      <div className="idea-card__divider" />

      <div className="idea-card__footer">
        <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
        <span className="idea-card__comments">{idea.comments || 0} Комментариев</span>
        <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
        <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
        <p style={{ margin: 0, color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>
          {idea.views || 0}
        </p>
      </div>

      <div className="idea-card__divider" />
    </div>
  );
};

DiscussionIdeaCard.propTypes = {
  idea: PropTypes.shape({
    message_text: PropTypes.string,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    created_at: PropTypes.string,
    comments: PropTypes.number,
    views: PropTypes.number
  }).isRequired
};

export default DiscussionIdeaCard;