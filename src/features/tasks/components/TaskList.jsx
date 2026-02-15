import React from 'react';
import PropTypes from 'prop-types';
import TaskCard from './TaskCard';
import LoadingState from '@/shared/components/LoadingState';
import ErrorState from '@/shared/components/ErrorState';

const TaskList = ({ tasks, loading, error, sectionCode, themeId, onCommentClick, onTaskComplete, onCompletedClick, labels = {} }) => {
  if (loading) {
    return <LoadingState message={labels.loading || "Загрузка задач..."} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (tasks.length === 0) {
    return (
      <div className="task-chat-page__empty">
        <p className="task-chat-page__top-text">
          {labels.emptyTop || 'В [Заголовок раздела] ещё нет опубликованных задач.'}
        </p>
        <p className="task-chat-page__bottom-text">
          {labels.emptyBottom || 'Придумайте заголовок и опишите суть задачи'}
        </p>
      </div>
    );
  }

  return (
    <div className="task-chat-page__list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          sectionCode={sectionCode}
          themeId={themeId}
          onCommentClick={onCommentClick}
          onTaskComplete={onTaskComplete}
          onCompletedClick={onCompletedClick}
          labels={labels}
        />
      ))}
    </div>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  sectionCode: PropTypes.string.isRequired,
  themeId: PropTypes.number.isRequired,
  onCommentClick: PropTypes.func,
  onTaskComplete: PropTypes.func,
  onCompletedClick: PropTypes.func,
  labels: PropTypes.object,
};

export default TaskList;
