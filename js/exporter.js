// js/exporter.js — PNG export using html2canvas

import { renderPoster } from './poster.js';
import { downloadPNG } from './fileManager.js';

/**
 * Generates and downloads a PNG poster of the spectacle state.
 * @param {object} state - The current spectacle state.
 */
export async function exportPNG(state) {
  // Create or get the poster container
  let posterContainer = document.getElementById('poster-container');
  if (!posterContainer) {
    posterContainer = document.createElement('div');
    posterContainer.id = 'poster-container';
    document.body.appendChild(posterContainer);
  }

  // Make it visible but off-screen for rendering
  posterContainer.style.position = 'absolute';
  posterContainer.style.left = '-9999px';
  posterContainer.style.top = '0';
  posterContainer.style.width = '1200px';
  posterContainer.style.display = 'block';

  // Render the poster DOM
  renderPoster(posterContainer, state);

  // Wait a tick for the DOM to settle
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    // Use html2canvas (loaded globally via script tag)
    const canvas = await window.html2canvas(posterContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#1a1a2e',
      width: 1200,
      windowWidth: 1200
    });

    canvas.toBlob((blob) => {
      if (blob) {
        downloadPNG(blob, state.titre, state.dateModification);
      }
    }, 'image/png');
  } catch (err) {
    console.error('Erreur lors de l\'export PNG:', err);
    alert('Erreur lors de la génération du PNG. Vérifiez la console pour plus de détails.');
  } finally {
    posterContainer.style.display = 'none';
  }
}
