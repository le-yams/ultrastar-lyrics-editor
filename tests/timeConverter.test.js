import { TimeConverter } from '../src/lyrics-editor/timeConverter.js';
describe('TimeConverter - msToComponents', () => {
    test('converts 0 ms', () => {
        expect(TimeConverter.msToComponents(0)).toEqual({ minutes: 0, seconds: 0, milliseconds: 0 });
    });
    test('converts 999 ms', () => {
        expect(TimeConverter.msToComponents(999)).toEqual({ minutes: 0, seconds: 0, milliseconds: 999 });
    });
    test('converts 1000 ms', () => {
        expect(TimeConverter.msToComponents(1000)).toEqual({ minutes: 0, seconds: 1, milliseconds: 0 });
    });
    test('converts 59999 ms', () => {
        expect(TimeConverter.msToComponents(59999)).toEqual({ minutes: 0, seconds: 59, milliseconds: 999 });
    });
    test('converts 60000 ms', () => {
        expect(TimeConverter.msToComponents(60000)).toEqual({ minutes: 1, seconds: 0, milliseconds: 0 });
    });
    test('converts 97048 ms', () => {
        expect(TimeConverter.msToComponents(97048)).toEqual({ minutes: 1, seconds: 37, milliseconds: 48 });
    });
    test('converts 3661500 ms', () => {
        expect(TimeConverter.msToComponents(3661500)).toEqual({ minutes: 61, seconds: 1, milliseconds: 500 });
    });
    test('converts 125456 ms', () => {
        expect(TimeConverter.msToComponents(125456)).toEqual({ minutes: 2, seconds: 5, milliseconds: 456 });
    });
});
describe('TimeConverter - componentsToMs', () => {
    test('converts {0, 0, 0}', () => {
        expect(TimeConverter.componentsToMs(0, 0, 0)).toBe(0);
    });
    test('converts {0, 0, 999}', () => {
        expect(TimeConverter.componentsToMs(0, 0, 999)).toBe(999);
    });
    test('converts {0, 1, 0}', () => {
        expect(TimeConverter.componentsToMs(0, 1, 0)).toBe(1000);
    });
    test('converts {1, 37, 48}', () => {
        expect(TimeConverter.componentsToMs(1, 37, 48)).toBe(97048);
    });
    test('converts {61, 1, 500}', () => {
        expect(TimeConverter.componentsToMs(61, 1, 500)).toBe(3661500);
    });
    test('converts only minutes', () => {
        expect(TimeConverter.componentsToMs(5, 0, 0)).toBe(300000);
    });
    test('converts only seconds', () => {
        expect(TimeConverter.componentsToMs(0, 30, 0)).toBe(30000);
    });
    test('converts only milliseconds', () => {
        expect(TimeConverter.componentsToMs(0, 0, 500)).toBe(500);
    });
});
describe('TimeConverter - reversibility', () => {
    test('is reversible for 0', () => {
        const ms = 0;
        const comp = TimeConverter.msToComponents(ms);
        expect(TimeConverter.componentsToMs(comp.minutes, comp.seconds, comp.milliseconds)).toBe(ms);
    });
    test('is reversible for 97048', () => {
        const ms = 97048;
        const comp = TimeConverter.msToComponents(ms);
        expect(TimeConverter.componentsToMs(comp.minutes, comp.seconds, comp.milliseconds)).toBe(ms);
    });
    test('is reversible for 3661500', () => {
        const ms = 3661500;
        const comp = TimeConverter.msToComponents(ms);
        expect(TimeConverter.componentsToMs(comp.minutes, comp.seconds, comp.milliseconds)).toBe(ms);
    });
    test('is reversible for various values', () => {
        [1234, 56789, 123456, 999999, 5000, 15750].forEach(ms => {
            const comp = TimeConverter.msToComponents(ms);
            expect(TimeConverter.componentsToMs(comp.minutes, comp.seconds, comp.milliseconds)).toBe(ms);
        });
    });
});
describe('TimeConverter - validateComponents', () => {
    test('validates correct components', () => {
        expect(TimeConverter.validateComponents(1, 30, 500)).toBe(true);
        expect(TimeConverter.validateComponents(0, 0, 0)).toBe(true);
        expect(TimeConverter.validateComponents(100, 59, 999)).toBe(true);
    });
    test('rejects negative minutes', () => {
        expect(TimeConverter.validateComponents(-1, 0, 0)).toBe(false);
    });
    test('rejects negative seconds', () => {
        expect(TimeConverter.validateComponents(0, -1, 0)).toBe(false);
    });
    test('rejects negative milliseconds', () => {
        expect(TimeConverter.validateComponents(0, 0, -1)).toBe(false);
    });
    test('rejects seconds > 59', () => {
        expect(TimeConverter.validateComponents(0, 60, 0)).toBe(false);
        expect(TimeConverter.validateComponents(0, 100, 0)).toBe(false);
    });
    test('accepts seconds = 59', () => {
        expect(TimeConverter.validateComponents(0, 59, 0)).toBe(true);
    });
    test('rejects milliseconds > 999', () => {
        expect(TimeConverter.validateComponents(0, 0, 1000)).toBe(false);
        expect(TimeConverter.validateComponents(0, 0, 5000)).toBe(false);
    });
    test('accepts milliseconds = 999', () => {
        expect(TimeConverter.validateComponents(0, 0, 999)).toBe(true);
    });
    test('rejects multiple invalid components', () => {
        expect(TimeConverter.validateComponents(-1, 60, 1000)).toBe(false);
    });
    test('accepts edge cases', () => {
        expect(TimeConverter.validateComponents(0, 0, 1)).toBe(true);
        expect(TimeConverter.validateComponents(0, 1, 0)).toBe(true);
        expect(TimeConverter.validateComponents(1, 0, 0)).toBe(true);
    });
});

describe('TimeConverter - beatToTime', () => {
    test('converts beat 0 with BPM 120 and no GAP', () => {
        const result = TimeConverter.beatToTime(0, 120, 0);
        expect(result).toEqual({ minutes: 0, seconds: 0 });
    });

    test('converts beat 480 with BPM 120 and no GAP', () => {
        // 480 beats * 60 / 120 / 4 = 60 seconds = 1 minute
        const result = TimeConverter.beatToTime(480, 120, 0);
        expect(result).toEqual({ minutes: 1, seconds: 0 });
    });

    test('converts beat 240 with BPM 120 and no GAP', () => {
        // 240 beats * 60 / 120 / 4 = 30 seconds
        const result = TimeConverter.beatToTime(240, 120, 0);
        expect(result).toEqual({ minutes: 0, seconds: 30 });
    });

    test('applies GAP offset correctly', () => {
        // 0 beats + 5000 ms GAP = 5 seconds
        const result = TimeConverter.beatToTime(0, 120, 5000);
        expect(result).toEqual({ minutes: 0, seconds: 5 });
    });

    test('combines beat and GAP', () => {
        // 240 beats (30s) + 5000 ms GAP = 35 seconds
        const result = TimeConverter.beatToTime(240, 120, 5000);
        expect(result).toEqual({ minutes: 0, seconds: 35 });
    });

    test('handles different BPM values', () => {
        // 240 beats * 60 / 60 / 4 = 60 seconds
        const result = TimeConverter.beatToTime(240, 60, 0);
        expect(result).toEqual({ minutes: 1, seconds: 0 });
    });

    test('returns null for invalid BPM (0)', () => {
        const result = TimeConverter.beatToTime(100, 0, 0);
        expect(result).toBeNull();
    });

    test('returns null for invalid BPM (negative)', () => {
        const result = TimeConverter.beatToTime(100, -120, 0);
        expect(result).toBeNull();
    });

    test('returns null for missing BPM', () => {
        const result = TimeConverter.beatToTime(100, null, 0);
        expect(result).toBeNull();
    });

    test('handles fractional seconds correctly (floors them)', () => {
        // 120 beats * 60 / 120 / 4 = 15 seconds
        const result = TimeConverter.beatToTime(120, 120, 0);
        expect(result).toEqual({ minutes: 0, seconds: 15 });
    });
});

describe('TimeConverter - formatTime', () => {
    test('formats 0:0 as 00:00', () => {
        expect(TimeConverter.formatTime(0, 0)).toBe('00:00');
    });

    test('formats 1:30 as 01:30', () => {
        expect(TimeConverter.formatTime(1, 30)).toBe('01:30');
    });

    test('formats 0:5 as 00:05', () => {
        expect(TimeConverter.formatTime(0, 5)).toBe('00:05');
    });

    test('formats 10:59 as 10:59', () => {
        expect(TimeConverter.formatTime(10, 59)).toBe('10:59');
    });

    test('formats 99:99 as 99:99', () => {
        expect(TimeConverter.formatTime(99, 99)).toBe('99:99');
    });

    test('formats single digit values with leading zeros', () => {
        expect(TimeConverter.formatTime(5, 9)).toBe('05:09');
    });
});

