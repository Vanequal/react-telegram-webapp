import React from 'react';
import PropTypes from 'prop-types';

const TaskPreviewScreen = ({
  originalData,
  gptData,
  editedGptText,
  isSubmitting,
  onPublishOriginal,
  onPublishGPT,
  onEditGPT
}) => {
  if (!originalData || !gptData) {
    return null;
  }

  return (
    <div className="task-preview-page">
      <div className="task-preview-page__section">
        <h3 className="task-preview-page__title">Оригинал текста:</h3>
        <p className="task-preview-page__subtitle">{originalData.title}</p>
        <p className="task-preview-page__text">{originalData.description}</p>
      </div>

      <div className="task-preview-page__section">
        <h3 className="task-preview-page__title">Улучшенная версия от ИИ:</h3>
        <p className="task-preview-page__subtitle">Заголовок от GPT</p>

        <div className="task-preview-page__gpt-card">
          <div className="task-preview-page__gpt-text">
            {editedGptText || 'Загрузка...'}
          </div>
        </div>
      </div>

      <div className="task-preview-page__actions">
        <button
          className="task-preview-page__btn"
          onClick={onPublishOriginal}
          disabled={isSubmitting}
        >
          Опубликовать оригинал
        </button>
        <button
          className="task-preview-page__btn"
          onClick={onPublishGPT}
          disabled={isSubmitting}
        >
          Опубликовать версию GPT
        </button>
        <button
          className="task-preview-page__btn"
          onClick={onEditGPT}
          disabled={isSubmitting}
        >
          Редактировать версию GPT
        </button>
      </div>
    </div>
  );
};

TaskPreviewScreen.propTypes = {
  originalData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }),
  gptData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }),
  editedGptText: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onPublishOriginal: PropTypes.func.isRequired,
  onPublishGPT: PropTypes.func.isRequired,
  onEditGPT: PropTypes.func.isRequired
};

export default TaskPreviewScreen;
