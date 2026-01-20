import { FileManager } from '../src/fileManager.js';

describe('FileManager - parseFile', () => {
    test('parses complete valid file', () => {
        const content = `#TITLE:Test Song
#ARTIST:Test Artist
#LANGUAGE:English
#GAP:5000
: 10 5 3 Hello
: 15 5 3 World
E`;
        const result = FileManager.parseFile(content);

        expect(result.metadata.TITLE).toBe('Test Song');
        expect(result.metadata.ARTIST).toBe('Test Artist');
        expect(result.metadata.LANGUAGE).toBe('English');
        expect(result.metadata.GAP).toBe('5000');
        expect(result.noteLines).toHaveLength(3);
    });

    test('extracts note lines correctly', () => {
        const content = `#TITLE:Song
: 10 5 3 Hello
- 15
: 20 5 3 World
E`;
        const result = FileManager.parseFile(content);

        expect(result.noteLines).toEqual([': 10 5 3 Hello', '- 15', ': 20 5 3 World', 'E']);
    });

    test('handles missing metadata', () => {
        const content = `: 10 5 3 Hello
E`;
        const result = FileManager.parseFile(content);

        expect(Object.keys(result.metadata)).toHaveLength(0);
        expect(result.noteLines).toHaveLength(2);
    });

    test('handles Windows line endings', () => {
        const content = "#TITLE:Song\r\n: 10 5 3 Hello\r\nE";
        const result = FileManager.parseFile(content);

        expect(result.metadata.TITLE).toBe('Song');
        expect(result.noteLines).toHaveLength(2);
    });

    test('ignores empty lines', () => {
        const content = `#TITLE:Song

: 10 5 3 Hello

E`;
        const result = FileManager.parseFile(content);

        expect(result.noteLines).toHaveLength(2);
    });
});

describe('FileManager - generateFile', () => {
    test('generates complete file', () => {
        const metadata = {
            TITLE: 'Test Song',
            ARTIST: 'Test Artist',
            LANGUAGE: 'English'
        };
        const syncedLines = [
            { line: ': 10 5 3 Hello' },
            { line: ': 15 5 3 World' },
            { line: 'E' }
        ];

        const result = FileManager.generateFile(metadata, syncedLines);

        expect(result).toContain('#TITLE:Test Song');
        expect(result).toContain('#ARTIST:Test Artist');
        expect(result).toContain('#LANGUAGE:English');
        expect(result).toContain(': 10 5 3 Hello');
        expect(result).toContain('E');
    });

    test('does not include GAP if value is 0', () => {
        const metadata = {
            TITLE: 'Song',
            GAP: '0'
        };
        const syncedLines = [{ line: 'E' }];

        const result = FileManager.generateFile(metadata, syncedLines);

        expect(result).not.toContain('#GAP');
    });

    test('includes GAP if value is not 0', () => {
        const metadata = {
            TITLE: 'Song',
            GAP: '5000'
        };
        const syncedLines = [{ line: 'E' }];

        const result = FileManager.generateFile(metadata, syncedLines);

        expect(result).toContain('#GAP:5000');
    });

    test('includes empty line after metadata', () => {
        const metadata = { TITLE: 'Song' };
        const syncedLines = [{ line: ': 10 5 3 Hello' }];

        const result = FileManager.generateFile(metadata, syncedLines);
        const lines = result.split('\n');

        expect(lines[1]).toBe('');
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
