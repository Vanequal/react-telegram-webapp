import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import userIcon from '@/assets/images/userIcon.webp'

const TaskInProgress = ({ items, taskId, taskStatus, onTaskComplete, onCompletedClick }) => {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const toggleExpand = useCallback(index => {
    setExpandedIndex(prev => (prev === index ? null : index))
  }, [])

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

  // If task is completed, show completed badge instead
  if (taskStatus === 'completed') {
    return (
      <div className="task-in-progress">
        <div className="task-in-progress__divider" />
        <div className="task-in-progress__item">
          <div
            className="task-in-progress__row task-in-progress__row--completed"
            onClick={() => onCompletedClick?.(taskId)}
          >
            <span className="task-in-progress__text-completed">Задача выполнена</span>
          </div>
        </div>
      </div>
    )
  }

  return (
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
            <img src={item.user?.avatar || userIcon} alt="User" className="task-in-progress__avatar" />
          </div>

          {expandedIndex === index && (
            <div className="task-in-progress__details">
              <div className="task-in-progress__details-card">
                {item.description && <p className="task-in-progress__description">{item.description}</p>}
                <p className="task-in-progress__deadline">Ориентировочный срок выполнения до {formatDeadline(item.deadline)}</p>

                {item.isCurrentUser && (
                  <button className="task-in-progress__complete-btn" onClick={() => onTaskComplete?.(item)}>
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
  taskStatus: PropTypes.string,
  onTaskComplete: PropTypes.func,
  onCompletedClick: PropTypes.func,
}

export default TaskInProgress
