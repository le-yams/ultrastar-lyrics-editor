
# UltraStar Lyrics Editor

UltraStar Lyrics Editor is a web-based tool for editing lyrics files for UltraStar, the popular karaoke game. 

This editor allows you to create a new UltraStar song file by synchronizing new lyrics with the timings from an existing [UltraStar song file](https://usdx.eu/format/#specs). Simply load your original file, enter the new lyrics, and let the editor automatically align them to the existing note timings.


## Features

### 🎵 Smart Synchronization
- **Automatic sync**: Align new lyrics to existing timings with one click
- **Phrase-based mapping**: Each line of lyrics is automatically mapped to corresponding note blocks
- **Syllable splitting**: Use the `|` character to split words into syllables for precise timing

### ✅ Validation & Warnings
- **File validation**: Ensures uploaded files are valid UltraStar format
- **Synchronization warnings**: Get notified when there's a mismatch between notes and syllables
- **Real-time feedback**: Visual notifications for every action (success, error, or warning)

### ✏️ Easy Editing
- **Song metadata**: Edit title, language, and GAP (start delay) directly in the interface
- **Manual adjustments**: Fine-tune synchronized lyrics before generating the final file
- **Preview mode**: Review all changes before saving

### 💾 Multiple Output Options
- **Copy to clipboard**: Quick copy for immediate use
- **Download file**: Save the synchronized file to your computer
- **Text preview**: View the complete UltraStar file before exporting

### ♿ User-Friendly Interface
- **Drag-and-drop support**: Easy file upload
- **Loading indicators**: Visual feedback during processing
- **Keyboard navigation**: Full keyboard accessibility
- **Help tooltips**: Contextual help when you need it


## Usage

### Requirements
- Node.js (v18 or higher)
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository or download the files
# Navigate to the project directory
cd ultrastar-lyrics-editor

# Install dependencies
npm install
```

### Running the Application

#### Development Mode
```bash
npm run dev
# Open http://localhost:5173 in your browser
```

#### Production Build
```bash
npm run build
# Files will be in the dist/ directory
```

### How to Use the Editor

1. Start the development server with `npm run dev`
2. Open http://localhost:5173 in your browser
3. Load an existing UltraStar song file (.txt) by clicking on the upload area or drag-and-drop
4. Enter or paste the new lyrics in the text area (or load a lyrics file)
5. Optionally edit the song title, language, and GAP (start delay) in the provided fields
6. Click "Auto-sync" to automatically align the lyrics with existing timings
6. Review the synchronized lyrics in the preview section
7. Make manual adjustments if necessary by editing individual lines
8. Click "Generate Final File" to create the new UltraStar file
9. Copy to clipboard or download the file to your computer


## Auto-synchronization

The editor automatically synchronizes your new lyrics with the existing timings from the original UltraStar file. Each line of new lyrics is mapped to a corresponding phrase (note block) in the original file.

### Loading Original Lyrics

If you want to edit or translate the original lyrics while preserving the syllable structure, you can use the **"📄 Load original"** button in the new lyrics section. This will automatically load the original lyrics with syllable separators (`|`) already in place, making it easier to:
- Translate lyrics while maintaining the exact syllable count
- Make small corrections to existing lyrics
- Understand the syllable structure of the original song

### Syllable Separator

You can use the `|` character to split words into syllables in your new lyrics.

**Example:** `hel|lo wor|ld` will be split into 4 syllables: `hel`, `lo`, `wor`, `ld`.

Each syllable will be assigned to a separate note timing from the original file.

**Spacing behavior:**
- Syllables within the same word (separated by `|`) will NOT have spaces between them
- A space will be added after the last syllable of each word (where there was a space in the original text)
- No space will be added after the last word of the phrase

**Example breakdown:**
- Input: `hel|lo wor|ld`
- Result: Note 1: `hel`, Note 2: `lo `, Note 3: `wor`, Note 4: `ld`
- (Note the space after "lo" but not after "ld")

### Synchronization Warnings

The editor automatically detects potential synchronization issues and displays warnings:
- **Line count mismatch**: When the number of lyric lines doesn't match the number of note blocks
- **Syllable count mismatch**: When the total number of syllables doesn't match the total number of notes

These warnings help you identify potential issues before generating the final file, allowing you to adjust your lyrics or review the synchronization manually.


## GAP Adjustment

The **GAP** metadata defines the delay (in milliseconds) before the song starts. This is useful when you need to synchronize the lyrics with the audio track.


### Default Behavior

- If the original UltraStar file doesn't have a GAP metadata, the default value is `0` (no delay)
- If you set the GAP value to `0`, it will **not be included** in the generated file (cleaner output)
- If you set a non-zero value, it will be included in the generated file with the calculated milliseconds value


## Notifications

The editor provides visual feedback for all operations:
- ✅ **Success notifications** (green): File loaded, synchronization completed, file generated, etc.
- ❌ **Error notifications** (red): Invalid file format, loading errors, etc.
- ⚠️ **Warning notifications** (yellow): Synchronization completed with potential issues
- ℹ️ **Info notifications** (blue): General information messages

All notifications automatically dismiss after 3 seconds, keeping your workspace clean.



