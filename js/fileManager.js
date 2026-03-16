/**
 * @module fileManager
 * @description JSON import/export and PNG download using browser APIs.
 *
 * All file operations use in-memory Blobs and programmatic anchor clicks
 * so they work entirely client-side without a server.
 */

import { validateSpectacle } from './validator.js';

/**
 * Sanitizes a string for use as a filename by replacing special
 * characters and whitespace with underscores.
 * @param {string} str - The raw string (e.g. the spectacle title).
 * @returns {string} A filesystem-safe filename fragment.
 */
function sanitizeFilename(str) {
  return str.replace(/[^a-zA-Z0-9À-ÿ\- ]/g, '_').replace(/\s+/g, '_');
}

/**
 * Triggers a JSON file download of the spectacle state.
 * The filename is derived from the title and modification date.
 * @param {object} state - The serialised spectacle state.
 */
export function exportJSON(state) {
  const dateStr = state.dateModification
    ? state.dateModification.slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const filename = `${sanitizeFilename(state.titre)}_${dateStr}.json`;
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads and validates a JSON file selected by the user.
 * @param {File} file - The file from an `<input type="file">`.
 * @returns {Promise<{valid: true, data: object}|{valid: false, errors: string[]}>}
 */
export function importJSON(file) {
  return new Promise((resolve) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      resolve({
        valid: false,
        errors: ['Format de fichier non supporté. Veuillez sélectionner un fichier .json.']
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const result = validateSpectacle(data);
        resolve(result);
      } catch (err) {
        resolve({
          valid: false,
          errors: ['Le fichier ne contient pas du JSON valide : ' + err.message]
        });
      }
    };
    reader.onerror = () => {
      resolve({ valid: false, errors: ['Erreur de lecture du fichier.'] });
    };
    reader.readAsText(file);
  });
}

/**
 * Triggers a PNG file download from a Blob.
 * @param {Blob} blob - The PNG image blob.
 * @param {string} titre - Spectacle title (used in the filename).
 * @param {string} dateModification - ISO 8601 date string (used in the filename).
 */
export function downloadPNG(blob, titre, dateModification) {
  const dateStr = dateModification
    ? dateModification.slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const filename = `${sanitizeFilename(titre)}_${dateStr}.png`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
