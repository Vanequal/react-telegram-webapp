// src/features/tasks/components/TaskCard.jsx
import React, { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { reactToPost, acceptTask } from '@/store/slices/postSlice'

// Components
import ReactionBadges from '@/shared/components/ReactionBadges'
import FileAttachments from '@/shared/components/FileAttachments'
import ImageModal from '@/shared/components/ImageModal'
import TaskInProgress from './TaskInProgress'
import TaskAcceptModal from './TaskAcceptModal'

// Icons
import userIcon from '@/assets/images/userIcon.webp'
import pinIcon from '@/assets/images/pinIcon.webp'
import avatarStack from '@/assets/images/avatarStack.webp'
import donatIcon from '@/assets/images/donatIcon.webp'

// Styles
import '@/styles/features/TaskCard.scss'

const TaskCard = ({ task, sectionCode, themeId, onCommentClick, onTaskComplete, onCompletedClick, labels = {} }) => {
    const dispatch = useDispatch()
    const posts = useSelector(state => state.post.posts)
    const currentUser = useSelector(state => state.me.user)

    // Local state
    const [showAcceptModal, setShowAcceptModal] = useState(false)
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

    // Task status from backend
    const taskStatus = currentPost?.status || task.status || 'idle'
    const taskRatio = currentPost?.ratio || task.ratio || null
    const isPartially = currentPost?.is_partially || task.is_partially || false
    const expiresAt = currentPost?.expires_at || task.expires_at || null

    // Build in-progress items
    const inProgressItems = useMemo(() => {
        if (taskStatus === 'idle') return []

        return [
            {
                type: isPartially ? 'partial' : 'full',
                user: task.executor || { username: 'Исполнитель' },
                deadline: expiresAt,
                description: task.executor_description || '',
                isCurrentUser: currentUser?.id === task.executor?.id,
            },
        ]
    }, [taskStatus, isPartially, expiresAt, task.executor, task.executor_description, currentUser])

    // Handlers
    const handleReaction = useCallback(
        reaction => {
            dispatch(
                reactToPost({
                    post_id: task.id,
                    reaction,
                })
            )
        },
        [dispatch, task.id]
    )

    const handleImageClick = useCallback(image => {
        setSelectedImage(image)
    }, [])

    const handleAcceptTask = useCallback(() => {
        setShowAcceptModal(true)
    }, [])

    const handleAcceptSubmit = useCallback(
        async data => {
            try {
                await dispatch(
                    acceptTask({
                        task_message_id: task.id,
                        section_code: sectionCode,
                        theme_id: themeId,
                        is_partially: data.type === 'partial',
                        description: data.description || '',
                        expires_at: data.deadline,
                    })
                ).unwrap()

                setShowAcceptModal(false)
            } catch (error) {
                console.error('Ошибка принятия задачи:', error)
            }
        },
        [task.id, sectionCode, themeId, dispatch]
    )

    const handleTaskCompleteClick = useCallback(
        item => {
            onTaskComplete?.(task.id, item)
        },
        [task.id, onTaskComplete]
    )

    const handleCommentClick = useCallback(() => {
        onCommentClick?.(task.id)
    }, [task.id, onCommentClick])

    const handleCompletedClick = useCallback(
        taskId => {
            onCompletedClick?.(taskId)
        },
        [onCompletedClick]
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
                    {(() => {
                        const fullText = task.text || task.content || 'Нет описания'
                        const separatorIndex = fullText.indexOf('\n\n')
                        if (separatorIndex !== -1) {
                            const titlePart = fullText.substring(0, separatorIndex)
                            const descPart = fullText.substring(separatorIndex + 2)
                            return (
                                <>
                                    <div className="task-card__title">{titlePart}</div>
                                    <div className="task-card__description">{descPart}</div>
                                </>
                            )
                        }
                        return <div className="task-card__title">{fullText}</div>
                    })()}
                </div>

                {/* Files */}
                {taskFiles.length > 0 && (
                    <div className="task-card__files">
                        <FileAttachments files={taskFiles} onImageClick={handleImageClick} />
                    </div>
                )}

                {/* Reactions + Help Button */}
                <div className="task-card__reactions">
                    <ReactionBadges likes={currentLikes} dislikes={currentDislikes} userReaction={currentUserReaction} onReaction={handleReaction} />
                    {taskStatus === 'idle' ? (
                        <button className="task-card__help-btn" onClick={handleAcceptTask}>
                            {labels.helpButton || 'Готов помочь с задачей'}
                        </button>
                    ) : (
                        <span className="task-card__timestamp">{formatTimestamp(task.created_at || task.timestamp)}</span>
                    )}
                </div>

                {/* In Progress / Completed Section */}
                {(taskStatus === 'in_progress' || taskStatus === 'completed') && inProgressItems.length > 0 && (
                    <TaskInProgress
                        items={inProgressItems}
                        taskId={task.id}
                        taskStatus={taskStatus}
                        onTaskComplete={handleTaskCompleteClick}
                        onCompletedClick={handleCompletedClick}
                        labels={labels}
                    />
                )}

                {/* Completed badge for tasks without inProgressItems */}
                {taskStatus === 'completed' && inProgressItems.length === 0 && (
                    <div className="task-card__completed-badge" onClick={() => handleCompletedClick(task.id)}>
                        <div className="task-card__completed-text">{labels.completed || 'Задача выполнена'}</div>
                    </div>
                )}

                <div className="task-card__divider" />
                <div className="task-card__footer" onClick={handleCommentClick}>
                    <img src={avatarStack} alt="Avatars" className="task-card__avatar-stack" />
                    <span className="task-card__comments">
                        {task.comments_count || 0} {task.comments_count === 1 ? 'комментарий' : 'комментариев'}
                    </span>
                    <img src={donatIcon} alt="Donate" className="task-card__icon-donat" />
                </div>
                {/* Ratio Badge */}
                {taskRatio && <div className="task-card__ratio">x{taskRatio}</div>}
            </div>

            {/* Modals */}
            {showAcceptModal && <TaskAcceptModal taskId={task.id} taskRatio={taskRatio} onClose={() => setShowAcceptModal(false)} onSubmit={handleAcceptSubmit} labels={labels} />}

            {selectedImage && <ImageModal src={selectedImage.src || selectedImage.downloadUrl || selectedImage.url} alt={selectedImage.alt || selectedImage.original_name || selectedImage.name} onClose={() => setSelectedImage(null)} />}
        </>
    )
}

TaskCard.propTypes = {
    task: PropTypes.object.isRequired,
    sectionCode: PropTypes.string.isRequired,
    themeId: PropTypes.number.isRequired,
    onCommentClick: PropTypes.func,
    onTaskComplete: PropTypes.func,
    onCompletedClick: PropTypes.func,
    labels: PropTypes.object,
}

export default TaskCard
