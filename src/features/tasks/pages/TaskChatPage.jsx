// src/features/tasks/pages/TaskChatPage.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPostsInSection } from '@/store/slices/postSlice'

// Components
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import TaskCard from '@/features/tasks/components/TaskCard'
import TaskComposer from '@/features/tasks/components/TaskComposer'
import TaskPreviewModal from '@/features/tasks/components/TaskPreviewModal'
import TaskRatingModal from '@/features/tasks/components/TaskRatingModal'
import LoadingState from '@/shared/components/LoadingState'
import EmptyState from '@/shared/components/EmptyState'
import ErrorState from '@/shared/components/ErrorState'

// Styles
import '@/styles/features/TaskChatPage.scss'

// Constants
const SECTION_CODE = 'chat_tasks'
const DEFAULT_THEME_ID = 1

const TaskChatPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Redux state
  const { posts, loading, error } = useSelector(state => state.post)

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [currentTaskData, setCurrentTaskData] = useState(null)
  const [gptPreview, setGptPreview] = useState(null)

  // Filter tasks
  const tasks = posts.filter(post => post.section_code === SECTION_CODE)

  // Load tasks on mount
  useEffect(() => {
    dispatch(
      fetchPostsInSection({
        section_code: SECTION_CODE,
        theme_id: DEFAULT_THEME_ID,
      })
    )
  }, [dispatch])

  // Handlers
  const handleTaskSubmit = useCallback(async data => {
    setIsSubmitting(true)
    setCurrentTaskData(data)

    try {
      // TODO: Запрос к OpenAI для preview
      // Временная заглушка
      const mockGPT = {
        title: `Улучшенная версия: ${data.title}`,
        description: `GPT версия: ${data.description}`,
      }

      setGptPreview(mockGPT)
      setShowPreviewModal(true)
    } catch (error) {
      console.error('Ошибка получения preview:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handlePublishOriginal = useCallback(() => {
    setShowPreviewModal(false)
    setShowRatingModal(true)
  }, [])

  const handlePublishGPT = useCallback(() => {
    setShowPreviewModal(false)
    setShowRatingModal(true)
  }, [])

  const handleEditGPT = useCallback(editedData => {
    setGptPreview(editedData)
    setShowPreviewModal(false)
    // Вернуться к форме с GPT данными
  }, [])

  const handleRatingSubmit = useCallback(
    async ratingData => {
      setShowRatingModal(false)
      setIsSubmitting(true)

      try {
        // TODO: Отправка задачи на сервер
        console.log('Публикуем задачу:', {
          ...currentTaskData,
          ratio: ratingData.ratio,
        })

        // Перезагрузить список задач
        await dispatch(
          fetchPostsInSection({
            section_code: SECTION_CODE,
            theme_id: DEFAULT_THEME_ID,
          })
        )
      } catch (error) {
        console.error('Ошибка публикации задачи:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [currentTaskData, dispatch]
  )

  const handleTaskAccepted = useCallback((taskId, acceptData) => {
    console.log('Задача принята:', taskId, acceptData)
    // TODO: Отправить на сервер
  }, [])

  const handleTaskCompleted = useCallback((taskId, item, completionData) => {
    console.log('Задача выполнена:', taskId, item, completionData)
    // TODO: Отправить на сервер
  }, [])

  return (
    <div className="task-chat-page">
      <MindVaultHeader bgColor="#EEEFF1" textColor="black" title="Чат задач" hideSectionTitle onBackClick={() => navigate('/')} />

      <div className="task-chat-page__content">
        {loading && <LoadingState message="Загрузка задач..." />}

        {error && <ErrorState message={error} />}

        {!loading && !error && tasks.length === 0 && (
          <div className="task-chat-page__empty">
            <p className="task-chat-page__top-text">В [Заголовок раздела] ещё нет опубликованных задач.</p>
            <p className="task-chat-page__bottom-text">Придумайте заголовок и опишите суть задачи</p>
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="task-chat-page__list">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} sectionCode={SECTION_CODE} themeId={DEFAULT_THEME_ID} onTaskAccepted={handleTaskAccepted} onTaskCompleted={handleTaskCompleted} />
            ))}
          </div>
        )}
      </div>

      <TaskComposer onSubmit={handleTaskSubmit} isSubmitting={isSubmitting} />

      {showPreviewModal && currentTaskData && gptPreview && (
        <TaskPreviewModal
          original={{
            title: currentTaskData.title,
            description: currentTaskData.description,
          }}
          gptVersion={gptPreview}
          onPublishOriginal={handlePublishOriginal}
          onPublishGPT={handlePublishGPT}
          onEditGPT={handleEditGPT}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {showRatingModal && <TaskRatingModal onSubmit={handleRatingSubmit} onClose={() => setShowRatingModal(false)} />}
    </div>
  )
}

export default TaskChatPage