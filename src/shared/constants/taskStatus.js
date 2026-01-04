export const TASK_STATUS = {
  IDLE: 'idle',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.IDLE]: 'Свободна',
  [TASK_STATUS.IN_PROGRESS]: 'В работе',
  [TASK_STATUS.COMPLETED]: 'Завершена',
  [TASK_STATUS.CANCELLED]: 'Отменена'
};

export default TASK_STATUS;
