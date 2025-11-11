// src/features/tasks/components/TaskRatingModal.jsx
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

const TaskRatingModal = ({ onSubmit, onClose }) => {
  const [ratio, setRatio] = useState('')
  const [skipRatio, setSkipRatio] = useState(false)

  const handleRatioChange = useCallback(e => {
    const value = e.target.value
    if (/^\d{0,2}$/.test(value)) {
      setRatio(value)
      if (value) setSkipRatio(false)
    }
  }, [])

  const handleSkipToggle = useCallback(() => {
    setSkipRatio(prev => !prev)
    if (!skipRatio) setRatio('')
  }, [skipRatio])

  const handleSubmit = useCallback(() => {
    onSubmit({
      ratio: skipRatio ? null : parseInt(ratio) || 0,
    })
  }, [ratio, skipRatio, onSubmit])

  const canSubmit = ratio.trim() !== '' || skipRatio

  return (
    <div className="task-rating-modal__overlay">
      <div className="task-rating-modal">
        <h3 className="task-rating-modal__title">Назначить рейтинговый коэффициент для задачи</h3>

        <div className="task-rating-modal__input-wrapper">
          <input type="text" className="task-rating-modal__input" value={ratio} onChange={handleRatioChange} placeholder="00" maxLength={2} disabled={skipRatio} />
        </div>

        <div className="task-rating-modal__checkbox-row">
          <input type="checkbox" id="skip-ratio" className="task-rating-modal__checkbox" checked={skipRatio} onChange={handleSkipToggle} />
          <label htmlFor="skip-ratio" className="task-rating-modal__checkbox-label">
            Пропустить
          </label>
        </div>

        {!canSubmit && <div className="task-rating-modal__instruction">Инструкция</div>}

        {canSubmit && (
          <button className="task-rating-modal__submit-btn" onClick={handleSubmit}>
            Опубликовать задачу
          </button>
        )}
      </div>
    </div>
  )
}

TaskRatingModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default TaskRatingModal