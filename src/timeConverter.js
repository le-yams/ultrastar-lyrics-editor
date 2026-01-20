import { ULTRASTAR } from './constants.js';

// ============================================================================
// UTILITY FUNCTIONS - Time Converter
// ============================================================================
export const TimeConverter = {
    msToComponents(totalMs) {
        const minutes = Math.floor(totalMs / ULTRASTAR.TIME.MS_PER_MINUTE);
        const seconds = Math.floor((totalMs % ULTRASTAR.TIME.MS_PER_MINUTE) / ULTRASTAR.TIME.MS_PER_SECOND);
        const milliseconds = totalMs % ULTRASTAR.TIME.MS_PER_SECOND;
        return { minutes, seconds, milliseconds };
    },

    componentsToMs(minutes, seconds, milliseconds) {
        return (minutes * ULTRASTAR.TIME.MS_PER_MINUTE) +
               (seconds * ULTRASTAR.TIME.MS_PER_SECOND) +
               milliseconds;
    },

    validateComponents(minutes, seconds, milliseconds) {
        return minutes >= 0 &&
               seconds >= 0 && seconds <= ULTRASTAR.TIME.MAX_SECONDS &&
               milliseconds >= 0 && milliseconds <= ULTRASTAR.TIME.MAX_MILLISECONDS;
    }
};
