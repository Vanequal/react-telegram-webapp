// src/features/tasks/components/TaskCard.jsx
import React, { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { reactToPost } from '@/store/slices/postSlice'

// Components
import ReactionBadges from '@/shared/components/ReactionBadges'
import FileAttachments from '@/shared/components/FileAttachments'
import ImageModal from '@/shared/components/ImageModal'
import TaskInProgress from './TaskInProgress'
import TaskAcceptModal from './TaskAcceptModal'

// Icons
import userIcon from '@/assets/images/userIcon.webp'
import pinIcon from '@/assets/images/pinIcon.webp'

// Styles
import '@/styles/features/TaskCard.scss'

const TaskCard = ({ task, sectionCode, themeId, onTaskAccepted, onTaskCompleted }) => {
  const dispatch = useDispatch()
  const posts = useSelector(state => state.post.posts)

  // Local state
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  // Derived data
  const currentPost = useMemo(() => posts.find(p => p.id === task.id), [posts, task.id])

  const currentLikes = currentPost?.reactions?.count_likes ?? currentPost?.likes ?? task.likes ?? 0
  const currentDislikes = currentPost?.reactions?.count_dislikes ?? currentPost?.dislikes ?? task.dislikes ?? 0
  const currentUserReaction = currentPost?.reactions?.user_reaction ?? currentPost?.user_reaction ?? task.userReaction ?? null

  const taskFiles = useMemo(() => {
    const rawFiles = task.attachments || currentPost?.attachments || task.files || []
    if (!rawFiles || rawFiles.length === 0) return []

    return rawFiles.map((file, index) => ({
      ...file,
      url: file.stored_path || file.url,
      relative_path: file.stored_path || file.relative_path,
      original_name: file.original_name || file.name,
      extension: file.extension || (file.original_name ? file.original_name.split('.').pop().toLowerCase() : ''),
      index: index,
    }))
  }, [task.attachments, currentPost?.attachments, task.files])

  // Task status
  const taskStatus = task.status || 'idle' // idle, in_progress, completed
  const taskRatio = task.ratio || null
  const inProgressItems = task.in_progress_items || [] // Массив { type: 'full'|'partial', user, deadline, description }

  // Handlers
  const handleReaction = useCallback(
    reaction => {
      dispatch(
        reactToPost({
          post_id: task.id,
          reaction,
          section_code: sectionCode,
          theme_id: themeId,
        })
      )
    },
    [dispatch, task.id, sectionCode, themeId]
  )

  const handleImageClick = useCallback(image => {
    setSelectedImage(image)
  }, [])

  const handleAcceptTask = useCallback(() => {
    setShowAcceptModal(true)
  }, [])

  const handleAcceptSubmit = useCallback(
    data => {
      setShowAcceptModal(false)
      if (onTaskAccepted) {
        onTaskAccepted(task.id, data)
      }
    },
    [task.id, onTaskAccepted]
  )

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
      return ''
    }
  }

  return (
    <>
      <div className="task-card">
        {/* Header */}
        <div className="task-card__header">
          <div className="task-card__user">
            <img src={userIcon} alt="User" className="task-card__user-icon" />
            <span className="task-card__username">{task.author?.username || task.username || 'Аноним'}</span>
          </div>
          {task.pinned && <img src={pinIcon} alt="Pin" className="task-card__pin" />}
        </div>

        {/* Content */}
        <div className="task-card__content">
          <div className="task-card__text">{task.text || task.content || 'Нет описания'}</div>
        </div>

        {/* Files */}
        {taskFiles.length > 0 && (
          <div className="task-card__files">
            <FileAttachments files={taskFiles} onImageClick={handleImageClick} />
          </div>
        )}

        {/* Reactions */}
        <div className="task-card__reactions">
          <ReactionBadges likes={currentLikes} dislikes={currentDislikes} userReaction={currentUserReaction} onReaction={handleReaction} />
          <span className="task-card__timestamp">{formatTimestamp(task.created_at || task.timestamp)}</span>
        </div>

        {/* Help Button (только если задача еще не в работе и не выполнена) */}
        {taskStatus === 'idle' && (
          <button className="task-card__help-btn" onClick={handleAcceptTask}>
            Готов помочь с задачей
          </button>
        )}

        {/* In Progress Section */}
        {(taskStatus === 'in_progress' || taskStatus === 'completed') && inProgressItems.length > 0 && (
          <TaskInProgress items={inProgressItems} taskId={task.id} sectionCode={sectionCode} themeId={themeId} onTaskCompleted={onTaskCompleted} />
        )}

        {/* Ratio Badge (если есть коэффициент) */}
        {taskRatio && <div className="task-card__ratio">x{taskRatio}</div>}
      </div>

      {/* Modals */}
      {showAcceptModal && <TaskAcceptModal taskId={task.id} taskRatio={taskRatio} onClose={() => setShowAcceptModal(false)} onSubmit={handleAcceptSubmit} />}

      {selectedImage && <ImageModal src={selectedImage.src || selectedImage.downloadUrl || selectedImage.url} alt={selectedImage.alt || selectedImage.original_name || selectedImage.name} onClose={() => setSelectedImage(null)} />}
    </>
  )
}

TaskCard.propTypes = {
  task: PropTypes.object.isRequired,
  sectionCode: PropTypes.string.isRequired,
  themeId: PropTypes.number.isRequired,
  onTaskAccepted: PropTypes.func,
  onTaskCompleted: PropTypes.func,
}

export default TaskCard