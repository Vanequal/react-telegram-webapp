import React from 'react'
import PropTypes from 'prop-types'
import likeIcon from '@/assets/images/likeIcon.webp'
import dislikeIcon from '@/assets/images/dislikeIcon.webp'
import '@/styles/components/reaction-badges.scss'

const ReactionBadges = ({ likes, dislikes, userReaction, onReaction, readOnly = false }) => {
  const handleLike = () => {
    if (!readOnly && onReaction) {
      onReaction('like')
    }
  }

  const handleDislike = () => {
    if (!readOnly && onReaction) {
      onReaction('dislike')
    }
  }

  return (
    <div className="reaction-badges">
      <div
        className={`reaction-badge ${userReaction === 'like' ? 'reaction-badge--active' : ''}`}
        onClick={handleLike}
        style={{
          cursor: readOnly ? 'default' : 'pointer',
          opacity: readOnly ? 0.7 : 1,
        }}
      >
        <img src={likeIcon} alt="Like" />
        <span>{likes}</span>
      </div>

      <div
        className={`reaction-badge ${userReaction === 'dislike' ? 'reaction-badge--active' : ''}`}
        onClick={handleDislike}
        style={{
          cursor: readOnly ? 'default' : 'pointer',
          opacity: readOnly ? 0.7 : 1,
        }}
      >
        <img src={dislikeIcon} alt="Dislike" />
        <span>{dislikes}</span>
      </div>
    </div>
  )
}

ReactionBadges.propTypes = {
  likes: PropTypes.number.isRequired,
  dislikes: PropTypes.number.isRequired,
  userReaction: PropTypes.oneOf(['like', 'dislike', null]),
  onReaction: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
}

export default ReactionBadges
