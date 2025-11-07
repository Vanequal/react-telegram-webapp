// PublicationChatPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPostComments, fetchPostsInSection, createPost, uploadFiles } from '@/store/slices/postSlice.js'
import { fetchTheme } from '@/store/slices/themeSlice' // ✅ Добавлено
import { getViewedIdeas, markIdeaAsViewed } from '@/shared/utils/utils.js'

// Components
import PublicationCard from '../components/PublicationCard.jsx'

// Icons
import menuIcon from '@/assets/images/menuQuestion.png'
import bellIcon from '@/assets/images/bellIcon.png'
import arrowIcon from '@/assets/images/arrowIconQuestion.png'
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'

// Styles
import '@/styles/features/PublicationChatPage.scss'

// Constants
const SECTION_CODE = 'chat_publications' // ✅ Переименовано
const DEFAULT_THEME_ID = 1

const PublicationChatPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  // State
  const [publicationData, setPublicationData] = useState({
    excerpt: '',
    files: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Transform posts to publications format
  const publications = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).map(post => {
      const actualComments = postComments[post.id]?.length || 0

      return {
        id: post.id,
        username: post.author?.first_name || post.author?.username || 'Пользователь',
        excerpt: post.text,
        text: post.text, // ✅ Добавлено
        likes: post.likes || 0,
        dislikes: post.dislikes || 0,
        comments: actualComments,
        views: post.views ?? 0,
        timestamp: post.created_at ?? '',
        created_at: post.created_at, // ✅ Добавлено
        files: post.media_files_ids || [], // ✅ Исправлено
        attachments: post.media_files_ids || [], // ✅ Добавлено
        userReaction: post.user_reaction || null,
        author: post.author, // ✅ Добавлено
      }
    })
  }, [posts, postComments])

  // ✅ Загружаем тему при монтировании
  useEffect(() => {
    dispatch(fetchTheme(themeId))
  }, [dispatch, themeId])

  // Fetch publications if not loaded
  useEffect(() => {
    if (!postsLoaded && !loading) {
      console.log('📥 Загружаем публикации:', fetchParams)
      dispatch(fetchPostsInSection(fetchParams))
    }
  }, [dispatch, fetchParams, postsLoaded, loading])

  // Load comments for publications
  useEffect(() => {
    if (!posts || posts.length === 0) return

    posts.forEach(post => {
      const isLoading = commentsLoadingFlags[post.id]
      const hasComments = postComments[post.id]

      if (!isLoading && !hasComments) {
        dispatch(
          fetchPostComments({
            post_id: post.id,
            section_code: SECTION_CODE, // ✅ Изменено
            theme_id: themeId,
          })
        )
      }
    })
  }, [posts?.length, dispatch, themeId, commentsLoadingFlags, postComments])

  // Handlers
  const handlePublicationExpand = useCallback(
    id => {
      const viewed = getViewedIdeas()
      if (!viewed[id]) {
        markIdeaAsViewed(id)
      }

      const selected = publications.find(p => p.id === id)
      const post = posts.find(p => p.id === id)
      const publicationWithText = {
        ...selected,
        message_text: post?.text || selected.excerpt,
      }

      navigate(`/publicationpage/${id}`, { state: { publication: publicationWithText } })
    },
    [publications, posts, navigate]
  )

  const handleFileChange = useCallback(e => {
    const files = Array.from(e.target.files || [])
    console.log('📎 Файлы выбраны:', files.length)
    setPublicationData(prev => ({ ...prev, files }))
  }, [])

  const handleExcerptChange = useCallback(e => {
    setPublicationData(prev => ({ ...prev, excerpt: e.target.value }))
  }, [])

  const handlePublish = useCallback(async () => {
    if (!publicationData.excerpt.trim() || publicationData.files.length === 0 || isSubmitting) {
      alert('Необходимо прикрепить файл и добавить выдержку')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('📤 Создаем публикацию:', {
        text: publicationData.excerpt.substring(0, 50),
        files_count: publicationData.files.length,
        section_code: SECTION_CODE,
        theme_id: themeId,
      })

      // ✅ Создаем публикацию с новыми параметрами
      await dispatch(
        createPost({
          message_text: publicationData.excerpt.trim(),
          section_code: SECTION_CODE, // ✅ Изменено
          theme_id: themeId,
          type: 'post', // ✅ Добавлено
          is_openai_generated: false, // ✅ Добавлено
          ratio: 99, // ✅ Добавлено
          files: publicationData.files,
        })
      ).unwrap()

      console.log('✅ Публикация создана успешно')
      setPublicationData({ excerpt: '', files: [] })

      // Очищаем file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('❌ Error creating publication:', error)
      alert(`Ошибка создания публикации: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [publicationData, dispatch, themeId, isSubmitting])

  const isPublishDisabled = !publicationData.excerpt.trim() || publicationData.files.length === 0 || isSubmitting

  return (
    <div className="publication-chat-page">
      <div className="publication-chat-header">
        <div className="header-top">
          <img src={menuIcon} alt="Menu" className="header-icon" />
          <div className="header-input-wrapper">
            <input type="text" placeholder="Поиск" className="header-input" />
          </div>
          <img src={bellIcon} alt="Bell" className="header-icon" />
        </div>

        <div className="header-bottom">
          <img src={arrowIcon} alt="Back" className="arrow-icon" onClick={() => navigate('/')} />
          <span className="header-title">Чат публикаций</span>
        </div>
      </div>

      <p className="chat-tab-description">Подробнее об этой вкладке</p>

      {/* Показываем публикации или пустое состояние */}
      {loading && publications.length === 0 ? (
        <div className="no-publications-box">
          <p className="no-publications-text">Загрузка публикаций...</p>
        </div>
      ) : publications.length === 0 ? (
        <div className="no-publications-box">
          <p className="no-publications-text">Временно: Публикации в разделе ещё нет</p>
        </div>
      ) : (
        <div className="publications-list">
          {publications.map(publication => (
            <PublicationCard
              key={publication.id}
              publication={publication}
              onExpand={handlePublicationExpand}
              commentCount={publication.comments}
              sectionCode={SECTION_CODE} // ✅ Изменено
              themeId={themeId}
            />
          ))}
        </div>
      )}

      <div className="attachment-hint-box">Прикрепите файл. Сделайте выдержку из файла актуальную для раздела.</div>

      <div className="chat-footer-box">
        <div className="footer-input-row">
          <img src={skrepkaIcon} alt="Attach" className="footer-icon" />
          <input
            type="file"
            onChange={handleFileChange}
            className="footer-input"
            placeholder="Прикрепить файл"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            multiple
          />
        </div>

        <div className="footer-input-row">
          <div style={{ width: '20px' }}></div>
          <input
            type="text"
            placeholder="Добавить выдержку"
            className="footer-input"
            value={publicationData.excerpt}
            onChange={handleExcerptChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Показываем прикрепленные файлы */}
        {publicationData.files.length > 0 && (
          <div className="attached-files-info">
            <strong>Прикреплено файлов: {publicationData.files.length}</strong>
            <ul>
              {publicationData.files.map((file, i) => (
                <li key={i}>
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className={`publish-button ${isPublishDisabled ? 'disabled' : ''}`}
          onClick={handlePublish}
          disabled={isPublishDisabled}
        >
          {isSubmitting ? 'ПУБЛИКУЕТСЯ...' : 'ОПУБЛИКОВАТЬ'}
        </button>
      </div>
    </div>
  )
}

export default PublicationChatPage