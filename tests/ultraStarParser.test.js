import { UltraStarParser } from '../src/ultraStarParser.js';
describe('UltraStarParser - findSpacePositions', () => {
    test('finds 4 spaces in valid line', () => {
        const positions = UltraStarParser.findSpacePositions(': 10 5 3 Hello', 4);
        expect(positions).toEqual([1, 4, 6, 8]);
    });
    test('returns partial array when fewer spaces', () => {
        const positions = UltraStarParser.findSpacePositions(': 10 5', 4);
        expect(positions).toEqual([1, 4]);
    });
    test('handles empty string', () => {
        const positions = UltraStarParser.findSpacePositions('', 4);
        expect(positions).toEqual([]);
    });
});
describe('UltraStarParser - parseNoteLine', () => {
    test('parses simple valid note line', () => {
        const result = UltraStarParser.parseNoteLine(': 10 5 3 Hello');
        expect(result).toEqual({
            type: ':',
            start: '10',
            duration: '5',
            pitch: '3',
            text: 'Hello'
        });
    });
    test('parses line with text containing spaces', () => {
        const result = UltraStarParser.parseNoteLine(': 10 5 3 Hello world');
        expect(result).toEqual({
            type: ':',
            start: '10',
            duration: '5',
            pitch: '3',
            text: 'Hello world'
        });
    });
    test('parses golden note type', () => {
        const result = UltraStarParser.parseNoteLine('* 10 5 3 Golden');
        expect(result.type).toBe('*');
    });
    test('parses text ending with space', () => {
        const result = UltraStarParser.parseNoteLine(': 10 5 3 word ');
        expect(result.text).toBe('word ');
    });
    test('returns null for invalid line', () => {
        const result = UltraStarParser.parseNoteLine(': 10 5');
        expect(result).toBeNull();
    });
    test('returns null for empty line', () => {
        const result = UltraStarParser.parseNoteLine('');
        expect(result).toBeNull();
    });
});
describe('UltraStarParser - buildNoteLine', () => {
    test('builds simple note line', () => {
        const fields = { type: ':', start: '10', duration: '5', pitch: '3', text: 'Hello' };
        expect(UltraStarParser.buildNoteLine(fields)).toBe(': 10 5 3 Hello');
    });
    test('builds line with text containing spaces', () => {
        const fields = { type: ':', start: '10', duration: '5', pitch: '3', text: 'Hello world' };
        expect(UltraStarParser.buildNoteLine(fields)).toBe(': 10 5 3 Hello world');
    });
    test('is reversible with parseNoteLine', () => {
        const original = ': 10 5 3 Hello world';
        const parsed = UltraStarParser.parseNoteLine(original);
        const rebuilt = UltraStarParser.buildNoteLine(parsed);
        expect(rebuilt).toBe(original);
    });
});
describe('UltraStarParser - validation methods', () => {
    test('isNoteLine detects note lines', () => {
        expect(UltraStarParser.isNoteLine(': 10 5 3 Text')).toBe(true);
        expect(UltraStarParser.isNoteLine('* 10 5 3 Text')).toBe(true);
        expect(UltraStarParser.isNoteLine('F 10 5 3 Text')).toBe(true);
        expect(UltraStarParser.isNoteLine('R 10 5 3 Text')).toBe(true);
        expect(UltraStarParser.isNoteLine('- 100')).toBe(false);
        expect(UltraStarParser.isNoteLine('#TITLE:Song')).toBe(false);
    });
    test('isBreakLine detects break lines', () => {
        expect(UltraStarParser.isBreakLine('-')).toBe(true);
        expect(UltraStarParser.isBreakLine('- 100')).toBe(true);
        expect(UltraStarParser.isBreakLine(': 10 5 3 Text')).toBe(false);
    });
    test('isEndLine detects end marker', () => {
        expect(UltraStarParser.isEndLine('E')).toBe(true);
        expect(UltraStarParser.isEndLine('  E  ')).toBe(true);
        expect(UltraStarParser.isEndLine('END')).toBe(false);
        expect(UltraStarParser.isEndLine('')).toBe(false);
    });
    test('isHeaderLine detects header lines', () => {
        expect(UltraStarParser.isHeaderLine('#TITLE:Song')).toBe(true);
        expect(UltraStarParser.isHeaderLine('  #ARTIST:Artist')).toBe(true);
        expect(UltraStarParser.isHeaderLine('TITLE:Song')).toBe(false);
    });
});
