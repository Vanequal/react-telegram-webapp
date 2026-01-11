// components/AnswerThread.jsx
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { reactToPost } from '@/store/slices/postSlice'
import userIcon from '@/assets/images/userIcon.webp'
import likeIcon from '@/assets/images/likeIcon.webp'
import dislikeIcon from '@/assets/images/dislikeIcon.webp'
import FileAttachments from '@/shared/components/FileAttachments'
import ImageModal from '@/shared/components/ImageModal'

const AnswerThread = ({ answer, isNew, sectionKey, themeId, isFirstAnswer = false }) => {
  const dispatch = useDispatch()
  const [showReplies, setShowReplies] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  const toggleReplies = useCallback(() => {
    setShowReplies(prev => !prev)
  }, [])

  // Обработчик реакций на ответ
  const handleAnswerReaction = useCallback(
    reaction => {
      dispatch(
        reactToPost({
          post_id: answer.id,
          reaction,
        })
      )
    },
    [dispatch, answer.id]
  )

  // Обработчик реакций на дополнительные ответы
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
    console.log('🖼️ Клик по изображению в ответе:', image)
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

  // Обработка файлов ответа
  const answerFiles = answer.attachments || []

  // Проверяем, является ли это первым ответом
  const isFirst = isFirstAnswer || answer.id === 1

  return (
    <>
      <div className={`question-comment-thread ${isFirst ? 'first-comment' : ''}`} id={isNew ? 'new-answer' : undefined}>
        <div className="question-comment-item">
          <div className="question-comment-header">
            <img src={userIcon} alt="Avatar" className="question-comment-avatar" />
            <div className="question-comment-user">{answer.author?.first_name || answer.author?.username || 'Пользователь'}</div>
            <div className="question-comment-timestamp">{formatTimestamp(answer.created_at)}</div>
          </div>

          <div className="question-comment-content">
            {isFirst ? (
              <>
                <strong>Ответ:</strong> {answer.text}
              </>
            ) : (
              answer.text
            )}
          </div>

          {/* Файлы ответа */}
          {answerFiles.length > 0 && (
            <div className="answer-files">
              <FileAttachments
                files={answerFiles.map((file, index) => ({
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

          <div className="question-comment-actions-right">
            <div className={`question-reaction-badge ${answer.reactions?.user_reaction === 'like' ? 'question-reaction-badge--active' : ''}`} onClick={() => handleAnswerReaction('like')} style={{ cursor: 'pointer' }}>
              <img src={likeIcon} alt="Like" />
              <span>{answer.reactions?.count_likes || answer.likes || 0}</span>
            </div>
            <div className={`question-reaction-badge ${answer.reactions?.user_reaction === 'dislike' ? 'question-reaction-badge--active' : ''}`} onClick={() => handleAnswerReaction('dislike')} style={{ cursor: 'pointer' }}>
              <img src={dislikeIcon} alt="Dislike" />
              <span>{answer.reactions?.count_dislikes || answer.dislikes || 0}</span>
            </div>
          </div>

          {isFirst ? (
            <div className="comment-actions-container">
              <button className="comment-action-button">Комментировать</button>
              {answer.replies?.length > 0 && (
                <button className="comment-action-button" onClick={toggleReplies}>
                  {showReplies ? `Скрыть комментарии (${answer.replies.length})` : `Посмотреть ${answer.replies.length} Комментария`}
                </button>
              )}
            </div>
          ) : (
            answer.replies?.length > 0 && (
              <div className="question-comment-actions-left">
                <button className="question-toggle-replies-button" onClick={toggleReplies}>
                  {showReplies ? `Скрыть ответы (${answer.replies.length})` : `Показать ответы (${answer.replies.length})`}
                </button>
              </div>
            )
          )}
        </div>

        {showReplies && answer.replies?.length > 0 && (
          <div className="replies-container">
            {answer.replies.map((reply, index) => {
              const replyFiles = reply.attachments || []

              return (
                <div key={reply.id} className="question-reply-thread" style={{ marginTop: '6%' }}>
                  <div className="question-subcomment">
                    <div className="question-subcomment-item">
                      <img src={userIcon} alt="Avatar" className="question-comment-avatar" />
                      <div className="question-subcomment-body">
                        <div className="question-subcomment-header">
                          <div className="question-subcomment-user">{reply.author?.first_name || reply.author?.username || 'Пользователь'}</div>
                          <div className="question-comment-timestamp">{formatTimestamp(reply.created_at)}</div>
                        </div>

                        {reply.reply_to && (
                          <div className="reply-quote-wrapper">
                            <div className="replied-user-name">{reply.reply_to.author}</div>
                            <div className="replied-content">{reply.reply_to.text}</div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div className="question-subcomment-text">{reply.text}</div>
                          <div className="question-subcomment-reactions">
                            <div className={`question-subcomment-reaction ${reply.reactions?.user_reaction === 'like' ? 'active' : ''}`} onClick={() => handleReplyReaction(reply.id, 'like')} style={{ cursor: 'pointer' }}>
                              <img src={likeIcon} alt="Like" />
                              <span>{reply.reactions?.count_likes || reply.likes || 0}</span>
                            </div>
                            <div className={`question-subcomment-reaction ${reply.reactions?.user_reaction === 'dislike' ? 'active' : ''}`} onClick={() => handleReplyReaction(reply.id, 'dislike')} style={{ cursor: 'pointer' }}>
                              <img src={dislikeIcon} alt="Dislike" />
                              <span>{reply.reactions?.count_dislikes || reply.dislikes || 0}</span>
                            </div>
                          </div>
                        </div>

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

                        <p style={{ color: '#1976D2', fontSize: '15px', fontFamily: 'Montserrat, sans-serif', margin: '0', fontWeight: '600' }}>Ответить</p>
                      </div>
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

AnswerThread.propTypes = {
  answer: PropTypes.shape({
    id: PropTypes.number.isRequired,
    author: PropTypes.object,
    text: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    reactions: PropTypes.object,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    replies: PropTypes.array,
    attachments: PropTypes.array,
  }).isRequired,
  isNew: PropTypes.bool,
  sectionKey: PropTypes.string.isRequired,
  themeId: PropTypes.number.isRequired,
  isFirstAnswer: PropTypes.bool,
}

export default AnswerThread
