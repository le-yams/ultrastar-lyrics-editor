// ============================================================================
// FILE MANAGEMENT - Parser and Generator
// ============================================================================
export const FileManager = {
    parseFile(content) {
        const lines = content.split(/\r?\n/);
        const metadata = {};
        const noteLines = [];

        lines.forEach(line => {
            if (line.trim().startsWith('#')) {
                const match = line.match(/#([^:]+):(.+)/);
                if (match) {
                    metadata[match[1]] = match[2];
                }
            } else if (line.trim() && !line.trim().startsWith('#')) {
                noteLines.push(line);
            }
        });

        return { metadata, noteLines };
    },

    generateFile(metadata, syncedLines) {
        const lines = [];

        // Add metadata
        Object.entries(metadata).forEach(([key, value]) => {
            if (key === 'GAP' && value === '0') {
                return; // Skip GAP if 0
            }
            lines.push(`#${key}:${value}`);
        });

        // Add empty line after metadata
        lines.push('');

        // Add synced lines
        syncedLines.forEach(item => {
            lines.push(item.line);
        });

        return lines.join('\n');
    },

    extractMetadata(content, key, defaultValue = '') {
        const match = content.match(new RegExp(`#${key}:(.+)`, 'm'));
        return match ? match[1].trim() : defaultValue;
    }
};
