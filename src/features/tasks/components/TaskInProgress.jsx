// src/features/tasks/components/TaskInProgress.jsx
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import userIcon from '@/assets/images/userIcon.webp'
import TaskCompletionModal from './TaskCompletionModal'

const TaskInProgress = ({ items, taskId, sectionCode, themeId, onTaskCompleted }) => {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const toggleExpand = useCallback(index => {
    setExpandedIndex(prev => (prev === index ? null : index))
  }, [])

  const handleCompleteClick = useCallback(item => {
    setSelectedItem(item)
    setShowCompletionModal(true)
  }, [])

  const handleCompletionSubmit = useCallback(
    data => {
      setShowCompletionModal(false)
      if (onTaskCompleted) {
        onTaskCompleted(taskId, selectedItem, data)
      }
    },
    [taskId, selectedItem, onTaskCompleted]
  )

  const formatDeadline = deadline => {
    if (!deadline) return ''
    try {
      return new Date(deadline).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch (error) {
      return deadline
    }
  }

  return (
    <>
      <div className="task-in-progress">
        <div className="task-in-progress__divider" />

        {items.map((item, index) => (
          <div key={index} className="task-in-progress__item">
            <div className="task-in-progress__row" onClick={() => toggleExpand(index)}>
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={`task-in-progress__arrow ${expandedIndex === index ? 'expanded' : ''}`}>
                <path d="M0.75 0.75L6.75 6.75L12.75 0.75" stroke="#3895D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="task-in-progress__text">
                {item.type === 'full' ? 'Задача в работе' : 'Часть задачи в работе'} до {formatDeadline(item.deadline)}
              </span>
              <img src={userIcon} alt="User" className="task-in-progress__avatar" />
            </div>

            {expandedIndex === index && (
              <div className="task-in-progress__details">
                <div className="task-in-progress__details-card">
                  {item.description && <p className="task-in-progress__description">{item.description}</p>}
                  <p className="task-in-progress__deadline">Ориентировочный срок выполнения до {formatDeadline(item.deadline)}</p>

                  {item.isCurrentUser && (
                    <button className="task-in-progress__complete-btn" onClick={() => handleCompleteClick(item)}>
                      Задача выполнена
                    </button>
                  )}
                </div>
              </div>
            )}

            {index < items.length - 1 && <div className="task-in-progress__divider" />}
          </div>
        ))}
      </div>

      {showCompletionModal && <TaskCompletionModal taskId={taskId} sectionCode={sectionCode} themeId={themeId} onClose={() => setShowCompletionModal(false)} onSubmit={handleCompletionSubmit} />}
    </>
  )
}

TaskInProgress.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['full', 'partial']).isRequired,
      user: PropTypes.object,
      deadline: PropTypes.string,
      description: PropTypes.string,
      isCurrentUser: PropTypes.bool,
    })
  ).isRequired,
  taskId: PropTypes.number.isRequired,
  sectionCode: PropTypes.string.isRequired,
  themeId: PropTypes.number.isRequired,
  onTaskCompleted: PropTypes.func,
}

export default TaskInProgress