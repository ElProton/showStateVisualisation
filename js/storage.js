// js/storage.js — localStorage management with debounce

const STORAGE_KEY = 'spectacle_cache';
let debounceTimer = null;

/**
 * Saves state to localStorage immediately.
 */
export function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Impossible de sauvegarder dans le localStorage:', e);
  }
}

/**
 * Saves state to localStorage with debounce (500ms).
 */
export function debouncedSave(state) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => saveToStorage(state), 500);
}

/**
 * Loads state from localStorage. Returns null if nothing stored.
 */
export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Erreur de lecture du localStorage:', e);
    return null;
  }
}

/**
 * Clears the cached state from localStorage.
 */
export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
