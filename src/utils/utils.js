const VIEWED_STORAGE_KEY = 'idea_views';

export function getViewedIdeas() {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function markIdeaAsViewed(id) {
  const viewed = getViewedIdeas();
  viewed[id] = true;
  localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(viewed));
}
