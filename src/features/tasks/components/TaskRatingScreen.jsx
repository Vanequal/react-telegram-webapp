import React from 'react';
import PropTypes from 'prop-types';

const TaskRatingScreen = ({
  ratio,
  skipRatio,
  canSubmitRating,
  isSubmitting,
  onRatioChange,
  onSkipToggle,
  onSubmit
}) => {
  return (
    <div className="task-rating-page">
      <div className="task-rating-page__card">
        <h3 className="task-rating-page__title">
          Назначить рейтинговый
          <br />
          коэффициент для задачи
        </h3>

        <div className="task-rating-page__input-wrapper">
          <input
            type="text"
            className="task-rating-page__input"
            value={ratio}
            onChange={onRatioChange}
            placeholder="00"
            maxLength={2}
            disabled={skipRatio}
          />
        </div>

        <div className="task-rating-page__checkbox-row">
          <input
            type="checkbox"
            id="skip-ratio"
            className="task-rating-page__checkbox"
            checked={skipRatio}
            onChange={onSkipToggle}
          />
          <label htmlFor="skip-ratio" className="task-rating-page__checkbox-label">
            Пропустить
          </label>
        </div>

        {!canSubmitRating && (
          <div className="task-rating-page__instruction">Инструкция</div>
        )}

        {canSubmitRating && (
          <button
            className="task-rating-page__submit-btn"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Публикация...' : 'Опубликовать задачу'}
          </button>
        )}
      </div>
    </div>
  );
};

TaskRatingScreen.propTypes = {
  ratio: PropTypes.string.isRequired,
  skipRatio: PropTypes.bool.isRequired,
  canSubmitRating: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onRatioChange: PropTypes.func.isRequired,
  onSkipToggle: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default TaskRatingScreen;
