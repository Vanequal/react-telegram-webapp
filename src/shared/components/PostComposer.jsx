// components/PostComposer.jsx
import React, { useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

// Icons
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'

// Styles
import '@/styles/components/post-composer.scss'

const PostComposer = ({ postData, onPostDataChange, onSubmit }) => {
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })

  const attachBtnRef = useRef(null)
  const fileInputMediaRef = useRef(null)
  const fileInputFilesRef = useRef(null)

  const { text, files } = postData

  // Handlers
  const handleTextChange = useCallback(
    e => {
      onPostDataChange({ ...postData, text: e.target.value })
    },
    [postData, onPostDataChange]
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
      console.log('Files selected:', {
        count: newFiles.length,
        files: newFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      })
      onPostDataChange({ ...postData, files: newFiles })

      // Очищаем input для возможности выбрать те же файлы снова
      e.target.value = ''
    },
    [postData, onPostDataChange]
  )

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onSubmit()
    }
  }, [text, onSubmit])

  const handleKeyPress = useCallback(
    e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const isSubmitDisabled = !text.trim()

  return (
    <>
      <div className="vault-footer">
        <img src={skrepkaIcon} alt="Attach" className="vault-footer__icon" onClick={handleAttachClick} ref={attachBtnRef} />

        {/* Hidden file inputs */}
        <input type="file" ref={fileInputMediaRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,video/*" multiple />
        <input type="file" ref={fileInputFilesRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt" multiple />

        <input type="text" className="vault-footer__input" placeholder="Добавить идею" value={text} onChange={handleTextChange} onKeyPress={handleKeyPress} />

        <img
          src={isSubmitDisabled ? sendIcon : sendIconActive}
          alt="Send"
          className="vault-footer__send"
          style={{
            opacity: isSubmitDisabled ? 0.5 : 1,
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSubmit}
          title={isSubmitDisabled ? 'Введите текст' : 'Отправить идею'}
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
          <strong>Вы прикрепили:</strong>
          <ul>
            {files.map((file, i) => (
              <li key={i}>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

PostComposer.propTypes = {
  postData: PropTypes.shape({
    text: PropTypes.string.isRequired,
    files: PropTypes.array.isRequired,
  }).isRequired,
  onPostDataChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default PostComposer
