const VIEWED_STORAGE_KEY = 'idea_views';

const getViewedIdeas = () => {
  return JSON.parse(localStorage.getItem(VIEWED_STORAGE_KEY) || '{}');
};

const markIdeaAsViewed = (id) => {
  const viewed = getViewedIdeas();
  viewed[id] = true;
  localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(viewed));
};
