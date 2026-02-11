# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UltraStar Tools is a collection of web tools for UltraStar karaoke files. A static landing page (`src/index.html`) lists available tools. Each tool lives in its own subdirectory under `src/`.

**Current tools:**
- **Lyrics Editor** (`src/lyrics-editor/`) — React app for synchronizing new lyrics with existing UltraStar note timings.
- **Timings Editor** (`src/timings-editor/`) — React app for shifting note timings by applying cumulative beat offsets.

## Commands

```bash
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # Production build to dist/
npm test             # Run Jest tests
npm test:watch       # Run tests in watch mode
npm test:coverage    # Run tests with coverage report
npx jest tests/lyricsSynchronizer.test.js   # Run a single test file
```

## Architecture

**Tech Stack:** React 19, Vite, Tailwind CSS v4 (build-time via `@tailwindcss/vite`), Jest

**Theme System:** Colors are centralized in `src/app.css`, the single shared stylesheet:
- CSS custom properties define light (`:root`) and dark (`.dark`) color values in a `@layer base` block
- `@theme inline` maps these CSS variables to semantic Tailwind class names (`theme-*`)
- `@custom-variant dark` enables class-based dark mode (`.dark` on `<html>`)
- Both pages reference `app.css` via `<link rel="stylesheet">` — Vite compiles it at build time
- Theme preference is persisted in `localStorage.theme` and shared across pages
- Use `theme-*` classes (e.g., `bg-theme-card`, `text-theme-title`) instead of `dark:` variant pairs
- Action buttons (`bg-purple-500`, `bg-green-600`), tooltip (`bg-gray-900`), NotificationToast, and `focus:ring-*` remain as direct Tailwind classes (not theme-dependent)
- To add a new theme color: add the CSS variable in both `:root` and `.dark`, then add a `--color-theme-*` entry in `@theme inline`

**Landing page:** `src/index.html` is a static HTML page (no JS modules). Served as a Vite entry point.

**Vite root:** `src/` (multi-page setup). Build outputs to `dist/`. Entry points: `src/index.html`, `src/lyrics-editor/index.html`, `src/timings-editor/index.html`.

**Public directory:** `src/public/` contains shared static assets (`icon.svg`) copied verbatim to `dist/` without Vite processing. Referenced via absolute paths (`/icon.svg`).

**Module dependency flow (Lyrics Editor):**
```
App.jsx (UI) → LyricsSynchronizer → LyricsProcessor → UltraStarParser → constants
                                   → UltraStarParser
             → FileManager → TimeConverter → constants
             → MetadataParser → TimeConverter
             → TimeConverter
             → UltraStarParser
```

**Module dependency flow (Timings Editor):**
```
App.jsx (UI) → TimingsEditor → UltraStarParser → constants
             → FileManager → TimeConverter → constants
             → TimeConverter
             → UltraStarParser
```

**App.jsx** (per tool) contains tool-specific React components. Each tool has its own `App.jsx`, `main.jsx`, and `index.html`.

**Shared React components:** `src/components/shared.jsx` exports `ThemeToggle`, `NotificationToast`, `FileUploadZone`, `Upload`, `Download`, `HelpIcon`, `PageLayout`, `ToolHeader`, `InstructionsBox`, and `GenerateButtons` — imported by both tools' `App.jsx`.

**Shared modules:** `UltraStarParser`, `FileManager`, `TimeConverter`, and `constants` live in `src/lyrics-editor/` and are imported by other tools via relative paths (`../lyrics-editor/...`).

**Testing:** Jest config is CJS (`jest.config.cjs`) with babel-jest transform. Tests live in `tests/*.test.js` and import from `src/lyrics-editor/` or `src/timings-editor/`.

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

## Timings Editor Algorithm

`TimingsEditor.applyBeatOffsets(noteLines, offsets)` shifts note timings:
- `offsets` is `{ lineIndex: beatOffset }` — maps a line index to a beat shift value
- Offsets accumulate: each offset adds to all subsequent notes/breaks
- Note lines: `start` beat is adjusted by cumulative offset
- Break lines: position is adjusted by cumulative offset
- End marker: unchanged

## Code Conventions

- **Files:** kebab-case (`lyrics-processor.js`)
- **Components:** PascalCase (`LyricsEditor`)
- **Functions:** camelCase (`parseLyrics`)
- **File encoding:** UTF-8 WITHOUT BOM
- **Tailwind CSS:** Use v4 syntax — `shrink-0` (not `flex-shrink-0`), `grow` (not `flex-grow`), `bg-linear-to-*` (not `bg-gradient-to-*`), and named spacing scale (e.g., `max-h-150` for 600px) instead of arbitrary values (`max-h-[600px]`) when the value is a multiple of 4px

## Testing Requirements

- Tests must test modules in `src/lyrics-editor/` or `src/timings-editor/`, not internal HTML code
- Write failing test first when fixing bugs (TDD)
- Coverage threshold: 90% for all metrics
- Do not create README.md in tests directory

## Development Rules

- Extract reusable logic from `App.jsx` to `src/lyrics-editor/` modules
- Verify code is actually used before modifying
- Remove dead code
- Run `npm test` after changes
