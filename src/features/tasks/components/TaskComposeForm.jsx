import React from 'react';
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
  return (
    <div className="task-compose-page">
      <div className="task-compose-page__label">Заголовок:</div>
      <textarea
        className="task-compose-page__input"
        placeholder="Введите заголовок"
        value={title}
        onChange={onTitleChange}
        rows={2}
      />

      <div className="task-compose-page__label">Условие задачи:</div>
      <textarea
        className="task-compose-page__textarea"
        placeholder="Опишите задачу подробно"
        value={description}
        onChange={onDescriptionChange}
        rows={8}
      />

      {selectedFiles.length > 0 && (
        <div className="task-compose-page__files">
          {selectedFiles.map((file, index) => (
            <div key={index} className="task-compose-page__file">
              {file.name}
            </div>
          ))}
        </div>
      )}

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
