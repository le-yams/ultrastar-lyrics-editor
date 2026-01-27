import { ULTRASTAR, logger } from './constants.js';
import { UltraStarParser } from './ultraStarParser.js';

// ============================================================================
// UTILITY FUNCTIONS - Lyrics Processor
// ============================================================================
export const LyricsProcessor = {
    extractSyllables(lyricsText) {
        const lines = lyricsText.split('\n');
        const phrases = [];

        lines.forEach(line => {
            const cleanLine = line.replace(/\[.*?]/g, '').trim();
            if (!cleanLine) return;

            const words = cleanLine.split(/\s+/).filter(w => w.length > 0);
            const syllables = [];

            words.forEach((word, wordIndex) => {
                const wordSyllables = word.split(ULTRASTAR.SYLLABLE_SEPARATOR).filter(s => s.length > 0);
                wordSyllables.forEach((syllable, syllableIndex) => {
                    syllables.push({
                        text: syllable,
                        isLastInWord: syllableIndex === wordSyllables.length - 1,
                        isLastInPhrase: wordIndex === words.length - 1 && syllableIndex === wordSyllables.length - 1
                    });
                });
            });

            if (syllables.length > 0) {
                phrases.push(syllables);
            }
        });

        return phrases;
    },

    groupNoteBlocks(noteLines) {
        const blocks = [];
        let currentBlock = [];

        noteLines.forEach(line => {
            if (UltraStarParser.isNoteLine(line)) {
                currentBlock.push(line);
            } else if (UltraStarParser.isBreakLine(line)) {
                if (currentBlock.length > 0) {
                    blocks.push(currentBlock);
                    currentBlock = [];
                }
            }
        });

        if (currentBlock.length > 0) {
            blocks.push(currentBlock);
        }

        return blocks;
    },

    extractOriginalLyrics(noteLines) {
        const phrases = [];
        let currentPhrase = [];

        noteLines.forEach(line => {
            if (UltraStarParser.isNoteLine(line)) {
                const parsed = UltraStarParser.parseNoteLine(line);
                if (parsed) {
                    logger.log(`Parsed syllable: "${parsed.text}"`);
                    currentPhrase.push(parsed.text);
                } else {
                    currentPhrase.push('');
                }
            } else if (UltraStarParser.isBreakLine(line)) {
                if (currentPhrase.length > 0) {
                    const phraseText = this.buildPhraseFromSyllables(currentPhrase);
                    phrases.push(phraseText);
                    currentPhrase = [];
                }
            }
        });

        if (currentPhrase.length > 0) {
            const phraseText = this.buildPhraseFromSyllables(currentPhrase);
            phrases.push(phraseText);
        }

        return phrases.join('\n');
    },

    buildPhraseFromSyllables(syllables) {
        let phraseText = '';
        syllables.forEach((syllable, index) => {
            if (index === 0) {
                phraseText = syllable;
            } else {
                const prevSyllable = syllables[index - 1];
                if (prevSyllable.endsWith(' ') || prevSyllable === '') {
                    phraseText += syllable;
                } else {
                    phraseText += ULTRASTAR.SYLLABLE_SEPARATOR + syllable;
                }
            }
        });
        return phraseText.trimEnd();
    }
};
