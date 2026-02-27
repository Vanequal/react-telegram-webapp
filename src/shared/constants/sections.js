export const SECTION_CODES = {
  CHAT_TASKS: 'chat_tasks',
  CHAT_EXPERIMENTS: 'chat_experiments',
  PUBLICATIONS: 'publications',
  QUESTIONS: 'questions',
  DISCUSSIONS: 'discussions',
  IDEAS: 'ideas'
};

// theme_id теперь UUID, получается из root theme через store.theme.theme.id
// Оставлено для обратной совместимости, thunks автоматически берут правильный UUID
export const DEFAULT_THEME_ID = null;

export const DEFAULT_PAGINATION = {
  LIMIT: 100,
  OFFSET: 0
};

export default SECTION_CODES;
