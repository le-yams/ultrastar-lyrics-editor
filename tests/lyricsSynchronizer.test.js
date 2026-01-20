import { LyricsSynchronizer } from '../src/lyricsSynchronizer.js';
describe('LyricsSynchronizer - validate', () => {
    test('generates warning when block count differs from phrase count', () => {
        const originalLines = [': 10 5 3 Hello', '- 15', ': 20 5 3 World'];
        const newLyrics = 'Test';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const warnings = sync.validate();
        expect(warnings.length).toBeGreaterThan(0);
        expect(warnings[0]).toContain('2 note blocks but 1 lyric lines');
    });
    test('generates warning when note count differs from syllable count', () => {
        const originalLines = [': 10 5 3 Hello', ': 15 5 3 World'];
        const newLyrics = 'Test';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const warnings = sync.validate();
        expect(warnings.length).toBeGreaterThan(0);
        expect(warnings.some(w => w.includes('notes but'))).toBe(true);
    });
    test('no warnings when counts match', () => {
        const originalLines = [': 10 5 3 Hello', ': 15 5 3 World'];
        const newLyrics = 'Test1 Test2';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const warnings = sync.validate();
        expect(warnings).toHaveLength(0);
    });
});
describe('LyricsSynchronizer - synchronize', () => {
    test('synchronizes simple lyrics', () => {
        const originalLines = [': 10 5 3 Hello', ': 15 5 3 World'];
        const newLyrics = 'Bon Test';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const result = sync.synchronize();
        expect(result[0].line).toBe(': 10 5 3 Bon ');
        expect(result[1].line).toBe(': 15 5 3 Test');
    });
    test('adds space after last syllable of word', () => {
        const originalLines = [': 10 5 3 Hello', ': 15 5 3 World', ': 20 5 3 Test'];
        const newLyrics = 'Bon|jour Test';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const result = sync.synchronize();
        expect(result[1].line).toContain('jour ');
    });
    test('does not add space after last syllable of phrase', () => {
        const originalLines = [': 10 5 3 Hello', ': 15 5 3 World'];
        const newLyrics = 'Bon Test';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const result = sync.synchronize();
        expect(result[1].line).toBe(': 15 5 3 Test');
        expect(result[1].line).not.toContain('Test ');
    });
    test('preserves break lines', () => {
        const originalLines = [': 10 5 3 Hello', '- 15', ': 20 5 3 World'];
        const newLyrics = 'Test1\nTest2';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const result = sync.synchronize();
        expect(result[1].type).toBe('break');
        expect(result[1].line).toBe('- 15');
    });
    test('preserves end marker', () => {
        const originalLines = [': 10 5 3 Hello', 'E'];
        const newLyrics = 'Test';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const result = sync.synchronize();
        expect(result[1].type).toBe('end');
        expect(result[1].line).toBe('E');
    });
    test('handles more notes than syllables', () => {
        const originalLines = [': 10 5 3 Hello', ': 15 5 3 World', ': 20 5 3 Test'];
        const newLyrics = 'A';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const result = sync.synchronize();
        expect(result[0].line).toBe(': 10 5 3 A');
        expect(result[1].line).toBe(': 15 5 3 ');
        expect(result[2].line).toBe(': 20 5 3 ');
    });
    test('preserves original timing and pitch', () => {
        const originalLines = [': 10 5 3 Hello'];
        const newLyrics = 'Test';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const result = sync.synchronize();
        expect(result[0].line).toContain(': 10 5 3');
    });
    test('stores original text', () => {
        const originalLines = [': 10 5 3 Hello'];
        const newLyrics = 'Test';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        const result = sync.synchronize();
        expect(result[0].original).toBe('Hello');
    });
});
describe('LyricsSynchronizer - getWarnings', () => {
    test('returns warnings after validation', () => {
        const originalLines = [': 10 5 3 Hello'];
        const newLyrics = 'Test1\nTest2';
        const sync = new LyricsSynchronizer(originalLines, newLyrics);
        sync.validate();
        const warnings = sync.getWarnings();
        expect(warnings.length).toBeGreaterThan(0);
    });
});
