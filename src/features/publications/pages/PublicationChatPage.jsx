// PublicationChatPage.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPostComments, fetchPostsInSection, createPost, fetchMessageReactions } from '@/store/slices/postSlice.js'
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

const PublicationChatPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  // Refs for file inputs
  const attachBtnRef = useRef(null)
  const fileInputMediaRef = useRef(null)
  const fileInputFilesRef = useRef(null)

  // State
  const [publicationData, setPublicationData] = useState({
    excerpt: '',
    files: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })

  // Redux selectors
  const { posts, loading, error, postsLoaded } = useSelector(state => state.post)
  const postComments = useSelector(state => state.post.comments)
  const commentsLoadingFlags = useSelector(state => state.post.commentsLoadingFlags)
  const rootThemeId = useSelector(state => state.theme.theme?.id)

  // Derived values — theme UUID from store (root theme loaded in App.jsx)
  const themeId = rootThemeId || null

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
        files: post.media_files || [],
        attachments: post.media_files || [],
        userReaction: post.user_reaction || null,
        author: post.author, // ✅ Добавлено
      }
    })
  }, [posts, postComments])

  // Fetch publications if not loaded
  useEffect(() => {
    if (!postsLoaded && !loading) {
      console.log('📥 Загружаем публикации:', fetchParams)
      dispatch(fetchPostsInSection(fetchParams))
    }
  }, [dispatch, fetchParams, postsLoaded, loading])

  // Load attachments, reactions and comments for publications
  useEffect(() => {
    if (!posts || posts.length === 0) return

    posts.forEach(post => {
      // Загружаем реакции если их еще нет (проверяем по likes, т.к. reactions не ставится в state)
      if (post.likes === undefined) {
        dispatch(fetchMessageReactions({ message_id: post.id }))
      }

      const isLoading = commentsLoadingFlags[post.id]
      const hasComments = postComments[post.id]

      if (!isLoading && !hasComments) {
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

  const handleAttachClick = useCallback(() => {
    if (attachBtnRef.current) {
      const rect = attachBtnRef.current.getBoundingClientRect()
      setPopoverPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      })
      setShowPopover(true)
    }
  }, [])

  const handleMediaClick = useCallback(() => {
    const tg = window.Telegram?.WebApp
    const used = tg?.showAttachMenu?.({ media: true })
    if (!used) {
      fileInputMediaRef.current?.click()
    }
    setShowPopover(false)
  }, [])

  const handleFileClick = useCallback(() => {
    const tg = window.Telegram?.WebApp
    const used = tg?.showAttachMenu?.({ files: true })
    if (!used) {
      fileInputFilesRef.current?.click()
    }
    setShowPopover(false)
  }, [])

  const handleFileChange = useCallback(e => {
    const newFiles = Array.from(e.target.files || [])
    console.log('📎 Файлы выбраны для публикации:', newFiles.length, newFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))
    setPublicationData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }))
    e.target.value = ''
  }, [])

  const handleRemoveFile = useCallback(index => {
    setPublicationData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }, [])

  const handleExcerptChange = useCallback(e => {
    const newExcerpt = e.target.value
    setPublicationData(prev => ({ ...prev, excerpt: newExcerpt }))
  }, [])

  const handlePublish = useCallback(async () => {
    if (!publicationData.excerpt.trim() || isSubmitting) {
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

      await dispatch(
        createPost({
          message_text: publicationData.excerpt.trim(),
          section_code: SECTION_CODE,
          theme_id: themeId,
          type: 'post',
          is_openai_generated: false,
          ratio: 99,
          files: publicationData.files,
        })
      ).unwrap()

      console.log('✅ Публикация создана успешно')
      setPublicationData({ excerpt: '', files: [] })
    } catch (error) {
      console.error('❌ Error creating publication:', error)
      alert(`Ошибка создания публикации: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [publicationData, dispatch, themeId, isSubmitting])

  const isPublishDisabled = !publicationData.excerpt.trim() || isSubmitting

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
          <img src={skrepkaIcon} alt="Attach" className="footer-icon" onClick={handleAttachClick} ref={attachBtnRef} style={{ cursor: 'pointer' }} />

          {/* Hidden file inputs */}
          <input type="file" ref={fileInputMediaRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,video/*" multiple />
          <input type="file" ref={fileInputFilesRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" multiple />

          <input
            type="text"
            placeholder="Добавить выдержку"
            className="footer-input"
            value={publicationData.excerpt}
            onChange={handleExcerptChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Popover Menu */}
        {showPopover && (
          <div className="popover-menu" style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }} onMouseLeave={() => setShowPopover(false)}>
            <button className="popover-btn" onClick={handleMediaClick}>
              📷 Медиа
            </button>
            <button className="popover-btn" onClick={handleFileClick}>
              📁 Файл
            </button>
          </div>
        )}

        {/* Attached files preview */}
        {publicationData.files.length > 0 && (
          <div className="attached-files-info">
            <strong>Прикреплено ({publicationData.files.length}):</strong>
            <ul>
              {publicationData.files.map((file, i) => (
                <li key={i}>
                  {file.name} ({Math.round(file.size / 1024)} KB)
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    style={{
                      marginLeft: '8px',
                      cursor: 'pointer',
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '12px',
                    }}
                  >
                    ✕
                  </button>
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