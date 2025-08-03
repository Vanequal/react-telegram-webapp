// QuestionChatPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPostComments,
  fetchPostsInSection,
  createPost
} from '../store/slices/postSlice';
import { getViewedIdeas, markIdeaAsViewed } from '../utils/utils.js';

// Components
import MindVaultHeader from '../components/UI/MindVaultHeader';
import QuestionCard from '../components/QuestionCard';
import QuestionComposer from '../components/QuestionComposer';

// Styles
import '../styles/QuestionAnswerPage.scss';

// Constants
const SECTION_KEY = 'chat_ideas'; // Отдельная секция для вопросов
const DEFAULT_THEME_ID = 1;

const QuestionChatPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // State
  const [questionData, setQuestionData] = useState({
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
    limit: 100,
    offset: 0
  }), [themeId]);

  // Transform posts to questions format
  const questions = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).map(post => {
      const actualAnswers = postComments[post.id]?.length || 
                           post.comments?.length || 
                           post.comments_count || 0;
      
      const reactions = post.reactions || {};
      
      return {
        id: post.id,
        username: post.author?.first_name || post.author?.username || 'Пользователь',
        text: post.text,
        likes: reactions.count_likes || post.likes || 0,
        dislikes: reactions.count_dislikes || post.dislikes || 0,
        answers: actualAnswers,
        views: post.views ?? 0,
        timestamp: post.created_at ?? '',
        files: post.attachments || post.files || [],
        userReaction: reactions.user_reaction || post.user_reaction || null,
        author: post.author
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

  // Fetch questions if not loaded
  useEffect(() => {
    if (!postsLoaded && !loading) {
      dispatch(fetchPostsInSection(fetchParams));
    }
  }, [dispatch, fetchParams, postsLoaded, loading]);

  // Load answers for questions
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    posts.forEach(post => {
      const isLoading = commentsLoadingFlags[post.id];
      const hasAnswers = postComments[post.id];

      if (!isLoading && !hasAnswers) {
        dispatch(fetchPostComments({
          post_id: post.id,
          section_key: SECTION_KEY,
          theme_id: themeId,
        }));
      }
    });
  }, [posts?.length, dispatch, themeId, commentsLoadingFlags, postComments]);

  // Handlers
  const handleQuestionExpand = useCallback((id) => {
    const viewed = getViewedIdeas();
    if (!viewed[id]) {
      markIdeaAsViewed(id);
    }

    const selected = questions.find(q => q.id === id);
    const post = posts.find(p => p.id === id);
    const questionWithText = {
      ...selected,
      message_text: post?.text || selected.text
    };

    navigate(`/questionanswerpage/${id}`, { state: { question: questionWithText } });
  }, [questions, posts, navigate]);

  const handleQuestionSubmit = useCallback(async () => {
    if (!questionData.text.trim()) return;
  
    try {
      // Сразу создаем вопрос без превью GPT
      await dispatch(createPost({
        message_text: questionData.text.trim(),
        section_key: SECTION_KEY,
        theme_id: themeId,
        publishing_method: 'original', // Оригинал без обработки
        files: questionData.files
      })).unwrap();
  
      setQuestionData({ text: '', files: [] });
    } catch (error) {
      console.error('Error creating question:', error);
      alert(`Ошибка создания вопроса: ${error}`);
    }
  }, [questionData, dispatch, themeId]);

  const handleQuestionDataChange = useCallback((newData) => {
    setQuestionData(newData);
  }, []);

  const handleNavigateToAbout = useCallback(() => navigate('/aboutpage'), [navigate]);
  const handleNavigateBack = useCallback(() => navigate('/'), [navigate]);

  // Render content based on state
  const renderContent = () => {
    if (loading && questions.length === 0) {
      return (
        <div className="question-loading">
          <p>Загрузка вопросов...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="question-error">
          <p>Ошибка загрузки: {error}</p>
        </div>
      );
    }

    if (!loading && questions.length === 0) {
      return (
        <div className="question-empty-state">
          <p>Вопросов пока нет. Задайте первый вопрос!</p>
        </div>
      );
    }

    return questions.map(question => (
      <QuestionCard
        key={question.id}
        question={question}
        onExpand={handleQuestionExpand}
        answerCount={question.answers}
        sectionKey={SECTION_KEY}
        themeId={themeId}
      />
    ));
  };

  return (
    <div className="question-page">
      <MindVaultHeader
        onBackClick={handleNavigateBack}
        onDescriptionClick={handleNavigateToAbout}
        bgColor="#EEEFF1"
        textColor="black"
        hideSectionTitle
        title="Чат вопросов"
      />

      <div className="question-page__container">
        {renderContent()}
      </div>

      <QuestionComposer
        questionData={questionData}
        onQuestionDataChange={handleQuestionDataChange}
        onSubmit={handleQuestionSubmit}
        disabled={loading}
      />
    </div>
  );
};

export default QuestionChatPage;