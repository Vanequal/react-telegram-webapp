// QuestionChatPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPostComments, fetchPostsInSection, createPost, fetchMessageAttachments, fetchMessageReactions } from '@/store/slices/postSlice.js'
import { fetchTheme } from '@/store/slices/themeSlice' // ✅ Добавлено
import { getViewedIdeas, markIdeaAsViewed } from '@/shared/utils/utils.js'

// Components
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader.jsx'
import QuestionCard from '@/features/questions/components/QuestionCard.jsx'
import QuestionComposer from '@/features/questions/components/QuestionComposer.jsx'

// Styles
import '@/styles/features/QuestionAnswerPage.scss'

// Constants
const SECTION_CODE = 'chat_qa' // ✅ Переименовано
const DEFAULT_THEME_ID = 1

const QuestionChatPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  // State
  const [questionData, setQuestionData] = useState({
    text: '',
    files: [],
  })

  // Redux selectors
  const { posts, loading, error, postsLoaded } = useSelector(state => state.post)
  const postComments = useSelector(state => state.post.comments)
  const commentsLoadingFlags = useSelector(state => state.post.commentsLoadingFlags)

  // Derived values
  const themeId = Number(searchParams.get('id')) || DEFAULT_THEME_ID

  const fetchParams = useMemo(
    () => ({
      section_code: SECTION_CODE, // ✅ Изменено
      theme_id: themeId,
      limit: 100,
      offset: 0,
    }),
    [themeId]
  )

  // Transform posts to questions format
  const questions = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).map(post => {
      const actualAnswers = postComments[post.id]?.length || 0

      return {
        id: post.id,
        username: post.author?.first_name || post.author?.username || 'Пользователь',
        text: post.text,
        likes: post.likes || 0,
        dislikes: post.dislikes || 0,
        answers: actualAnswers,
        views: post.views ?? 0,
        timestamp: post.created_at ?? '',
        created_at: post.created_at, // ✅ Добавлено
        files: post.media_files_ids || [], // ✅ Исправлено
        attachments: post.media_files_ids || [], // ✅ Добавлено для совместимости
        userReaction: post.user_reaction || null,
        author: post.author, // ✅ Добавлено
      }
    })
  }, [posts, postComments])

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegram = () => {
      const tg = window.Telegram?.WebApp
      if (tg) {
        try {
          tg.ready()
          tg.expand()
          tg.requestWriteAccess?.()
        } catch (err) {
          console.warn('[Telegram WebApp] initialization error:', err.message)
        }
      }
    }

    initTelegram()
  }, [])

  // ✅ Загружаем тему при монтировании
  useEffect(() => {
    dispatch(fetchTheme(themeId))
  }, [dispatch, themeId])

  // Fetch questions if not loaded
  useEffect(() => {
    if (!postsLoaded && !loading) {
      console.log('📥 Загружаем вопросы:', fetchParams)
      dispatch(fetchPostsInSection(fetchParams))
    }
  }, [dispatch, fetchParams, postsLoaded, loading])

  // Load attachments, reactions and answers for questions
  useEffect(() => {
    if (!posts || posts.length === 0) return

    posts.forEach(post => {
      // Загружаем вложения если их еще нет
      if (!post.attachments) {
        dispatch(fetchMessageAttachments({ message_id: post.id }))
      }

      // Загружаем реакции если их еще нет
      if (!post.reactions) {
        dispatch(fetchMessageReactions({ message_id: post.id }))
      }

      const isLoading = commentsLoadingFlags[post.id]
      const hasAnswers = postComments[post.id]

      if (!isLoading && !hasAnswers) {
        dispatch(
          fetchPostComments({
            post_id: post.id,
            section_code: SECTION_CODE,
            theme_id: themeId,
          })
        )
      }
    })
  }, [posts?.length, dispatch, themeId, commentsLoadingFlags, postComments])

  // Handlers
  const handleQuestionExpand = useCallback(
    id => {
      const viewed = getViewedIdeas()
      if (!viewed[id]) {
        markIdeaAsViewed(id)
      }

      const selected = questions.find(q => q.id === id)
      const post = posts.find(p => p.id === id)
      const questionWithText = {
        ...selected,
        message_text: post?.text || selected.text,
      }

      navigate(`/questionanswerpage/${id}`, { state: { question: questionWithText } })
    },
    [questions, posts, navigate]
  )

  const handleQuestionSubmit = useCallback(async () => {
    if (!questionData.text.trim()) return

    try {
      console.log('📤 Создаем вопрос:', {
        text: questionData.text.substring(0, 50),
        section_code: SECTION_CODE,
        theme_id: themeId,
      })

      // ✅ Создаем вопрос с новыми параметрами
      await dispatch(
        createPost({
          message_text: questionData.text.trim(),
          section_code: SECTION_CODE, // ✅ Изменено
          theme_id: themeId,
          type: 'post', // ✅ Добавлено
          is_openai_generated: false, // ✅ Добавлено
          ratio: 99, // ✅ Добавлено
          files: questionData.files,
        })
      ).unwrap()

      console.log('✅ Вопрос создан успешно')
      setQuestionData({ text: '', files: [] })
    } catch (error) {
      console.error('❌ Error creating question:', error)
      alert(`Ошибка создания вопроса: ${error}`)
    }
  }, [questionData, dispatch, themeId])

  const handleQuestionDataChange = useCallback(newData => {
    setQuestionData(newData)
  }, [])

  const handleNavigateToAbout = useCallback(() => navigate('/aboutpage'), [navigate])
  const handleNavigateBack = useCallback(() => navigate('/'), [navigate])

  // Render content based on state
  const renderContent = () => {
    if (loading && questions.length === 0) {
      return (
        <div className="question-loading">
          <p>Загрузка вопросов...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="question-error">
          <p>Ошибка загрузки: {error}</p>
        </div>
      )
    }

    if (!loading && questions.length === 0) {
      return (
        <div className="question-empty-state">
          <p>Вопросов пока нет. Задайте первый вопрос!</p>
        </div>
      )
    }

    return questions.map(question => (
      <QuestionCard
        key={question.id}
        question={question}
        onExpand={handleQuestionExpand}
        answerCount={question.answers}
        sectionCode={SECTION_CODE} // ✅ Изменено
        themeId={themeId}
      />
    ))
  }

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

      <div className="question-page__container">{renderContent()}</div>

      <QuestionComposer
        questionData={questionData}
        onQuestionDataChange={handleQuestionDataChange}
        onSubmit={handleQuestionSubmit}
        disabled={loading}
      />
    </div>
  )
}

export default QuestionChatPage