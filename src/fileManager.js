import { TimeConverter } from './timeConverter.js';
// ============================================================================
// FILE MANAGEMENT - Parser and Generator
// ============================================================================
/**
 * Parses an UltraStar file content
 * @param {string} content - The file content
 * @param {Object} ultraStarParser - UltraStarParser object with utility methods
 * @param {string} endMarker - The end marker string (typically 'E')
 * @returns {Object} Object with header and noteLines
 */
export function parseFile(content, ultraStarParser, endMarker) {
    const lines = content.split('\n');
    const header = {};
    const noteLines = [];
    lines.forEach(line => {
        const cleanLine = line.replace(/[\r\n]+$/, '');
        const trimmedLine = cleanLine.trim();
        if (ultraStarParser.isHeaderLine(trimmedLine)) {
            const [key, ...valueParts] = trimmedLine.substring(1).split(':');
            header[key.trim()] = valueParts.join(':').trim();
        } else if (ultraStarParser.isNoteLine(trimmedLine) || ultraStarParser.isBreakLine(trimmedLine) || trimmedLine === endMarker) {
            if (ultraStarParser.isNoteLine(cleanLine) || ultraStarParser.isBreakLine(cleanLine) || cleanLine === endMarker) {
                noteLines.push(cleanLine);
            }
        }
    });
    return { header, noteLines };
}
/**
 * Generates an UltraStar file content
 * @param {Object} headerInfo - Original header information
 * @param {Object} metadata - Current metadata state (title, language, gap components)
 * @param {Array} syncedLines - Array of synced line objects
 * @returns {string} The generated file content
 */
export function generateFile(headerInfo, metadata, syncedLines) {
    let output = '';
    const totalGapMs = TimeConverter.componentsToMs(
        metadata.gapMinutes,
        metadata.gapSeconds,
        metadata.gapMilliseconds
    );
    // Generate metadata lines
    Object.keys(headerInfo).forEach(key => {
        if (key === 'LANGUAGE') {
            output += `#${key}:${metadata.language}\n`;
        } else if (key === 'TITLE') {
            output += `#${key}:${metadata.title}\n`;
        } else if (key === 'GAP') {
            if (totalGapMs !== 0) {
                output += `#${key}:${totalGapMs}\n`;
            }
        } else {
            output += `#${key}:${headerInfo[key]}\n`;
        }
    });
    // Add GAP if it wasn't in original header but is set to non-zero
    if (!headerInfo.GAP && totalGapMs !== 0) {
        output += `#GAP:${totalGapMs}\n`;
    }
    // Add synced lines
    syncedLines.forEach(item => {
        output += item.line + '\n';
    });
    return output;
}
/**
 * Extracts a specific metadata value from file content
 * @param {string} content - The file content
 * @param {string} key - The metadata key to extract
 * @param {string} defaultValue - Default value if not found
 * @returns {string} The extracted value or default
 */
export function extractMetadata(content, key, defaultValue = '') {
    const match = content.match(new RegExp(`#${key}:(.+)`, 'm'));
    return match ? match[1].trim() : defaultValue;
}
export const FileManager = {
    parseFile,
    generateFile,
    extractMetadata
};
