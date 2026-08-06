const STORAGE_KEY = 'omnitool_history';
const MAX_ITEMS = 20;

export function getHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function addHistory(name) {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    const entry = {
      id: crypto.randomUUID(),
      name,
      timestamp: Date.now(),
    };
    const updated = [entry, ...history].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch {
    // silently fail
  }
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
