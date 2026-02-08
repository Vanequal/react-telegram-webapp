// src/features/tasks/components/TaskCard.jsx
import React, { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { reactToPost, acceptTask, completeTask } from '@/store/slices/postSlice'

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

const TaskCard = ({ task, sectionCode, themeId }) => {
    const dispatch = useDispatch()
    const posts = useSelector(state => state.post.posts)
    const currentUser = useSelector(state => state.me.user) // Предполагаем что есть user в meSlice

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
    const taskStatus = currentPost?.status || task.status || 'idle' // idle, in_progress, completed
    const taskRatio = currentPost?.ratio || task.ratio || null
    const isPartially = currentPost?.is_partially || task.is_partially || false
    const expiresAt = currentPost?.expires_at || task.expires_at || null

    // Формируем массив "в работе" для отображения
    const inProgressItems = useMemo(() => {
        if (taskStatus === 'idle' || taskStatus === 'completed') return []

        // TODO: В идеале нужен отдельный запрос для получения всех исполнителей
        // Пока показываем одну запись на основе текущих данных
        return [
            {
                type: isPartially ? 'partial' : 'full',
                user: task.executor || { username: 'Исполнитель' }, // TODO: данные исполнителя
                deadline: expiresAt,
                description: task.executor_description || '', // TODO: описание от исполнителя
                isCurrentUser: currentUser?.id === task.executor?.id, // Проверяем это текущий юзер или нет
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

    const handleTaskCompleted = useCallback(
        async (taskId, item, completionData) => {
            try {
                await dispatch(
                    completeTask({
                        task_message_id: taskId,
                        section_code: sectionCode,
                        theme_id: themeId,
                        description: completionData.description,
                        files: completionData.files,
                    })
                ).unwrap()

                console.log('✅ Задача успешно завершена')
            } catch (error) {
                console.error('Ошибка завершения задачи:', error)
            }
        },
        [sectionCode, themeId, dispatch]
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

                {/* Reactions + Help Button */}
                <div className="task-card__reactions">
                    <ReactionBadges likes={currentLikes} dislikes={currentDislikes} userReaction={currentUserReaction} onReaction={handleReaction} />
                    {taskStatus === 'idle' ? (
                        <button className="task-card__help-btn" onClick={handleAcceptTask}>
                            Готов помочь с задачей
                        </button>
                    ) : (
                        <span className="task-card__timestamp">{formatTimestamp(task.created_at || task.timestamp)}</span>
                    )}
                </div>

                {/* In Progress Section */}
                {(taskStatus === 'in_progress' || taskStatus === 'completed') && inProgressItems.length > 0 && (
                    <TaskInProgress items={inProgressItems} taskId={task.id} sectionCode={sectionCode} themeId={themeId} onTaskCompleted={handleTaskCompleted} />
                )}
                <div className="task-card__divider" />
                <div className="task-card__footer">
                    <img src={avatarStack} alt="Avatars" className="task-card__avatar-stack" />
                    <span className="task-card__comments">
                        {task.comments_count || 0} {task.comments_count === 1 ? 'комментарий' : 'комментариев'}
                    </span>
                    <img src={donatIcon} alt="Donate" className="task-card__icon-donat" />
                </div>
                {/* Ratio Badge */}
                {taskRatio && <div className="task-card__ratio">x{taskRatio}</div>}

                {/* Completed Badge */}
                {taskStatus === 'completed' && (
                    <div className="task-card__completed-badge">
                        <div className="task-card__completed-text">Задача выполнена</div>
                        <img src={userIcon} alt="User" className="task-card__completed-avatar" />
                    </div>
                )}
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
}

export default TaskCard