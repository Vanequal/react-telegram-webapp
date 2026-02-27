// components/CommentThread.jsx
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { reactToPost } from '@/store/slices/postSlice'
import userIcon from '@/assets/images/userIcon.webp'
import likeIcon from '@/assets/images/likeIcon.webp'
import dislikeIcon from '@/assets/images/dislikeIcon.webp'
import FileAttachments from '@/shared/components/FileAttachments'
import ImageModal from '@/shared/components/ImageModal'

const CommentThread = ({ comment, isNew, sectionCode, themeId }) => {
  const dispatch = useDispatch()
  const [showReplies, setShowReplies] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  const toggleReplies = useCallback(() => {
    setShowReplies(prev => !prev)
  }, [])

  // Обработчик реакций на комментарий
  const handleCommentReaction = useCallback(
    reaction => {
      dispatch(
        reactToPost({
          post_id: comment.id,
          reaction,
        })
      )
    },
    [dispatch, comment.id]
  )

  // Обработчик реакций на ответы
  const handleReplyReaction = useCallback(
    (replyId, reaction) => {
      dispatch(
        reactToPost({
          post_id: replyId,
          reaction,
        })
      )
    },
    [dispatch]
  )

  // Обработчик клика по изображению
  const handleImageClick = useCallback(image => {
    console.log('🖼️ Клик по изображению в комментарии:', image)
    setSelectedImage(image)
  }, [])

  const handleImageModalClose = useCallback(() => {
    setSelectedImage(null)
  }, [])

  const formatTimestamp = timestamp => {
    if (!timestamp) return ''
    try {
      return new Date(timestamp).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      console.warn('Error formatting timestamp:', timestamp)
      return ''
    }
  }

  // Обработка файлов комментария (новый API: media_files, старый: attachments)
  const commentFiles = comment.media_files || comment.attachments || []

  return (
    <>
      <div className="comment-thread" id={isNew ? 'new-comment' : undefined}>
        <div className="comment-item">
          <div className="comment-header">
            <img src={userIcon} alt="Avatar" className="comment-avatar" />
            <div className="comment-user">{comment.author?.first_name || comment.author?.username || 'Пользователь'}</div>
            <div className="comment-timestamp">{formatTimestamp(comment.created_at)}</div>
          </div>

          <div className="comment-content">{comment.text}</div>

          {/* Файлы комментария */}
          {commentFiles.length > 0 && (
            <div className="comment-files">
              <FileAttachments
                files={commentFiles.map((file, index) => ({
                  ...file,
                  file_path: file.file_path || file.stored_path || file.url,
                  url: file.file_path || file.stored_path || file.url,
                  relative_path: file.file_path || file.stored_path || file.relative_path,
                  original_name: file.original_name || file.name,
                  extension: file.extension || (file.original_name ? file.original_name.split('.').pop().toLowerCase() : ''),
                  index: index,
                }))}
                onImageClick={handleImageClick}
              />
            </div>
          )}

          <div className="comment-actions-right">
            <div className={`reaction-badge ${(comment.user_reaction ?? comment.reactions?.user_reaction) === 'like' ? 'reaction-badge--active' : ''}`} onClick={() => handleCommentReaction('like')} style={{ cursor: 'pointer' }}>
              <img src={likeIcon} alt="Like" />
              <span>{comment.likes ?? comment.reactions?.count_likes ?? 0}</span>
            </div>
            <div className={`reaction-badge ${(comment.user_reaction ?? comment.reactions?.user_reaction) === 'dislike' ? 'reaction-badge--active' : ''}`} onClick={() => handleCommentReaction('dislike')} style={{ cursor: 'pointer' }}>
              <img src={dislikeIcon} alt="Dislike" />
              <span>{comment.dislikes ?? comment.reactions?.count_dislikes ?? 0}</span>
            </div>
          </div>

          {comment.replies?.length > 0 && (
            <div className="comment-actions-left">
              <button className="toggle-replies-button" onClick={toggleReplies}>
                {showReplies ? `Скрыть ответы (${comment.replies.length})` : `Показать ответы (${comment.replies.length})`}
              </button>
            </div>
          )}
        </div>

        {showReplies && comment.replies?.length > 0 && (
          <div className="replies-container">
            {comment.replies.map(reply => {
              const replyFiles = reply.media_files || reply.attachments || []

              return (
                <div key={reply.id} className="reply-thread">
                  <div className="comment-header">
                    <img src={userIcon} alt="Avatar" className="comment-avatar" />
                    <div className="comment-user">{reply.author?.first_name || reply.author?.username || 'Пользователь'}</div>
                    <div className="comment-timestamp">{formatTimestamp(reply.created_at)}</div>
                  </div>
                  <div className="comment-content">{reply.text}</div>

                  {/* Файлы ответа */}
                  {replyFiles.length > 0 && (
                    <div className="reply-files">
                      <FileAttachments
                        files={replyFiles.map((file, index) => ({
                          ...file,
                          url: file.stored_path || file.url,
                          relative_path: file.stored_path || file.relative_path,
                          original_name: file.original_name || file.name,
                          extension: file.extension || (file.original_name ? file.original_name.split('.').pop().toLowerCase() : ''),
                          index: index,
                        }))}
                        onImageClick={handleImageClick}
                      />
                    </div>
                  )}

                  <div className="comment-actions-right">
                    <div className={`reaction-badge ${(reply.user_reaction ?? reply.reactions?.user_reaction) === 'like' ? 'reaction-badge--active' : ''}`} onClick={() => handleReplyReaction(reply.id, 'like')} style={{ cursor: 'pointer' }}>
                      <img src={likeIcon} alt="Like" />
                      <span>{reply.likes ?? reply.reactions?.count_likes ?? 0}</span>
                    </div>
                    <div className={`reaction-badge ${(reply.user_reaction ?? reply.reactions?.user_reaction) === 'dislike' ? 'reaction-badge--active' : ''}`} onClick={() => handleReplyReaction(reply.id, 'dislike')} style={{ cursor: 'pointer' }}>
                      <img src={dislikeIcon} alt="Dislike" />
                      <span>{reply.dislikes ?? reply.reactions?.count_dislikes ?? 0}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && <ImageModal src={selectedImage.src || selectedImage.downloadUrl || selectedImage.url} alt={selectedImage.alt || selectedImage.original_name || selectedImage.name} onClose={handleImageModalClose} />}
    </>
  )
}

CommentThread.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    author: PropTypes.object,
    text: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    reactions: PropTypes.object,
    replies: PropTypes.array,
    attachments: PropTypes.array,
  }).isRequired,
  isNew: PropTypes.bool,
  sectionCode: PropTypes.string.isRequired,
  themeId: PropTypes.number.isRequired,
}

export default CommentThread