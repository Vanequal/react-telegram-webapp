// DescriptionComposePage.jsx
import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createPost } from '@/store/slices/postSlice'
import { SECTION_CODES } from '@/shared/constants/sections'
import { showError } from '@/shared/utils/notifications'

import MindVaultHeader from '@/features/mindvault/components/MindVaultHeader'

import '@/styles/features/DescriptionComposePage.scss'

const SECTION_CODE = SECTION_CODES.DESCRIPTION

const DescriptionComposePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const rootThemeId = useSelector(state => state.theme.theme?.id)
  const themeTitle = useSelector(state => state.theme.theme?.title)
  const themeId = rootThemeId || null

  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const textareaRef = useRef(null)

  const handleTitleClick = useCallback(() => {
    setIsEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [])

  const handlePublish = useCallback(async () => {
    if (!text.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await dispatch(
        createPost({
          message_text: text.trim(),
          section_code: SECTION_CODE,
          theme_id: themeId,
          files: [],
        })
      ).unwrap()
      navigate('/descriptionpage')
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Неизвестная ошибка'
      showError(`Ошибка публикации: ${msg.slice(0, 150)}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [text, isSubmitting, dispatch, themeId, navigate])

  const canPublish = text.trim().length > 0 && !isSubmitting

  return (
    <div className="description-compose">
      <MindVaultHeader
        bgColor="#EEEFF1"
        textColor="black"
        title="Описание раздела"
        hideSectionTitle
        onBackClick={() => navigate('/descriptionpage')}
      />

      <div className="description-compose__content">
        {!isEditing ? (
          <span className="description-compose__title-label" onClick={handleTitleClick}>
            {themeTitle || 'Заголовок раздела'}
          </span>
        ) : (
          <textarea
            ref={textareaRef}
            className="description-compose__textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Начните описание..."
            disabled={isSubmitting}
          />
        )}
      </div>

      <div className="description-compose__footer">
        <button
          className={`description-compose__publish-btn ${!canPublish ? 'description-compose__publish-btn--disabled' : ''}`}
          onClick={handlePublish}
          disabled={!canPublish}
        >
          {isSubmitting ? 'ПУБЛИКУЕТСЯ...' : 'ОПУБЛИКОВАТЬ'}
        </button>
      </div>
    </div>
  )
}

export default DescriptionComposePage
