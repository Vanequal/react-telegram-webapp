import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createPostPreview, createPost, fetchPostsInSection } from '@/store/slices/postSlice'
import { SECTION_CODES, DEFAULT_THEME_ID } from '@/shared/constants/sections'

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import ExperimentComposer from '@/features/laboratory/components/ExperimentComposer'
import ExperimentVersionSelector from '@/features/laboratory/components/ExperimentVersionSelector'
import EmptyState from '@/shared/components/EmptyState'
import LoadingState from '@/shared/components/LoadingState'
import '@/styles/shared/components/LaboratoryPage.scss'

const SECTION_CODE = SECTION_CODES.CHAT_EXPERIMENTS || 'chat_experiments'
const THEME_ID = DEFAULT_THEME_ID

const LaboratoryPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { posts, loading, preview } = useSelector(state => state.post)
  const [step, setStep] = useState('empty') // empty, compose, preview
  const [experimentData, setExperimentData] = useState({
    title: '',
    scenario: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Фильтруем эксперименты
  const experiments = posts.filter(post => post.section_code === SECTION_CODE)

  useEffect(() => {
    // Загружаем эксперименты при монтировании
    dispatch(
      fetchPostsInSection({
        section_code: SECTION_CODE,
        theme_id: THEME_ID,
      })
    )
  }, [dispatch])

  // Определяем какой экран показывать
  useEffect(() => {
    if (experiments.length === 0 && step === 'empty') {
      setStep('empty')
    }
  }, [experiments.length, step])

  const handleStartCompose = useCallback(() => {
    setStep('compose')
  }, [])

  const handleExperimentDataChange = useCallback(newData => {
    setExperimentData(newData)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!experimentData.title.trim() || !experimentData.scenario.trim()) return

    setIsSubmitting(true)

    try {
      const fullText = `${experimentData.title.trim()}\n\n${experimentData.scenario.trim()}`

      // Пытаемся получить GPT версию
      const previewResult = await dispatch(
        createPostPreview({
          section_code: SECTION_CODE,
          theme_id: THEME_ID,
          text: fullText,
        })
      ).unwrap()

      setStep('preview')
    } catch (error) {
      console.error('Error creating preview:', error)

      // Если OpenAI недоступен, публикуем без GPT версии
      if (error === 'OpenAI временно недоступен') {
        try {
          await dispatch(
            createPost({
              message_text: `${experimentData.title.trim()}\n\n${experimentData.scenario.trim()}`,
              section_code: SECTION_CODE,
              theme_id: THEME_ID,
              is_openai_generated: false,
              ratio: 99,
              files: [],
            })
          ).unwrap()

          alert('Эксперимент опубликован без AI обработки')
          setExperimentData({ title: '', scenario: '' })
          setStep('empty')
        } catch (postError) {
          alert(`Ошибка публикации: ${postError}`)
        }
      } else {
        alert(`Ошибка создания превью: ${error}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [experimentData, dispatch])

  const handlePublishOriginal = useCallback(async () => {
    setIsSubmitting(true)

    try {
      await dispatch(
        createPost({
          message_text: preview.original_text,
          section_code: SECTION_CODE,
          theme_id: THEME_ID,
          is_openai_generated: false,
          ratio: 99,
          files: [],
        })
      ).unwrap()

      alert('Эксперимент опубликован!')
      setExperimentData({ title: '', scenario: '' })
      setStep('empty')
    } catch (error) {
      alert(`Ошибка публикации: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [preview, dispatch])

  const handlePublishGPT = useCallback(async () => {
    setIsSubmitting(true)

    try {
      await dispatch(
        createPost({
          message_text: preview.openai_text,
          section_code: SECTION_CODE,
          theme_id: THEME_ID,
          is_openai_generated: true,
          ratio: 99,
          files: [],
        })
      ).unwrap()

      alert('Эксперимент опубликован!')
      setExperimentData({ title: '', scenario: '' })
      setStep('empty')
    } catch (error) {
      alert(`Ошибка публикации: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [preview, dispatch])

  const handleEditGPT = useCallback(
    editedText => {
      setExperimentData({
        title: experimentData.title,
        scenario: editedText,
      })
      setStep('compose')
    },
    [experimentData.title]
  )

  const handleRestart = useCallback(() => {
    setStep('compose')
  }, [])

  const handleBackClick = useCallback(() => {
    if (step !== 'empty') {
      setStep('empty')
      setExperimentData({ title: '', scenario: '' })
    } else {
      navigate('/')
    }
  }, [step, navigate])

  const renderContent = () => {
    if (loading && experiments.length === 0) {
      return <LoadingState />
    }

    if (step === 'empty' && experiments.length === 0) {
      return (
        <div className="laboratory-page__empty">
          <div className="laboratory-page__empty-text">В [Заголовок раздела] ещё нет опубликованных экспериментов.</div>
          <div className="laboratory-page__empty-subtitle">Придумайте название эксперимента и сформулируйте его сценарий</div>
          <button className="laboratory-page__start-button" onClick={handleStartCompose}>
            Создать эксперимент
          </button>
        </div>
      )
    }

    if (step === 'compose') {
      return <ExperimentComposer experimentData={experimentData} onExperimentDataChange={handleExperimentDataChange} onSubmit={handleSubmit} disabled={isSubmitting} />
    }

    if (step === 'preview' && preview) {
      return <ExperimentVersionSelector originalText={preview.original_text} gptText={preview.openai_text} onPublishOriginal={handlePublishOriginal} onPublishGPT={handlePublishGPT} onEditGPT={handleEditGPT} onRestart={handleRestart} />
    }

    // Если есть эксперименты, показываем список (пока что EmptyState)
    return <EmptyState />
  }

  return (
    <div className="laboratory-page">
      <MindVaultHeader bgColor="#EEEFF1" textColor="black" title="Лаборатория экспериментов" onBackClick={handleBackClick} />
      {renderContent()}
    </div>
  )
}

export default LaboratoryPage

