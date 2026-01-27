// ============================================================================
// CONSTANTS
// ============================================================================
export const ULTRASTAR = {
    NOTE_FIELD_COUNT: 4,
    NOTE_REGEX: /^[:*FRG]/,
    BREAK_REGEX: /^-/,
    END_MARKER: 'E',
    HEADER_PREFIX: '#',
    FILE_EXTENSION: '.txt',
    TIME: {
        MS_PER_MINUTE: 60000,
        MS_PER_SECOND: 1000,
        MAX_SECONDS: 59,
        MAX_MILLISECONDS: 999,
        DEFAULT_GAP: 0
    },
    SYLLABLE_SEPARATOR: '|'
};

export const DEBUG = false;
export const logger = {
    log: (...args) => DEBUG && console.log(...args),
    error: (...args) => console.error(...args)
};
