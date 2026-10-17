# KDP Book Manager

A local-first, installable web app for planning, writing, formatting and exporting Amazon KDP books, with an AI-assisted workflow built around prompt steps you can copy into any assistant.

**Live app:** <https://kdp-book-manager.netlify.app>
**Author:** [tomascornelles](https://github.com/tomascornelles)

KDP Book Manager runs entirely in the browser. There is no server, no account and no cloud sync: your books live in your browser's storage, and you control backups through explicit export and import.

---

## Features

- **Book library** with search, status filter, and archived books collapsed at the bottom of the list (they stay included in exports).
- **Status tracking:** `✏️ WIP`, `📗 Ready for KDP`, `⏳ Waiting KDP`, `🚀 Published`, `📁 Archived` (archiving asks for a reason).
- **AI-assisted workflow:** configurable prompt steps. View a prompt, paste the response, and keep it with the book. Steps appear or hide depending on the book's type, niche, status, language or author.
- **Prompt placeholders** such as `{{title}}`, `{{author}}`, `{{description}}`, `{{frontMatter}}` and `{{step.ID}}` to reuse earlier answers.
- **Publishing metadata:** Amazon description, back cover text, tags, categories, front matter and back matter.
- **Chapters:** upload `.md` and `.txt` files, create and edit chapters with a Code/Preview editor, reorder by drag and drop or with ▲▼, sort by name.
- **Build and preview:** table of contents navigation, selectable templates, and output as **EPUB**, **Markdown**, **TXT** or **PDF** (PDF uses the browser's print dialog, with a full-page cover when one is attached).
- **Suggestions:** author, niche, type and language fields autocomplete from values you have used before.
- **Export and import:** export selected books to a ZIP, import books with conflict detection, and export or import prompt steps and templates.
- **Backup and restore:** a single ZIP containing all settings, books, attachments and chapters.
- **Day, Night and System themes.**
- **Installable and offline-ready:** install it as a desktop or mobile app and keep working without a connection.

---

## Install as an app

KDP Book Manager is a Progressive Web App (PWA). To install it:

- **Chrome or Edge (desktop):** open <https://kdp-book-manager.netlify.app> and click the install icon in the address bar.
- **Chrome (Android):** open the site and choose *Install app* or *Add to Home screen*.
- **Safari (iOS / iPadOS):** open the site, tap *Share*, then *Add to Home Screen*.

Once installed, it opens in its own window without browser controls and works offline after the first visit.

> **Note:** Offline support requires the app to be served over HTTPS (or `localhost`). Opening `index.html` directly from disk still works, but it does not install or cache the app, and its data is stored separately from the hosted version (see [Data and storage](#data-and-storage)).

---

## Quick start

### Use the hosted version

1. Open <https://kdp-book-manager.netlify.app>.
2. Install it (see above) or simply use it in the browser.
3. Click **＋ New book** to start.

### Run it locally

No build step and no dependencies are required.

```bash
git clone https://github.com/tomascornelles/kdp-book-manager.git
cd kdp-book-manager
# Option A: open index.html directly in your browser (no offline install)
# Option B: serve the folder, which enables installation and offline mode
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## Using the app

### Workflow tab
Each step is a card with **View prompt** and **Paste / Edit response** actions. A card turns green once it contains a response. Prompt steps are managed from *Menu → Configure prompts*, where you can create, edit, hide, delete, export and import them.

### Publishing tab
Attach the book file (`.epub` or `.md`) and the cover image. Both are stored in IndexedDB. Fill in the metadata fields that KDP asks for.

### Chapters tab
Upload several `.md` or `.txt` files at once, or create chapters from scratch. Chapter order drives the table of contents and the generated files. The list grows with its content, so the whole page scrolls naturally.

### Build tab
- **Contents** jumps the preview to a chapter.
- **Template** picks the layout used for the preview and for PDF. Templates do not change the EPUB, Markdown or TXT output.
- Choose a format (`epub`, `md`, `txt` or `pdf`) and press **Generate**.
- Index entries in the front matter link to their chapters automatically.

**PDF:** the app opens the browser print dialog. Choose *Save as PDF*. Without a cover, the title and author are printed in large type on the first page.

### Menu
- **Export books:** choose which books to export from the current filter.
- **Import books:** choose the books to import. A ⚠ warning flags a book whose ID already exists, and you choose which version to keep.
- **Configure prompts / templates:** create, edit and remove, plus *Export all* and *Import all* with the same conflict handling.
- **Backup:** create a full backup or restore one (this replaces all current data and reloads the app).
- **Appearance:** Day, Night or System.

---

## Data and storage

All data stays in the browser that runs the app.

| Storage | Keys | Contents |
| --- | --- | --- |
| `localStorage` | `kdp-book-manager-v2` | Books and their metadata |
| `localStorage` | `kdp-book-manager-suggestions` | Autocomplete suggestions |
| `localStorage` | `kdp-prompt-steps-v1` | Prompt step configuration |
| `localStorage` | `kdp-templates-v1` | Build templates |
| `localStorage` | `kdp-theme`, `kdp-archived-open` | Interface preferences |
| IndexedDB `kdp-book-manager-files` (store `files`) | `${bookId}:book`, `${bookId}:cover`, `${bookId}:chapters` | Attachments and chapters |

Browsers keep storage separately for each origin. Data created at `file://…/index.html`, `localhost:8080` and `kdp-book-manager.netlify.app` **are three different sets of data**. To move your work between them, use *Menu → Backup* in the old location and restore it in the new one.

Clearing site data in the browser deletes your books. Make regular backups.

---

## Import, export and backup formats

- **Book export** creates a ZIP with one folder per book, containing `book.txt` (metadata, prompt responses and publishing fields), the cover and the chapter files.
- **Backup** creates a ZIP with a `manifest.json` that lists the saved settings and IndexedDB records, plus the binary blobs. Restoring a backup replaces everything currently stored.
- ZIP files are generated and read without external libraries (stored entries, and deflate through the browser's `DecompressionStream`).

---

## Project structure

```
kdp-book-manager/
├── index.html            # App shell, sidebar, editor layout, modal, PWA links
├── app.js                # All application logic (state, rendering, storage, EPUB/PDF generation, ZIP)
├── styles.css            # macOS-inspired styling with Day/Night themes
├── manifest.webmanifest  # PWA manifest (name, icons, colours, display mode)
├── sw.js                 # Service worker: offline cache of the app shell
├── _headers              # Netlify headers (no-cache for sw.js)
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
└── README.md
```

The app is plain HTML, CSS and JavaScript with no frameworks.

---

## Deployment

The site is deployed to Netlify. Any static host works, as long as it serves the files over HTTPS.

**Netlify (drag and drop):** upload the project folder to the Netlify dashboard. The `_headers` file is applied automatically.

**Netlify (from Git):** connect the repository, leave the build command empty and set the publish directory to `/` (the root).

After deploying a new version, the service worker updates the cache in the background. Users see the new version on their **next** visit or reload.

---

## Browser support

| Browser | Status |
| --- | --- |
| Chrome / Edge (desktop and Android) | Recommended, full support including installation and PDF with cover |
| Safari (macOS, iOS) | Supported. Installation via *Add to Dock* (macOS) or *Add to Home Screen* (iOS) |
| Firefox | Supported, but the full-page cover in PDF relies on CSS named pages, which Firefox does not support yet |

---

## Known limitations

- **No cloud sync.** Data stays in one browser profile. Use Backup to move it between computers.
- **Per-origin storage** (see [Data and storage](#data-and-storage)).
- **PDF generation** uses the browser's print engine, so the result depends on the browser and its print settings.
- **Offline installation** needs HTTPS or `localhost`.

---

## Development notes

- Edit `app.js`, `styles.css` and `index.html` directly. Refresh to see changes.
- Quick syntax check: `node --check app.js` (and `node --check sw.js`).
- When you change files that the service worker caches, bump `CACHE_VERSION` in `sw.js` so that returning users receive the update on the next load.
- Keep the README in sync with the UI and storage keys when you add features.

---

## Roadmap

- Test backup/restore, the import picker and PDF covers across browsers.
- Optional sync (currently out of scope; import/export and local backup remain the supported path).

---

## Author

Created and maintained by **tomascornelles**.

## License

No license has been selected yet. All rights reserved until a license is added.
