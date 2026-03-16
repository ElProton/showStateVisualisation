/**
 * @module poster
 * @description Poster DOM builder for PNG capture.
 *
 * Constructs a dark-themed poster layout inside a hidden container.
 * The resulting DOM tree is then captured by {@link module:exporter}
 * using `html2canvas` to produce a downloadable PNG image.
 */

import { getProgressHex } from './state.js';

/**
 * Renders the poster DOM into the given container.
 * The container should be a hidden div used for html2canvas capture.
 */
export function renderPoster(container, state) {
  const sceneCount = state.scenes.length;
  const useGrid = sceneCount > 6;

  container.innerHTML = '';
  container.className = 'poster';

  // Header
  const header = document.createElement('div');
  header.className = 'poster-header';
  header.innerHTML = `
    <div class="poster-icon">🎭</div>
    <h1 class="poster-title">${escapeHTML(state.titre)}</h1>
    <div class="poster-date">Dernière mise à jour : ${formatDatePoster(state.dateModification)}</div>
    ${state.commentaireGlobal ? `<div class="poster-comment-global">« ${escapeHTML(state.commentaireGlobal)} »</div>` : ''}
  `;
  container.appendChild(header);

  // Scenes container
  const scenesContainer = document.createElement('div');
  scenesContainer.className = useGrid ? 'poster-scenes poster-grid' : 'poster-scenes';

  state.scenes.forEach((scene) => {
    const card = renderPosterScene(scene);
    scenesContainer.appendChild(card);
  });

  container.appendChild(scenesContainer);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'poster-footer';
  footer.textContent = `Généré le ${formatDatePoster(new Date().toISOString())}`;
  container.appendChild(footer);
}

/**
 * Renders a single scene card for the poster.
 * Low-advancement scenes (< 50 %) receive an alert style.
 * @param {object} scene - The scene data object.
 * @returns {HTMLDivElement} The poster scene card element.
 */
function renderPosterScene(scene) {
  const isLow = scene.avancement < 50;
  const color = getProgressHex(scene.avancement);
  const bgTint = getBgTint(scene.avancement);

  const card = document.createElement('div');
  card.className = `poster-scene${isLow ? ' poster-scene-alert' : ''}`;
  if (bgTint) card.style.backgroundColor = bgTint;
  if (isLow) card.style.borderLeftColor = color;

  // Scene header
  const header = document.createElement('div');
  header.className = 'poster-scene-header';
  header.innerHTML = `
    <span class="poster-scene-name">${escapeHTML(scene.nom)}</span>
    ${isLow ? '<span class="poster-alert-badge">⚠️ PRIORITÉ</span>' : ''}
  `;
  card.appendChild(header);

  // Progress bar
  const progressRow = document.createElement('div');
  progressRow.className = 'poster-progress-row';
  const bar = document.createElement('div');
  bar.className = 'poster-progress-bar';
  const fill = document.createElement('div');
  fill.className = 'poster-progress-fill';
  fill.style.width = `${scene.avancement}%`;
  fill.style.backgroundColor = color;
  bar.appendChild(fill);
  const pctLabel = document.createElement('span');
  pctLabel.className = 'poster-progress-pct';
  pctLabel.textContent = `${scene.avancement}%`;
  pctLabel.style.color = color;
  const statusIcon = document.createElement('span');
  statusIcon.className = 'poster-status-icon';
  statusIcon.textContent = getStatusEmoji(scene.avancement);
  progressRow.appendChild(bar);
  progressRow.appendChild(pctLabel);
  progressRow.appendChild(statusIcon);
  card.appendChild(progressRow);

  // Todo list
  if (scene.todoList && scene.todoList.trim()) {
    const todoBlock = document.createElement('div');
    todoBlock.className = 'poster-todo';
    const todoTitle = document.createElement('div');
    todoTitle.className = 'poster-block-title';
    todoTitle.textContent = '📝 Todo :';
    todoBlock.appendChild(todoTitle);
    const todoContent = document.createElement('div');
    todoContent.className = 'poster-todo-content';
    todoContent.innerHTML = formatTodoList(scene.todoList);
    todoBlock.appendChild(todoContent);
    card.appendChild(todoBlock);
  }

  // Comment
  if (scene.commentaire && scene.commentaire.trim()) {
    const commentBlock = document.createElement('div');
    commentBlock.className = 'poster-comment';
    const commentTitle = document.createElement('div');
    commentTitle.className = 'poster-block-title';
    commentTitle.textContent = '💬 Commentaire :';
    commentBlock.appendChild(commentTitle);
    const commentContent = document.createElement('div');
    commentContent.className = 'poster-comment-content';
    commentContent.textContent = `« ${scene.commentaire.trim()} »`;
    commentBlock.appendChild(commentContent);
    card.appendChild(commentBlock);
  }

  return card;
}

/**
 * Converts a multiline todo-list string into HTML bullet items.
 * Leading dash/bullet characters are normalised to `•`.
 * @param {string} text - Raw todo text (one item per line).
 * @returns {string} HTML string of `<div>` elements.
 */
function formatTodoList(text) {
  return text.split('\n')
    .filter(line => line.trim())
    .map(line => {
      const cleaned = line.replace(/^[-•*]\s*/, '').trim();
      return `<div class="poster-todo-item">• ${escapeHTML(cleaned)}</div>`;
    })
    .join('');
}

/**
 * Returns a status emoji for a given advancement percentage.
 * @param {number} avancement - Completion percentage (0–100).
 * @returns {string} An emoji character.
 */
function getStatusEmoji(avancement) {
  if (avancement <= 25) return '🔴';
  if (avancement <= 50) return '🟠';
  if (avancement <= 75) return '🟡';
  if (avancement <= 99) return '🟢';
  return '✅';
}

/**
 * Returns a subtle RGBA background tint for low-advancement scenes.
 * @param {number} avancement - Completion percentage (0–100).
 * @returns {string|null} A CSS `rgba()` value, or `null` for scenes above 50 %.
 */
function getBgTint(avancement) {
  if (avancement <= 25) return 'rgba(231, 76, 60, 0.08)';
  if (avancement <= 50) return 'rgba(243, 156, 18, 0.06)';
  return null;
}

/**
 * Formats an ISO 8601 date string into a French locale date (day month year).
 * @param {string} isoString - ISO 8601 date string.
 * @returns {string} Formatted date or `'—'` when the input is falsy.
 */
function formatDatePoster(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

/**
 * Escapes a string for safe insertion into HTML.
 * @param {string} str - The raw string.
 * @returns {string} The HTML-escaped string.
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
