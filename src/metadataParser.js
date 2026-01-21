import { TimeConverter } from './timeConverter.js';

// ============================================================================
// METADATA PARSING - Utilities for parsing UltraStar metadata
// ============================================================================

/**
 * Parses GAP value from header and converts it to component form
 * @param {Object} header - The parsed header object
 * @returns {Object} Object with gapMinutes, gapSeconds, gapMilliseconds
 */
export function parseGapFromHeader(header) {
    const gapValue = parseInt(header.GAP || '0', 10);
    const gapComponents = TimeConverter.msToComponents(gapValue);

    return {
        gapMinutes: gapComponents.minutes,
        gapSeconds: gapComponents.seconds,
        gapMilliseconds: gapComponents.milliseconds
    };
}

/**
 * Parses all metadata from header
 * @param {Object} header - The parsed header object
 * @returns {Object} Metadata object with title, language, and gap components
 */
export function parseMetadata(header) {
    const gapData = parseGapFromHeader(header);

    return {
        title: header.TITLE || '',
        language: header.LANGUAGE || '',
        ...gapData
    };
}

export const MetadataParser = {
    parseGapFromHeader,
    parseMetadata
};
