import { UltraStarParser } from '../lyrics-editor/ultraStarParser.js';

// ============================================================================
// UTILITY FUNCTIONS - Timings Editor
// ============================================================================
export const TimingsEditor = {
    parseBreakPosition(line) {
        if (!UltraStarParser.isBreakLine(line)) return null;
        const parts = line.split(' ');
        if (parts.length < 2) return null;
        return parseInt(parts[1], 10);
    },

    buildBreakLine(position) {
        return `- ${position}`;
    },

    applyBeatOffsets(noteLines, offsets) {
        let cumulativeOffset = 0;

        return noteLines.map((line, index) => {
            if (offsets[index] !== undefined) {
                cumulativeOffset += offsets[index];
            }

            if (cumulativeOffset === 0) {
                return line;
            }

            if (UltraStarParser.isNoteLine(line)) {
                const parsed = UltraStarParser.parseNoteLine(line);
                if (parsed) {
                    const newStart = parseInt(parsed.start, 10) + cumulativeOffset;
                    return UltraStarParser.buildNoteLine({
                        ...parsed,
                        start: String(newStart)
                    });
                }
            }

            if (UltraStarParser.isBreakLine(line)) {
                const position = this.parseBreakPosition(line);
                if (position !== null) {
                    return this.buildBreakLine(position + cumulativeOffset);
                }
            }

            return line;
        });
    }
};
