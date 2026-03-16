/**
 * @module state
 * @description State manager for the spectacle application.
 *
 * Contains the data model definition, factory functions for creating
 * empty spectacles/scenes, serialisation helpers and colour-mapping
 * utilities used by both the editor and the poster.
 */

import { validateSpectacle } from './validator.js';

/**
 * Creates a new empty spectacle with one blank scene.
 * @returns {object} A spectacle object with default values.
 */
export function createEmptySpectacle() {
  return {
    titre: '',
    dateModification: new Date().toISOString(),
    commentaireGlobal: '',
    scenes: [createEmptyScene()]
  };
}

/**
 * Creates a new empty scene with zeroed-out fields.
 * @returns {object} A scene object with default values.
 */
export function createEmptyScene() {
  return {
    nom: '',
    avancement: 0,
    todoList: '',
    commentaire: ''
  };
}

/**
 * Returns a copy of the state with an updated `dateModification`.
 * Only the top-level object is cloned; the `scenes` array is shared by reference.
 * @param {object} state - The current spectacle state.
 * @returns {object} A new state object with the current timestamp.
 */
export function touchDate(state) {
  return {
    ...state,
    dateModification: new Date().toISOString()
  };
}

/**
 * Serializes state to a clean JSON-safe object, stripping any extra fields.
 * @param {object} state - The current spectacle state.
 * @returns {object} A plain object safe for `JSON.stringify`.
 */
export function serializeState(state) {
  return {
    titre: state.titre,
    dateModification: state.dateModification,
    commentaireGlobal: state.commentaireGlobal || '',
    scenes: state.scenes.map(s => ({
      nom: s.nom,
      avancement: s.avancement,
      todoList: s.todoList || '',
      commentaire: s.commentaire || ''
    }))
  };
}

/**
 * Validates and imports external data into a state object.
 * @param {object} data - The raw data parsed from a JSON file.
 * @returns {{valid: true, data: object}|{valid: false, errors: string[]}}
 */
export function importState(data) {
  const result = validateSpectacle(data);
  if (!result.valid) return result;
  return { valid: true, data: serializeState(data) };
}

/**
 * Returns the CSS progress colour class for a given advancement value.
 * @param {number} avancement - Completion percentage (0–100).
 * @returns {string} A CSS class name (e.g. `'progress-red'`).
 */
export function getProgressColor(avancement) {
  if (avancement <= 25) return 'progress-red';
  if (avancement <= 50) return 'progress-orange';
  if (avancement <= 75) return 'progress-yellow';
  if (avancement <= 99) return 'progress-lightgreen';
  return 'progress-green';
}

/**
 * Returns the hex colour string for a given advancement value.
 * @param {number} avancement - Completion percentage (0–100).
 * @returns {string} A CSS hex colour (e.g. `'#e74c3c'`).
 */
export function getProgressHex(avancement) {
  if (avancement <= 25) return '#e74c3c';
  if (avancement <= 50) return '#f39c12';
  if (avancement <= 75) return '#f1c40f';
  if (avancement <= 99) return '#2ecc71';
  return '#27ae60';
}
