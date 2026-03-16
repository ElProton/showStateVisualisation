# 🎭 showStateVisualisation

A lightweight, vanilla JavaScript single-page application for tracking and visualising the production state of a theatrical show (*spectacle*). Create scenes, track their completion percentage, and export the current status as a JSON file or a styled PNG poster.

## Features

- **Create & edit** a spectacle with multiple scenes, each having a name, advancement percentage (0–100), a todo list and a comment.
- **Color-coded progress** — scenes are highlighted from red (0–25 %) through orange, yellow and green up to 100 %.
- **Drag & drop** reordering of scenes.
- **Auto-save** to `localStorage` with a 500 ms debounce so work is never lost.
- **Session restore** — on return the app offers to resume the previous session.
- **JSON export / import** with full schema validation and detailed error messages.
- **PNG export** — generates a dark-themed poster via `html2canvas` ready for sharing or printing.
- **No build step** — pure ES modules served as static files.

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/ElProton/showStateVisualisation.git
   cd showStateVisualisation
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Serve the project with any static file server, for example:
   ```bash
   npx serve .
   ```
4. Open the displayed URL in a modern browser.

> The application requires a browser that supports ES modules (Chrome 61+, Firefox 67+, Safari 10.1+, Edge 79+).

## Project Structure

```
├── index.html            # Entry point
├── package.json          # NPM metadata & dependency declaration
├── css/
│   ├── style.css         # Light-theme editor styles
│   └── poster.css        # Dark-theme PNG poster styles
├── js/
│   ├── app.js            # Main orchestration (init, routing, notifications)
│   ├── state.js          # Data structures & state helpers
│   ├── editor.js         # Editor UI rendering & event handling
│   ├── validator.js      # JSON schema validation
│   ├── storage.js        # localStorage wrapper with debounce
│   ├── fileManager.js    # JSON/PNG file import & export
│   ├── exporter.js       # PNG generation via html2canvas
│   └── poster.js         # Poster DOM builder for PNG capture
└── lib/
    └── html2canvas.min.js  # Third-party HTML-to-canvas library
```

## Architecture

The application follows a simple **unidirectional data-flow**:

1. `app.js` initialises the application: it checks `localStorage` for a cached session and either shows a restore modal or the welcome screen.
2. When the user starts editing, `editor.js` renders the full form UI and captures input events.
3. Every change triggers `onStateChange()` in `app.js`, which updates the modification date, persists the state via `storage.js` and re-renders the editor.
4. Exports are handled by `fileManager.js` (JSON) and `exporter.js` + `poster.js` (PNG).
5. All incoming data (from JSON files) passes through `validator.js` before being accepted.

### Data Model

```jsonc
{
  "titre": "My Show",                       // required, non-empty string
  "dateModification": "2025-06-01T12:00:00.000Z", // ISO 8601 timestamp
  "commentaireGlobal": "",                   // optional string
  "scenes": [
    {
      "nom": "Act 1 — Opening",             // required, unique among scenes
      "avancement": 75,                      // integer 0–100
      "todoList": "- Finish lighting\n- Sound check", // optional string
      "commentaire": ""                      // optional string
    }
  ]
}
```

### Progress Colors

| Range   | Color       | Hex       | Emoji |
|---------|-------------|-----------|-------|
| 0–25 %  | Red         | `#e74c3c` | 🔴    |
| 26–50 % | Orange      | `#f39c12` | 🟠    |
| 51–75 % | Yellow      | `#f1c40f` | 🟡    |
| 76–99 % | Light green | `#2ecc71` | 🟢    |
| 100 %   | Green       | `#27ae60` | ✅    |

## Module Reference

| Module            | Exports | Description |
|-------------------|---------|-------------|
| **app.js**        | *(none — side-effect)* | Boots the app on `DOMContentLoaded`, manages current state and wires UI actions. |
| **state.js**      | `createEmptySpectacle`, `createEmptyScene`, `touchDate`, `serializeState`, `importState`, `getProgressColor`, `getProgressHex` | Pure helpers for creating, cloning and serialising the spectacle data model. |
| **editor.js**     | `renderEditor` | Builds the editor DOM inside a given container and binds all input/drag-drop events. |
| **validator.js**  | `validateSpectacle`, `validateAvancement`, `validateSceneName`, `validateTitre` | Schema validation returning `{ valid, data?, errors? }` objects. |
| **storage.js**    | `saveToStorage`, `debouncedSave`, `loadFromStorage`, `clearStorage` | Thin wrapper around `localStorage` with try/catch and a 500 ms debounce. |
| **fileManager.js**| `exportJSON`, `importJSON`, `downloadPNG` | File I/O: triggers downloads and reads uploaded JSON files. |
| **exporter.js**   | `exportPNG` | Renders the poster off-screen with `html2canvas` and downloads the resulting PNG. |
| **poster.js**     | `renderPoster` | Builds a dark-themed poster DOM used as the source for PNG capture. |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| [html2canvas](https://html2canvas.hertzen.com/) | ^1.4.1 | Converts DOM elements to a `<canvas>` for PNG export |

## Browser Compatibility

The app uses ES modules (`<script type="module">`) and modern DOM APIs. It requires:

- Chrome 61+
- Firefox 67+
- Safari 10.1+
- Edge 79+

Internet Explorer is **not** supported.

## License

ISC