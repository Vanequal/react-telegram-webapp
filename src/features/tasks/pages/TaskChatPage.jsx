// src/features/tasks/pages/TaskChatPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPostsInSection } from '@/store/slices/postSlice'

// Components
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import TaskCard from '@/features/tasks/components/TaskCard'
import LoadingState from '@/shared/components/LoadingState'
import ErrorState from '@/shared/components/ErrorState'

// Icons
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'

// Styles
import '@/styles/features/TaskChatPage.scss'

// Constants
const SECTION_CODE = 'chat_tasks'
const DEFAULT_THEME_ID = 1

const TaskChatPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)

  // Redux state
  const { posts, loading, error } = useSelector(state => state.post)

  // Local state
  const [step, setStep] = useState('list') // list, compose, preview, rating
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  
  // Preview data
  const [originalData, setOriginalData] = useState(null)
  const [gptData, setGptData] = useState(null)
  const [editedGptText, setEditedGptText] = useState('')
  
  // Rating data
  const [ratio, setRatio] = useState('')
  const [skipRatio, setSkipRatio] = useState(false)

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

  // Handlers - Compose step
  const handleInputFocus = useCallback(() => {
    setStep('compose')
  }, [])

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileSelect = useCallback(e => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
    }
    e.target.value = ''
  }, [])

  const handlePublishClick = useCallback(async () => {
    if (!title.trim() && !description.trim()) return

    setIsSubmitting(true)

    try {
      // TODO: Запрос к OpenAI для превью
      const mockGPT = {
        title: `Разработка насекомых-опылителей для закрытых экосистем`,
        description: `Вывести новый вид насекомых опылителей для теплиц ...`,
      }

      setOriginalData({
        title: title.trim(),
        description: description.trim(),
      })
      setGptData(mockGPT)
      setEditedGptText(mockGPT.description)
      setStep('preview')
    } catch (error) {
      console.error('Ошибка получения preview:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [title, description])

  // Handlers - Preview step
  const handlePublishOriginal = useCallback(() => {
    setStep('rating')
  }, [])

  const handlePublishGPT = useCallback(() => {
    setStep('rating')
  }, [])

  const handleEditGPT = useCallback(() => {
    setGptData(prev => ({
      ...prev,
      description: editedGptText,
    }))
    setTitle(gptData.title)
    setDescription(editedGptText)
    setStep('compose')
  }, [editedGptText, gptData])

  // Handlers - Rating step
  const handleRatioChange = useCallback(e => {
    const value = e.target.value
    if (/^\d{0,2}$/.test(value)) {
      setRatio(value)
      if (value) setSkipRatio(false)
    }
  }, [])

  const handleSkipToggle = useCallback(() => {
    setSkipRatio(prev => !prev)
    if (!skipRatio) setRatio('')
  }, [skipRatio])

  const handleFinalPublish = useCallback(async () => {
    setIsSubmitting(true)

    try {
      // TODO: Отправка задачи на сервер
      console.log('Публикуем задачу:', {
        title,
        description,
        ratio: skipRatio ? null : parseInt(ratio) || 0,
        files: selectedFiles,
      })

      // Сброс и возврат к списку
      setTitle('')
      setDescription('')
      setSelectedFiles([])
      setRatio('')
      setSkipRatio(false)
      setStep('list')

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
  }, [title, description, ratio, skipRatio, selectedFiles, dispatch])

  const handleTaskAccepted = useCallback((taskId, acceptData) => {
    console.log('Задача принята:', taskId, acceptData)
    // TODO: Отправить на сервер
  }, [])

  const handleTaskCompleted = useCallback((taskId, item, completionData) => {
    console.log('Задача выполнена:', taskId, item, completionData)
    // TODO: Отправить на сервер
  }, [])

  // Render helpers
  const canPublish = title.trim() || description.trim()
  const canSubmitRating = ratio.trim() !== '' || skipRatio

  return (
    <div className="task-chat-page">
      <input ref={fileInputRef} type="file" multiple accept="*/*" style={{ display: 'none' }} onChange={handleFileSelect} />

      <MindVaultHeader
        bgColor="#EEEFF1"
        textColor="black"
        title="Чат задач"
        hideSectionTitle
        onBackClick={() => {
          if (step !== 'list') {
            setStep('list')
          } else {
            navigate('/')
          }
        }}
      />

      {/* STEP 1: List of tasks */}
      {step === 'list' && (
        <>
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

          <div className="task-footer">
            <img src={skrepkaIcon} alt="Attach" className="task-footer__icon" onClick={handleAttachClick} style={{ cursor: 'pointer' }} />
            <input type="text" className="task-footer__input" placeholder="Назвать и сформулировать задачу" onFocus={handleInputFocus} readOnly />
            <img src={sendIcon} alt="Send" className="task-footer__send" />
          </div>
        </>
      )}

      {/* STEP 2: Compose task */}
      {step === 'compose' && (
        <>
          <div className="task-compose-page">
            <div className="task-compose-page__label">Заголовок:</div>
            <div className="task-compose-page__canvas" contentEditable suppressContentEditableWarning onInput={e => setTitle(e.currentTarget.textContent)} style={{ minHeight: '60px' }}>
              {title}
            </div>

            <div className="task-compose-page__label">Условие задачи:</div>
            <div className="task-compose-page__canvas" contentEditable suppressContentEditableWarning onInput={e => setDescription(e.currentTarget.textContent)} style={{ minHeight: '200px' }}>
              {description}
            </div>

            <button className="task-compose-page__publish-btn" onClick={handlePublishClick} disabled={!canPublish || isSubmitting}>
              Опубликовать
            </button>
          </div>
        </>
      )}

      {/* STEP 3: Preview with GPT */}
      {step === 'preview' && originalData && gptData && (
        <>
          <div className="task-preview-page">
            <div className="task-preview-page__section">
              <h3 className="task-preview-page__title">Оригинал текста:</h3>
              <p className="task-preview-page__subtitle">{originalData.title}</p>
              <p className="task-preview-page__text">{originalData.description}</p>
            </div>

            <div className="task-preview-page__section">
              <h3 className="task-preview-page__title">Улучшенная версия от ИИ:</h3>
              <p className="task-preview-page__subtitle">{gptData.title}</p>
              <textarea className="task-preview-page__textarea" value={editedGptText} onChange={e => setEditedGptText(e.target.value)} rows={8} />
            </div>

            <div className="task-preview-page__actions">
              <button className="task-preview-page__btn" onClick={handlePublishOriginal}>
                Опубликовать оригинал
              </button>
              <button className="task-preview-page__btn" onClick={handlePublishGPT}>
                Опубликовать версию GPT
              </button>
              <button className="task-preview-page__btn" onClick={handleEditGPT}>
                Редактировать версию GPT
              </button>
            </div>
          </div>
        </>
      )}

      {/* STEP 4: Rating */}
      {step === 'rating' && (
        <>
          <div className="task-rating-page">
            <div className="task-rating-page__card">
              <h3 className="task-rating-page__title">Назначить рейтинговый<br />коэффициент для задачи</h3>

              <div className="task-rating-page__input-wrapper">
                <input type="text" className="task-rating-page__input" value={ratio} onChange={handleRatioChange} placeholder="00" maxLength={2} disabled={skipRatio} />
              </div>

              <div className="task-rating-page__checkbox-row">
                <input type="checkbox" id="skip-ratio" className="task-rating-page__checkbox" checked={skipRatio} onChange={handleSkipToggle} />
                <label htmlFor="skip-ratio" className="task-rating-page__checkbox-label">
                  Пропустить
                </label>
              </div>

              {!canSubmitRating && <div className="task-rating-page__instruction">Инструкция</div>}

              {canSubmitRating && (
                <button className="task-rating-page__submit-btn" onClick={handleFinalPublish} disabled={isSubmitting}>
                  Опубликовать задачу
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TaskChatPage