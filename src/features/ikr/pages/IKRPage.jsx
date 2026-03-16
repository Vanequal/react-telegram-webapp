// IKRPage.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPostsInSection,
  fetchPostComments,
  createPost,
  createComment,
  createPostPreview,
  reactToPost,
} from '@/store/slices/postSlice'
import { showError } from '@/shared/utils/notifications'

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import ReactionBadges from '@/shared/components/ReactionBadges'
import CommentThread from '@/features/discussion/components/CommentThread'

import userIcon from '@/assets/images/userIcon.webp'
import avatarStack from '@/assets/images/avatarStack.webp'
import donatIcon from '@/assets/images/donatIcon.webp'
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'

import '@/styles/features/IKRPage.scss'

// Helper: render post text with bold lines-ending-in-colon
function renderFormattedText(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim()
    if (trimmed.endsWith(':')) {
      return <strong key={i} className="ikr-page__post-text-heading">{line}</strong>
    }
    return <span key={i} className="ikr-page__post-text-line">{line}</span>
  })
}

// Arrow SVG
const ArrowIcon = ({ isOpen, color = '#333333' }) => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
  >
    <path d="M6 4l4 4-4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IKRPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)

  const themeId = useSelector(state => state.theme.theme?.id)
  const themeTitle = useSelector(state => state.theme.theme?.title) || 'раздела'
  const currentUser = useSelector(state => state.me.currentUser)
  const allComments = useSelector(state => state.post.comments)

  const [step, setStep] = useState('loading')
  const [desiredPosts, setDesiredPosts] = useState([])
  const [technicalPosts, setTechnicalPosts] = useState([])
  const [undesirablePosts, setUndesirablePosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)

  const [composeText, setComposeText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentFiles, setCommentFiles] = useState([])

  const [gptOriginal, setGptOriginal] = useState('')
  const [gptImproved, setGptImproved] = useState('')
  const [editedGptText, setEditedGptText] = useState('')
  const [isEditingGpt, setIsEditingGpt] = useState(false)

  const [hubDesiredExpanded, setHubDesiredExpanded] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [showCommentInput, setShowCommentInput] = useState(false)

  const currentComments = selectedPost ? (allComments[selectedPost.id] || []) : []

  // --- Data loading ---
  const loadDesiredPosts = useCallback(async () => {
    if (!themeId) return []
    try {
      const result = await dispatch(fetchPostsInSection({ section_code: 'desirable_effects', theme_id: themeId })).unwrap()
      const posts = Array.isArray(result) ? result : []
      setDesiredPosts(posts)
      return posts
    } catch { setDesiredPosts([]); return [] }
  }, [dispatch, themeId])

  const loadTechnicalPosts = useCallback(async () => {
    if (!themeId) return []
    try {
      const result = await dispatch(fetchPostsInSection({ section_code: 'technical_modeling', theme_id: themeId })).unwrap()
      const posts = Array.isArray(result) ? result : []
      setTechnicalPosts(posts)
      return posts
    } catch { setTechnicalPosts([]); return [] }
  }, [dispatch, themeId])

  const loadUndesirablePosts = useCallback(async () => {
    if (!themeId) return []
    try {
      const result = await dispatch(fetchPostsInSection({ section_code: 'undesirable_effects', theme_id: themeId })).unwrap()
      const posts = Array.isArray(result) ? result : []
      setUndesirablePosts(posts)
      return posts
    } catch { setUndesirablePosts([]); return [] }
  }, [dispatch, themeId])

  const loadComments = useCallback((postId, sectionCode) => {
    if (!postId || !themeId) return
    dispatch(fetchPostComments({ post_id: postId, section_code: sectionCode, theme_id: themeId }))
  }, [dispatch, themeId])

  // Initial load
  useEffect(() => {
    if (!themeId) return
    loadDesiredPosts().then(posts => {
      if (posts.length > 0) {
        setStep('hub')
        loadTechnicalPosts()
        loadUndesirablePosts()
      } else {
        setStep('empty')
      }
    })
  }, [themeId])

  // --- Navigation ---
  const handleBackClick = useCallback(() => {
    if (step === 'empty' || step === 'hub' || step === 'loading') {
      navigate('/')
    } else if (step === 'compose_desired') {
      setStep('empty'); setComposeText('')
    } else if (step === 'gpt_preview') {
      setStep('compose_desired')
    } else if (step === 'detail_desired') {
      setStep('hub')
    } else if (step === 'section_technical') {
      setStep('hub')
    } else if (step === 'compose_technical') {
      setStep('section_technical')
    } else if (step === 'detail_technical') {
      setStep('section_technical'); setShowComments(false); setShowCommentInput(false)
    } else if (step === 'section_undesirable') {
      setStep('hub')
    } else if (step === 'compose_undesirable') {
      setStep('section_undesirable')
    } else if (step === 'detail_undesirable') {
      setStep('section_undesirable'); setShowComments(false); setShowCommentInput(false)
    } else {
      navigate('/')
    }
  }, [step, navigate])

  // --- Header titles ---
  const getTitle = () => {
    switch (step) {
      case 'detail_desired': return 'Желаемый эффект'
      case 'section_technical':
      case 'compose_technical':
      case 'detail_technical': return 'Тех. моделирование'
      case 'section_undesirable':
      case 'compose_undesirable':
      case 'detail_undesirable': return 'Нежелательные эффекты'
      default: return 'ИКР'
    }
  }

  // --- Publish desired effect with GPT auto-generation ---
  const publishAndAutoGenerateTech = useCallback(async (text, isGpt) => {
    await dispatch(createPost({
      message_text: text,
      section_code: 'desirable_effects',
      theme_id: themeId,
      is_openai_generated: isGpt,
    })).unwrap()

    // Auto-generate technical modeling
    try {
      const techPreview = await dispatch(createPostPreview({
        section_code: 'technical_modeling',
        theme_id: themeId,
        text,
      })).unwrap()
      if (techPreview.openai_text) {
        await dispatch(createPost({
          message_text: techPreview.openai_text,
          section_code: 'technical_modeling',
          theme_id: themeId,
          is_openai_generated: true,
        })).unwrap()
      }
    } catch {} // silent fail

    await loadDesiredPosts()
    await loadTechnicalPosts()
    await loadUndesirablePosts()
    setStep('hub')
  }, [dispatch, themeId, loadDesiredPosts, loadTechnicalPosts, loadUndesirablePosts])

  // --- Compose desired: on publish ---
  const handlePublishCompose = useCallback(async () => {
    if (!composeText.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const result = await dispatch(createPostPreview({
        section_code: 'desirable_effects',
        theme_id: themeId,
        text: composeText.trim(),
      })).unwrap()
      setGptOriginal(composeText.trim())
      setGptImproved(result.openai_text || '')
      setEditedGptText(result.openai_text || '')
      setIsEditingGpt(false)
      setStep('gpt_preview')
    } catch {
      // GPT unavailable - publish directly
      try {
        await publishAndAutoGenerateTech(composeText.trim(), false)
        setComposeText('')
      } catch (e) {
        showError('Ошибка публикации')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [composeText, isSubmitting, dispatch, themeId, publishAndAutoGenerateTech])

  // --- GPT preview: publish original ---
  const handlePublishOriginal = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await publishAndAutoGenerateTech(gptOriginal, false)
      setComposeText('')
    } catch {
      showError('Ошибка публикации')
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, gptOriginal, publishAndAutoGenerateTech])

  // --- GPT preview: publish GPT version ---
  const handlePublishGPT = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await publishAndAutoGenerateTech(editedGptText, true)
      setComposeText('')
    } catch {
      showError('Ошибка публикации')
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, editedGptText, publishAndAutoGenerateTech])

  // --- Hub: open desired effect detail ---
  const handleOpenDesiredDetail = useCallback((post) => {
    setSelectedPost(post)
    loadComments(post.id, 'desirable_effects')
    setShowComments(true)
    setShowCommentInput(false)
    setCommentText('')
    setStep('detail_desired')
  }, [loadComments])

  // --- Hub: go to technical section ---
  const handleOpenTechnical = useCallback(() => {
    loadTechnicalPosts()
    setStep('section_technical')
  }, [loadTechnicalPosts])

  // --- Hub: go to undesirable section ---
  const handleOpenUndesirable = useCallback(() => {
    loadUndesirablePosts()
    setStep('section_undesirable')
  }, [loadUndesirablePosts])

  // --- Sub-section: open detail ---
  const handleOpenTechnicalDetail = useCallback((post) => {
    setSelectedPost(post)
    setShowComments(false)
    setShowCommentInput(false)
    setCommentText('')
    setStep('detail_technical')
  }, [])

  const handleOpenUndesirableDetail = useCallback((post) => {
    setSelectedPost(post)
    setShowComments(false)
    setShowCommentInput(false)
    setCommentText('')
    setStep('detail_undesirable')
  }, [])

  // --- Comments ---
  const handleLoadAndShowComments = useCallback((sectionCode) => {
    if (!selectedPost) return
    loadComments(selectedPost.id, sectionCode)
    setShowComments(true)
  }, [selectedPost, loadComments])

  const handleSendComment = useCallback(async (sectionCode) => {
    if ((!commentText.trim() && commentFiles.length === 0) || isSubmitting || !selectedPost) return
    setIsSubmitting(true)
    try {
      await dispatch(createComment({
        post_id: selectedPost.id,
        message_text: commentText.trim(),
        section_code: sectionCode,
        theme_id: themeId,
        files: commentFiles,
      })).unwrap()
      setCommentText('')
      setCommentFiles([])
      loadComments(selectedPost.id, sectionCode)
    } catch (e) {
      showError('Ошибка отправки комментария')
    } finally {
      setIsSubmitting(false)
    }
  }, [commentText, commentFiles, isSubmitting, selectedPost, dispatch, themeId, loadComments])

  // --- Reactions ---
  const handleReaction = useCallback((postId, reaction) => {
    dispatch(reactToPost({ post_id: postId, reaction }))
  }, [dispatch])

  // --- Compose sub-sections ---
  const handlePublishSubSection = useCallback(async (sectionCode, onSuccess) => {
    if (!composeText.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await dispatch(createPost({
        message_text: composeText.trim(),
        section_code: sectionCode,
        theme_id: themeId,
      })).unwrap()
      setComposeText('')
      await onSuccess()
    } catch {
      showError('Ошибка публикации')
    } finally {
      setIsSubmitting(false)
    }
  }, [composeText, isSubmitting, dispatch, themeId])

  // --- Helper: extract reactions from post ---
  const getPostReactions = (post) => ({
    likes: post?.reactions?.count_likes ?? post?.likes ?? 0,
    dislikes: post?.reactions?.count_dislikes ?? post?.dislikes ?? 0,
    userReaction: post?.reactions?.user_reaction ?? post?.user_reaction ?? null,
  })

  // --- Standard comment footer ---
  const renderCommentFooter = (sectionCode) => {
    const canSend = commentText.trim().length > 0 && !isSubmitting
    return (
      <>
        <input ref={fileInputRef} type="file" multiple accept="*/*" style={{ display: 'none' }}
          onChange={e => { setCommentFiles(prev => [...prev, ...Array.from(e.target.files || [])]); e.target.value = '' }} />
        <div className="ikr-page__footer">
          <img src={skrepkaIcon} alt="attach" className="ikr-page__footer-icon" onClick={() => fileInputRef.current?.click()} />
          <input type="text" className="ikr-page__footer-input" placeholder="Комментировать"
            value={commentText} onChange={e => setCommentText(e.target.value)}
            onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(sectionCode) } }}
            disabled={isSubmitting} />
          <img src={canSend ? sendIconActive : sendIcon} alt="send" className="ikr-page__footer-send"
            onClick={canSend ? () => handleSendComment(sectionCode) : undefined}
            style={{ cursor: canSend ? 'pointer' : 'default', opacity: canSend ? 1 : 0.5 }} />
        </div>
      </>
    )
  }

  // --- Comments list render ---
  const renderComments = (sectionCode) => (
    <div className="ikr-page__comments-section">
      {currentComments.length > 0 && (
        <span className="ikr-page__discussion-badge">Начало обсуждения</span>
      )}
      {currentComments.map(comment => (
        <CommentThread key={comment.id} comment={comment} sectionCode={sectionCode} themeId={themeId} />
      ))}
    </div>
  )

  // === RENDER ===
  if (step === 'loading') {
    return (
      <div className="ikr-page">
        <MindVaultHeader bgColor="#EEEFF1" textColor="black" title="ИКР" hideSectionTitle onBackClick={() => navigate('/')} />
        <div className="ikr-page__content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#666', fontFamily: 'Roboto', fontSize: '16px' }}>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ikr-page">
      <MindVaultHeader bgColor="#EEEFF1" textColor="black" title={getTitle()} hideSectionTitle onBackClick={handleBackClick} />

      {/* SCREEN: empty */}
      {step === 'empty' && (
        <>
          <div className="ikr-page__content" style={{ display: 'flex', flexDirection: 'column', padding: '16px 0 100px 0' }}>
            <p className="ikr-page__intro-text">
              Идеальный конечный результат для {currentUser?.first_name || 'вас'} не сформулирован.
            </p>
            <p className="ikr-page__intro-text">
              Для определения ИКР для {themeTitle} с использованием ИИ, кратко опишите идеальный результат, выраженный в функциях.
            </p>
            <div style={{ flex: 1 }} />
            <p className="ikr-page__hint-text">
              Подсказка (на примере велосипеда): "Уникальный универсальный велосипед: компактный, складывается в рюкзак, вечный в использовании, способен летать, плавать под водой и по поверхности воды, адаптирован для катания по льду и сугробам."
            </p>
          </div>
          <div className="ikr-page__footer" style={{ cursor: 'pointer' }} onClick={() => { setComposeText(''); setStep('compose_desired') }}>
            <img src={skrepkaIcon} alt="attach" className="ikr-page__footer-icon" />
            <input type="text" className="ikr-page__footer-input" placeholder="Сформулировать ИКР" readOnly style={{ cursor: 'pointer' }} />
            <img src={sendIcon} alt="send" className="ikr-page__footer-send" style={{ opacity: 0.5 }} />
          </div>
        </>
      )}

      {/* SCREEN: compose_desired */}
      {step === 'compose_desired' && (
        <>
          <div className="ikr-page__content" style={{ padding: 0 }}>
            <textarea
              className="ikr-page__compose-area"
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              placeholder="Начните формулировать..."
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          <button
            className="ikr-page__publish-btn"
            onClick={handlePublishCompose}
            disabled={!composeText.trim() || isSubmitting}
          >
            {isSubmitting ? 'ОБРАБОТКА...' : 'ОПУБЛИКОВАТЬ'}
          </button>
        </>
      )}

      {/* SCREEN: gpt_preview */}
      {step === 'gpt_preview' && (
        <div className="ikr-page__content">
          <div className="ikr-page__preview-card">
            <span className="ikr-page__preview-label">Оригинал текста:</span>
            <p className="ikr-page__preview-text">{gptOriginal}</p>
            <span className="ikr-page__preview-label" style={{ marginTop: '16px' }}>Улучшенная версия от ИИ:</span>
            {isEditingGpt ? (
              <textarea
                className="ikr-page__preview-textarea"
                value={editedGptText}
                onChange={e => setEditedGptText(e.target.value)}
              />
            ) : (
              <p className="ikr-page__preview-text">{editedGptText}</p>
            )}
          </div>
          <div className="ikr-page__preview-buttons">
            <button className="ikr-page__preview-btn" onClick={handlePublishOriginal} disabled={isSubmitting}>
              Опубликовать оригинал
            </button>
            <button className="ikr-page__preview-btn" onClick={handlePublishGPT} disabled={isSubmitting}>
              Опубликовать версию GPT
            </button>
            <button className="ikr-page__preview-btn" onClick={() => setIsEditingGpt(!isEditingGpt)} disabled={isSubmitting}>
              {isEditingGpt ? 'Готово' : 'Редактировать версию GPT'}
            </button>
          </div>
          {isSubmitting && <p style={{ textAlign: 'center', color: '#666', padding: '16px', fontFamily: 'Roboto' }}>Публикация...</p>}
        </div>
      )}

      {/* SCREEN: hub */}
      {step === 'hub' && (
        <div className="ikr-page__content">
          <div className="ikr-page__hub-content">
            {/* Accordion 1: Желаемый эффект (gray) */}
            <div className="ikr-page__accordion">
              <div
                className={`ikr-page__accordion-header${hubDesiredExpanded ? ' open' : ''}`}
                onClick={() => setHubDesiredExpanded(!hubDesiredExpanded)}
              >
                <span className="ikr-page__accordion-title">Желаемый эффект</span>
                <ArrowIcon isOpen={hubDesiredExpanded} color="#333333" />
              </div>
              {hubDesiredExpanded && desiredPosts.length > 0 && (
                <div className="ikr-page__accordion-body">
                  <p className="ikr-page__accordion-post-text">{desiredPosts[0].text}</p>
                  <div className="ikr-page__accordion-reactions">
                    <ReactionBadges
                      likes={getPostReactions(desiredPosts[0]).likes}
                      dislikes={getPostReactions(desiredPosts[0]).dislikes}
                      userReaction={getPostReactions(desiredPosts[0]).userReaction}
                      onReaction={r => handleReaction(desiredPosts[0].id, r)}
                    />
                  </div>
                  <div className="ikr-page__accordion-divider" />
                  <div className="ikr-page__accordion-footer" onClick={() => handleOpenDesiredDetail(desiredPosts[0])}>
                    {(allComments[desiredPosts[0].id]?.length || 0) > 0 && (
                      <img src={avatarStack} alt="avatars" className="ikr-page__avatar-stack" />
                    )}
                    <span className="ikr-page__comment-count">
                      {(allComments[desiredPosts[0].id]?.length || 0) > 0
                        ? `${allComments[desiredPosts[0].id].length} комментариев`
                        : 'Прокомментировать'}
                    </span>
                    <img src={donatIcon} alt="donat" className="ikr-page__donat" />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Техническое моделирование (blue) */}
            <div className="ikr-page__accordion" onClick={handleOpenTechnical} style={{ cursor: 'pointer' }}>
              <div className="ikr-page__accordion-header">
                <span className="ikr-page__accordion-title ikr-page__accordion-title--blue">
                  ТЕХНИЧЕСКОЕ МОДЕЛИРОВАНИЕ ИКР
                </span>
                <ArrowIcon isOpen={false} color="#007AFF" />
              </div>
            </div>

            {/* Accordion 3: Нежелательные эффекты (blue) */}
            <div className="ikr-page__accordion" onClick={handleOpenUndesirable} style={{ cursor: 'pointer' }}>
              <div className="ikr-page__accordion-header">
                <span className="ikr-page__accordion-title ikr-page__accordion-title--blue">
                  НЕЖЕЛАТЕЛЬНЫЕ ЭФФЕКТЫ
                </span>
                <ArrowIcon isOpen={false} color="#007AFF" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN: detail_desired */}
      {step === 'detail_desired' && selectedPost && (
        <>
          <div className="ikr-page__content">
            <div className="ikr-page__post-body">
              {renderFormattedText(selectedPost.text)}
            </div>
            <div className="ikr-page__reactions-bar">
              <ReactionBadges
                likes={getPostReactions(selectedPost).likes}
                dislikes={getPostReactions(selectedPost).dislikes}
                userReaction={getPostReactions(selectedPost).userReaction}
                onReaction={r => handleReaction(selectedPost.id, r)}
              />
              <div className="ikr-page__comment-info">
                {currentComments.length > 0 && <img src={avatarStack} alt="" className="ikr-page__avatar-stack" />}
                <span className="ikr-page__comment-count">
                  {currentComments.length > 0 ? `${currentComments.length} комментариев` : ''}
                </span>
              </div>
            </div>
            {renderComments('desirable_effects')}
          </div>
          {renderCommentFooter('desirable_effects')}
        </>
      )}

      {/* SCREEN: section_technical */}
      {step === 'section_technical' && (
        <>
          <div className="ikr-page__content">
            {technicalPosts.length === 0 ? (
              <div className="ikr-page__section-text">
                <span>Технического моделирования для </span>
                <strong className="ikr-page__section-text-bold">{themeTitle}</strong>
                <span> ещё нет.{'\n'}</span>
                <strong className="ikr-page__section-text-bold">Разделите систему на ключевые подсистемы.{'\n'}</strong>
                <strong className="ikr-page__section-text-bold">Опишите каждую подсистему через её функции и технологии.{'\n'}</strong>
                <strong className="ikr-page__section-text-bold">Дополните примерами из существующих решений или новыми идеями.{'\n'}</strong>
                <span>{'\n'}Например так:{'\n'}Ключевые подсистемы "идеального велосипеда":{'\n'}Привод и источник энергии: Гибридная система, сочетающая педальный привод с генераторами в колесах и водородными топливными элементами, как у Toyota Mirai.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                {technicalPosts.map(post => (
                  <div key={post.id} className="ikr-page__nj-card" style={{ cursor: 'pointer' }} onClick={() => handleOpenTechnicalDetail(post)}>
                    <div className="ikr-page__nj-card-header">
                      <img src={userIcon} alt="user" className="ikr-page__nj-avatar" />
                      <span className="ikr-page__nj-username">{post.author?.first_name || post.author?.username || 'Аноним'}</span>
                    </div>
                    {post.is_openai_generated && <span className="ikr-page__gpt-label">Версия gpt-чат:</span>}
                    <p className="ikr-page__nj-text">{post.text}</p>
                    <div className="ikr-page__nj-reactions">
                      <ReactionBadges
                        likes={getPostReactions(post).likes}
                        dislikes={getPostReactions(post).dislikes}
                        userReaction={getPostReactions(post).userReaction}
                        onReaction={r => handleReaction(post.id, r)}
                      />
                    </div>
                    <div className="ikr-page__action-bar" onClick={e => { e.stopPropagation(); handleOpenTechnicalDetail(post) }}>
                      <button className="ikr-page__action-btn">Ответить</button>
                      <button className="ikr-page__action-btn">Посмотреть ответы</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="ikr-page__footer" style={{ cursor: 'pointer' }}
            onClick={() => { setComposeText(''); setStep('compose_technical') }}>
            <img src={skrepkaIcon} alt="attach" className="ikr-page__footer-icon" />
            <input type="text" className="ikr-page__footer-input" placeholder="Моделировать" readOnly style={{ cursor: 'pointer' }} />
            <img src={sendIcon} alt="send" className="ikr-page__footer-send" style={{ opacity: 0.5 }} />
          </div>
        </>
      )}

      {/* SCREEN: compose_technical */}
      {step === 'compose_technical' && (
        <>
          <div className="ikr-page__content" style={{ padding: 0 }}>
            <textarea
              className="ikr-page__compose-area"
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              placeholder={`${themeTitle} это — (опишите ключевые подсистемы)`}
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          <button
            className="ikr-page__publish-btn"
            onClick={() => handlePublishSubSection('technical_modeling', async () => { await loadTechnicalPosts(); setStep('section_technical') })}
            disabled={!composeText.trim() || isSubmitting}
          >
            {isSubmitting ? 'ПУБЛИКУЕТСЯ...' : 'ОПУБЛИКОВАТЬ'}
          </button>
        </>
      )}

      {/* SCREEN: detail_technical */}
      {step === 'detail_technical' && selectedPost && (
        <>
          <div className="ikr-page__content">
            <div className="ikr-page__post-body">
              {selectedPost.is_openai_generated && (
                <span className="ikr-page__gpt-label">Версия gpt-чат:</span>
              )}
              {renderFormattedText(selectedPost.text)}
            </div>
            <div className="ikr-page__reactions-bar" style={{ justifyContent: 'flex-end' }}>
              <ReactionBadges
                likes={getPostReactions(selectedPost).likes}
                dislikes={getPostReactions(selectedPost).dislikes}
                userReaction={getPostReactions(selectedPost).userReaction}
                onReaction={r => handleReaction(selectedPost.id, r)}
              />
            </div>
            <div className="ikr-page__action-bar">
              <button className="ikr-page__action-btn" onClick={() => {
                setShowCommentInput(true)
                handleLoadAndShowComments('technical_modeling')
              }}>Ответить</button>
              <button className="ikr-page__action-btn" onClick={() => handleLoadAndShowComments('technical_modeling')}>
                Посмотреть {currentComments.length > 0 ? currentComments.length : ''} ответов
              </button>
            </div>
            {showComments && renderComments('technical_modeling')}
          </div>
          {showCommentInput && renderCommentFooter('technical_modeling')}
        </>
      )}

      {/* SCREEN: section_undesirable */}
      {step === 'section_undesirable' && (
        <>
          <div className="ikr-page__content">
            {undesirablePosts.length === 0 ? (
              <div className="ikr-page__section-text">
                <span>Нежелательные эффекты </span>
                <strong className="ikr-page__section-text-bold">{themeTitle}</strong>
                <span> ещё не сформулированы.{'\n'}Опишите нежелательный эффект, учитывая:{'\n\n'}</span>
                <strong className="ikr-page__section-text-bold">Возможные ограничения (технические, экономические, экологические).{'\n'}</strong>
                <strong className="ikr-page__section-text-bold">Косвенные негативные процессы (побочные эффекты, влияющие на смежные системы).{'\n'}</strong>
                <strong className="ikr-page__section-text-bold">Аварийные ситуации (риски отказа, потенциальные критические сбои).{'\n\n'}</strong>
                <span>Например так: Совмещение различных технологий и систем (например, электропривода, активной подвески, ИИ и сенсоров) в одном велосипеде требует...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
                {undesirablePosts.map(post => (
                  <div key={post.id} className="ikr-page__nj-card">
                    <div className="ikr-page__nj-card-header">
                      <img src={userIcon} alt="user" className="ikr-page__nj-avatar" />
                      <span className="ikr-page__nj-username">{post.author?.first_name || post.author?.username || 'Аноним'}</span>
                    </div>
                    <p className="ikr-page__nj-text">
                      <strong>Нежелательный эффект: </strong>{post.text}
                    </p>
                    <div className="ikr-page__nj-reactions">
                      <ReactionBadges
                        likes={getPostReactions(post).likes}
                        dislikes={getPostReactions(post).dislikes}
                        userReaction={getPostReactions(post).userReaction}
                        onReaction={r => handleReaction(post.id, r)}
                      />
                    </div>
                    <div className="ikr-page__action-bar" onClick={() => handleOpenUndesirableDetail(post)}>
                      <button className="ikr-page__action-btn">Ответить</button>
                      <button className="ikr-page__action-btn">Посмотреть ответы</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="ikr-page__footer" style={{ cursor: 'pointer' }}
            onClick={() => { setComposeText(''); setStep('compose_undesirable') }}>
            <img src={skrepkaIcon} alt="attach" className="ikr-page__footer-icon" />
            <input type="text" className="ikr-page__footer-input" placeholder="Описать нежелательный эффект" readOnly style={{ cursor: 'pointer' }} />
            <img src={sendIcon} alt="send" className="ikr-page__footer-send" style={{ opacity: 0.5 }} />
          </div>
        </>
      )}

      {/* SCREEN: compose_undesirable */}
      {step === 'compose_undesirable' && (
        <>
          <div className="ikr-page__content" style={{ padding: 0 }}>
            <textarea
              className="ikr-page__compose-area"
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              placeholder="Нежелательный эффект: опишите..."
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          <button
            className="ikr-page__publish-btn"
            onClick={() => handlePublishSubSection('undesirable_effects', async () => { await loadUndesirablePosts(); setStep('section_undesirable') })}
            disabled={!composeText.trim() || isSubmitting}
          >
            {isSubmitting ? 'ПУБЛИКУЕТСЯ...' : 'ОПУБЛИКОВАТЬ'}
          </button>
        </>
      )}

      {/* SCREEN: detail_undesirable */}
      {step === 'detail_undesirable' && selectedPost && (
        <>
          <div className="ikr-page__content">
            <div className="ikr-page__nj-card" style={{ margin: '16px' }}>
              <div className="ikr-page__nj-card-header">
                <img src={userIcon} alt="user" className="ikr-page__nj-avatar" />
                <span className="ikr-page__nj-username">{selectedPost.author?.first_name || selectedPost.author?.username || 'Аноним'}</span>
              </div>
              <p className="ikr-page__nj-text">
                <strong>Нежелательный эффект: </strong>{selectedPost.text}
              </p>
              <div className="ikr-page__nj-reactions">
                <ReactionBadges
                  likes={getPostReactions(selectedPost).likes}
                  dislikes={getPostReactions(selectedPost).dislikes}
                  userReaction={getPostReactions(selectedPost).userReaction}
                  onReaction={r => handleReaction(selectedPost.id, r)}
                />
              </div>
            </div>
            <div className="ikr-page__action-bar">
              <button className="ikr-page__action-btn" onClick={() => {
                setShowCommentInput(true)
                handleLoadAndShowComments('undesirable_effects')
              }}>Ответить</button>
              <button className="ikr-page__action-btn" onClick={() => handleLoadAndShowComments('undesirable_effects')}>
                Посмотреть {currentComments.length > 0 ? currentComments.length : ''} ответов
              </button>
            </div>
            {showComments && renderComments('undesirable_effects')}
          </div>
          {showCommentInput && renderCommentFooter('undesirable_effects')}
        </>
      )}
    </div>
  )
}

export default IKRPage
