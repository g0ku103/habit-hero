const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

export const fetchDashboardAnalytics = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/dashboard`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }
  return response.json();
};

export const fetchHabits = async () => {
  const response = await fetch(`${API_BASE_URL}/habits/`);
  if (!response.ok) throw new Error('Failed to fetch habits');
  return response.json();
};

export const createHabit = async (habitData) => {
  const response = await fetch(`${API_BASE_URL}/habits/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habitData)
  });
  if (!response.ok) throw new Error('Failed to create habit');
  return response.json();
};

export const createProgress = async (progressData) => {
  const response = await fetch(`${API_BASE_URL}/progress/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progressData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to log progress');
  }
  return response.json();
};

export const fetchAISuggestions = async (targetCategory = null) => {
  const response = await fetch(`${API_BASE_URL}/ai/suggest-habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_category: targetCategory, num_suggestions: 5 })
  });
  if (!response.ok) throw new Error('Failed to fetch suggestions');
  return response.json();
};

export const fetchMotivation = async (habitId) => {
  const response = await fetch(`${API_BASE_URL}/ai/motivation/${habitId}`);
  if (!response.ok) throw new Error('Failed to fetch motivation');
  return response.json();
};