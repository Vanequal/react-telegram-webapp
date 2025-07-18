// DiscussionPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createComment, fetchPostComments, reactToPost } from '../store/slices/postSlice';

// Components
import MindVaultHeader from '../components/UI/MindVaultHeader';
import DiscussionIdeaCard from '../components/DiscussionIdeaCard';
import CommentThread from '../components/CommentThread';
import CommentComposer from '../components/CommentComposer';

// Styles
import '../styles/components/discussion.scss';

// Constants
const SECTION_KEY = 'chat_ideas';
const DEFAULT_THEME_ID = 1;

const DiscussionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux selectors
  const { posts } = useSelector(state => state.post);
  const postComments = useSelector(state => state.post.comments[+id] || []);
  const { commentsLoading } = useSelector(state => state.post);

  // Local state
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Derived data
  const ideaFromState = location.state?.idea;
  const idea = useMemo(() => ideaFromState || posts.find(p => String(p.id) === id), [ideaFromState, posts, id]);
  const comments = postComments;

  // Handlers
  const handleSendComment = useCallback(async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await dispatch(createComment({
        post_id: +id,
        message_text: commentText.trim(),
        section_key: SECTION_KEY,
        theme_id: DEFAULT_THEME_ID,
        files: [] 
      })).unwrap();

      setCommentText('');
      
      // Scroll to bottom after adding comment
      setTimeout(() => {
        const commentsContainer = document.querySelector('.comment-list');
        if (commentsContainer) {
          commentsContainer.scrollTop = commentsContainer.scrollHeight;
        }
      }, 100);

    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [commentText, isSubmitting, dispatch, id]);

  const handleCommentChange = useCallback((text) => {
    setCommentText(text);
  }, []);

  const handleNavigateBack = useCallback(() => {
    navigate('/mindvault');
  }, [navigate]);

  const handleNavigateToAbout = useCallback(() => {
    navigate('/aboutpage');
  }, [navigate]);

  // Обработчик реакций на пост (для DiscussionIdeaCard)
  const handlePostReaction = useCallback((reaction) => {
    if (idea?.id) {
      dispatch(reactToPost({
        post_id: idea.id,
        reaction,
        section_key: SECTION_KEY,
        theme_id: DEFAULT_THEME_ID
      }));
    }
  }, [dispatch, idea?.id]);

  // Effects
  useEffect(() => {
    if (idea?.id) {
      console.log('🔄 Загружаем комментарии для поста:', idea.id);
      dispatch(fetchPostComments({
        post_id: idea.id,
        section_key: SECTION_KEY,
        theme_id: DEFAULT_THEME_ID,
        type: 'post'
      }));
    }
  }, [idea?.id, dispatch]);

  // Автозагрузка комментариев при монтировании компонента (для случая перезагрузки страницы)
  useEffect(() => {
    const postId = +id;
    if (postId && (!comments || comments.length === 0)) {
      console.log('🔄 Автозагрузка комментариев при перезагрузке для поста:', postId);
      dispatch(fetchPostComments({
        post_id: postId,
        section_key: SECTION_KEY,
        theme_id: DEFAULT_THEME_ID,
        type: 'post'
      }));
    }
  }, [id, comments, dispatch]);

  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [location.state]);

  return (
    <div className="discussion-page">
      <MindVaultHeader
        onBackClick={handleNavigateBack}
        onDescriptionClick={handleNavigateToAbout}
        bgColor="#EEEFF1"
        textColor="black"
      />

      <div className="discussion-page__container">
        {idea && (
          <div className="discussion-page__idea-wrapper">
            <DiscussionIdeaCard 
              idea={idea} 
              onReaction={handlePostReaction}
            />
          </div>
        )}

        <div id="discussion-start" className="discussion-pill">
          Начало обсуждения
        </div>

        <div className="comment-list">
          {commentsLoading && comments.length === 0 && (
            <p className="loading-comments">Загрузка комментариев...</p>
          )}
          
          {!commentsLoading && comments.length > 0 ? (
            comments.map((comment, index) => (
              <CommentThread 
                key={comment.id} 
                comment={comment} 
                isNew={location.state?.scrollTo === 'new-comment' && index === comments.length - 1}
                sectionKey={SECTION_KEY}
                themeId={DEFAULT_THEME_ID}
              />
            ))
          ) : !commentsLoading && (
            <p className="empty-comments">Комментариев пока нет</p>
          )}
        </div>
      </div>

      <CommentComposer
        commentText={commentText}
        onCommentChange={handleCommentChange}
        onSubmit={handleSendComment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DiscussionPage;