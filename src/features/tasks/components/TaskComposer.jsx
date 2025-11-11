// src/features/tasks/components/TaskComposer.jsx
import React, { useState, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import skrepkaIcon from '@/assets/images/skrepkaIcon.webp'
import sendIcon from '@/assets/images/sendIcon.webp'
import sendIconActive from '@/assets/images/sendButtonActive.png'
import FileAttachments from '@/shared/components/FileAttachments'

const TaskComposer = ({ onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const fileInputRef = useRef(null)

  const handleFocus = useCallback(() => {
    setShowForm(true)
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

  const handleRemoveFile = useCallback(indexToRemove => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove))
  }, [])

  const handleSubmit = useCallback(() => {
    if ((title.trim() || description.trim() || selectedFiles.length > 0) && !isSubmitting) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        files: selectedFiles,
      })
      setTitle('')
      setDescription('')
      setSelectedFiles([])
      setShowForm(false)
    }
  }, [title, description, selectedFiles, isSubmitting, onSubmit])

  const isDisabled = (!title.trim() && !description.trim() && selectedFiles.length === 0) || isSubmitting

  return (
    <>
      <input ref={fileInputRef} type="file" multiple accept="*/*" style={{ display: 'none' }} onChange={handleFileSelect} />

      {showForm && (
        <div className="task-composer__form">
          <div className="task-composer__field">
            <label className="task-composer__label">Заголовок:</label>
            <input type="text" className="task-composer__input" placeholder="Введите заголовок задачи" value={title} onChange={e => setTitle(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="task-composer__field">
            <label className="task-composer__label">Условие задачи:</label>
            <textarea className="task-composer__textarea" placeholder="Опишите задачу подробно" rows={5} value={description} onChange={e => setDescription(e.target.value)} disabled={isSubmitting} />
          </div>

          {selectedFiles.length > 0 && (
            <div className="task-composer__files">
              <FileAttachments
                files={selectedFiles.map((file, index) => ({
                  id: `temp-${index}`,
                  original_name: file.name,
                  name: file.name,
                  extension: file.name.split('.').pop()?.toLowerCase() || '',
                  size: file.size,
                  file: file,
                  isTemp: true,
                  type: file.type || 'application/octet-stream',
                }))}
                onRemove={handleRemoveFile}
                showRemoveButton={true}
              />
            </div>
          )}

          <button className="task-composer__publish-btn" onClick={handleSubmit} disabled={isDisabled}>
            Опубликовать
          </button>
        </div>
      )}

      <div className="task-footer">
        <img src={skrepkaIcon} alt="Attach" className="task-footer__icon" onClick={handleAttachClick} style={{ cursor: 'pointer' }} />
        <input type="text" className="task-footer__input" placeholder="Назвать и сформулировать задачу" onFocus={handleFocus} disabled={isSubmitting} readOnly />
        <img
          src={isDisabled ? sendIcon : sendIconActive}
          alt="Send"
          className="task-footer__send"
          style={{
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.5 : 1,
          }}
        />
      </div>
    </>
  )
}

TaskComposer.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
}

export default TaskComposer