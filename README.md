# KDP Book Manager v2

A local-first webapp for managing an AI-assisted Amazon KDP production workflow.

## v2 changes

The project now separates **project data** from **editorial content**:

- `book.txt` — metadata, research, outline, workflow notes, price, URL, status, etc.
- `01-research.txt`
- `02-outline.txt`
- `03-chapter-01.md`, `03-chapter-02.md`, etc.
- `04-exercises.md`
- `05-editorial-review.md`
- `06-fact-check.md`
- `07-kdp-metadata.txt`
- `manuscript.md` — automatically rebuilt by concatenating chapter Markdown files.

## Markdown editor

Each chapter has:
- Markdown source editor
- Live preview
- H1/H2/list/quote/bold quick buttons
- Individual `.md` download
- Automatic filename from chapter title

The chapter prompt explicitly requests Markdown, so ChatGPT output can be pasted directly into the editor.

## Storage

The browser keeps the working project in localStorage.

For real files, click **Choose TXT/MD folder**. In Chrome/Edge, the app uses the File System Access API to create:

`Chosen folder / Book Title / book.txt`
`Chosen folder / Book Title / 01-research.txt`
`Chosen folder / Book Title / 02-outline.txt`
`Chosen folder / Book Title / 01-chapter-name.md`
`Chosen folder / Book Title / manuscript.md`

If direct folder access is unavailable, use **Export current book**, **Export all books**, and **Import project files**.

## Run

Open `index.html` in a modern browser.

For direct folder saving, Chrome or Edge is recommended.

## Important

This app manages content and files; it does not automatically upload or publish to Amazon KDP.
