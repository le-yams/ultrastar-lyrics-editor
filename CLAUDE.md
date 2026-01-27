# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UltraStar Lyrics Editor is a React web application for synchronizing lyrics with UltraStar karaoke song files. Users load existing UltraStar files, input new lyrics, and the app automatically aligns them to existing note timings.

## Commands

```bash
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # Production build to dist/lyrics-editor/
npm test             # Run Jest tests
npm test:watch       # Run tests in watch mode
npm test:coverage    # Run tests with coverage report
npx jest tests/lyricsSynchronizer.test.js   # Run a single test file
```

## Architecture

**Tech Stack:** React 19, Vite, Tailwind CSS (CDN), Jest

**Vite root:** `src/lyrics-editor/` (not project root). Build outputs to `dist/lyrics-editor/`.

**Module dependency flow:**
```
App.jsx (UI) → LyricsSynchronizer → LyricsProcessor → UltraStarParser → constants
                                   → UltraStarParser
             → FileManager → TimeConverter → constants
             → MetadataParser → TimeConverter
             → TimeConverter
             → UltraStarParser
```

**App.jsx** is a single-file UI containing all React components (FileUploadZone, LyricsEditor, MetadataEditor, GapEditor, SyncPreview, WarningsDisplay). State is organized into grouped `useState` objects: `fileData` (originalLines, headerInfo, syncedLines), `metadata` (title, language, gap components), `lyrics` (string), and `ui` (isLoading, isDragging).

**Testing:** Jest config is CJS (`jest.config.cjs`) with babel-jest transform. Tests live in `tests/*.test.js` and import from `src/lyrics-editor/`.

## UltraStar Format

**Specification:** https://usdx.eu/format/#specs

**Note Types:**
- `:` Normal, `*` Golden (bonus), `F` Freestyle (unscored), `R` Rap, `G` Rap golden

**Note Line Format:** `NoteType StartBeat Length Pitch Text` (Text field can contain spaces)

**Key Metadata:** TITLE, ARTIST, LANGUAGE, GAP (milliseconds offset)

## Synchronization Algorithm

1. Match phrases line-by-line between original file and new lyrics
2. Match words within each phrase
3. Handle syllable separator `|` to split words across notes

**Spacing Rules:**
- No space after syllables (where `|` appears)
- Space after last syllable of each word
- No space at end of phrase

Example: `hel|lo world` → Notes: `hel` (no space), `lo ` (with space), `world` (no space)

## Code Conventions

- **Files:** kebab-case (`lyrics-processor.js`)
- **Components:** PascalCase (`LyricsEditor`)
- **Functions:** camelCase (`parseLyrics`)
- **File encoding:** UTF-8 WITHOUT BOM

## Testing Requirements

- Tests must test modules in `src/lyrics-editor/`, not internal HTML code
- Write failing test first when fixing bugs (TDD)
- Coverage threshold: 90% for all metrics
- Do not create README.md in tests directory

## Development Rules

- Extract reusable logic from `App.jsx` to `src/lyrics-editor/` modules
- Verify code is actually used before modifying
- Remove dead code
- Run `npm test` after changes
