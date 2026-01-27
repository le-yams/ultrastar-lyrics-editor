import { LyricsProcessor } from '../src/lyrics-editor/lyricsProcessor.js';
describe('LyricsProcessor - extractSyllables', () => {
    test('extracts simple syllables without separator', () => {
        const result = LyricsProcessor.extractSyllables('Hello world');
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveLength(2);
        expect(result[0][0].text).toBe('Hello');
        expect(result[0][1].text).toBe('world');
    });
    test('extracts syllables with separator', () => {
        const result = LyricsProcessor.extractSyllables('hel|lo wor|ld');
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveLength(4);
        expect(result[0].map(s => s.text)).toEqual(['hel', 'lo', 'wor', 'ld']);
    });
    test('marks isLastInWord correctly', () => {
        const result = LyricsProcessor.extractSyllables('hel|lo world');
        expect(result[0][0].isLastInWord).toBe(false);
        expect(result[0][1].isLastInWord).toBe(true);
        expect(result[0][2].isLastInWord).toBe(true);
    });
    test('marks isLastInPhrase correctly', () => {
        const result = LyricsProcessor.extractSyllables('hello world');
        expect(result[0][0].isLastInPhrase).toBe(false);
        expect(result[0][1].isLastInPhrase).toBe(true);
    });
    test('handles multiple lines', () => {
        const result = LyricsProcessor.extractSyllables('line1\nline2');
        expect(result).toHaveLength(2);
    });
    test('ignores empty lines', () => {
        const result = LyricsProcessor.extractSyllables('line1\n\nline2');
        expect(result).toHaveLength(2);
    });
    test('removes timestamps in brackets', () => {
        const result = LyricsProcessor.extractSyllables('[00:10] text');
        expect(result[0][0].text).toBe('text');
    });
});
describe('LyricsProcessor - groupNoteBlocks', () => {
    test('groups notes separated by breaks', () => {
        const lines = [': 10 5 3 Hello', ': 15 5 3 World', '- 20', ': 25 5 3 Test'];
        const result = LyricsProcessor.groupNoteBlocks(lines);
        expect(result).toHaveLength(2);
        expect(result[0]).toHaveLength(2);
        expect(result[1]).toHaveLength(1);
    });
    test('handles single block without break', () => {
        const lines = [': 10 5 3 Hello', ': 15 5 3 World'];
        const result = LyricsProcessor.groupNoteBlocks(lines);
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveLength(2);
    });
    test('ignores consecutive breaks', () => {
        const lines = [': 10 5 3 Hello', '- 20', '- 30', ': 25 5 3 Test'];
        const result = LyricsProcessor.groupNoteBlocks(lines);
        expect(result).toHaveLength(2);
    });
});
describe('LyricsProcessor - buildPhraseFromSyllables', () => {
    test('builds simple phrase', () => {
        const result = LyricsProcessor.buildPhraseFromSyllables(['Hello', 'world']);
        expect(result).toBe('Hello|world');
    });
    test('handles word ending with space', () => {
        const result = LyricsProcessor.buildPhraseFromSyllables(['Hello ', 'world']);
        expect(result).toBe('Hello world');
    });
    test('trims trailing spaces', () => {
        const result = LyricsProcessor.buildPhraseFromSyllables(['Hello ', 'world ']);
        expect(result).toBe('Hello world');
    });
});
describe('LyricsProcessor - extractOriginalLyrics', () => {
    test('extracts simple text from notes', () => {
        const lines = [': 10 5 3 Hello', ': 15 5 3 World'];
        const result = LyricsProcessor.extractOriginalLyrics(lines);
        expect(result).toBe('Hello|World');
    });
    test('preserves spaces between words', () => {
        const lines = [': 10 5 3 Hello ', ': 15 5 3 World'];
        const result = LyricsProcessor.extractOriginalLyrics(lines);
        expect(result).toBe('Hello World');
    });
    test('handles multiple phrases with breaks', () => {
        const lines = [': 10 5 3 Hello', '- 15', ': 20 5 3 World'];
        const result = LyricsProcessor.extractOriginalLyrics(lines);
        expect(result).toBe('Hello\nWorld');
    });
    test('does not add space at end of phrase', () => {
        const lines = [': 10 5 3 Hello', ': 15 5 3 World '];
        const result = LyricsProcessor.extractOriginalLyrics(lines);
        expect(result).toBe('Hello|World');
    });
    test('handles empty text in notes', () => {
        const lines = [': 10 5 3 Hello', ': 15 5 3 ', ': 20 5 3 World'];
        const result = LyricsProcessor.extractOriginalLyrics(lines);
        expect(result).toBe('Hello|World');
    });
});
