// src/features/tasks/components/TaskResultCard.jsx
import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import userIcon from '@/assets/images/userIcon.webp'
import FileAttachments from '@/shared/components/FileAttachments'
import ImageModal from '@/shared/components/ImageModal'

const TaskResultCard = ({ task, result }) => {
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageClick = useCallback(image => {
    setSelectedImage(image)
  }, [])

  const resultFiles = (result.files || []).map((file, index) => ({
    ...file,
    url: file.stored_path || file.url,
    relative_path: file.stored_path || file.relative_path,
    original_name: file.original_name || file.name,
    extension: file.extension || (file.original_name ? file.original_name.split('.').pop().toLowerCase() : ''),
    index: index,
  }))

  const formatTimestamp = timestamp => {
    if (!timestamp) return ''
    try {
      return new Date(timestamp).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      return ''
    }
  }

  return (
    <>
      <div className="task-result-card">
        {/* Header */}
        <div className="task-result-card__header">
          <div className="task-result-card__user">
            <img src={userIcon} alt="User" className="task-result-card__user-icon" />
            <span className="task-result-card__username">{task.author?.username || 'Аноним'}</span>
          </div>
        </div>

        {/* Files Section */}
        {resultFiles.length > 0 && (
          <div className="task-result-card__files">
            <FileAttachments files={resultFiles} onImageClick={handleImageClick} />
          </div>
        )}

        {/* Excerpt Section */}
        {result.description && (
          <div className="task-result-card__excerpt">
            <h4 className="task-result-card__excerpt-title">Выдержка:</h4>
            <p className="task-result-card__excerpt-text">{result.description}</p>
          </div>
        )}

        {/* Original Task */}
        <div className="task-result-card__divider" />
        <div className="task-result-card__original">
          <div className="task-result-card__text">{task.text || task.content}</div>
          <span className="task-result-card__timestamp">{formatTimestamp(task.created_at)}</span>
        </div>
      </div>

      {selectedImage && <ImageModal src={selectedImage.src || selectedImage.downloadUrl || selectedImage.url} alt={selectedImage.alt || selectedImage.original_name || selectedImage.name} onClose={() => setSelectedImage(null)} />}
    </>
  )
}

TaskResultCard.propTypes = {
  task: PropTypes.object.isRequired,
  result: PropTypes.shape({
    files: PropTypes.array,
    description: PropTypes.string,
  }).isRequired,
}

export default TaskResultCard