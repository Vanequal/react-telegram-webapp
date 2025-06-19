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
import sendIconActive from '../assets/img/sendButtonActive.png'

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

function Comment({ comment, isNew }) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="comment-thread" id={isNew ? "new-comment" : undefined}>
      <div className="comment-item">
        <div className="comment-header">
          <img src={userIcon} alt="Avatar" className="comment-avatar" />
          <div className="comment-user">{comment.author?.first_name || 'Пользователь'}</div>
          <div className="comment-timestamp">
            {comment.created_at ? new Date(comment.created_at).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }) : ''}
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
                <div className="comment-timestamp">
                  {reply.created_at ? new Date(reply.created_at).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : ''}
                </div>
              </div>
              <div className="comment-content">{reply.text}</div>
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
  const { posts } = useSelector(state => state.post);
  const postComments = useSelector(state => state.post.comments[+id] || []);
  const { commentsLoading } = useSelector(state => state.post);

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const ideaFromState = location.state?.idea;
  const idea = useMemo(() => ideaFromState || posts.find(p => String(p.id) === id), [ideaFromState, posts, id]);
  const comments = postComments;

  // 🔥 ИСПРАВЛЕНО: Убрали дублирование запроса и исправили параметры
  const handleSendComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await dispatch(createComment({
        post_id: +id,
        message_text: commentText.trim(),
        section_key: 'chat_ideas', // В Redux action используется section_key
        theme_id: 1,
        files: [] // Добавили поддержку файлов если нужно
      })).unwrap();

      setCommentText('');
      
      // 🔥 УБРАЛИ дублирующий запрос - комментарий уже добавится в store через createComment.fulfilled

      // Прокручиваем к новому комментарию
      setTimeout(() => {
        const commentsContainer = document.querySelector('.comment-list');
        if (commentsContainer) {
          commentsContainer.scrollTop = commentsContainer.scrollHeight;
        }
      }, 100);

    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 ИСПРАВЛЕНО: Правильный type для загрузки комментариев к посту
  useEffect(() => {
    if (idea?.id) {
      dispatch(fetchPostComments({
        post_id: idea.id,
        section_key: 'chat_ideas',
        theme_id: 1,
        type: 'post' // 🔥 ИСПРАВЛЕНО: Используем 'post' вместо 'message'
      }));
    }
  }, [idea?.id, dispatch]);

  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          {commentsLoading && comments.length === 0 && (
            <p className="loading-comments">Загрузка комментариев...</p>
          )}
          
          {!commentsLoading && comments.length > 0 ? (
            comments.map((comment, index) => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                isNew={location.state?.scrollTo === 'new-comment' && index === comments.length - 1} 
              />
            ))
          ) : !commentsLoading && (
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
          disabled={isSubmitting}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendComment();
            }
          }}
        />
        <img
          src={commentText.trim() ? sendIconActive : sendIcon}
          alt="Send"
          className="discussion-footer__send"
          onClick={handleSendComment}
          style={{
            cursor: commentText.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
            opacity: commentText.trim() && !isSubmitting ? 1 : 0.5
          }}
        />
      </div>
    </div>
  );
}

export default DiscussionPage;