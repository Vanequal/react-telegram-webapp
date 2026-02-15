// src/features/tasks/components/TaskAcceptModal.jsx
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import '@/styles/features/TaskAcceptModal.scss'

const TaskAcceptModal = ({ taskId, taskRatio, onSubmit, onClose, labels = {} }) => {
  const [acceptType, setAcceptType] = useState('') // 'full' or 'partial'
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleAcceptTypeChange = useCallback(type => {
    setAcceptType(prev => (prev === type ? '' : type))
  }, [])

  const handleSubmit = useCallback(() => {
    if (!acceptType || !deadline) return

    onSubmit({
      type: acceptType,
      description: acceptType === 'partial' ? description : '',
      deadline: deadline,
    })
  }, [acceptType, description, deadline, onSubmit])

  const canSubmit = acceptType && deadline && (acceptType === 'full' || description.trim())

  return (
    <div className="task-accept-modal__overlay" onClick={onClose}>
      <div className="task-accept-modal" onClick={e => e.stopPropagation()}>
        {/* Row 1: Full task checkbox + coefficient */}
        <div className="task-accept-modal__checkbox-row">
          <input
            type="checkbox"
            id="accept-full"
            className="task-accept-modal__checkbox"
            checked={acceptType === 'full'}
            onChange={() => handleAcceptTypeChange('full')}
          />
          <label htmlFor="accept-full" className="task-accept-modal__checkbox-label">
            {labels.acceptFull || 'Вы готовы выполнить всю задачу'}
          </label>
          {taskRatio && <span className="task-accept-modal__ratio-inline">x{taskRatio}</span>}
        </div>

        {/* Row 2: Partial task checkbox */}
        <div className="task-accept-modal__checkbox-row">
          <input
            type="checkbox"
            id="accept-partial"
            className="task-accept-modal__checkbox"
            checked={acceptType === 'partial'}
            onChange={() => handleAcceptTypeChange('partial')}
          />
          <label htmlFor="accept-partial" className="task-accept-modal__checkbox-label">
            {labels.acceptPartial || 'Вы готовы выполнить часть задачи'}
          </label>
        </div>

        {/* Description field (bordered container) */}
        <div className="task-accept-modal__desc-container">
          <span className="task-accept-modal__desc-title">Опишите часть:</span>
          <input
            type="text"
            className="task-accept-modal__desc-input"
            placeholder="Проведу 1-й этап исследований"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Deadline */}
        <div className="task-accept-modal__field">
          <label className="task-accept-modal__field-label">Ориентировочный срок выполнения</label>
          <input
            type="text"
            className="task-accept-modal__date-input"
            placeholder="MM/DD/YYYY"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            onFocus={e => { e.target.type = 'date' }}
            onBlur={e => { if (!e.target.value) e.target.type = 'text' }}
          />
        </div>

        {/* Submit button */}
        <div className="task-accept-modal__submit-wrapper">
          <button className="task-accept-modal__submit-btn" onClick={handleSubmit} disabled={!canSubmit}>
            В работе
          </button>
        </div>
      </div>
    </div>
  )
}

TaskAcceptModal.propTypes = {
  taskId: PropTypes.number.isRequired,
  taskRatio: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  labels: PropTypes.object,
}

export default TaskAcceptModal