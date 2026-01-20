import { logger } from './constants.js';
import { UltraStarParser } from './ultraStarParser.js';
import { LyricsProcessor } from './lyricsProcessor.js';

// ============================================================================
// BUSINESS LOGIC - Synchronizer
// ============================================================================
export class LyricsSynchronizer {
    constructor(originalLines, newLyricsText) {
        this.originalLines = originalLines;
        this.newPhrases = LyricsProcessor.extractSyllables(newLyricsText);
        this.noteBlocks = LyricsProcessor.groupNoteBlocks(originalLines);
        this.warnings = [];
    }

    validate() {
        logger.log('Note blocks:', this.noteBlocks.length);
        logger.log('New phrases:', this.newPhrases.length);

        if (this.noteBlocks.length !== this.newPhrases.length) {
            this.warnings.push(
                `Warning: ${this.noteBlocks.length} note blocks but ${this.newPhrases.length} lyric lines. Synchronization may be imperfect.`
            );
        }

        const totalNotes = this.noteBlocks.reduce((sum, block) => sum + block.length, 0);
        const totalSyllables = this.newPhrases.reduce((sum, phrase) => sum + phrase.length, 0);

        if (totalNotes !== totalSyllables) {
            this.warnings.push(
                `Warning: ${totalNotes} notes but ${totalSyllables} syllables. Some notes may be empty or unused.`
            );
        }

        return this.warnings;
    }

    synchronize() {
        const synced = [];
        let blockIndex = 0;
        let syllableIndexInBlock = 0;

        this.originalLines.forEach(line => {
            if (UltraStarParser.isBreakLine(line)) {
                synced.push({ type: 'break', line, original: '' });
                if (syllableIndexInBlock > 0) {
                    blockIndex++;
                    syllableIndexInBlock = 0;
                }
            } else if (UltraStarParser.isNoteLine(line)) {
                const parsed = UltraStarParser.parseNoteLine(line);
                if (!parsed) return;

                let newText = '';
                if (blockIndex < this.newPhrases.length) {
                    const currentPhrase = this.newPhrases[blockIndex];
                    if (syllableIndexInBlock < currentPhrase.length) {
                        const syllableInfo = currentPhrase[syllableIndexInBlock];
                        newText = syllableInfo.text;
                        if (syllableInfo.isLastInWord && !syllableInfo.isLastInPhrase) {
                            newText += ' ';
                        }
                    }
                    syllableIndexInBlock++;
                }

                const newLine = UltraStarParser.buildNoteLine({
                    ...parsed,
                    text: newText
                });
                synced.push({ type: 'note', line: newLine, original: parsed.text });
            } else if (UltraStarParser.isEndLine(line)) {
                synced.push({ type: 'end', line, original: '' });
            } else {
                synced.push({ type: 'other', line, original: '' });
            }
        });

        return synced;
    }

    getWarnings() {
        return this.warnings;
    }
}
