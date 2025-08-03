// QuestionAnswerPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createComment, fetchPostComments, reactToPost, fetchPostById } from '../store/slices/postSlice';

// Components
import MindVaultHeader from '../components/UI/MindVaultHeader';
import QuestionDisplayCard from '../components/QuestionDisplayCard';
import AnswerThread from '../components/AnswerThread';
import AnswerComposer from '../components/AnswerComposer';

// Styles
import '../styles/QuestionAnswerPage.scss';

// Constants
const SECTION_KEY = 'chat_questions';
const DEFAULT_THEME_ID = 1;

const QuestionAnswerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux selectors
  const { posts, selectedPost } = useSelector(state => state.post);
  const postAnswers = useSelector(state => state.post.comments[+id] || []);
  const { commentsLoading, loading } = useSelector(state => state.post);

  // Local state
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answersLoaded, setAnswersLoaded] = useState(false);
  
  // Derived data
  const questionFromState = location.state?.question;
  const questionFromPosts = posts.find(p => String(p.id) === id);
  const question = useMemo(() => {
    return questionFromState || questionFromPosts || selectedPost;
  }, [questionFromState, questionFromPosts, selectedPost]);

  const answers = postAnswers;

  // Handlers
  const handleSendAnswer = useCallback(async (files = []) => {
    if ((!answerText.trim() && files.length === 0) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log('📤 Отправка ответа с файлами:', {
        text: answerText.trim(),
        filesCount: files.length,
        files: files.map(f => f.name)
      });

      await dispatch(createComment({
        post_id: +id,
        message_text: answerText.trim(),
        section_key: SECTION_KEY,
        theme_id: DEFAULT_THEME_ID,
        files: files
      })).unwrap();

      setAnswerText('');
      
      // Scroll to bottom after adding answer
      setTimeout(() => {
        const answersContainer = document.querySelector('.answer-list');
        if (answersContainer) {
          answersContainer.scrollTop = answersContainer.scrollHeight;
        }
      }, 100);

    } catch (error) {
      console.error('Error adding answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [answerText, isSubmitting, dispatch, id]);

  const handleAnswerChange = useCallback((text) => {
    setAnswerText(text);
  }, []);

  const handleNavigateBack = useCallback(() => {
    navigate('/questionchat');
  }, [navigate]);

  const handleNavigateToAbout = useCallback(() => {
    navigate('/aboutpage');
  }, [navigate]);

  // Обработчик реакций на вопрос
  const handleQuestionReaction = useCallback((reaction) => {
    if (question?.id) {
      dispatch(reactToPost({
        post_id: question.id,
        reaction,
        section_key: SECTION_KEY,
        theme_id: DEFAULT_THEME_ID
      }));
    }
  }, [dispatch, question?.id]);

  // Effect для загрузки вопроса, если его нет в состоянии
  useEffect(() => {
    const questionId = +id;
    if (questionId && !question && !loading) {
      console.log('🔄 Загружаем вопрос по ID:', questionId);
      dispatch(fetchPostById({
        message_id: questionId,
        section_key: SECTION_KEY,
        theme_id: DEFAULT_THEME_ID
      }));
    }
  }, [id, question, loading, dispatch]);

  // Effect для загрузки ответов
  useEffect(() => {
    const questionId = +id;
    
    const shouldLoadAnswers = questionId && 
      !answersLoaded && 
      !commentsLoading && 
      (!answers || answers.length === 0);

    if (shouldLoadAnswers) {
      console.log('🔄 Загружаем ответы для вопроса:', questionId);
      setAnswersLoaded(true);
      
      dispatch(fetchPostComments({
        post_id: questionId,
        section_key: SECTION_KEY,
        theme_id: DEFAULT_THEME_ID,
        type: 'post'
      }));
    }
  }, [id, answers, commentsLoading, answersLoaded, dispatch]);

  // Effect для сброса флага при смене вопроса
  useEffect(() => {
    setAnswersLoaded(false);
  }, [id]);

  // Effect для скролла к элементу
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
    <div className="question-page">
      <MindVaultHeader
        onBackClick={handleNavigateBack}
        onDescriptionClick={handleNavigateToAbout}
        bgColor="#EEEFF1"
        textColor="black"
        hideSectionTitle
        title="Ответы"
      />

      <div className="question-page__container">
        {/* Показываем лоадер, если вопрос загружается */}
        {loading && !question && (
          <div className="loading-post">Загрузка вопроса...</div>
        )}

        {question && (
          <div className="question-page__wrapper">
            <QuestionDisplayCard 
              question={question} 
              onReaction={handleQuestionReaction}
            />
          </div>
        )}

        <div id="question-start" className="question-pill">
          Начало Обсуждения
        </div>

        <div className="question-comment-list answer-list">
          {commentsLoading && (
            <p className="loading-comments">Загрузка ответов...</p>
          )}
          
          {!commentsLoading && answers.length > 0 ? (
            answers.map((answer, index) => (
              <AnswerThread 
                key={answer.id} 
                answer={answer} 
                isNew={location.state?.scrollTo === 'new-answer' && index === answers.length - 1}
                sectionKey={SECTION_KEY}
                themeId={DEFAULT_THEME_ID}
              />
            ))
          ) : !commentsLoading && answersLoaded && (
            <p className="question-empty-comments">Ответов пока нет</p>
          )}
        </div>
      </div>

      <AnswerComposer
        answerText={answerText}
        onAnswerChange={handleAnswerChange}
        onSubmit={handleSendAnswer}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default QuestionAnswerPage;