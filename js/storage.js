/**
 * @module storage
 * @description localStorage management with debounce.
 *
 * Provides a thin, error-tolerant wrapper around `localStorage` for
 * persisting the spectacle state between sessions.  A 500 ms debounce
 * avoids excessive writes during rapid edits.
 */

/** @type {string} localStorage key used to persist the spectacle. */
const STORAGE_KEY = 'spectacle_cache';

/** @type {number|null} Handle returned by `setTimeout` for the debounce timer. */
let debounceTimer = null;

/**
 * Saves state to localStorage immediately.
 * @param {object} state - The serialised spectacle state.
 */
export function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Impossible de sauvegarder dans le localStorage:', e);
  }
}

/**
 * Saves state to localStorage with a 500 ms debounce to limit write frequency.
 * @param {object} state - The serialised spectacle state.
 */
export function debouncedSave(state) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => saveToStorage(state), 500);
}

/**
 * Loads the cached spectacle state from localStorage.
 * @returns {object|null} The parsed state, or `null` if nothing is stored
 *   or if parsing fails.
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
