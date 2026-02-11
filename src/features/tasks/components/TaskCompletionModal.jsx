import React from 'react'
import PropTypes from 'prop-types'
import '@/styles/features/TaskCompletionModal.scss'

const TaskCompletionModal = ({ selectedFiles = [], onClose }) => {
  const getFileInfo = file => {
    const name = (file.name || '').toLowerCase()
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
        <h2 className="task-completion-modal__title">Задача выполнена?</h2>

        <div className="task-completion-modal__content">
          {selectedFiles.length > 0 && (
            <div className="task-completion-modal__files">
              {selectedFiles.map((file, index) => (
                <div key={index} className="task-completion-modal__file-row">
                  <div className="task-completion-modal__file-box" />
                  <div className="task-completion-modal__file-info">
                    <span className="task-completion-modal__file-title">{file.name}</span>
                    <span className="task-completion-modal__file-size">{Math.round(file.size / 1024)} Кб</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="task-completion-modal__hint">
          После прикрепления файла добавьте краткий комментарий с описанием результатов выполнения задачи или выделите ключевые выводы, связанные с текущим разделом проекта.
        </p>
      </div>
    </div>
  )
}

TaskCompletionModal.propTypes = {
  selectedFiles: PropTypes.array,
  onClose: PropTypes.func.isRequired,
}

export default TaskCompletionModal
