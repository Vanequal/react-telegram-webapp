// components/QuestionComposer.jsx
import React, { useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

// Icons
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'

// Styles - используем стили футера как в оригинале
import '@/styles/components/post-composer.scss'

const QuestionComposer = ({ questionData, onQuestionDataChange, onSubmit, disabled }) => {
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })

  const attachBtnRef = useRef(null)
  const fileInputMediaRef = useRef(null)
  const fileInputFilesRef = useRef(null)

  const { text, files } = questionData

  // Handlers
  const handleTextChange = useCallback(
    e => {
      const newText = e.target.value
      onQuestionDataChange(prev => ({ ...prev, text: newText }))
    },
    [onQuestionDataChange]
  )

  const handleAttachClick = useCallback(() => {
    if (attachBtnRef.current) {
      const rect = attachBtnRef.current.getBoundingClientRect()
      setPopoverPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      })
      setShowPopover(true)
    }
  }, [])

  const handleMediaClick = useCallback(() => {
    const tg = window.Telegram?.WebApp
    const used = tg?.showAttachMenu?.({ media: true })
    if (!used) {
      fileInputMediaRef.current?.click()
    }
    setShowPopover(false)
  }, [])

  const handleFileClick = useCallback(() => {
    const tg = window.Telegram?.WebApp
    const used = tg?.showAttachMenu?.({ files: true })
    if (!used) {
      fileInputFilesRef.current?.click()
    }
    setShowPopover(false)
  }, [])

  const handleFileChange = useCallback(
    e => {
      const newFiles = Array.from(e.target.files)
      console.log('Files selected for question:', {
        count: newFiles.length,
        files: newFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      })
      // Объединяем старые и новые файлы (используем functional updater чтобы не потерять state)
      onQuestionDataChange(prev => ({ ...prev, files: [...prev.files, ...newFiles] }))

      // Очищаем input для возможности выбрать те же файлы снова
      e.target.value = ''
    },
    [onQuestionDataChange]
  )

  const handleRemoveFile = useCallback(
    index => {
      onQuestionDataChange(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }))
    },
    [onQuestionDataChange]
  )

  const handleSubmit = useCallback(() => {
    if (text.trim() && !disabled) {
      onSubmit()
    }
  }, [text, onSubmit, disabled])

  const handleKeyPress = useCallback(
    e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const isSubmitDisabled = !text.trim() || disabled

  return (
    <>
      <div className="question-footer">
        <img src={skrepkaIcon} alt="Attach" className="question-footer__icon" onClick={handleAttachClick} ref={attachBtnRef} />

        {/* Hidden file inputs */}
        <input type="file" ref={fileInputMediaRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,video/*" multiple />
        <input type="file" ref={fileInputFilesRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt" multiple />

        <input type="text" className="question-footer__input" placeholder="Задать вопрос" value={text} onChange={handleTextChange} onKeyPress={handleKeyPress} disabled={disabled} />

        <img
          src={isSubmitDisabled ? sendIcon : sendIconActive}
          alt="Send"
          className="question-footer__send"
          style={{
            opacity: isSubmitDisabled ? 0.5 : 1,
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSubmit}
          title={isSubmitDisabled ? 'Введите вопрос' : 'Отправить вопрос'}
        />
      </div>

      {/* Popover Menu */}
      {showPopover && (
        <div className="popover-menu" style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }} onMouseLeave={() => setShowPopover(false)}>
          <button className="popover-btn" onClick={handleMediaClick}>
            📷 Медиа
          </button>
          <button className="popover-btn" onClick={handleFileClick}>
            📁 Файл
          </button>
        </div>
      )}

      {/* Attached Files Preview */}
      {files.length > 0 && (
        <div className="attached-files-preview">
          <strong>Вы прикрепили ({files.length}):</strong>
          <ul>
            {files.map((file, i) => (
              <li key={i}>
                {file.name} ({Math.round(file.size / 1024)} KB)
                <button
                  type="button"
                  onClick={() => handleRemoveFile(i)}
                  style={{
                    marginLeft: '8px',
                    cursor: 'pointer',
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '12px',
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

QuestionComposer.propTypes = {
  questionData: PropTypes.shape({
    text: PropTypes.string.isRequired,
    files: PropTypes.array.isRequired,
  }).isRequired,
  onQuestionDataChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

export default QuestionComposer
