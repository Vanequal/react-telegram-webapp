// src/features/tasks/components/TaskPreviewModal.jsx
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

const TaskPreviewModal = ({ original, gptVersion, onPublishOriginal, onPublishGPT, onEditGPT, onClose }) => {
  const [editedGPT, setEditedGPT] = useState(gptVersion.description)

  const handleEditGPT = useCallback(() => {
    onEditGPT({
      title: gptVersion.title,
      description: editedGPT,
    })
  }, [editedGPT, gptVersion.title, onEditGPT])

  return (
    <div className="task-preview-modal__overlay">
      <div className="task-preview-modal">
        {/* Original */}
        <div className="task-preview-modal__section">
          <h3 className="task-preview-modal__title">Оригинал текста:</h3>
          <p className="task-preview-modal__subtitle">{original.title}</p>
          <p className="task-preview-modal__text">{original.description}</p>
        </div>

        {/* GPT Version */}
        <div className="task-preview-modal__section">
          <h3 className="task-preview-modal__title">Улучшенная версия от ИИ:</h3>
          <p className="task-preview-modal__subtitle">{gptVersion.title}</p>
          <textarea className="task-preview-modal__textarea" value={editedGPT} onChange={e => setEditedGPT(e.target.value)} rows={8} />
        </div>

        {/* Actions */}
        <div className="task-preview-modal__actions">
          <button className="task-preview-modal__btn" onClick={onPublishOriginal}>
            Опубликовать оригинал
          </button>
          <button className="task-preview-modal__btn" onClick={onPublishGPT}>
            Опубликовать версию GPT
          </button>
          <button className="task-preview-modal__btn" onClick={handleEditGPT}>
            Редактировать версию GPT
          </button>
        </div>
      </div>
    </div>
  )
}

TaskPreviewModal.propTypes = {
  original: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  gptVersion: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onPublishOriginal: PropTypes.func.isRequired,
  onPublishGPT: PropTypes.func.isRequired,
  onEditGPT: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default TaskPreviewModal