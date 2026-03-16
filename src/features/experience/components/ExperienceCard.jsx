// components/ExperienceCard.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { reactToPost } from '@/store/slices/postSlice'
import { getViewedIdeas, markIdeaAsViewed } from '@/shared/utils/utils'

// Components
import ImageModal from '@/shared/components/ImageModal'
import FileAttachments from '@/shared/components/FileAttachments'
import ReactionBadges from '@/shared/components/ReactionBadges'

// Icons
import userIcon from '@/assets/images/userIcon.webp'
import avatarStack from '@/assets/images/avatarStack.webp'
import donatIcon from '@/assets/images/donatIcon.webp'

// Styles
import '@/styles/features/ExperienceCard.scss'

const VIEW_THRESHOLD_MS = 30000
const INTERSECTION_THRESHOLD = 0.75
const TEXT_EXPAND_THRESHOLD = 160

const ExperienceCard = React.memo(function ExperienceCard({ post, onCommentClick, commentCount = 0 }) {
  const dispatch = useDispatch()
  const posts = useSelector(state => state.post.posts)
  const comments = useSelector(state => state.post.comments[post.id] || [])

  const [expanded, setExpanded] = useState(false)
  const [showReadMore, setShowReadMore] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const textWrapperRef = useRef(null)
  const cardRef = useRef(null)

  const currentPost = useMemo(() => posts.find(p => p.id === post.id), [posts, post.id])

  const currentLikes = currentPost?.reactions?.count_likes ?? currentPost?.likes ?? post.likes ?? 0
  const currentDislikes = currentPost?.reactions?.count_dislikes ?? currentPost?.dislikes ?? post.dislikes ?? 0
  const currentUserReaction = currentPost?.reactions?.user_reaction ?? currentPost?.user_reaction ?? post.userReaction ?? null

  const postFiles = useMemo(() => {
    const rawFiles = post.media_files || currentPost?.media_files || post.attachments || currentPost?.attachments || post.files || currentPost?.files || []
    if (!rawFiles || rawFiles.length === 0) return []

    let fileNameMap = {}
    try {
      fileNameMap = JSON.parse(sessionStorage.getItem('mediaFileNames') || '{}')
    } catch (_) {}

    return rawFiles.map((file, index) => {
      const storedName = fileNameMap[file.media_file_id]
      const resolvedName = file.original_name || file.name || storedName
      return {
        ...file,
        file_path: file.file_path || file.stored_path || file.url || file.media_file_id,
        url: file.file_path || file.stored_path || file.url || file.media_file_id,
        relative_path: file.file_path || file.stored_path || file.relative_path || file.media_file_id,
        original_name: resolvedName,
        extension: file.extension || (resolvedName ? resolvedName.split('.').pop().toLowerCase() : ''),
        index,
      }
    })
  }, [post.media_files, currentPost?.media_files, post.attachments, currentPost?.attachments, post.files, currentPost?.files, post.id])

  useEffect(() => {
    if (textWrapperRef.current?.scrollHeight > TEXT_EXPAND_THRESHOLD) {
      setShowReadMore(true)
    }
  }, [])

  useEffect(() => {
    const viewed = getViewedIdeas()
    if (viewed[post.id]) return

    let timer = null
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => markIdeaAsViewed(post.id), VIEW_THRESHOLD_MS)
        } else {
          clearTimeout(timer)
        }
      },
      { threshold: INTERSECTION_THRESHOLD }
    )

    if (cardRef.current) observer.observe(cardRef.current)

    return () => {
      clearTimeout(timer)
      if (cardRef.current) observer.unobserve(cardRef.current)
    }
  }, [post.id])

  const handleReaction = useCallback(
    reaction => dispatch(reactToPost({ post_id: post.id, reaction })),
    [dispatch, post.id]
  )

  const handleExpandClick = useCallback(() => setExpanded(true), [])
  const handleCommentClick = useCallback(() => onCommentClick(post.id), [onCommentClick, post.id])
  const handleImageClick = useCallback(image => setSelectedImage(image), [])
  const handleImageModalClose = useCallback(() => setSelectedImage(null), [])

  const formatTimestamp = timestamp => {
    if (!timestamp) return ''
    try {
      return new Date(timestamp).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const displayCommentCount = comments.length || commentCount || 0

  return (
    <>
      <div className="experience-card" ref={cardRef}>
        {/* Header: avatar + username */}
        <div className="experience-card__top">
          <div className="experience-card__user">
            <img src={userIcon} alt="User" className="experience-card__user-icon" />
            <span className="experience-card__username">
              {post.author?.first_name || post.author?.username || post.username || 'Аноним'}
            </span>
          </div>
        </div>

        {/* Bold "Заголовок" label */}
        <strong className="experience-card__title-label">Заголовок</strong>

        {/* Post text with "read more" */}
        <div ref={textWrapperRef} className={`experience-card__text-wrapper ${expanded ? 'expanded' : ''}`}>
          <div className="experience-card__text">
            {post.text || post.excerpt || post.content || 'Нет текста'}
          </div>
        </div>

        {!expanded && showReadMore && (
          <button className="experience-card__read-more" onClick={handleExpandClick}>
            Читать далее
          </button>
        )}

        {/* File Attachments */}
        {postFiles.length > 0 && (
          <div className="experience-card__files">
            <FileAttachments files={postFiles} onImageClick={handleImageClick} />
          </div>
        )}

        {/* Reactions + timestamp */}
        <div className="experience-card__actions-container">
          <ReactionBadges
            likes={currentLikes}
            dislikes={currentDislikes}
            userReaction={currentUserReaction}
            onReaction={handleReaction}
          />
          <span className="experience-card__timestamp">
            {formatTimestamp(post.created_at || post.timestamp)}
          </span>
        </div>

        <div className="experience-card__divider" />

        {/* Footer */}
        <div className="experience-card__footer" onClick={handleCommentClick}>
          {displayCommentCount > 0 && (
            <img src={avatarStack} alt="Avatars" className="experience-card__avatar-stack" />
          )}
          <span className="experience-card__comments">
            {displayCommentCount > 0 ? `${displayCommentCount} комментариев` : 'Прокомментировать'}
          </span>
          <img src={donatIcon} alt="Donate" className="experience-card__icon-donat" />
        </div>
      </div>

      {selectedImage && (
        <ImageModal
          src={selectedImage.src || selectedImage.downloadUrl || selectedImage.url}
          alt={selectedImage.alt || selectedImage.original_name || selectedImage.name}
          onClose={handleImageModalClose}
        />
      )}
    </>
  )
})

export default ExperienceCard
