import { FileManager } from '../src/fileManager.js';
import { UltraStarParser } from '../src/ultraStarParser.js';
const END_MARKER = 'E';
describe('FileManager - parseFile', () => {
    test('parses complete valid file', () => {
        const content = `#TITLE:Test Song
#ARTIST:Test Artist
#LANGUAGE:English
#GAP:5000
: 10 5 3 Hello
: 15 5 3 World
E`;
        const result = FileManager.parseFile(content, UltraStarParser, END_MARKER);
        expect(result.header.TITLE).toBe('Test Song');
        expect(result.header.ARTIST).toBe('Test Artist');
        expect(result.header.LANGUAGE).toBe('English');
        expect(result.header.GAP).toBe('5000');
        expect(result.noteLines).toHaveLength(3);
    });
    test('extracts note lines correctly', () => {
        const content = `#TITLE:Song
: 10 5 3 Hello
- 15
: 20 5 3 World
E`;
        const result = FileManager.parseFile(content, UltraStarParser, END_MARKER);
        expect(result.noteLines).toEqual([': 10 5 3 Hello', '- 15', ': 20 5 3 World', 'E']);
    });
    test('handles missing metadata', () => {
        const content = `: 10 5 3 Hello
E`;
        const result = FileManager.parseFile(content, UltraStarParser, END_MARKER);
        expect(Object.keys(result.header)).toHaveLength(0);
        expect(result.noteLines).toHaveLength(2);
    });
    test('handles Windows line endings', () => {
        const content = "#TITLE:Song\r\n: 10 5 3 Hello\r\nE";
        const result = FileManager.parseFile(content, UltraStarParser, END_MARKER);
        expect(result.header.TITLE).toBe('Song');
        expect(result.noteLines).toHaveLength(2);
    });
    test('ignores empty lines', () => {
        const content = `#TITLE:Song
: 10 5 3 Hello
E`;
        const result = FileManager.parseFile(content, UltraStarParser, END_MARKER);
        expect(result.noteLines).toHaveLength(2);
    });
    test('parses file with all note types including rap golden', () => {
        const content = `#TITLE:Test Song
#ARTIST:Test Artist
: 10 5 3 Normal
* 20 5 3 Golden
F 30 5 3 Freestyle
R 40 5 3 Rap
G 50 5 3 RapGolden
- 60
E`;
        const result = FileManager.parseFile(content, UltraStarParser, END_MARKER);
        expect(result.header.TITLE).toBe('Test Song');
        expect(result.noteLines).toHaveLength(7);
        expect(result.noteLines[0]).toBe(': 10 5 3 Normal');
        expect(result.noteLines[1]).toBe('* 20 5 3 Golden');
        expect(result.noteLines[2]).toBe('F 30 5 3 Freestyle');
        expect(result.noteLines[3]).toBe('R 40 5 3 Rap');
        expect(result.noteLines[4]).toBe('G 50 5 3 RapGolden');
        expect(result.noteLines[5]).toBe('- 60');
        expect(result.noteLines[6]).toBe(END_MARKER);
    });
});
describe('FileManager - generateFile', () => {
    test('generates complete file', () => {
        const headerInfo = {
            TITLE: 'Test Song',
            ARTIST: 'Test Artist',
            LANGUAGE: 'English'
        };
        const metadata = {
            title: 'Test Song',
            language: 'English',
            gapMinutes: 0,
            gapSeconds: 0,
            gapMilliseconds: 0
        };
        const syncedLines = [
            { line: ': 10 5 3 Hello' },
            { line: ': 15 5 3 World' },
            { line: 'E' }
        ];
        const result = FileManager.generateFile(headerInfo, metadata, syncedLines);
        expect(result).toContain('#TITLE:Test Song');
        expect(result).toContain('#ARTIST:Test Artist');
        expect(result).toContain('#LANGUAGE:English');
        expect(result).toContain(': 10 5 3 Hello');
        expect(result).toContain('E');
    });
    test('does not include GAP if value is 0', () => {
        const headerInfo = {
            TITLE: 'Song',
            GAP: '0'
        };
        const metadata = {
            title: 'Song',
            language: '',
            gapMinutes: 0,
            gapSeconds: 0,
            gapMilliseconds: 0
        };
        const syncedLines = [{ line: 'E' }];
        const result = FileManager.generateFile(headerInfo, metadata, syncedLines);
        expect(result).not.toContain('#GAP');
    });
    test('includes GAP if value is not 0', () => {
        const headerInfo = {
            TITLE: 'Song',
            GAP: '5000'
        };
        const metadata = {
            title: 'Song',
            language: '',
            gapMinutes: 0,
            gapSeconds: 5,
            gapMilliseconds: 0
        };
        const syncedLines = [{ line: 'E' }];
        const result = FileManager.generateFile(headerInfo, metadata, syncedLines);
        expect(result).toContain('#GAP:5000');
    });
    test('adds GAP if not in original header but set to non-zero', () => {
        const headerInfo = {
            TITLE: 'Song'
            // No GAP in original
        };
        const metadata = {
            title: 'Song',
            language: '',
            gapMinutes: 0,
            gapSeconds: 5,
            gapMilliseconds: 0
        };
        const syncedLines = [{ line: 'E' }];
        const result = FileManager.generateFile(headerInfo, metadata, syncedLines);
        expect(result).toContain('#GAP:5000');
    });
    test('respects edited metadata values', () => {
        const headerInfo = {
            TITLE: 'Original Title',
            LANGUAGE: 'Original Language'
        };
        const metadata = {
            title: 'Edited Title',
            language: 'Edited Language',
            gapMinutes: 0,
            gapSeconds: 0,
            gapMilliseconds: 0
        };
        const syncedLines = [{ line: 'E' }];
        const result = FileManager.generateFile(headerInfo, metadata, syncedLines);
        expect(result).toContain('#TITLE:Edited Title');
        expect(result).toContain('#LANGUAGE:Edited Language');
        expect(result).not.toContain('Original Title');
        expect(result).not.toContain('Original Language');
    });
});
describe('FileManager - extractMetadata', () => {
    test('extracts existing metadata', () => {
        const content = '#TITLE:Test Song\n#ARTIST:Artist';
        expect(FileManager.extractMetadata(content, 'TITLE')).toBe('Test Song');
        expect(FileManager.extractMetadata(content, 'ARTIST')).toBe('Artist');
    });
    test('returns default value for missing metadata', () => {
        const content = '#TITLE:Song';
        expect(FileManager.extractMetadata(content, 'ARTIST', 'Unknown')).toBe('Unknown');
    });
    test('returns empty string as default if not specified', () => {
        const content = '#TITLE:Song';
        expect(FileManager.extractMetadata(content, 'ARTIST')).toBe('');
    });
    test('trims whitespace from values', () => {
        const content = '#TITLE:  Song With Spaces  ';
        expect(FileManager.extractMetadata(content, 'TITLE')).toBe('Song With Spaces');
    });
});
