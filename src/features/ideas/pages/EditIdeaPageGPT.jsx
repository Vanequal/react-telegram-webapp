// EditIdeaPageGPT.jsx
import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createPost, clearError } from '@/store/slices/postSlice'

// Components
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'
import IdeaPreviewCard from '@/features/ideas/components/IdeaPreviewCard'

// Styles
import '@/styles/features/edit-idea-gpt.scss'

// Constants
const DEFAULT_SECTION_CODE = 'chat_ideas' // ✅ Переименовано
const DEFAULT_THEME_ID = null

const EditIdeaPageGPT = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  // ✅ Получаем данные из state навигации
  const attachedFiles = location.state?.attachedFiles || []
  const preview = location.state?.preview || null
  const sectionCode = location.state?.section_code || DEFAULT_SECTION_CODE // ✅ Изменено
  const themeId = location.state?.theme_id || DEFAULT_THEME_ID // ✅ Изменено

  const loading = useSelector(state => state.post.loading)
  const error = useSelector(state => state.post.error)

  // Очищаем ошибки при монтировании
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Handlers
  const handlePublish = useCallback(
    async (text, is_openai_generated = false) => {
      if (!text || !text.trim()) {
        alert('Текст для публикации не может быть пустым')
        return
      }

      console.log('📤 Публикуем пост:', {
        text: text.substring(0, 50) + '...',
        is_openai_generated,
        files_count: attachedFiles?.length || 0,
        section_code: sectionCode,
        theme_id: themeId,
      })

      const payload = {
        message_text: text.trim(),
        section_code: sectionCode, // ✅ Изменено
        theme_id: themeId,
        type: 'post',
        is_openai_generated: is_openai_generated,
        ratio: 99,
        files: attachedFiles || [],
      }

      try {
        const actionResult = await dispatch(createPost(payload))

        if (actionResult.meta.requestStatus === 'fulfilled') {
          console.log('✅ Пост успешно опубликован:', actionResult.payload)
          navigate('/mindvault')
        } else {
          const errorMsg =
            typeof actionResult.payload === 'string'
              ? actionResult.payload
              : actionResult.payload?.message || actionResult.payload?.detail || 'Неизвестная ошибка'

          console.error('❌ Ошибка публикации:', errorMsg)
          alert(`Ошибка публикации: ${errorMsg}`)
        }
      } catch (error) {
        console.error('❌ Исключение при публикации:', error)
        alert('Произошла ошибка при публикации поста')
      }
    },
    [dispatch, sectionCode, themeId, attachedFiles, navigate]
  )

  const handlePublishOriginal = useCallback(() => {
    if (!preview?.original_text) {
      alert('Оригинальный текст недоступен')
      return
    }
    handlePublish(preview.original_text, false) // ✅ is_openai_generated = false
  }, [handlePublish, preview])

  const handlePublishGPT = useCallback(() => {
    if (!preview?.openai_text && !preview?.gpt_text) { // ✅ Проверяем оба варианта
      alert('GPT версия недоступна')
      return
    }
    handlePublish(preview.openai_text || preview.gpt_text, true) // ✅ is_openai_generated = true
  }, [handlePublish, preview])

  const handleEditGPT = useCallback(() => {
    const gptText = preview?.openai_text || preview?.gpt_text // ✅ Проверяем оба варианта
    if (!gptText) {
      alert('GPT версия недоступна для редактирования')
      return
    }
    navigate('/textgpteditpage', {
      state: {
        gptText: gptText,
        attachedFiles: attachedFiles,
        section_code: sectionCode, // ✅ Изменено
        theme_id: themeId,
      },
    })
  }, [navigate, preview, attachedFiles, sectionCode, themeId])

  const handleNavigateBack = useCallback(() => {
    window.history.back()
  }, [])

  const displayError = error && typeof error === 'string' ? error : null
  const hasGPT = !!(preview?.openai_text || preview?.gpt_text) // ✅ Проверяем оба варианта

  return (
    <div className="edit-idea-page-gpt">
      <MindVaultHeader
        onBackClick={handleNavigateBack}
        onDescriptionClick={() => {}}
        hideSectionTitle={true}
        hideDescription={true}
        textColor="black"
        bgColor="#EEEFF1"
      />

      <div className="edit-idea-page-gpt__content">
        {displayError && (
          <div className="edit-idea-page-gpt__error">
            <p className="error-message">❌ {displayError}</p>
            <button className="error-dismiss" onClick={() => dispatch(clearError())}>
              ✕
            </button>
          </div>
        )}

        {!preview ? (
          <EmptyPreview sectionCode={sectionCode} />
        ) : (
          <>
            <IdeaPreviewCard preview={preview} attachedFiles={attachedFiles} />

            <PreviewActions
              onPublishOriginal={handlePublishOriginal}
              onPublishGPT={handlePublishGPT}
              onEditGPT={handleEditGPT}
              loading={loading}
              hasOriginal={!!preview.original_text}
              hasGPT={hasGPT}
            />
          </>
        )}
      </div>
    </div>
  )
}

// Sub-components
const EmptyPreview = ({ sectionCode }) => (
  <div className="edit-idea-page-gpt__empty-container">
    <p className="edit-idea-page-gpt__empty-message">Превью поста пока не создано.</p>
    <p className="edit-idea-page-gpt__empty-hint">Вернитесь назад, чтобы создать превью.</p>
    {sectionCode && (
      <p className="edit-idea-page-gpt__section-info">
        Секция: <strong>{sectionCode}</strong>
      </p>
    )}
  </div>
)

const PreviewActions = ({ onPublishOriginal, onPublishGPT, onEditGPT, loading, hasOriginal, hasGPT }) => (
  <div className="idea-card-gpt__actions">
    <button
      className="idea-card-gpt__action-button"
      onClick={onPublishOriginal}
      disabled={loading || !hasOriginal}
      title={!hasOriginal ? 'Оригинальный текст недоступен' : ''}
    >
      {loading ? 'Публикуем...' : 'Опубликовать оригинал'}
    </button>

    <button
      className="idea-card-gpt__action-button"
      onClick={onPublishGPT}
      disabled={loading || !hasGPT}
      title={!hasGPT ? 'GPT версия недоступна' : ''}
    >
      {loading ? 'Публикуем...' : 'Опубликовать версию GPT'}
    </button>

    <button
      className="idea-card-gpt__action-button idea-card-gpt__action-button--secondary"
      onClick={onEditGPT}
      disabled={loading || !hasGPT}
      title={!hasGPT ? 'GPT версия недоступна для редактирования' : ''}
    >
      Редактировать версию GPT
    </button>
  </div>
)

export default EditIdeaPageGPT