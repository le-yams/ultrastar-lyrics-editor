# AI Agent Instructions - UltraStar Lyrics Editor

## Project Context

You are working on **UltraStar Lyrics Editor**, a React-based web application for synchronizing lyrics with UltraStar karaoke files.

**Project Structure:**
- `index.html` - Main React standalone application (uses Babel for transpilation)
- `src/` - JavaScript modules (parsing, synchronization, conversion, etc.)
- `tests/` - Jest unit tests

## Critical Rules

### Code Organization

**ALWAYS:**
- Extract reusable code from `index.html` into `src/` modules
- Separate concerns into distinct modules (parsing, synchronization, conversion)
- Verify the code you're modifying is actually used by the application
- Remove dead code from the repository
- Create files without BOM (Byte Order Mark) - use UTF-8 encoding without BOM

**NEVER:**
- Duplicate code between application and modules
- Leave unused/dead code in the codebase
- Add BOM (﻿) at the beginning of files

### Testing Requirements

**MANDATORY RULES:**
- Tests MUST test code actually used by the application (not internal `index.html` code)
- Tests MUST be written for modules in `src/`, not for code inside `index.html`
- Tests MUST verify expected behavior/results, not implementation details
- Tests MUST be self-documenting through clear naming and structure
- DO NOT create README.md in the tests directory

**Test-Driven Development for Bugs:**
1. Write a failing test that demonstrates the bug
2. Fix the code to make the test pass
3. Run `npm test` to validate
4. DO NOT fix the bug before writing the test

**Test Priorities:**
- High: File parsing, lyrics synchronization, time conversion
- Medium: Metadata handling, input validation
- Low: Simple utilities

### Documentation Rules

**ONLY document user-facing functionality:**
- Update README.md for new features
- Focus on "what" and "why", NOT "how"
- Include: overview, features, usage instructions, requirements (e.g., internet connection)

**FORBIDDEN in documentation:**
- Technical implementation details
- Source code examples
- Bug documentation files (use Git history instead)
- Files like IMPROVEMENTS.md (delete after incorporating into README)

### Workflow

**Before any modification:**
1. Read existing code to understand context
2. Verify you're modifying code used by the application
3. Check if extraction to `src/` modules is needed

**During implementation:**
1. Extract code to `src/` modules if working with `index.html` logic
2. Write tests for new modules
3. Use `get_errors` tool to validate changes
4. Test manually if necessary

**After modification:**
1. Run `npm test` to validate all tests pass
2. Update README.md if features were added
3. Delete any temporary documentation files created

## Project-Specific Knowledge

### UltraStar Metadata

**Editable metadata (all must be user-configurable):**
- `TITLE` - Song title (default: original filename)
- `ARTIST` - Artist name
- `LANGUAGE` - Lyrics language (NO hardcoded values)
- `GAP` - Time offset in milliseconds (default: 0, omit from file if 0)

**GAP Implementation:**
- UI: 3 separate fields (minutes, seconds, milliseconds)
- Conversion: Parse to/from milliseconds
- Example: 97048ms = 1 min, 37 sec, 48 ms

### Lyrics Synchronization Algorithm

**Process:**
1. Match phrases: original file ↔ new lyrics (line by line)
2. Match words: within each phrase
3. Handle syllable separator `|` to split words across multiple notes

**Spacing Rules (CRITICAL):**
- DO NOT add space after syllables (where `|` appears)
- DO add space after last syllable of each word (space in text)
- DO NOT add space at end of phrase

**Note Line Format:**
```
NoteType StartBeat Length Pitch Text
```
⚠️ The Text field can contain spaces itself

**Example:**
- Text: `hel|lo world`
- Notes: `hel` (no space), `lo ` (with space), `world` (no space at phrase end)

### UI Components Requirements

**1. File Upload Component:**
- Support drag-and-drop AND click
- Display after load: Title (bold, dark purple), Artist (purple), Line count

**2. Metadata Editor:**
- Title field (text input)
- Language field (text input)
- GAP field (3 inputs: minutes, seconds, milliseconds)

**3. New Lyrics Component:**
- Text area for new lyrics
- Button to load original lyrics (with `|` separators added)
- Button to load from file
- Help button with tooltip explaining synchronization and `|` usage

**Styling:**
- Title: First, bold, dark purple
- Artist: Second, purple (not bold)

### Naming Conventions

**ALWAYS use:**
- Application name: "UltraStar Lyrics Editor" (NOT "UltraStar Sync Tool")
- Files: kebab-case (e.g., `lyrics-processor.js`)
- React Components: PascalCase (e.g., `LyricsEditor`)
- Functions: camelCase (e.g., `parseLyrics`)

### Error Handling

**ALWAYS:**
- Validate user inputs
- Handle edge cases (empty files, invalid formats)
- Display clear error messages to users
- Test error scenarios

### Refactoring Process

When code improvements are needed:
1. Identify readability/maintainability issues
2. Propose all improvements at once
3. Implement all improvements together
4. Validate tests still pass (`npm test`)
5. Clean up any temporary files created

## Command Reference

- **Run tests:** `npm test`
- **Validate errors:** Use `get_errors` tool after code changes
- **Manual testing:** Open `index.html` in browser

## Remember

- YOU are responsible for complete implementation
- DO NOT ask for permission to use tools
- DO NOT show code blocks unless user asks - use edit tools instead
- DO NOT show terminal commands unless user asks - use run_in_terminal instead
- ALWAYS validate your work (tests, errors, manual testing)
- Extract logic to modules, test modules, not HTML internals
- Tests must test actual application code, not phantom implementations

---

**These instructions are derived from project history and MUST be followed for consistency.**
