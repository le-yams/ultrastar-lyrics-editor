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
    },

    beatToTime(beat, bpm, gapMs = 0) {
        if (!bpm || bpm <= 0) return null;

        // Formula: time (in seconds) = (beat * 60 / BPM / 4) + GAP
        // Division by 4 because UltraStar uses quarter notes
        const timeInSeconds = (beat * 60 / bpm / 4) + (gapMs / 1000);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);

        return { minutes, seconds };
    },

    formatTime(minutes, seconds) {
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        return `${mm}:${ss}`;
    }
};
