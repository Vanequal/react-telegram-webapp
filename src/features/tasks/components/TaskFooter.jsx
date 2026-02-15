import React, { useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'

const TaskFooter = ({
  mode = 'create',
  onAttachClick,
  onInputFocus,
  value = '',
  onChange,
  onSend,
  onFileSelect,
  hasFiles = false,
  isSubmitting = false,
  labels = {},
}) => {
  const fileInputRef = useRef(null)

  const handleAttachClick = useCallback(() => {
    if (mode === 'create') {
      onAttachClick?.()
    } else {
      fileInputRef.current?.click()
    }
  }, [mode, onAttachClick])

  const handleFileChange = useCallback(
    e => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onFileSelect?.(files)
      }
      e.target.value = ''
    },
    [onFileSelect]
  )

  const handleKeyPress = useCallback(
    e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSend?.()
      }
    },
    [onSend]
  )

  const getPlaceholder = () => {
    if (mode === 'create') return labels.create || 'Назвать и сформулировать задачу'
    if (mode === 'comment') return labels.comment || 'Комментировать'
    if (mode === 'complete') return hasFiles ? (labels.completeDesc || 'Добавить описание') : (labels.completeFile || 'Прикрепить файл')
    return ''
  }

  const isReadOnly = mode === 'create'
  const isInputDisabled = mode === 'complete' && !hasFiles

  const canSend = (() => {
    if (mode === 'create') return false
    if (mode === 'comment') return (value.trim() || hasFiles) && !isSubmitting
    if (mode === 'complete') return hasFiles && value.trim() && !isSubmitting
    return false
  })()

  return (
    <>
      {mode !== 'create' && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      <div className="task-footer">
        <img
          src={skrepkaIcon}
          alt="Attach"
          className="task-footer__icon"
          onClick={handleAttachClick}
          style={{ cursor: 'pointer' }}
        />
        <input
          type="text"
          className="task-footer__input"
          placeholder={getPlaceholder()}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onFocus={isReadOnly ? onInputFocus : undefined}
          readOnly={isReadOnly}
          disabled={isInputDisabled}
          onKeyPress={handleKeyPress}
        />
        <img
          src={canSend ? sendIconActive : sendIcon}
          alt="Send"
          className="task-footer__send"
          onClick={canSend ? onSend : undefined}
          style={{
            cursor: canSend ? 'pointer' : 'default',
            opacity: canSend ? 1 : 0.5,
          }}
        />
      </div>
    </>
  )
}

TaskFooter.propTypes = {
  mode: PropTypes.oneOf(['create', 'comment', 'complete']),
  onAttachClick: PropTypes.func,
  onInputFocus: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSend: PropTypes.func,
  onFileSelect: PropTypes.func,
  hasFiles: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  labels: PropTypes.object,
}

export default TaskFooter
