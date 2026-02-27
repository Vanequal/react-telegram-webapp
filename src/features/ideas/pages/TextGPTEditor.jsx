// TextGPTEditor.jsx
import React, { useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createPost } from '@/store/slices/postSlice'
import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'

import '@/styles/features/TextGPTEditor.scss'

// Constants
const DEFAULT_SECTION_CODE = 'chat_ideas' // ✅ Переименовано
const DEFAULT_THEME_ID = null

const TextGPTEditor = () => {
  const location = useNavigate()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // ✅ Получаем данные из state навигации
  const initialText = location.state?.gptText || ''
  const attachedFiles = location.state?.attachedFiles || []
  const sectionCode = location.state?.section_code || DEFAULT_SECTION_CODE // ✅ Изменено
  const themeId = location.state?.theme_id || DEFAULT_THEME_ID // ✅ Изменено

  // State
  const [text, setText] = useState(initialText)
  const [isPublishing, setIsPublishing] = useState(false)

  // Redux state
  const { loading, error } = useSelector(state => state.post)

  const hasChanges = text.trim() !== initialText.trim()
  const canPublish = text.trim().length > 0

  const handleBack = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите уйти?')
      if (!confirmed) return
    }
    window.history.back()
  }, [hasChanges])

  const handlePublish = useCallback(async () => {
    if (!canPublish || isPublishing) return

    setIsPublishing(true)

    try {
      console.log('📤 Публикуем отредактированный GPT текст:', {
        text: text.substring(0, 50) + '...',
        files_count: attachedFiles?.length || 0,
        section_code: sectionCode,
        theme_id: themeId,
      })

      const payload = {
        message_text: text.trim(),
        section_code: sectionCode, // ✅ Изменено
        theme_id: themeId,
        type: 'post',
        is_openai_generated: true, // ✅ Это отредактированная GPT версия
        ratio: 99,
        files: attachedFiles || [],
      }

      const actionResult = await dispatch(createPost(payload))

      if (actionResult.meta.requestStatus === 'fulfilled') {
        console.log('✅ Отредактированный пост успешно опубликован:', actionResult.payload)
        navigate('/mindvault', {
          state: {
            message: 'Пост успешно опубликован!',
          },
        })
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
    } finally {
      setIsPublishing(false)
    }
  }, [text, attachedFiles, sectionCode, themeId, canPublish, isPublishing, dispatch, navigate])

  return (
    <div className="text-gpt-editor">
      <MindVaultHeader
        title="Редактировать"
        onBackClick={handleBack}
        hideSectionTitle={true}
        hideDescription={true}
        bgColor={'#EEEFF1'}
        textColor="black"
      />

      <div className="text-gpt-editor__content">
        {attachedFiles && attachedFiles.length > 0 && (
          <div className="text-gpt-editor__files-info">📎 Прикреплено файлов: {attachedFiles.length}</div>
        )}

        {error && <div className="text-gpt-editor__error">❌ {error}</div>}

        <textarea
          className="text-gpt-editor__textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Введите текст..."
          autoFocus
          disabled={isPublishing}
        />

        <div className="text-gpt-editor__actions">
          {hasChanges && <div className="text-gpt-editor__changes-indicator">✏️ Текст изменен</div>}

          <button
            className="text-gpt-editor__publish-btn"
            onClick={handlePublish}
            disabled={!canPublish || isPublishing || loading}
          >
            {isPublishing || loading ? 'Публикуем...' : 'Опубликовать'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TextGPTEditor