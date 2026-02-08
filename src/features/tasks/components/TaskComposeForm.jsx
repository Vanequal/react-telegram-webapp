import React, { useRef } from 'react';
import PropTypes from 'prop-types';

const TaskComposeForm = ({
  title,
  description,
  selectedFiles,
  canPublish,
  isSubmitting,
  onTitleChange,
  onDescriptionChange,
  onPublish
}) => {
  const titleInputRef = useRef(null);
  const descInputRef = useRef(null);

  return (
    <div className="task-compose-page">
      <div className="task-compose-page__inline-field" onClick={() => titleInputRef.current?.focus()}>
        <span className="task-compose-page__inline-label">Заголовок:</span>
        <input
          ref={titleInputRef}
          type="text"
          className="task-compose-page__inline-input"
          placeholder="Введите заголовок"
          value={title}
          onChange={onTitleChange}
        />
      </div>

      <div className="task-compose-page__inline-field" onClick={() => descInputRef.current?.focus()}>
        <span className="task-compose-page__inline-label">Условие задачи:</span>
        <input
          ref={descInputRef}
          type="text"
          className="task-compose-page__inline-input"
          placeholder="Опишите задачу"
          value={description}
          onChange={onDescriptionChange}
        />
      </div>

      <button
        className="task-compose-page__publish-btn"
        onClick={onPublish}
        disabled={!canPublish || isSubmitting}
      >
        {isSubmitting ? 'Обработка...' : 'Опубликовать'}
      </button>
    </div>
  );
};

TaskComposeForm.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  selectedFiles: PropTypes.array.isRequired,
  canPublish: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onPublish: PropTypes.func.isRequired
};

export default TaskComposeForm;
