// src/features/tasks/components/TaskAcceptModal.jsx
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

const TaskAcceptModal = ({ taskId, taskRatio, onSubmit, onClose }) => {
  const [acceptType, setAcceptType] = useState('') // 'full' or 'partial'
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleAcceptTypeChange = useCallback(type => {
    setAcceptType(type)
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
        {taskRatio && <div className="task-accept-modal__ratio">x{taskRatio}</div>}

        <div className="task-accept-modal__checkbox-row">
          <input type="checkbox" id="accept-full" className="task-accept-modal__checkbox" checked={acceptType === 'full'} onChange={() => handleAcceptTypeChange('full')} />
          <label htmlFor="accept-full" className="task-accept-modal__checkbox-label">
            Вы готовы выполнить всю задачу
          </label>
        </div>

        <div className="task-accept-modal__checkbox-row">
          <input type="checkbox" id="accept-partial" className="task-accept-modal__checkbox" checked={acceptType === 'partial'} onChange={() => handleAcceptTypeChange('partial')} />
          <label htmlFor="accept-partial" className="task-accept-modal__checkbox-label">
            Вы готовы выполнить часть задачи
          </label>
        </div>

        {acceptType === 'partial' && (
          <div className="task-accept-modal__field">
            <label className="task-accept-modal__field-label">Опишите часть:</label>
            <textarea className="task-accept-modal__textarea" placeholder="Проведу 1-й этап исследований" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
        )}

        <div className="task-accept-modal__field">
          <label className="task-accept-modal__field-label">Ориентировочный срок выполнения</label>
          <input type="date" className="task-accept-modal__date-input" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>

        <button className="task-accept-modal__submit-btn" onClick={handleSubmit} disabled={!canSubmit}>
          В работе
        </button>
      </div>
    </div>
  )
}

TaskAcceptModal.propTypes = {
  taskId: PropTypes.number.isRequired,
  taskRatio: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default TaskAcceptModal