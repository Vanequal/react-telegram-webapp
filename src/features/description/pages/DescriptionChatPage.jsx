// DescriptionChatPage.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPostsInSection,
  fetchPostComments,
  fetchMessageReactions,
  createComment,
} from '@/store/slices/postSlice'
import { SECTION_CODES } from '@/shared/constants/sections'
import { showError } from '@/shared/utils/notifications'

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import ExperienceCard from '@/features/experience/components/ExperienceCard'
import CommentThread from '@/features/discussion/components/CommentThread'

import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'

import '@/styles/features/DescriptionChatPage.scss'
import '@/styles/features/discussion.scss'

const SECTION_CODE = SECTION_CODES.DESCRIPTION

const DescriptionChatPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const fileInputRef = useRef(null)

  const { posts, loading } = useSelector(state => state.post)
  const postComments = useSelector(state => state.post.comments)
  const commentsLoadingFlags = useSelector(state => state.post.commentsLoadingFlags)
  const rootThemeId = useSelector(state => state.theme.theme?.id)
  const themeId = rootThemeId || null

  // step: 'list' | 'detail'
  const [step, setStep] = useState('list')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Detail mode: composing comment
  const [commentText, setCommentText] = useState('')
  const [commentFiles, setCommentFiles] = useState([])

  const fetchParams = useMemo(
    () => ({ section_code: SECTION_CODE, theme_id: themeId, limit: 100, offset: 0 }),
    [themeId]
  )

  useEffect(() => {
    if (themeId) {
      dispatch(fetchPostsInSection(fetchParams))
    }
  }, [dispatch, themeId])

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

  const descriptions = useMemo(() => {
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

  const selectedPost = descriptions.find(p => p.id === selectedPostId)
  const comments = postComments[selectedPostId] || []

  // --- Detail mode handlers ---
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
    if (files.length > 0) setCommentFiles(prev => [...prev, ...files])
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

  const handleBackClick = useCallback(() => {
    if (step === 'detail') {
      setStep('list')
      setSelectedPostId(null)
    } else {
      navigate('/')
    }
  }, [step, navigate])

  const canSendComment = (commentText.trim() || commentFiles.length > 0) && !isSubmitting

  return (
    <div className="description-chat-page">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        style={{ display: 'none' }}
        onChange={handleCommentFileChange}
      />

      <MindVaultHeader
        bgColor="#EEEFF1"
        textColor="black"
        title="Описание раздела"
        hideSectionTitle
        onBackClick={handleBackClick}
      />

      {/* LIST MODE */}
      {step === 'list' && (
        <>
          <div className="description-chat-page__content">
            {descriptions.length > 0 && (
              <div className="description-chat-page__list">
                {descriptions.map(desc => (
                  <ExperienceCard
                    key={desc.id}
                    post={desc}
                    onCommentClick={handleCommentClick}
                    commentCount={postComments[desc.id]?.length || 0}
                  />
                ))}
              </div>
            )}

            {descriptions.length === 0 && (
              <p className="description-chat-page__hint">
                Опиши суть, цели и перспективы этого проектного раздела в свободной форме.
              </p>
            )}
          </div>

          {/* Footer: navigates to compose page */}
          <div className="description-chat-page__footer" onClick={() => navigate('/descriptioncompose')}>
            <img src={skrepkaIcon} alt="Attach" className="description-chat-page__footer-icon" />
            <input
              type="text"
              className="description-chat-page__footer-input"
              placeholder="Описать раздел"
              readOnly
            />
            <img
              src={sendIcon}
              alt="Send"
              className="description-chat-page__footer-send"
              style={{ opacity: 0.5 }}
            />
          </div>
        </>
      )}

      {/* DETAIL MODE */}
      {step === 'detail' && selectedPost && (
        <>
          <div className="description-chat-page__content">
            <div className="description-chat-page__list">
              <ExperienceCard
                post={selectedPost}
                onCommentClick={() => {}}
                commentCount={comments.length}
              />
            </div>

            <div className="description-chat-page__divider" />

            <div className="description-chat-page__comments">
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
                <p className="description-chat-page__no-comments">Комментариев пока нет</p>
              )}
            </div>
          </div>

          {commentFiles.length > 0 && (
            <div className="description-chat-page__attached-files">
              {commentFiles.map((file, i) => (
                <span key={i} className="description-chat-page__attached-file">
                  {file.name}
                  <button
                    className="description-chat-page__attached-file-remove"
                    onClick={() => setCommentFiles(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="description-chat-page__footer">
            <img
              src={skrepkaIcon}
              alt="Attach"
              className="description-chat-page__footer-icon"
              onClick={handleCommentAttachClick}
            />
            <input
              type="text"
              className="description-chat-page__footer-input"
              placeholder="Комментировать"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyPress={handleCommentKeyPress}
              disabled={isSubmitting}
            />
            <img
              src={canSendComment ? sendIconActive : sendIcon}
              alt="Send"
              className="description-chat-page__footer-send"
              onClick={canSendComment ? handleSendComment : undefined}
              style={{ cursor: canSendComment ? 'pointer' : 'default', opacity: canSendComment ? 1 : 0.5 }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default DescriptionChatPage
