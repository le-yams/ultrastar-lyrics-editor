import { TimingsEditor } from '../src/timings-editor/timings-editor.js';

describe('TimingsEditor - parseBreakPosition', () => {
    test('parses break with position', () => {
        expect(TimingsEditor.parseBreakPosition('- 100')).toBe(100);
    });

    test('parses break with large position', () => {
        expect(TimingsEditor.parseBreakPosition('- 5000')).toBe(5000);
    });

    test('returns null for break without position', () => {
        expect(TimingsEditor.parseBreakPosition('-')).toBeNull();
    });

    test('returns null for non-break line', () => {
        expect(TimingsEditor.parseBreakPosition(': 10 5 3 Hello')).toBeNull();
    });
});

describe('TimingsEditor - buildBreakLine', () => {
    test('builds break line from position', () => {
        expect(TimingsEditor.buildBreakLine(100)).toBe('- 100');
    });

    test('builds break line from zero', () => {
        expect(TimingsEditor.buildBreakLine(0)).toBe('- 0');
    });

    test('roundtrip parseBreakPosition and buildBreakLine', () => {
        const original = '- 250';
        const position = TimingsEditor.parseBreakPosition(original);
        expect(TimingsEditor.buildBreakLine(position)).toBe(original);
    });
});

describe('TimingsEditor - applyBeatOffsets', () => {
    test('returns lines unchanged when no offsets', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            ': 20 5 3 World',
            'E'
        ];
        const result = TimingsEditor.applyBeatOffsets(noteLines, {});
        expect(result).toEqual(noteLines);
    });

    test('applies offset to first note and all subsequent notes', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            ': 20 5 3 World',
            'E'
        ];
        const offsets = { 0: 5 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result).toEqual([
            ': 15 5 3 Hello',
            ': 25 5 3 World',
            'E'
        ]);
    });

    test('applies offset starting from middle note', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            ': 20 5 3 World',
            ': 30 5 3 Foo',
            'E'
        ];
        const offsets = { 1: 10 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result).toEqual([
            ': 10 5 3 Hello',
            ': 30 5 3 World',
            ': 40 5 3 Foo',
            'E'
        ]);
    });

    test('applies negative offset', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            ': 20 5 3 World',
            'E'
        ];
        const offsets = { 0: -3 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result).toEqual([
            ': 7 5 3 Hello',
            ': 17 5 3 World',
            'E'
        ]);
    });

    test('cumulates multiple offsets', () => {
        const noteLines = [
            ': 10 5 3 A',
            ': 20 5 3 B',
            ': 30 5 3 C',
            ': 40 5 3 D',
            'E'
        ];
        const offsets = { 0: 5, 2: 10 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        // Note 0: 10 + 5 = 15
        // Note 1: 20 + 5 = 25
        // Note 2: 30 + 5 + 10 = 45
        // Note 3: 40 + 5 + 10 = 55
        expect(result).toEqual([
            ': 15 5 3 A',
            ': 25 5 3 B',
            ': 45 5 3 C',
            ': 55 5 3 D',
            'E'
        ]);
    });

    test('applies offset to break line positions', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            '- 15',
            ': 20 5 3 World',
            'E'
        ];
        const offsets = { 0: 5 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result).toEqual([
            ': 15 5 3 Hello',
            '- 20',
            ': 25 5 3 World',
            'E'
        ]);
    });

    test('does not modify end marker', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            'E'
        ];
        const offsets = { 0: 100 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result[1]).toBe('E');
    });

    test('offset on a break line cumulates to following notes', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            '- 15',
            ': 20 5 3 World',
            'E'
        ];
        const offsets = { 1: 5 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result).toEqual([
            ': 10 5 3 Hello',
            '- 20',
            ': 25 5 3 World',
            'E'
        ]);
    });

    test('offset of zero has no effect', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            ': 20 5 3 World',
            'E'
        ];
        const offsets = { 0: 0 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result).toEqual(noteLines);
    });

    test('handles mixed note types (golden, freestyle, rap)', () => {
        const noteLines = [
            ': 10 5 3 Normal',
            '* 20 5 3 Golden',
            'F 30 5 3 Free',
            'R 40 5 3 Rap',
            'G 50 5 3 RapGolden',
            'E'
        ];
        const offsets = { 0: 2 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result).toEqual([
            ': 12 5 3 Normal',
            '* 22 5 3 Golden',
            'F 32 5 3 Free',
            'R 42 5 3 Rap',
            'G 52 5 3 RapGolden',
            'E'
        ]);
    });

    test('handles complex scenario with multiple breaks and offsets', () => {
        const noteLines = [
            ': 10 5 3 A',
            ': 20 5 3 B',
            '- 25',
            ': 30 5 3 C',
            ': 40 5 3 D',
            '- 45',
            ': 50 5 3 E',
            'E'
        ];
        const offsets = { 0: 2, 3: -5 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        // Cumulative after index 0: +2
        // Cumulative after index 3: +2 + (-5) = -3
        expect(result).toEqual([
            ': 12 5 3 A',
            ': 22 5 3 B',
            '- 27',
            ': 27 5 3 C',
            ': 37 5 3 D',
            '- 42',
            ': 47 5 3 E',
            'E'
        ]);
    });

    test('does not modify original noteLines array', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            ': 20 5 3 World',
            'E'
        ];
        const original = [...noteLines];
        TimingsEditor.applyBeatOffsets(noteLines, { 0: 5 });
        expect(noteLines).toEqual(original);
    });

    test('handles empty noteLines', () => {
        const result = TimingsEditor.applyBeatOffsets([], {});
        expect(result).toEqual([]);
    });

    test('preserves note text with spaces', () => {
        const noteLines = [
            ': 10 5 3 Hello world ',
            'E'
        ];
        const offsets = { 0: 5 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result).toEqual([
            ': 15 5 3 Hello world ',
            'E'
        ]);
    });

    test('handles break without position when offset is active', () => {
        const noteLines = [
            ': 10 5 3 Hello',
            '-',
            ': 20 5 3 World',
            'E'
        ];
        const offsets = { 0: 5 };
        const result = TimingsEditor.applyBeatOffsets(noteLines, offsets);
        expect(result).toEqual([
            ': 15 5 3 Hello',
            '-',
            ': 25 5 3 World',
            'E'
        ]);
    });
});
