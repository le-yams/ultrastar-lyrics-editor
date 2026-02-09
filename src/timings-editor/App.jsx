import { useState, useMemo, useCallback } from 'react';
import { ULTRASTAR, logger } from '../lyrics-editor/constants';
import { UltraStarParser } from '../lyrics-editor/ultraStarParser';
import { TimeConverter } from '../lyrics-editor/timeConverter';
import { FileManager } from '../lyrics-editor/fileManager';
import { TimingsEditor } from './timings-editor';

// ============================================================================
// SVG ICON COMPONENTS
// ============================================================================
const Upload = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const Download = ({ className }) => (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================
const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    const toggle = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        document.documentElement.classList.toggle('dark', newIsDark);
        localStorage.theme = newIsDark ? 'dark' : 'light';
    };

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg bg-theme-toggle-bg hover:bg-theme-toggle-hover transition-colors text-xl"
            aria-label="Toggle theme"
            type="button"
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
};

// ============================================================================
// NOTIFICATION COMPONENT
// ============================================================================
const NotificationToast = ({ notification }) => {
    if (!notification) return null;

    const typeStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    const typeIcons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    return (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${typeStyles[notification.type] || typeStyles.info}`}>
            <div className="flex items-center gap-2">
                <span className="text-lg">{typeIcons[notification.type] || typeIcons.info}</span>
                <span>{notification.message}</span>
            </div>
        </div>
    );
};

// ============================================================================
// FILE UPLOAD COMPONENT
// ============================================================================
const FileUploadZone = ({ onFileLoad, fileInfo, isDragging, onDragOver, onDragLeave, onDrop }) => {
    return (
        <label
            className={`border-2 border-dashed rounded-lg transition-colors cursor-pointer flex flex-col items-center justify-center p-4 min-h-[150px] ${
                isDragging ? 'border-purple-500 bg-theme-drag-bg' : 'border-theme-border-accent bg-theme-card'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="text-theme-accent mb-2">
                <Upload />
            </div>
            <span className="text-sm font-medium text-theme-text mb-2">
                Load UltraStar File
            </span>
            <span className="text-xs text-gray-500 mb-2">
                Click or drag and drop
            </span>
            <input
                type="file"
                accept={ULTRASTAR.FILE_EXTENSION}
                onChange={onFileLoad}
                className="hidden"
            />
            {fileInfo.lineCount > 0 ? (
                <div className="text-center">
                    {fileInfo.title && (
                        <div className="text-sm font-semibold text-theme-accent">
                            {fileInfo.title}
                        </div>
                    )}
                    {fileInfo.artist && (
                        <div className="text-sm text-theme-accent">
                            {fileInfo.artist}
                        </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                        {fileInfo.lineCount} lines loaded
                    </div>
                </div>
            ) : (
                <span className="text-xs text-gray-500">No file</span>
            )}
        </label>
    );
};

// ============================================================================
// NOTES TIMINGS DISPLAY COMPONENT
// ============================================================================
const NotesTimingsDisplay = ({ noteLines, offsets, onOffsetChange, bpm, gapMs }) => {
    if (noteLines.length === 0) return null;

    // Compute cumulative offsets for each line
    const cumulativeOffsets = useMemo(() => {
        let cumulative = 0;
        return noteLines.map((_, index) => {
            if (offsets[index] !== undefined) {
                cumulative += offsets[index];
            }
            return cumulative;
        });
    }, [noteLines, offsets]);

    // Detect first note of each phrase for timing display
    const isFirstNoteOfPhrase = (index) => {
        if (!UltraStarParser.isNoteLine(noteLines[index])) return false;
        if (index === 0) return true;
        for (let i = index - 1; i >= 0; i--) {
            if (UltraStarParser.isBreakLine(noteLines[i])) return true;
            if (UltraStarParser.isNoteLine(noteLines[i])) return false;
        }
        return false;
    };

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-theme-title mb-3">
                Notes and Timings
            </h2>
            <div className="bg-theme-surface rounded-lg p-4 max-h-[600px] overflow-y-auto">
                {noteLines.map((line, index) => {
                    if (UltraStarParser.isBreakLine(line)) {
                        const position = TimingsEditor.parseBreakPosition(line);
                        const adjustedPosition = position !== null ? position + cumulativeOffsets[index] : null;
                        return (
                            <div key={index} className="flex items-center gap-2 py-1 border-t border-theme-border my-1">
                                <span className="w-20 flex-shrink-0"></span>
                                <span className="text-xs text-gray-400 w-16 flex-shrink-0">
                                    break {adjustedPosition !== null ? adjustedPosition : ''}
                                </span>
                                <span className="flex-1"></span>
                                <div className="w-20 flex-shrink-0">
                                    <input
                                        type="number"
                                        value={offsets[index] !== undefined ? offsets[index] : ''}
                                        onChange={(e) => onOffsetChange(index, e.target.value)}
                                        className="w-full px-1 py-0.5 border border-theme-border rounded text-xs text-center bg-theme-input-bg text-theme-input-text"
                                        placeholder="0"
                                    />
                                </div>
                                <span className="w-16 flex-shrink-0 text-xs text-center text-theme-text-secondary">
                                    {cumulativeOffsets[index] !== 0 ? (
                                        <span className={cumulativeOffsets[index] > 0 ? 'text-green-500' : 'text-red-500'}>
                                            {cumulativeOffsets[index] > 0 ? '+' : ''}{cumulativeOffsets[index]}
                                        </span>
                                    ) : null}
                                </span>
                            </div>
                        );
                    }

                    if (UltraStarParser.isEndLine(line)) {
                        return (
                            <div key={index} className="text-theme-text-secondary font-bold text-sm py-1 border-t border-theme-border mt-1">
                                {line}
                            </div>
                        );
                    }

                    if (UltraStarParser.isNoteLine(line)) {
                        const parsed = UltraStarParser.parseNoteLine(line);
                        if (!parsed) return null;

                        const adjustedStart = parseInt(parsed.start, 10) + cumulativeOffsets[index];
                        const isFirstNote = isFirstNoteOfPhrase(index);
                        const timing = isFirstNote && bpm
                            ? TimeConverter.beatToTime(adjustedStart, bpm, gapMs)
                            : null;
                        const hasOffset = cumulativeOffsets[index] !== 0;

                        return (
                            <div key={index} className="flex items-center gap-2 py-1">
                                {timing ? (
                                    <span className={`text-xs font-mono w-20 flex-shrink-0 font-semibold ${hasOffset ? 'text-yellow-500' : 'text-theme-accent'}`}>
                                        {TimeConverter.formatTime(timing.minutes, timing.seconds, timing.milliseconds)}
                                    </span>
                                ) : (
                                    <span className="w-20 flex-shrink-0"></span>
                                )}
                                <span className={`text-xs w-16 flex-shrink-0 ${hasOffset ? 'text-yellow-500' : 'text-gray-500'}`}>
                                    {parsed.type} {adjustedStart}
                                </span>
                                <span className="text-xs text-theme-text flex-1 truncate" title={parsed.text}>
                                    {parsed.text}
                                </span>
                                <div className="w-20 flex-shrink-0">
                                    <input
                                        type="number"
                                        value={offsets[index] !== undefined ? offsets[index] : ''}
                                        onChange={(e) => onOffsetChange(index, e.target.value)}
                                        className="w-full px-1 py-0.5 border border-theme-border rounded text-xs text-center bg-theme-input-bg text-theme-input-text"
                                        placeholder="0"
                                    />
                                </div>
                                <span className="w-16 flex-shrink-0 text-xs text-center text-theme-text-secondary">
                                    {cumulativeOffsets[index] !== 0 ? (
                                        <span className={cumulativeOffsets[index] > 0 ? 'text-green-500' : 'text-red-500'}>
                                            {cumulativeOffsets[index] > 0 ? '+' : ''}{cumulativeOffsets[index]}
                                        </span>
                                    ) : null}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="text-theme-text-secondary text-sm py-1">
                            {line}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function UltraStarTimingsEditor() {
    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================
    const [fileData, setFileData] = useState({
        noteLines: [],
        headerInfo: {}
    });

    const [offsets, setOffsets] = useState({});

    const [ui, setUI] = useState({
        isDragging: false
    });

    const [notification, setNotification] = useState(null);

    // ========================================================================
    // DERIVED STATE
    // ========================================================================
    const fileInfo = useMemo(() => ({
        lineCount: fileData.noteLines.length,
        title: fileData.headerInfo.TITLE || '',
        artist: fileData.headerInfo.ARTIST || ''
    }), [fileData.noteLines.length, fileData.headerInfo.TITLE, fileData.headerInfo.ARTIST]);

    const bpm = useMemo(() =>
        fileData.headerInfo.BPM ? parseFloat(fileData.headerInfo.BPM) : null,
        [fileData.headerInfo.BPM]
    );

    const gapMs = useMemo(() =>
        fileData.headerInfo.GAP ? parseFloat(fileData.headerInfo.GAP) : 0,
        [fileData.headerInfo.GAP]
    );

    const hasOffsets = useMemo(() =>
        Object.values(offsets).some(v => v !== 0),
        [offsets]
    );

    // ========================================================================
    // NOTIFICATION HANDLER
    // ========================================================================
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // ========================================================================
    // FILE PARSING
    // ========================================================================
    const parseUltraStarFile = useCallback((content) => {
        try {
            const { header, noteLines } = FileManager.parseFile(content, UltraStarParser, ULTRASTAR.END_MARKER);

            if (noteLines.length === 0) {
                showNotification('No valid note lines found in file', 'error');
                return;
            }

            setFileData({
                noteLines,
                headerInfo: header
            });

            setOffsets({});

            showNotification(`File loaded: ${noteLines.length} lines`, 'success');
        } catch (error) {
            logger.error('Error parsing UltraStar file:', error);
            showNotification('Error parsing UltraStar file: ' + error.message, 'error');
        }
    }, [showNotification]);

    // ========================================================================
    // FILE UPLOAD HANDLERS
    // ========================================================================
    const handleFileRead = useCallback((file) => {
        if (!file.name.endsWith(ULTRASTAR.FILE_EXTENSION)) {
            showNotification('Please select a .txt file', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => parseUltraStarFile(event.target.result);
        reader.onerror = () => showNotification('Error reading file', 'error');
        reader.readAsText(file);
    }, [parseUltraStarFile, showNotification]);

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) handleFileRead(file);
    }, [handleFileRead]);

    const preventDefaultAndStopPropagation = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragOver = useCallback((e) => {
        preventDefaultAndStopPropagation(e);
        setUI(prev => ({ ...prev, isDragging: true }));
    }, [preventDefaultAndStopPropagation]);

    const handleDragLeave = useCallback((e) => {
        preventDefaultAndStopPropagation(e);
        setUI(prev => ({ ...prev, isDragging: false }));
    }, [preventDefaultAndStopPropagation]);

    const handleDrop = useCallback((e) => {
        preventDefaultAndStopPropagation(e);
        setUI(prev => ({ ...prev, isDragging: false }));
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFileRead(files[0]);
    }, [preventDefaultAndStopPropagation, handleFileRead]);

    // ========================================================================
    // OFFSET HANDLER
    // ========================================================================
    const handleOffsetChange = useCallback((index, value) => {
        const numValue = value === '' ? undefined : parseInt(value, 10);
        setOffsets(prev => {
            const next = { ...prev };
            if (numValue === undefined || isNaN(numValue)) {
                delete next[index];
            } else {
                next[index] = numValue;
            }
            return next;
        });
    }, []);

    // ========================================================================
    // OUTPUT GENERATION
    // ========================================================================
    const generateOutput = useCallback(() => {
        try {
            const modifiedLines = TimingsEditor.applyBeatOffsets(fileData.noteLines, offsets);
            const syncedLines = modifiedLines.map(line => ({ line }));

            // Build metadata from header for generateFile
            const metadata = {
                title: fileData.headerInfo.TITLE || '',
                language: fileData.headerInfo.LANGUAGE || '',
                gapMinutes: 0,
                gapSeconds: 0,
                gapMilliseconds: 0
            };

            if (fileData.headerInfo.GAP) {
                const gapValue = parseFloat(fileData.headerInfo.GAP);
                const components = TimeConverter.msToComponents(gapValue);
                metadata.gapMinutes = components.minutes;
                metadata.gapSeconds = components.seconds;
                metadata.gapMilliseconds = components.milliseconds;
            }

            return FileManager.generateFile(fileData.headerInfo, metadata, syncedLines);
        } catch (error) {
            logger.error('Error generating file:', error);
            showNotification('Error generating file: ' + error.message, 'error');
            throw error;
        }
    }, [fileData, offsets, showNotification]);

    const generateAndDownload = useCallback(() => {
        try {
            const output = generateOutput();
            const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileData.headerInfo.TITLE || 'song'}_adjusted.txt`;
            link.click();
            window.URL.revokeObjectURL(url);
            showNotification('File generated and downloaded successfully!', 'success');
        } catch (error) {
            // Error already logged and notified in generateOutput
        }
    }, [generateOutput, fileData.headerInfo.TITLE, showNotification]);

    const generateAndCopy = useCallback(() => {
        try {
            const output = generateOutput();
            navigator.clipboard.writeText(output)
                .then(() => showNotification('File generated and copied to clipboard!', 'success'))
                .catch(() => showNotification('Failed to copy to clipboard', 'error'));
        } catch (error) {
            // Error already logged and notified in generateOutput
        }
    }, [generateOutput, showNotification]);

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-theme-page-from to-theme-page-to">
            <NotificationToast notification={notification} />
            <div className="w-full max-w-6xl mx-auto p-6">
                <div className="bg-theme-card rounded-lg shadow-theme p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <a href="/" className="text-theme-accent hover:text-theme-accent-hover transition" aria-label="Back to home" title="Back to UltraStar Tools">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </a>
                            <h1 className="text-3xl font-bold text-theme-title">
                                Timings Editor
                            </h1>
                        </div>
                        <ThemeToggle />
                    </div>

                    <div className="mb-6 bg-theme-info-bg rounded-lg p-4">
                        <h3 className="font-semibold text-theme-info-title mb-2">📋 Instructions</h3>
                        <ol className="text-sm text-theme-info-text space-y-1 list-decimal list-inside">
                            <li>Load your UltraStar file</li>
                            <li>Enter beat offsets on specific notes to shift timings</li>
                            <li>Offsets accumulate: each offset applies to all subsequent notes</li>
                            <li>Generate and download or copy the adjusted file</li>
                        </ol>
                    </div>

                    <div className="mb-6">
                        <FileUploadZone
                            onFileLoad={handleFileUpload}
                            fileInfo={fileInfo}
                            isDragging={ui.isDragging}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        />
                    </div>

                    {fileData.noteLines.length > 0 && (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="text-sm text-theme-text-secondary">
                                    <span className="font-medium">BPM:</span> {bpm || 'N/A'}
                                    <span className="ml-4 font-medium">GAP:</span> {gapMs} ms
                                </div>
                                {hasOffsets && (
                                    <button
                                        type="button"
                                        onClick={() => setOffsets({})}
                                        className="text-xs text-red-500 hover:text-red-600 transition"
                                    >
                                        Clear all offsets
                                    </button>
                                )}
                            </div>

                            <div className="mb-3 flex items-center gap-4 text-xs text-theme-text-secondary px-1">
                                <span className="w-20 flex-shrink-0">Timing</span>
                                <span className="w-16 flex-shrink-0">Beat</span>
                                <span className="flex-1">Text</span>
                                <span className="w-20 flex-shrink-0 text-center">Offset</span>
                                <span className="w-16 flex-shrink-0 text-center">Cumul</span>
                            </div>

                            <NotesTimingsDisplay
                                noteLines={fileData.noteLines}
                                offsets={offsets}
                                onOffsetChange={handleOffsetChange}
                                bpm={bpm}
                                gapMs={gapMs}
                            />
                        </>
                    )}

                    {fileData.noteLines.length > 0 && (
                        <div className="text-center mb-6">
                            <div className="flex gap-4 justify-center">
                                <button
                                    type="button"
                                    onClick={generateAndDownload}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Generate and download
                                </button>
                                <button
                                    type="button"
                                    onClick={generateAndCopy}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center gap-2"
                                >
                                    📋
                                    Generate and copy to clipboard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
