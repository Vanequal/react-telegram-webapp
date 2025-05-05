import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { createComment, fetchPostComments } from '../store/slices/postSlice';

import MindVaultHeader from '../components/UI/MindVaultHeader';

import userIcon from '../assets/img/userIcon.webp';
import likeIcon from '../assets/img/likeIcon.webp';
import dislikeIcon from '../assets/img/dislikeIcon.webp';
import avatarStack from '../assets/img/avatarStack.webp';
import donatIcon from '../assets/img/donatIcon.webp';
import eyeIcon from '../assets/img/eyeIcon.webp';
import skrepkaIcon from '../assets/img/skrepkaIcon.webp';
import sendIcon from '../assets/img/sendIcon.webp';

import '../styles/DiscussionPage.scss';

function IdeaCard({ idea }) {
  return (
    <div className="idea-card idea-card--no-header">
      <div className="idea-card__text-wrapper expanded">
        <div className="idea-card__text">{idea.message_text}</div>
      </div>

      <div className="idea-card__actions-container">
        <div className="idea-card__reaction-badges">
          <div className="idea-card__reaction-badge">
            <img src={likeIcon} alt="Like" />
            <span>{idea.likes}</span>
          </div>
          <div className="idea-card__reaction-badge">
            <img src={dislikeIcon} alt="Dislike" />
            <span>{idea.dislikes}</span>
          </div>
        </div>
        <div className="idea-card__timestamp">{idea.created_at?.split(' ')[1]}</div>
      </div>

      <div className="idea-card__divider"></div>

      <div className="idea-card__footer">
        <img src={avatarStack} alt="Avatars" className="idea-card__avatar-stack" />
        <span className="idea-card__comments">{idea.comments || 0} Комментариев</span>
        <img src={donatIcon} alt="Donate" className="idea-card__icon-donat" />
        <img src={eyeIcon} alt="Views" className="idea-card__icon-eye" />
        <p style={{ margin: 0, color: 'rgba(193, 198, 201, 1)', fontSize: '14px' }}>{idea.views}</p>
      </div>

      <div className="idea-card__divider"></div>
    </div>
  );
}

function Comment({ comment }) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="comment-thread" id={isNew ? "new-comment" : undefined}>
      <div className="comment-item">
        <div className="comment-header">
          <img src={userIcon} alt="Avatar" className="comment-avatar" />
          <div className="comment-user">{comment.author?.first_name || 'Пользователь'}</div>
          <div className="comment-timestamp">{comment.created_at?.split(' ')[1]}</div>
        </div>
        <div className="comment-content">{comment.message_text}</div>
        <div className="comment-actions-right">
          <div className="reaction-badge">
            <img src={likeIcon} alt="Like" />
            <span>{comment.likes}</span>
          </div>
          <div className="reaction-badge">
            <img src={dislikeIcon} alt="Dislike" />
            <span>{comment.dislikes}</span>
          </div>
        </div>
        {comment.replies?.length > 0 && (
          <div className="comment-actions-left">
            <button className="toggle-replies-button" onClick={() => setShowReplies(!showReplies)}>
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
                <div className="comment-user">{reply.author?.first_name || 'Пользователь'}</div>
                <div className="comment-timestamp">{reply.created_at?.split(' ')[1]}</div>
              </div>
              <div className="comment-content">{reply.message_text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiscussionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { posts } = useSelector(state => state.section);
  const postComments = useSelector(state => state.post.comments[+id] || []);

  const [commentText, setCommentText] = useState('');
  const ideaFromState = location.state?.idea;
  const idea = useMemo(() => ideaFromState || posts.find(p => String(p.id) === id), [ideaFromState, posts, id]);
  const comments = postComments;

  const handleSendComment = () => {
    if (!commentText.trim()) return;
  
    const scrollToNew = () => {
      setTimeout(() => {
        const el = document.getElementById('new-comment');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200); 
    };
  
    sessionStorage.setItem('return_to_discussion', JSON.stringify({
      id: idea.id,
      scrollTo: 'new-comment'
    }));
  
    dispatch(createComment({
      post_id: idea.id,
      message_text: commentText.trim(),
      parent_id: null,
      section_key: 'chat_ideas',
      theme_id: 1,
      content_type: 'post'
    })).then(() => {
      navigate('/reload'); 
    });
  };  

  useEffect(() => {
    if (idea?.id) {
      dispatch(fetchPostComments({
        post_id: idea.id,
        section_key: 'chat_ideas',
        theme_id: 1,
        content_type: 'post'
      }));
    }
  }, [idea?.id, dispatch]);

  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sessionStorage.removeItem('return_to_discussion');
      }, 300);
    }
  }, [location.state]);
  
  
  return (
    <div className="discussion-page">
      <MindVaultHeader
        onBackClick={() => navigate('/mindvault')}
        onDescriptionClick={() => navigate('/aboutpage')}
        bgColor={"#EEEFF1"}
        textColor="black"
      />

      <div className="discussion-page__container">
        {idea && (
          <div className="discussion-page__idea-wrapper">
            <IdeaCard idea={idea} />
          </div>
        )}

        <div id="discussion-start" className="discussion-pill">Начало обсуждения</div>

        <div className="comment-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="empty-comments">Комментариев пока нет</p>
          )}
        </div>
      </div>

      <div className="discussion-footer">
        <img src={skrepkaIcon} alt="Attach" className="discussion-footer__icon" />
        <input
          type="text"
          className="discussion-footer__input"
          placeholder="Комментировать"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <img
          src={sendIcon}
          alt="Send"
          className="discussion-footer__send"
          onClick={handleSendComment}
          style={{
            cursor: commentText.trim() ? 'pointer' : 'not-allowed',
            opacity: commentText.trim() ? 1 : 0.5
          }}
        />
      </div>
    </div>
  );
}


export default DiscussionPage;
