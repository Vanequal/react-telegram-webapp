// src/features/tasks/components/TaskCompletionModal.jsx
import React, { useState, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'
import FileAttachments from '@/shared/components/FileAttachments'

const TaskCompletionModal = ({ taskId, sectionCode, themeId, onSubmit, onClose }) => {
  const [description, setDescription] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const fileInputRef = useRef(null)

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

  const handleRemoveFile = useCallback(indexToRemove => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove))
  }, [])

  const handleSubmit = useCallback(() => {
    if (selectedFiles.length > 0 && description.trim()) {
      onSubmit({
        files: selectedFiles,
        description: description.trim(),
      })
    }
  }, [selectedFiles, description, onSubmit])

  const canSubmit = selectedFiles.length > 0 && description.trim()

  const getFileInfo = file => {
    const name = file.name.toLowerCase()
    if (file.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => name.endsWith(`.${ext}`))) {
      return { type: 'image', icon: '🖼️' }
    }
    if (['pdf', 'doc', 'docx'].some(ext => name.endsWith(`.${ext}`))) {
      return { type: 'document', icon: '📄' }
    }
    return { type: 'file', icon: '📎' }
  }

  return (
    <div className="task-completion-modal__overlay" onClick={onClose}>
      <div className="task-completion-modal" onClick={e => e.stopPropagation()}>
        <input ref={fileInputRef} type="file" multiple accept="*/*" style={{ display: 'none' }} onChange={handleFileSelect} />

        <h2 className="task-completion-modal__title">Задача выполнена?</h2>

        <div className="task-completion-modal__content">
          {selectedFiles.length > 0 && (
            <div className="task-completion-modal__files">
              {selectedFiles.map((file, index) => {
                const fileInfo = getFileInfo(file)
                return (
                  <div key={index} className="task-completion-modal__file-card">
                    <div className="task-completion-modal__file-box" />
                    <div className="task-completion-modal__file-info">
                      <span className="task-completion-modal__file-title">{file.name}</span>
                      <span className="task-completion-modal__file-size">{Math.round(file.size / 1024)} Кб</span>
                      <span className="task-completion-modal__file-link" onClick={() => handleRemoveFile(index)}>
                        Удалить файл
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <p className="task-completion-modal__hint">
            {selectedFiles.length === 0
              ? 'После прикрепления файла добавьте краткий комментарий с описанием результатов выполнения задачи или выделите ключевые выводы, связанные с текущим разделом проекта.'
              : 'Добавьте краткий комментарий с описанием результатов выполнения задачи'}
          </p>
        </div>

        <div className="task-completion-modal__footer">
          <img src={skrepkaIcon} alt="Attach" className="task-completion-modal__icon" onClick={handleAttachClick} style={{ cursor: 'pointer' }} />
          <input type="text" className="task-completion-modal__input" placeholder={selectedFiles.length === 0 ? 'Прикрепить файл' : 'Добавить описание'} value={description} onChange={e => setDescription(e.target.value)} disabled={selectedFiles.length === 0} />
          <img
            src={canSubmit ? sendIconActive : sendIcon}
            alt="Send"
            className="task-completion-modal__send"
            onClick={canSubmit ? handleSubmit : undefined}
            style={{
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.5,
            }}
          />
        </div>
      </div>
    </div>
  )
}

TaskCompletionModal.propTypes = {
  taskId: PropTypes.number.isRequired,
  sectionCode: PropTypes.string.isRequired,
  themeId: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default TaskCompletionModal