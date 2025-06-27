// MindVaultPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as postActions from '../store/slices/postSlice';
import { getViewedIdeas, markIdeaAsViewed } from '../utils/utils.js';

// Деструктуризация после импорта для лучшей отладки
const { 
  createPost,
  createPostPreview, 
  fetchPostComments, 
  fetchPostsInSection
} = postActions;

// Components
import MindVaultHeader from '../components/UI/MindVaultHeader';
import IdeaCard from './components/IdeaCard';
import PostComposer from './components/PostComposer';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

// Styles
import '../styles/components/mind-vault.scss';

// Constants
const SECTION_KEY = 'chat_ideas';
const DEFAULT_THEME_ID = 1;

const MindVaultPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // State
  const [expandedIdeaId, setExpandedIdeaId] = useState(null);
  const [postData, setPostData] = useState({
    text: '',
    files: []
  });

  // Redux selectors
  const { posts, loading, error, postsLoaded } = useSelector(state => state.post);
  const postComments = useSelector(state => state.post.comments);
  const commentsLoadingFlags = useSelector(state => state.post.commentsLoadingFlags);

  // Derived values
  const themeId = Number(searchParams.get('id')) || DEFAULT_THEME_ID;

  const fetchParams = useMemo(() => ({
    section_key: SECTION_KEY,
    theme_id: themeId,
    content_type: 'posts'
  }), [themeId]);

  // Transform posts to ideas format
  const ideas = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).map(post => {
      const actualComments = postComments[post.id]?.length;
      return {
        id: post.id,
        username: post.author?.first_name || 'Пользователь',
        preview: post.text,
        likes: post.likes || 0,
        dislikes: post.dislikes || 0,
        comments: actualComments ?? post.comments_count ?? 0,
        views: post.views ?? 0,
        pinned: post.pinned ?? false,
        timestamp: post.created_at ?? '',
        files: post.files || [],
        userReaction: post.user_reaction || null
      };
    });
  }, [posts, postComments]);

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegram = () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        try {
          tg.ready();
          tg.expand();
          tg.requestWriteAccess?.();
        } catch (err) {
          console.warn('[Telegram WebApp] initialization error:', err.message);
        }
      }
    };

    initTelegram();
  }, []);

  // Fetch posts if not loaded
  useEffect(() => {
    if (!postsLoaded && !loading) {
      dispatch(fetchPostsInSection(fetchParams));
    }
  }, [dispatch, fetchParams, postsLoaded, loading]);

  // Load comments for posts
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    posts.forEach(post => {
      const isLoading = commentsLoadingFlags[post.id];
      const hasComments = postComments[post.id];

      if (!isLoading && !hasComments) {
        dispatch(fetchPostComments({
          post_id: post.id,
          section_key: SECTION_KEY,
          theme_id: themeId,
          type: 'post',
        }));
      }
    });
  }, [posts?.length, dispatch, themeId, commentsLoadingFlags, postComments]);

  // Handlers
  const handleIdeaExpand = useCallback((id) => {
    const viewed = getViewedIdeas();
    if (!viewed[id]) {
      markIdeaAsViewed(id);
    }
    
    const selected = ideas.find(i => i.id === id);
    const post = posts.find(p => p.id === id);
    const ideaWithText = {
      ...selected,
      message_text: post?.text || selected.preview
    };
    
    navigate(`/discussion/${id}`, { state: { idea: ideaWithText } });
  }, [ideas, posts, navigate]);

  const handlePostSubmit = useCallback(async () => {
    if (!postData.text.trim()) return;

    try {
      // Проверяем наличие createPost
      if (!createPost) {
        console.error('createPost is not defined!');
        return;
      }

      if (postData.files.length > 0) {
        // Direct post creation with files
        console.log('Creating post with files...', {
          filesCount: postData.files.length,
          files: postData.files,
          text: postData.text
        });

        // Проверяем, что dispatch и createPost существуют
        console.log('Dispatch available:', !!dispatch);
        console.log('createPost available:', !!createPost);

        const actionResult = await dispatch(createPost({
          message_text: postData.text.trim(),
          section_id: SECTION_KEY,
          theme_id: themeId,
          publishing_method: 'original',
          files: postData.files
        }));

        console.log('Action result:', actionResult);

        if (actionResult.meta?.requestStatus === 'fulfilled') {
          console.log('✅ Post with files created:', actionResult.payload);

          // Reset form
          setPostData({ text: '', files: [] });

          // Reload posts
          dispatch(fetchPostsInSection({
            section_key: SECTION_KEY,
            theme_id: themeId
          }));
        } else {
          console.error('Failed to create post:', actionResult);
        }

      } else {
        // Create preview for AI processing
        console.log('Creating post preview...');
        const previewResult = await dispatch(createPostPreview({
          section_id: SECTION_KEY,
          theme_id: themeId,
          text: postData.text.trim()
        })).unwrap();

        navigate('/editideapagegpt', {
          state: {
            attachedFiles: [],
            preview: previewResult
          }
        });
      }
    } catch (error) {
      console.error('Error creating post/preview:', error);
      console.error('Error stack:', error.stack);
    }
  }, [postData, dispatch, themeId, navigate]);

  const handlePostDataChange = useCallback((newData) => {
    setPostData(newData);
  }, []);

  const handleNavigateToAbout = useCallback(() => navigate('/aboutpage'), [navigate]);
  const handleNavigateBack = useCallback(() => navigate('/'), [navigate]);

  // Render content based on state
  const renderContent = () => {
    if (loading && ideas.length === 0) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} />;
    }

    if (!loading && ideas.length === 0) {
      return <EmptyState />;
    }

    if (expandedIdeaId) {
      const expandedIdea = ideas.find(i => i.id === expandedIdeaId);
      return (
        <IdeaCard
          idea={expandedIdea}
          onExpand={handleIdeaExpand}
          commentCount={expandedIdea?.comments || 0}
          isExpanded={true}
          onCollapse={() => setExpandedIdeaId(null)}
          sectionKey={SECTION_KEY}
          themeId={themeId}
        />
      );
    }

    return ideas.map(idea => (
      <IdeaCard
        key={idea.id}
        idea={idea}
        commentCount={idea.comments}
        onExpand={handleIdeaExpand}
        isExpanded={false}
        sectionKey={SECTION_KEY}
        themeId={themeId}
      />
    ));
  };

  return (
    <>
      <MindVaultHeader
        onDescriptionClick={handleNavigateToAbout}
        onBackClick={handleNavigateBack}
        textColor="black"
        bgColor="#EEEFF1"
      />

      <div className="mind-vault-page">
        {renderContent()}
      </div>

      {!expandedIdeaId && (
        <PostComposer
          postData={postData}
          onPostDataChange={handlePostDataChange}
          onSubmit={handlePostSubmit}
        />
      )}
    </>
  );
};

export default MindVaultPage;