// src/features/tasks/pages/TaskChatPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { createTask, fetchTasks, createPostPreview } from '@/store/slices/postSlice'

// Components
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import TaskCard from '@/features/tasks/components/TaskCard'
import LoadingState from '@/shared/components/LoadingState'
import ErrorState from '@/shared/components/ErrorState'

// Icons
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'

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
    const [step, setStep] = useState('list')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form data
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedFiles, setSelectedFiles] = useState([])

    // Preview data
    const [originalData, setOriginalData] = useState(null)
    const [gptData, setGptData] = useState(null)
    const [editedGptText, setEditedGptText] = useState('')
    const [useGPTVersion, setUseGPTVersion] = useState(false)

    // Rating data
    const [ratio, setRatio] = useState('')
    const [skipRatio, setSkipRatio] = useState(false)

    // Filter tasks
    const tasks = posts.filter(post => post.type === 'task' && post.section_code === SECTION_CODE)

    console.log('🔍 Всего постов в store:', posts.length)
    console.log('🔍 Задач после фильтрации:', tasks.length)

    // Load tasks on mount
    useEffect(() => {
        console.log('🔄 Компонент TaskChatPage монтируется, загружаем задачи...')
        dispatch(
            fetchTasks({
                section_code: SECTION_CODE,
                theme_id: DEFAULT_THEME_ID,
            })
        )
    }, [dispatch])

    // Handlers
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
            // Формируем полный текст задачи
            const fullText = `${title.trim()}\n\n${description.trim()}`

            console.log('📤 Запрашиваем GPT preview для:', fullText)

            // Запрос к OpenAI для превью
            const previewResult = await dispatch(
                createPostPreview({
                    section_code: SECTION_CODE,
                    theme_id: DEFAULT_THEME_ID,
                    text: fullText,
                })
            ).unwrap()

            console.log('✅ Получен ответ от GPT:', previewResult)

            setOriginalData({
                title: title.trim(),
                description: description.trim(),
            })

            // ✅ ПРАВИЛЬНО ИЗВЛЕКАЕМ ДАННЫЕ
            setGptData({
                title: 'Улучшенная версия от ИИ', // Заголовок статичный
                description: previewResult.openai_text || previewResult.gpt_text || 'Нет ответа от GPT',
            })
            setEditedGptText(previewResult.openai_text || previewResult.gpt_text || '')

            setStep('preview')
        } catch (error) {
            console.error('❌ Ошибка получения preview:', error)

            // Если OpenAI недоступен (403), переходим сразу к рейтингу
            if (error === 'OpenAI временно недоступен') {
                console.log('⚠️ OpenAI недоступен, пропускаем preview')
                setStep('rating')
            } else {
                alert('Ошибка получения preview от GPT')
            }
        } finally {
            setIsSubmitting(false)
        }
    }, [title, description, dispatch])

    const handlePublishOriginal = useCallback(() => {
        setUseGPTVersion(false)
        setStep('rating')
    }, [])

    const handlePublishGPT = useCallback(() => {
        setUseGPTVersion(true)
        setStep('rating')
    }, [])

    const handleEditGPT = useCallback(() => {
        setGptData(prev => ({
            ...prev,
            description: editedGptText,
        }))
        setDescription(editedGptText)
        setStep('compose')
    }, [editedGptText])

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

    // ✅ ИСПРАВЛЕННАЯ функция публикации задачи
    const handleFinalPublish = useCallback(async () => {
        setIsSubmitting(true)

        try {
            // Определяем текст задачи
            const taskText = useGPTVersion
                ? editedGptText  // Если GPT, берем отредактированный текст
                : `${title.trim()}\n\n${description.trim()}` // Иначе заголовок + описание

            console.log('📤 Публикуем задачу:', {
                text: taskText,
                ratio: skipRatio ? null : parseInt(ratio) || null,
                files_count: selectedFiles.length,
            })

            // ✅ Правильные параметры для createTask
            const taskParams = {
                message_text: taskText,
                section_code: SECTION_CODE,
                theme_id: DEFAULT_THEME_ID,
                is_partially: false, // При создании задачи это всегда false
                files: selectedFiles,
            }

            // ✅ Добавляем ratio только если он указан
            if (!skipRatio && ratio) {
                taskParams.ratio = parseInt(ratio)
            }

            // ✅ expires_at не передаем вообще при создании задачи (null вызывает ошибку)
            // Он нужен только при acceptTask

            const result = await dispatch(createTask(taskParams)).unwrap()

            console.log('✅ Задача создана:', result)

            // Сброс всех полей
            setTitle('')
            setDescription('')
            setSelectedFiles([])
            setRatio('')
            setSkipRatio(false)
            setUseGPTVersion(false)
            setOriginalData(null)
            setGptData(null)
            setEditedGptText('')

            setStep('list')

            // Перезагрузка списка задач
            console.log('🔄 Перезагружаем список задач...')
            await dispatch(
                fetchTasks({
                    section_code: SECTION_CODE,
                    theme_id: DEFAULT_THEME_ID,
                })
            )

            console.log('✅ Список задач обновлен')
        } catch (error) {
            console.error('❌ Ошибка публикации задачи:', error)
            alert(`Ошибка публикации задачи: ${error}`)
        } finally {
            setIsSubmitting(false)
        }
    }, [title, description, ratio, skipRatio, selectedFiles, useGPTVersion, editedGptText, dispatch])

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

            {/* STEP 1: List */}
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
                                    <TaskCard key={task.id} task={task} sectionCode={SECTION_CODE} themeId={DEFAULT_THEME_ID} />
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

            {/* STEP 2: Compose */}
            {step === 'compose' && (
                <div className="task-compose-page">
                    <div className="task-compose-page__label">Заголовок:</div>
                    <textarea
                        className="task-compose-page__input"
                        placeholder="Введите заголовок"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        rows={2}
                    />

                    <div className="task-compose-page__label">Условие задачи:</div>
                    <textarea
                        className="task-compose-page__textarea"
                        placeholder="Опишите задачу подробно"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={8}
                    />

                    {/* Отображение выбранных файлов */}
                    {selectedFiles.length > 0 && (
                        <div className="task-compose-page__files">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="task-compose-page__file">
                                    {file.name}
                                </div>
                            ))}
                        </div>
                    )}

                    <button className="task-compose-page__publish-btn" onClick={handlePublishClick} disabled={!canPublish || isSubmitting}>
                        {isSubmitting ? 'Обработка...' : 'Опубликовать'}
                    </button>
                </div>
            )}

            {/* STEP 3: Preview */}
            {step === 'preview' && originalData && gptData && (
                <div className="task-preview-page">
                    <div className="task-preview-page__section">
                        <h3 className="task-preview-page__title">Оригинал текста:</h3>
                        <p className="task-preview-page__subtitle">{originalData.title}</p>
                        <p className="task-preview-page__text">{originalData.description}</p>
                    </div>

                    <div className="task-preview-page__section">
                        <h3 className="task-preview-page__title">Улучшенная версия от ИИ:</h3>
                        <p className="task-preview-page__subtitle">Заголовок от GPT</p>

                        {/* ✅ ПЛАШКА с текстом от ИИ (БЕЗ textarea) */}
                        <div className="task-preview-page__gpt-card">
                            <div className="task-preview-page__gpt-text">
                                {editedGptText || 'Загрузка...'}
                            </div>
                        </div>
                    </div>

                    <div className="task-preview-page__actions">
                        <button className="task-preview-page__btn" onClick={handlePublishOriginal} disabled={isSubmitting}>
                            Опубликовать оригинал
                        </button>
                        <button className="task-preview-page__btn" onClick={handlePublishGPT} disabled={isSubmitting}>
                            Опубликовать версию GPT
                        </button>
                        <button className="task-preview-page__btn" onClick={handleEditGPT} disabled={isSubmitting}>
                            Редактировать версию GPT
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: Rating */}
            {step === 'rating' && (
                <div className="task-rating-page">
                    <div className="task-rating-page__card">
                        <h3 className="task-rating-page__title">
                            Назначить рейтинговый
                            <br />
                            коэффициент для задачи
                        </h3>

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
                                {isSubmitting ? 'Публикация...' : 'Опубликовать задачу'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TaskChatPage