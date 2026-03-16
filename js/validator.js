// js/validator.js — JSON schema validation with detailed error messages

/**
 * Validates a spectacle data object against the expected schema.
 * Returns { valid: true, data } or { valid: false, errors: string[] }
 */
export function validateSpectacle(data) {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Le fichier ne contient pas un objet JSON valide.'] };
  }

  if (typeof data.titre !== 'string' || data.titre.trim() === '') {
    errors.push("Le champ 'titre' est manquant ou vide.");
  }

  if (data.dateModification !== undefined && typeof data.dateModification !== 'string') {
    errors.push("Le champ 'dateModification' doit être une chaîne ISO 8601.");
  }

  if (data.commentaireGlobal !== undefined && typeof data.commentaireGlobal !== 'string') {
    errors.push("Le champ 'commentaireGlobal' doit être une chaîne de caractères.");
  }

  if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
    errors.push("Le spectacle doit contenir au moins une scène (tableau 'scenes' non vide).");
  } else {
    const noms = new Set();
    data.scenes.forEach((scene, i) => {
      const prefix = `Scène n°${i + 1}`;
      if (!scene || typeof scene !== 'object') {
        errors.push(`${prefix} : n'est pas un objet valide.`);
        return;
      }
      if (typeof scene.nom !== 'string' || scene.nom.trim() === '') {
        errors.push(`${prefix} : le champ 'nom' est manquant ou vide.`);
      } else {
        if (noms.has(scene.nom.trim())) {
          errors.push(`${prefix} : le nom '${scene.nom}' est en doublon.`);
        }
        noms.add(scene.nom.trim());
      }
      if (typeof scene.avancement !== 'number' || !Number.isInteger(scene.avancement)) {
        errors.push(`${prefix} : le champ 'avancement' doit être un entier.`);
      } else if (scene.avancement < 0 || scene.avancement > 100) {
        errors.push(`${prefix} : l'avancement (${scene.avancement}) doit être entre 0 et 100.`);
      }
      if (scene.todoList !== undefined && typeof scene.todoList !== 'string') {
        errors.push(`${prefix} : le champ 'todoList' doit être une chaîne de caractères.`);
      }
      if (scene.commentaire !== undefined && typeof scene.commentaire !== 'string') {
        errors.push(`${prefix} : le champ 'commentaire' doit être une chaîne de caractères.`);
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data };
}

/**
 * Validates individual field constraints for the editor.
 */
export function validateAvancement(value) {
  const num = Number(value);
  if (value === '' || isNaN(num)) return 'La valeur doit être un nombre entier.';
  if (!Number.isInteger(num)) return 'La valeur doit être un entier (pas de décimales).';
  if (num < 0 || num > 100) return 'La valeur doit être comprise entre 0 et 100.';
  return null;
}

export function validateSceneName(name, allNames, currentIndex) {
  if (!name || name.trim() === '') return 'Le nom de la scène est obligatoire.';
  const trimmed = name.trim();
  const duplicate = allNames.some((n, i) => i !== currentIndex && n.trim() === trimmed);
  if (duplicate) return 'Ce nom de scène existe déjà.';
  return null;
}

export function validateTitre(titre) {
  if (!titre || titre.trim() === '') return 'Le titre du spectacle est obligatoire pour la sauvegarde.';
  return null;
}
