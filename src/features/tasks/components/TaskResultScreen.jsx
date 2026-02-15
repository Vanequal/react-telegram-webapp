import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { createTaskComment, fetchTasks, reactToPost, fetchMessageAttachments } from '@/store/slices/postSlice'

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import CommentThread from '@/features/discussion/components/CommentThread'
import TaskFooter from './TaskFooter'
import ReactionBadges from '@/shared/components/ReactionBadges'

import userIcon from '@/assets/images/userIcon.webp'
import avatarStack from '@/assets/images/avatarStack.webp'
import donatIcon from '@/assets/images/donatIcon.webp'

import '@/styles/features/TaskResultScreen.scss'

const TaskResultScreen = ({ task, sectionCode, themeId, onBack, labels = {} }) => {
  const dispatch = useDispatch()
  const posts = useSelector(state => state.post.posts)

  const [commentText, setCommentText] = useState('')
  const [commentFiles, setCommentFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentPost = posts.find(p => p.id === task?.id)

  // Комментарии = executions задачи (т.к. /comments endpoint не поддерживает chat_tasks)
  const taskExecutions = currentPost?.executions || task?.executions || []
  const comments = taskExecutions.map(exec => ({
    id: exec.message?.id,
    author_id: exec.message?.author_id,
    text: exec.message?.text || '',
    created_at: exec.message?.created_at,
    type: 'comment',
    reactions: exec.message?.reactions || null,
  }))
  const currentLikes = currentPost?.reactions?.count_likes ?? currentPost?.likes ?? task?.likes ?? 0
  const currentDislikes = currentPost?.reactions?.count_dislikes ?? currentPost?.dislikes ?? task?.dislikes ?? 0
  const currentUserReaction = currentPost?.reactions?.user_reaction ?? currentPost?.user_reaction ?? null

  // Completion data
  const completionDescription = currentPost?.completion_description || task?.completion_description || ''
  const completionFiles = currentPost?.completion_files || task?.completion_files || []
  const taskAttachments = currentPost?.attachments || task?.attachments || []

  // Get first completion file for display
  const firstCompletionFile = completionFiles.length > 0
    ? completionFiles[0]
    : taskAttachments.length > 0
      ? taskAttachments[0]
      : null

  // Load attachments
  useEffect(() => {
    if (task?.id && !currentPost?.attachments) {
      dispatch(fetchMessageAttachments({ message_id: task.id }))
    }
  }, [task?.id, currentPost?.attachments, dispatch])

  const handleReaction = useCallback(
    reaction => {
      dispatch(reactToPost({ post_id: task.id, reaction }))
    },
    [dispatch, task?.id]
  )

  const handleFileDownload = useCallback(file => {
    const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const filePath = file.file_path || file.stored_path || file.url || file.relative_path
    if (filePath) {
      window.open(`${BACKEND_BASE_URL}/static/${filePath}`, '_blank')
    }
  }, [])

  const handleSendComment = useCallback(async () => {
    if ((!commentText.trim() && commentFiles.length === 0) || isSubmitting) return

    setIsSubmitting(true)
    try {
      await dispatch(
        createTaskComment({
          post_id: task.id,
          message_text: commentText.trim(),
          section_code: sectionCode,
          theme_id: themeId,
          files: commentFiles,
        })
      ).unwrap()

      setCommentText('')
      setCommentFiles([])

      // Перезагружаем задачи чтобы обновить executions
      dispatch(fetchTasks({ section_code: sectionCode, theme_id: themeId }))
    } catch (error) {
      console.error('Ошибка добавления комментария:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [commentText, commentFiles, isSubmitting, dispatch, task?.id, sectionCode, themeId])

  const handleFileSelect = useCallback(files => {
    setCommentFiles(prev => [...prev, ...files])
  }, [])

  if (!task) return null

  const fullText = task.text || task.content || ''
  const separatorIndex = fullText.indexOf('\n\n')
  const titlePart = separatorIndex !== -1 ? fullText.substring(0, separatorIndex) : fullText
  const descPart = separatorIndex !== -1 ? fullText.substring(separatorIndex + 2) : ''

  return (
    <div className="task-result-screen">
      <MindVaultHeader
        bgColor="#EEEFF1"
        textColor="black"
        title={labels.completed || "Задача выполнена"}
        hideSectionTitle
        onBackClick={onBack}
      />

      <div className="task-result-screen__content">
        <div className="task-result-card">
          {/* Header */}
          <div className="task-result-card__header">
            <img src={userIcon} alt="User" className="task-result-card__avatar" />
            <span className="task-result-card__username">
              {task.author?.username || task.username || 'Аноним'}
            </span>
          </div>

          {/* Completion file */}
          {firstCompletionFile && (
            <div className="task-result-card__file-wrapper">
              <div className="file-row">
                <div className="file-box" />
                <div className="file-info">
                  <span className="file-title">
                    {firstCompletionFile.original_name || firstCompletionFile.name || 'Файл'}
                  </span>
                  <span className="file-size">
                    {firstCompletionFile.size ? `${Math.round(firstCompletionFile.size / 1024)} Кб` : '0 Кб'}
                  </span>
                  <span className="file-link" onClick={() => handleFileDownload(firstCompletionFile)}>
                    Открыть файл
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Excerpt */}
          <strong className="task-result-card__excerpt-title">Выдержка:</strong>
          <p className="task-result-card__excerpt-text">
            {completionDescription || descPart || titlePart || 'Нет описания'}
          </p>

          {/* Reactions */}
          <div className="task-result-card__reactions">
            <ReactionBadges
              likes={currentLikes}
              dislikes={currentDislikes}
              userReaction={currentUserReaction}
              onReaction={handleReaction}
            />
          </div>

          <div className="task-result-card__divider" />

          {/* Footer */}
          <div className="task-result-card__footer">
            <img src={avatarStack} alt="Avatars" className="task-result-card__avatar-stack" />
            <span className="task-result-card__comments">
              {comments.length || task.comments_count || 0} Комментариев
            </span>
            <img src={donatIcon} alt="Donate" className="task-result-card__icon-donat" />
          </div>
        </div>

        {/* Divider */}
        <div className="task-result-screen__divider" />

        {/* Comments (task executions) */}
        <div className="task-result-screen__comments">
          {comments.length > 0
            ? comments.map(comment => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  sectionCode={sectionCode}
                  themeId={themeId}
                />
              ))
            : (
                <p style={{ textAlign: 'center', color: '#666' }}>Комментариев пока нет</p>
              )}
        </div>
      </div>

      <TaskFooter
        mode="comment"
        value={commentText}
        onChange={setCommentText}
        onSend={handleSendComment}
        onFileSelect={handleFileSelect}
        hasFiles={commentFiles.length > 0}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

TaskResultScreen.propTypes = {
  task: PropTypes.object.isRequired,
  sectionCode: PropTypes.string.isRequired,
  themeId: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired,
  labels: PropTypes.object,
}

export default TaskResultScreen
