// ExperienceExchangePage.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPostsInSection,
  fetchPostComments,
  fetchMessageReactions,
  createPost,
  createComment,
} from '@/store/slices/postSlice'
import { SECTION_CODES } from '@/shared/constants/sections'
import { showError } from '@/shared/utils/notifications'

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import ExperienceCard from '../components/ExperienceCard'
import CommentThread from '@/features/discussion/components/CommentThread'

import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'

import '@/styles/features/ExperienceExchangePage.scss'
import '@/styles/features/discussion.scss'

const SECTION_CODE = SECTION_CODES.CHAT_EXPERIENCE

const ExperienceExchangePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const fileInputRef = useRef(null)

  const { posts, loading, error } = useSelector(state => state.post)
  const postComments = useSelector(state => state.post.comments)
  const commentsLoadingFlags = useSelector(state => state.post.commentsLoadingFlags)
  const rootThemeId = useSelector(state => state.theme.theme?.id)
  const themeId = rootThemeId || null

  // step: 'list' | 'detail'
  const [step, setStep] = useState('list')
  const [selectedPostId, setSelectedPostId] = useState(null)

  // List mode: composing new post
  const [postText, setPostText] = useState('')
  const [postFiles, setPostFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Detail mode: composing comment
  const [commentText, setCommentText] = useState('')
  const [commentFiles, setCommentFiles] = useState([])

  const fetchParams = useMemo(
    () => ({ section_code: SECTION_CODE, theme_id: themeId, limit: 100, offset: 0 }),
    [themeId]
  )

  // Fetch posts for this section
  useEffect(() => {
    if (themeId) {
      dispatch(fetchPostsInSection(fetchParams))
    }
  }, [dispatch, themeId])

  // Load reactions and comments for each post
  useEffect(() => {
    if (!posts || posts.length === 0) return
    posts.forEach(post => {
      if (post.likes === undefined) {
        dispatch(fetchMessageReactions({ message_id: post.id }))
      }
      const isLoading = commentsLoadingFlags[post.id]
      const hasComments = postComments[post.id]
      if (!isLoading && !hasComments) {
        dispatch(fetchPostComments({ post_id: post.id, section_code: SECTION_CODE, theme_id: themeId }))
      }
    })
  }, [posts?.length, dispatch, themeId, commentsLoadingFlags, postComments])

  // Transform posts to display format
  const experiences = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).map(post => ({
      id: post.id,
      username: post.author?.first_name || post.author?.username || 'Пользователь',
      text: post.text,
      likes: post.likes || 0,
      dislikes: post.dislikes || 0,
      views: post.views ?? 0,
      timestamp: post.created_at ?? '',
      created_at: post.created_at,
      files: post.media_files || [],
      attachments: post.media_files || [],
      userReaction: post.user_reaction || null,
      author: post.author,
    }))
  }, [posts])

  const selectedPost = experiences.find(p => p.id === selectedPostId)
  const comments = postComments[selectedPostId] || []

  // --- Handlers: list mode ---
  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(e => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setPostFiles(prev => [...prev, ...files])
    }
    e.target.value = ''
  }, [])

  const handleSendPost = useCallback(async () => {
    if ((!postText.trim() && postFiles.length === 0) || isSubmitting) return
    setIsSubmitting(true)
    try {
      await dispatch(
        createPost({
          message_text: postText.trim(),
          section_code: SECTION_CODE,
          theme_id: themeId,
          files: postFiles,
        })
      ).unwrap()
      setPostText('')
      setPostFiles([])
      dispatch(fetchPostsInSection(fetchParams))
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Неизвестная ошибка'
      showError(`Ошибка публикации: ${msg.slice(0, 150)}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [postText, postFiles, isSubmitting, dispatch, themeId, fetchParams])

  const handlePostKeyPress = useCallback(
    e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendPost()
      }
    },
    [handleSendPost]
  )

  // --- Handlers: detail mode ---
  const handleCommentClick = useCallback(
    postId => {
      setSelectedPostId(postId)
      setCommentText('')
      setCommentFiles([])
      setStep('detail')
      dispatch(fetchPostComments({ post_id: postId, section_code: SECTION_CODE, theme_id: themeId }))
    },
    [dispatch, themeId]
  )

  const handleCommentAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleCommentFileChange = useCallback(e => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setCommentFiles(prev => [...prev, ...files])
    }
    e.target.value = ''
  }, [])

  const handleSendComment = useCallback(async () => {
    if ((!commentText.trim() && commentFiles.length === 0) || isSubmitting) return
    setIsSubmitting(true)
    try {
      await dispatch(
        createComment({
          post_id: selectedPostId,
          message_text: commentText.trim(),
          section_code: SECTION_CODE,
          theme_id: themeId,
          files: commentFiles,
        })
      ).unwrap()
      setCommentText('')
      setCommentFiles([])
      dispatch(fetchPostComments({ post_id: selectedPostId, section_code: SECTION_CODE, theme_id: themeId }))
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Неизвестная ошибка'
      showError(`Ошибка: ${msg.slice(0, 150)}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [commentText, commentFiles, isSubmitting, dispatch, selectedPostId, themeId])

  const handleCommentKeyPress = useCallback(
    e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendComment()
      }
    },
    [handleSendComment]
  )

  // --- Navigation ---
  const handleBackClick = useCallback(() => {
    if (step === 'detail') {
      setStep('list')
      setSelectedPostId(null)
    } else {
      navigate('/')
    }
  }, [step, navigate])

  const canSendPost = (postText.trim() || postFiles.length > 0) && !isSubmitting
  const canSendComment = (commentText.trim() || commentFiles.length > 0) && !isSubmitting

  return (
    <div className="experience-page">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        style={{ display: 'none' }}
        onChange={step === 'list' ? handleFileChange : handleCommentFileChange}
      />

      <MindVaultHeader
        bgColor="#EEEFF1"
        textColor="black"
        title="Обмен опытом"
        hideSectionTitle
        onBackClick={handleBackClick}
      />

      {/* LIST MODE */}
      {step === 'list' && (
        <>
          <div className="experience-page__content">
            {experiences.length > 0 && (
              <div className="experience-page__list">
                {experiences.map(exp => (
                  <ExperienceCard
                    key={exp.id}
                    post={exp}
                    onCommentClick={handleCommentClick}
                    commentCount={postComments[exp.id]?.length || 0}
                  />
                ))}
              </div>
            )}

            {/* Bottom hint text */}
            <p className="experience-page__hint">
              Поделитесь своим опытом! Опишите, как вы решали конкретную задачу, какие методы использовали,
              с какими трудностями столкнулись и какие выводы сделали. Прикрепите скриншоты, фото, видео
              или другие доказательства. Ваш контент размещается безвоздмезно, но пользователи смогут
              отблагодарить вас.
            </p>
          </div>

          {/* Attached files preview */}
          {postFiles.length > 0 && (
            <div className="experience-page__attached-files">
              {postFiles.map((file, i) => (
                <span key={i} className="experience-page__attached-file">
                  {file.name}
                  <button
                    className="experience-page__attached-file-remove"
                    onClick={() => setPostFiles(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Footer: compose new post */}
          <div className="experience-page__footer">
            <img
              src={skrepkaIcon}
              alt="Attach"
              className="experience-page__footer-icon"
              onClick={handleAttachClick}
            />
            <input
              type="text"
              className="experience-page__footer-input"
              placeholder="Описать опыт"
              value={postText}
              onChange={e => setPostText(e.target.value)}
              onKeyPress={handlePostKeyPress}
              disabled={isSubmitting}
            />
            <img
              src={canSendPost ? sendIconActive : sendIcon}
              alt="Send"
              className="experience-page__footer-send"
              onClick={canSendPost ? handleSendPost : undefined}
              style={{ cursor: canSendPost ? 'pointer' : 'default', opacity: canSendPost ? 1 : 0.5 }}
            />
          </div>
        </>
      )}

      {/* DETAIL MODE */}
      {step === 'detail' && selectedPost && (
        <>
          <div className="experience-page__content">
            <div className="experience-page__list">
              <ExperienceCard
                post={selectedPost}
                onCommentClick={() => {}}
                commentCount={comments.length}
              />
            </div>

            <div className="experience-page__divider" />

            <div className="experience-page__comments">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    sectionCode={SECTION_CODE}
                    themeId={themeId}
                  />
                ))
              ) : (
                <p className="experience-page__no-comments">Комментариев пока нет</p>
              )}
            </div>
          </div>

          {/* Attached comment files preview */}
          {commentFiles.length > 0 && (
            <div className="experience-page__attached-files">
              {commentFiles.map((file, i) => (
                <span key={i} className="experience-page__attached-file">
                  {file.name}
                  <button
                    className="experience-page__attached-file-remove"
                    onClick={() => setCommentFiles(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Footer: comment */}
          <div className="experience-page__footer">
            <img
              src={skrepkaIcon}
              alt="Attach"
              className="experience-page__footer-icon"
              onClick={handleCommentAttachClick}
            />
            <input
              type="text"
              className="experience-page__footer-input"
              placeholder="Комментировать"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyPress={handleCommentKeyPress}
              disabled={isSubmitting}
            />
            <img
              src={canSendComment ? sendIconActive : sendIcon}
              alt="Send"
              className="experience-page__footer-send"
              onClick={canSendComment ? handleSendComment : undefined}
              style={{ cursor: canSendComment ? 'pointer' : 'default', opacity: canSendComment ? 1 : 0.5 }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ExperienceExchangePage
