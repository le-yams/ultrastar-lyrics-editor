import { ULTRASTAR } from './constants.js';

// ============================================================================
// UTILITY FUNCTIONS - UltraStar Parser
// ============================================================================
export const UltraStarParser = {
    findSpacePositions(line, count) {
        const positions = [];
        for (let i = 0; i < line.length && positions.length < count; i++) {
            if (line[i] === ' ') {
                positions.push(i);
            }
        }
        return positions;
    },

    parseNoteLine(line) {
        const spacePositions = this.findSpacePositions(line, ULTRASTAR.NOTE_FIELD_COUNT);

        if (spacePositions.length < ULTRASTAR.NOTE_FIELD_COUNT) {
            return null;
        }

        return {
            type: line.substring(0, spacePositions[0]),
            start: line.substring(spacePositions[0] + 1, spacePositions[1]),
            duration: line.substring(spacePositions[1] + 1, spacePositions[2]),
            pitch: line.substring(spacePositions[2] + 1, spacePositions[3]),
            text: line.substring(spacePositions[3] + 1)
        };
    },

    buildNoteLine(fields) {
        return `${fields.type} ${fields.start} ${fields.duration} ${fields.pitch} ${fields.text}`;
    },

    isNoteLine(line) {
        return ULTRASTAR.NOTE_REGEX.test(line);
    },

    isBreakLine(line) {
        return ULTRASTAR.BREAK_REGEX.test(line);
    },

    isEndLine(line) {
        return line.trim() === ULTRASTAR.END_MARKER;
    },

    isHeaderLine(line) {
        return line.trim().startsWith(ULTRASTAR.HEADER_PREFIX);
    }
};
