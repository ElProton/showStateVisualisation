// js/app.js — Main application orchestration

import { createEmptySpectacle, touchDate, serializeState, importState } from './state.js';
import { loadFromStorage, debouncedSave, saveToStorage, clearStorage } from './storage.js';
import { renderEditor } from './editor.js';
import { exportJSON, importJSON } from './fileManager.js';
import { exportPNG } from './exporter.js';
import { validateTitre } from './validator.js';

let currentState = null;

function init() {
  const cached = loadFromStorage();
  if (cached && cached.titre) {
    showRestoreModal(cached);
  } else {
    showWelcomeScreen();
  }
}

function showWelcomeScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="welcome-screen">
      <div class="welcome-icon">🎭</div>
      <h1>Suivi de Production de Spectacle</h1>
      <p>Créez, éditez et partagez l'état d'avancement de votre spectacle.</p>
      <div class="welcome-actions">
        <button class="btn btn-primary" id="btn-new">✨ Nouveau spectacle</button>
        <button class="btn btn-secondary" id="btn-import-welcome">📂 Importer un JSON</button>
        <input type="file" id="file-import-welcome" accept=".json" style="display:none">
      </div>
    </div>
  `;

  document.getElementById('btn-new').addEventListener('click', () => {
    currentState = createEmptySpectacle();
    saveToStorage(currentState);
    startEditor();
  });

  document.getElementById('btn-import-welcome').addEventListener('click', () => {
    document.getElementById('file-import-welcome').click();
  });

  document.getElementById('file-import-welcome').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handleImport(file);
  });
}

function showRestoreModal(cached) {
  const app = document.getElementById('app');
  const titre = cached.titre || 'Sans titre';
  app.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-icon">🎭</div>
        <h2>Session précédente trouvée</h2>
        <p>Une session précédente a été trouvée pour « <strong>${escapeHTML(titre)}</strong> ».</p>
        <p>Souhaitez-vous la reprendre ?</p>
        <div class="modal-actions">
          <button class="btn btn-primary" id="btn-restore">✅ Oui, reprendre</button>
          <button class="btn btn-secondary" id="btn-discard">❌ Non, repartir à zéro</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-restore').addEventListener('click', () => {
    currentState = cached;
    startEditor();
  });

  document.getElementById('btn-discard').addEventListener('click', () => {
    clearStorage();
    showWelcomeScreen();
  });
}

function startEditor() {
  const app = document.getElementById('app');
  renderEditor(app, currentState, onStateChange);
  bindEditorActions();
}

function onStateChange(newState) {
  currentState = touchDate(newState);
  debouncedSave(serializeState(currentState));
  // Re-render editor
  const app = document.getElementById('app');
  renderEditor(app, currentState, onStateChange);
  bindEditorActions();
}

function bindEditorActions() {
  const saveBtn = document.getElementById('btn-save-json');
  const exportBtn = document.getElementById('btn-export-png');
  const importBtn = document.getElementById('btn-import-json');
  const fileInput = document.getElementById('file-import');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const err = validateTitre(currentState.titre);
      if (err) {
        showNotification(err, 'error');
        return;
      }
      currentState = touchDate(currentState);
      saveToStorage(serializeState(currentState));
      exportJSON(serializeState(currentState));
      showNotification('Fichier JSON sauvegardé !', 'success');
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const err = validateTitre(currentState.titre);
      if (err) {
        showNotification(err, 'error');
        return;
      }
      showNotification('Génération du PNG en cours...', 'info');
      await exportPNG(serializeState(currentState));
      showNotification('Export PNG terminé !', 'success');
    });
  }

  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (currentState && currentState.titre) {
        if (!confirm('L\'import d\'un fichier JSON écrasera les données actuelles. Continuer ?')) {
          fileInput.value = '';
          return;
        }
      }
      await handleImport(file);
      fileInput.value = '';
    });
  }
}

async function handleImport(file) {
  const result = await importJSON(file);
  if (!result.valid) {
    showNotification('Erreur d\'import : ' + result.errors.join(' | '), 'error');
    return;
  }
  currentState = touchDate(result.data);
  saveToStorage(serializeState(currentState));
  startEditor();
  showNotification('Spectacle importé avec succès !', 'success');
}

function showNotification(message, type) {
  let notif = document.getElementById('notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notification';
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.className = `notification notification-${type} notification-show`;
  clearTimeout(notif._timer);
  notif._timer = setTimeout(() => {
    notif.classList.remove('notification-show');
  }, 4000);
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
