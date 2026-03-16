// js/editor.js — Editor UI rendering and event handling

import { createEmptyScene, getProgressColor, getProgressHex } from './state.js';
import { validateAvancement, validateSceneName } from './validator.js';

let dragSrcIndex = null;

/**
 * Renders the full editor UI into the given container.
 * @param {HTMLElement} container
 * @param {object} state
 * @param {function} onStateChange - callback(newState)
 */
export function renderEditor(container, state, onStateChange) {
  container.innerHTML = '';

  // Header section
  const header = document.createElement('div');
  header.className = 'editor-header';
  header.innerHTML = `
    <h1>🎭 Tableau de Bord de Production</h1>
    <div class="date-info">Dernière modification : ${formatDate(state.dateModification)}</div>
  `;
  container.appendChild(header);

  // Title field
  const titreGroup = createFieldGroup('Titre du spectacle *', 'text', state.titre, (val) => {
    state.titre = val;
    onStateChange(state);
  }, 'titre-input');
  titreGroup.classList.add('field-titre');
  container.appendChild(titreGroup);

  // Global comment
  const commentGroup = createTextareaGroup('Commentaire global', state.commentaireGlobal || '', (val) => {
    state.commentaireGlobal = val;
    onStateChange(state);
  }, 'comment-global');
  container.appendChild(commentGroup);

  // Scenes section
  const scenesHeader = document.createElement('div');
  scenesHeader.className = 'scenes-header';
  scenesHeader.innerHTML = '<h2>Scènes</h2>';
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-add';
  addBtn.textContent = '+ Ajouter une scène';
  addBtn.addEventListener('click', () => {
    state.scenes.push(createEmptyScene());
    onStateChange(state);
  });
  scenesHeader.appendChild(addBtn);
  container.appendChild(scenesHeader);

  // Scene list
  const sceneList = document.createElement('div');
  sceneList.className = 'scene-list';
  sceneList.id = 'scene-list';

  state.scenes.forEach((scene, index) => {
    const card = renderSceneCard(scene, index, state, onStateChange);
    sceneList.appendChild(card);
  });

  container.appendChild(sceneList);

  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'editor-actions';
  actions.innerHTML = `
    <button class="btn btn-save" id="btn-save-json">💾 Sauvegarder JSON</button>
    <button class="btn btn-export" id="btn-export-png">📸 Exporter PNG</button>
    <button class="btn btn-import" id="btn-import-json">📂 Importer JSON</button>
    <input type="file" id="file-import" accept=".json" style="display:none">
  `;
  container.appendChild(actions);
}

function renderSceneCard(scene, index, state, onStateChange) {
  const card = document.createElement('div');
  card.className = 'scene-card';
  card.setAttribute('draggable', 'true');
  card.dataset.index = index;

  // Drag events
  card.addEventListener('dragstart', (e) => {
    dragSrcIndex = index;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    document.querySelectorAll('.scene-card').forEach(c => c.classList.remove('drag-over'));
  });
  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    card.classList.add('drag-over');
  });
  card.addEventListener('dragleave', () => {
    card.classList.remove('drag-over');
  });
  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('drag-over');
    if (dragSrcIndex !== null && dragSrcIndex !== index) {
      const moved = state.scenes.splice(dragSrcIndex, 1)[0];
      state.scenes.splice(index, 0, moved);
      onStateChange(state);
    }
    dragSrcIndex = null;
  });

  // Scene number & drag handle
  const headerDiv = document.createElement('div');
  headerDiv.className = 'scene-card-header';
  headerDiv.innerHTML = `<span class="drag-handle" title="Glisser pour réordonner">☰</span><span class="scene-number">Scène ${index + 1}</span>`;

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-delete';
  deleteBtn.textContent = '🗑️';
  if (state.scenes.length <= 1) {
    deleteBtn.disabled = true;
    deleteBtn.title = 'Un spectacle doit contenir au moins une scène.';
  } else {
    deleteBtn.title = 'Supprimer cette scène';
    deleteBtn.addEventListener('click', () => {
      state.scenes.splice(index, 1);
      onStateChange(state);
    });
  }
  headerDiv.appendChild(deleteBtn);
  card.appendChild(headerDiv);

  // Scene name
  const nameGroup = document.createElement('div');
  nameGroup.className = 'field-group';
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Nom de la scène *';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = scene.nom;
  nameInput.placeholder = 'Ex: Acte 1 — Ouverture';
  const nameError = document.createElement('div');
  nameError.className = 'field-error';

  nameInput.addEventListener('input', () => {
    scene.nom = nameInput.value;
    const allNames = state.scenes.map(s => s.nom);
    const err = validateSceneName(nameInput.value, allNames, index);
    nameError.textContent = err || '';
    nameInput.classList.toggle('input-error', !!err);
    if (!err) onStateChange(state);
  });

  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  nameGroup.appendChild(nameError);
  card.appendChild(nameGroup);

  // Avancement
  const avGroup = document.createElement('div');
  avGroup.className = 'field-group field-avancement';
  const avLabel = document.createElement('label');
  avLabel.textContent = 'Avancement (%)';
  const avRow = document.createElement('div');
  avRow.className = 'avancement-row';
  const avInput = document.createElement('input');
  avInput.type = 'number';
  avInput.min = '0';
  avInput.max = '100';
  avInput.step = '1';
  avInput.value = scene.avancement;
  const avError = document.createElement('div');
  avError.className = 'field-error';

  // Progress bar preview
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar-mini';
  const progressFill = document.createElement('div');
  progressFill.className = `progress-fill ${getProgressColor(scene.avancement)}`;
  progressFill.style.width = `${scene.avancement}%`;
  progressBar.appendChild(progressFill);

  avInput.addEventListener('input', () => {
    const err = validateAvancement(avInput.value);
    avError.textContent = err || '';
    avInput.classList.toggle('input-error', !!err);
    if (!err) {
      scene.avancement = parseInt(avInput.value, 10);
      progressFill.style.width = `${scene.avancement}%`;
      progressFill.className = `progress-fill ${getProgressColor(scene.avancement)}`;
      onStateChange(state);
    }
  });

  avRow.appendChild(avInput);
  avRow.appendChild(progressBar);
  avGroup.appendChild(avLabel);
  avGroup.appendChild(avRow);
  avGroup.appendChild(avError);
  card.appendChild(avGroup);

  // Todo list
  const todoGroup = createTextareaGroup('Todo List', scene.todoList || '', (val) => {
    scene.todoList = val;
    onStateChange(state);
  }, `todo-${index}`);
  todoGroup.querySelector('textarea').placeholder = '- Point 1\n- Point 2';
  card.appendChild(todoGroup);

  // Commentaire
  const commentGroup = createTextareaGroup('Commentaire', scene.commentaire || '', (val) => {
    scene.commentaire = val;
    onStateChange(state);
  }, `comment-${index}`);
  card.appendChild(commentGroup);

  return card;
}

function createFieldGroup(label, type, value, onChange, id) {
  const group = document.createElement('div');
  group.className = 'field-group';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  if (id) lbl.htmlFor = id;
  const input = document.createElement('input');
  input.type = type;
  input.value = value || '';
  if (id) input.id = id;
  input.addEventListener('input', () => onChange(input.value));
  group.appendChild(lbl);
  group.appendChild(input);
  return group;
}

function createTextareaGroup(label, value, onChange, id) {
  const group = document.createElement('div');
  group.className = 'field-group';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  if (id) lbl.htmlFor = id;
  const textarea = document.createElement('textarea');
  textarea.rows = 3;
  textarea.value = value || '';
  if (id) textarea.id = id;
  textarea.addEventListener('input', () => onChange(textarea.value));
  group.appendChild(lbl);
  group.appendChild(textarea);
  return group;
}

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
