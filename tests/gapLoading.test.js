import { MetadataParser } from '../src/lyrics-editor/metadataParser.js';

/**
 * GAP Loading Tests
 *
 * These tests verify that the GAP value from an UltraStar file is correctly
 * parsed and converted to the metadata state structure expected by the UI.
 *
 * This tests the ACTUAL code used by App.jsx via the MetadataParser module.
 */

describe('MetadataParser - parseGapFromHeader', () => {
    describe('GAP value should be converted to correct component properties', () => {
        test('GAP value 97048 should return gapMinutes=1, gapSeconds=37, gapMilliseconds=48', () => {
            const header = {
                TITLE: 'Test Song',
                ARTIST: 'Test Artist',
                GAP: '97048',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            // TEST EXPECTED BEHAVIOR: These properties should exist with correct values
            expect(result.gapMinutes).toBe(1);
            expect(result.gapSeconds).toBe(37);
            expect(result.gapMilliseconds).toBe(48);
        });

        test('GAP value 0 should return all gap fields with 0', () => {
            const header = {
                TITLE: 'Test Song',
                GAP: '0',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            expect(result.gapMinutes).toBe(0);
            expect(result.gapSeconds).toBe(0);
            expect(result.gapMilliseconds).toBe(0);
        });

        test('GAP value 5000 should return gapMinutes=0, gapSeconds=5, gapMilliseconds=0', () => {
            const header = {
                TITLE: 'Test Song',
                GAP: '5000',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            expect(result.gapMinutes).toBe(0);
            expect(result.gapSeconds).toBe(5);
            expect(result.gapMilliseconds).toBe(0);
        });

        test('GAP value 125456 should return gapMinutes=2, gapSeconds=5, gapMilliseconds=456', () => {
            const header = {
                TITLE: 'Test Song',
                GAP: '125456',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            expect(result.gapMinutes).toBe(2);
            expect(result.gapSeconds).toBe(5);
            expect(result.gapMilliseconds).toBe(456);
        });

        test('GAP value 3661500 should return gapMinutes=61, gapSeconds=1, gapMilliseconds=500', () => {
            const header = {
                TITLE: 'Test Song',
                GAP: '3661500',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            expect(result.gapMinutes).toBe(61);
            expect(result.gapSeconds).toBe(1);
            expect(result.gapMilliseconds).toBe(500);
        });

        test('GAP value 750 should return gapMinutes=0, gapSeconds=0, gapMilliseconds=750', () => {
            const header = {
                TITLE: 'Test Song',
                GAP: '750',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            expect(result.gapMinutes).toBe(0);
            expect(result.gapSeconds).toBe(0);
            expect(result.gapMilliseconds).toBe(750);
        });
    });

    describe('Return value should not contain incorrect property names', () => {
        test('result should NOT have "minutes" property', () => {
            const header = {
                TITLE: 'Test Song',
                GAP: '97048',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            // TEST EXPECTED BEHAVIOR: These generic properties should NOT exist
            expect(result.minutes).toBeUndefined();
        });

        test('result should NOT have "seconds" property', () => {
            const header = {
                TITLE: 'Test Song',
                GAP: '97048',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            expect(result.seconds).toBeUndefined();
        });

        test('result should NOT have "milliseconds" property', () => {
            const header = {
                TITLE: 'Test Song',
                GAP: '97048',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            expect(result.milliseconds).toBeUndefined();
        });

        test('result should ONLY have gapMinutes, gapSeconds, gapMilliseconds', () => {
            const header = {
                GAP: '97048'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            const keys = Object.keys(result);
            expect(keys).toEqual(['gapMinutes', 'gapSeconds', 'gapMilliseconds']);
        });
    });

    describe('Edge cases', () => {
        test('missing GAP header should default to 0 in all gap fields', () => {
            const header = {
                TITLE: 'Test Song',
                LANGUAGE: 'English'
                // No GAP property
            };

            const result = MetadataParser.parseGapFromHeader(header);

            expect(result.gapMinutes).toBe(0);
            expect(result.gapSeconds).toBe(0);
            expect(result.gapMilliseconds).toBe(0);
        });

        test('empty string GAP should be treated as 0', () => {
            const header = {
                GAP: ''
            };

            const result = MetadataParser.parseGapFromHeader(header);

            expect(result.gapMinutes).toBe(0);
            expect(result.gapSeconds).toBe(0);
            expect(result.gapMilliseconds).toBe(0);
        });

        test('non-numeric GAP should be treated as NaN (parsed by parseInt)', () => {
            const header = {
                GAP: 'invalid'
            };

            const result = MetadataParser.parseGapFromHeader(header);

            // parseInt('invalid') returns NaN, and NaN passed to TimeConverter
            // will produce NaN for all components
            expect(isNaN(result.gapMinutes)).toBe(true);
            expect(isNaN(result.gapSeconds)).toBe(true);
            expect(isNaN(result.gapMilliseconds)).toBe(true);
        });
    });
});

describe('MetadataParser - parseMetadata', () => {
    describe('Complete metadata parsing', () => {
        test('should parse all metadata including GAP', () => {
            const header = {
                TITLE: 'Test Song',
                ARTIST: 'Test Artist',
                GAP: '97048',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseMetadata(header);

            expect(result.title).toBe('Test Song');
            expect(result.language).toBe('English');
            expect(result.gapMinutes).toBe(1);
            expect(result.gapSeconds).toBe(37);
            expect(result.gapMilliseconds).toBe(48);
        });

        test('should handle missing TITLE', () => {
            const header = {
                GAP: '5000',
                LANGUAGE: 'English'
            };

            const result = MetadataParser.parseMetadata(header);

            expect(result.title).toBe('');
            expect(result.language).toBe('English');
            expect(result.gapMinutes).toBe(0);
            expect(result.gapSeconds).toBe(5);
            expect(result.gapMilliseconds).toBe(0);
        });

        test('should handle missing LANGUAGE', () => {
            const header = {
                TITLE: 'Test Song',
                GAP: '5000'
            };

            const result = MetadataParser.parseMetadata(header);

            expect(result.title).toBe('Test Song');
            expect(result.language).toBe('');
            expect(result.gapMinutes).toBe(0);
            expect(result.gapSeconds).toBe(5);
            expect(result.gapMilliseconds).toBe(0);
        });

        test('should handle missing GAP', () => {
            const header = {
                TITLE: 'Test Song',
                LANGUAGE: 'French'
            };

            const result = MetadataParser.parseMetadata(header);

            expect(result.title).toBe('Test Song');
            expect(result.language).toBe('French');
            expect(result.gapMinutes).toBe(0);
            expect(result.gapSeconds).toBe(0);
            expect(result.gapMilliseconds).toBe(0);
        });

        test('should handle completely empty header', () => {
            const header = {};

            const result = MetadataParser.parseMetadata(header);

            expect(result.title).toBe('');
            expect(result.language).toBe('');
            expect(result.gapMinutes).toBe(0);
            expect(result.gapSeconds).toBe(0);
            expect(result.gapMilliseconds).toBe(0);
        });
    });

    describe('Return value structure', () => {
        test('should return exactly 5 properties', () => {
            const header = {
                TITLE: 'Test',
                LANGUAGE: 'EN',
                GAP: '1000'
            };

            const result = MetadataParser.parseMetadata(header);

            const keys = Object.keys(result);
            expect(keys).toHaveLength(5);
            expect(keys).toContain('title');
            expect(keys).toContain('language');
            expect(keys).toContain('gapMinutes');
            expect(keys).toContain('gapSeconds');
            expect(keys).toContain('gapMilliseconds');
        });

        test('should not include generic time component names', () => {
            const header = {
                TITLE: 'Test',
                GAP: '97048'
            };

            const result = MetadataParser.parseMetadata(header);

            expect(result.minutes).toBeUndefined();
            expect(result.seconds).toBeUndefined();
            expect(result.milliseconds).toBeUndefined();
        });

        test('should not include original header properties', () => {
            const header = {
                TITLE: 'Test',
                ARTIST: 'Artist',
                GAP: '1000',
                LANGUAGE: 'EN',
                BPM: '120'
            };

            const result = MetadataParser.parseMetadata(header);

            // Should not include ARTIST, BPM, etc.
            expect(result.ARTIST).toBeUndefined();
            expect(result.BPM).toBeUndefined();
            expect(result.TITLE).toBeUndefined();
            expect(result.LANGUAGE).toBeUndefined();
            expect(result.GAP).toBeUndefined();
        });
    });
});
