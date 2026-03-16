// js/state.js — State manager for the spectacle application

import { validateSpectacle } from './validator.js';

/**
 * Creates a new empty spectacle with one blank scene.
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
 * Creates a new empty scene.
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
 * Returns a deep clone of the state with updated dateModification.
 */
export function touchDate(state) {
  return {
    ...state,
    dateModification: new Date().toISOString()
  };
}

/**
 * Serializes state to a clean JSON object (strips any extra fields).
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
 */
export function importState(data) {
  const result = validateSpectacle(data);
  if (!result.valid) return result;
  return { valid: true, data: serializeState(data) };
}

/**
 * Returns the progress color class for a given advancement value.
 */
export function getProgressColor(avancement) {
  if (avancement <= 25) return 'progress-red';
  if (avancement <= 50) return 'progress-orange';
  if (avancement <= 75) return 'progress-yellow';
  if (avancement <= 99) return 'progress-lightgreen';
  return 'progress-green';
}

/**
 * Returns the hex color for a given advancement value.
 */
export function getProgressHex(avancement) {
  if (avancement <= 25) return '#e74c3c';
  if (avancement <= 50) return '#f39c12';
  if (avancement <= 75) return '#f1c40f';
  if (avancement <= 99) return '#2ecc71';
  return '#27ae60';
}
