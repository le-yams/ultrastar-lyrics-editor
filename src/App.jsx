import { useState, useMemo, useCallback } from 'react';
import { ULTRASTAR, logger } from './constants';
import { UltraStarParser } from './ultraStarParser';
import { TimeConverter } from './timeConverter';
import { LyricsProcessor } from './lyricsProcessor';
import { LyricsSynchronizer } from './lyricsSynchronizer';
import { MetadataParser } from './metadataParser';
import { FileManager } from './fileManager';

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

const HelpIcon = ({ className }) => (
    <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

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
                isDragging ? 'border-purple-500 bg-purple-100' : 'border-purple-300 bg-white'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="text-purple-500 mb-2">
                <Upload />
            </div>
            <span className="text-sm font-medium text-gray-700 mb-2">
                Load Original UltraStar File
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
                        <div className="text-sm font-semibold text-purple-700">
                            {fileInfo.title}
                        </div>
                    )}
                    {fileInfo.artist && (
                        <div className="text-sm text-purple-600">
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
// LYRICS EDITOR COMPONENT
// ============================================================================
const LyricsEditor = ({ lyrics, onChange, onLoadFile, onLoadOriginal, hasOriginalFile }) => {
    return (
        <div className="border-2 border-purple-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                        New lyrics
                    </label>
                    <div className="relative group">
                        <button
                            type="button"
                            className="text-purple-500 hover:text-purple-700 transition focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                            aria-label="Help"
                        >
                            <HelpIcon className="w-4 h-4" />
                        </button>
                        <div className="absolute left-0 top-6 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-10 shadow-lg">
                            <p className="font-semibold mb-2">📝 How synchronization works:</p>
                            <ul className="space-y-1 mb-2">
                                <li>• Each line is synced with original timings</li>
                                <li>• Lines are split into syllables</li>
                                <li>• Each syllable gets one note</li>
                            </ul>
                            <p className="font-semibold mb-1">🔤 Syllable separator:</p>
                            <p className="mb-1">Use <span className="font-mono bg-gray-700 px-1 rounded">{ULTRASTAR.SYLLABLE_SEPARATOR}</span> to split words into syllables</p>
                            <p className="italic text-gray-300">Example: hel|lo wor|ld</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onLoadOriginal}
                        disabled={!hasOriginalFile}
                        className={`px-3 py-1 rounded text-xs transition ${
                            !hasOriginalFile
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title="Load original lyrics with syllable separators"
                    >
                        📄 Load original
                    </button>
                    <label className="cursor-pointer bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 transition">
                        📁 Load file
                        <input
                            type="file"
                            accept={ULTRASTAR.FILE_EXTENSION}
                            onChange={onLoadFile}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>
            <textarea
                className="w-full h-32 p-2 border border-gray-300 rounded text-sm"
                placeholder="Paste your new lyrics here or load a file..."
                value={lyrics}
                onChange={onChange}
            />
        </div>
    );
};

// ============================================================================
// METADATA EDITOR COMPONENT
// ============================================================================
const MetadataEditor = ({ title, language, onTitleChange, onLanguageChange }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Song Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter song title..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                </label>
                <input
                    type="text"
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter language..."
                />
            </div>
        </div>
    );
};

// ============================================================================
// GAP EDITOR COMPONENT
// ============================================================================
const GapEditor = ({ minutes, seconds, milliseconds, onMinutesChange, onSecondsChange, onMillisecondsChange }) => {
    const totalMs = useMemo(
        () => TimeConverter.componentsToMs(minutes, seconds, milliseconds),
        [minutes, seconds, milliseconds]
    );

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                GAP (delay before the song starts)
            </label>
            <div className="flex gap-2 items-center">
                <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Minutes</label>
                    <input
                        type="number"
                        min="0"
                        value={minutes}
                        onChange={(e) => onMinutesChange(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Seconds</label>
                    <input
                        type="number"
                        min="0"
                        max={ULTRASTAR.TIME.MAX_SECONDS}
                        value={seconds}
                        onChange={(e) => onSecondsChange(Math.max(0, Math.min(ULTRASTAR.TIME.MAX_SECONDS, parseInt(e.target.value) || 0)))}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Milliseconds</label>
                    <input
                        type="number"
                        min="0"
                        max={ULTRASTAR.TIME.MAX_MILLISECONDS}
                        value={milliseconds}
                        onChange={(e) => onMillisecondsChange(Math.max(0, Math.min(ULTRASTAR.TIME.MAX_MILLISECONDS, parseInt(e.target.value) || 0)))}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                    />
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Total: {totalMs} ms
            </p>
        </div>
    );
};

// ============================================================================
// SYNC PREVIEW COMPONENT
// ============================================================================
const SyncPreview = ({ syncedLines, onLineUpdate, bpm, gapMs }) => {
    if (syncedLines.length === 0) return null;

    // Déterminer quelles lignes sont la première note d'une phrase
    const isFirstNoteOfPhrase = (index) => {
        if (syncedLines[index].type !== 'note') return false;

        // Première note du fichier
        if (index === 0) return true;

        // Première note après un break
        for (let i = index - 1; i >= 0; i--) {
            if (syncedLines[i].type === 'break') return true;
            if (syncedLines[i].type === 'note') return false;
        }

        return false;
    };

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-purple-600 mb-3">
                Preview and Edit
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {syncedLines.map((item, index) => {
                    if (item.type === 'break') {
                        return (
                            <div key={index} className="text-gray-400 text-sm py-1">
                                {item.line}
                            </div>
                        );
                    }

                    if (item.type === 'end') {
                        return (
                            <div key={index} className="text-gray-600 font-bold text-sm py-1">
                                {item.line}
                            </div>
                        );
                    }

                    if (item.type === 'note') {
                        const parsed = UltraStarParser.parseNoteLine(item.line);
                        if (!parsed) return null;

                        const isFirstNote = isFirstNoteOfPhrase(index);
                        const timing = isFirstNote && bpm
                            ? TimeConverter.beatToTime(parsed.start, bpm, gapMs)
                            : null;

                        return (
                            <div key={index} className="flex items-center gap-2 py-1">
                                {timing ? (
                                    <span className="text-xs font-mono text-purple-600 w-12 flex-shrink-0 font-semibold">
                                        {TimeConverter.formatTime(timing.minutes, timing.seconds)}
                                    </span>
                                ) : (
                                    <span className="w-12 flex-shrink-0"></span>
                                )}
                                <span className="text-xs text-gray-500 w-16 flex-shrink-0">
                                    {parsed.type} {parsed.start}
                                </span>
                                <span className="text-xs text-blue-600 w-32 flex-shrink-0 italic truncate" title={item.original}>
                                    {item.original}
                                </span>
                                <input
                                    type="text"
                                    value={parsed.text}
                                    onChange={(e) => onLineUpdate(index, e.target.value)}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Enter text..."
                                />
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="text-gray-600 text-sm py-1">
                            {item.line}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================================
// WARNINGS DISPLAY COMPONENT
// ============================================================================
const WarningsDisplay = ({ warnings }) => {
    if (warnings.length === 0) return null;

    return (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
                <span className="text-yellow-600 text-xl mr-3">⚠</span>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-2">Synchronization Warnings</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        {warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// OUTPUT DISPLAY COMPONENT
// ============================================================================
// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function UltraStarLyricsEditor() {
    // ========================================================================
    // STATE MANAGEMENT - Grouped by concern
    // ========================================================================
    const [fileData, setFileData] = useState({
        originalLines: [],
        headerInfo: {},
        syncedLines: []
    });

    const [metadata, setMetadata] = useState({
        title: '',
        language: '',
        gapMinutes: 0,
        gapSeconds: 0,
        gapMilliseconds: 0
    });

    const [lyrics, setLyrics] = useState('');

    const [ui, setUI] = useState({
        isLoading: false,
        isDragging: false
    });

    const [notification, setNotification] = useState(null);
    const [syncWarnings, setSyncWarnings] = useState([]);

    // ========================================================================
    // DERIVED STATE
    // ========================================================================
    const fileInfo = useMemo(() => ({
        lineCount: fileData.originalLines.length,
        title: fileData.headerInfo.TITLE || '',
        artist: fileData.headerInfo.ARTIST || ''
    }), [fileData.originalLines.length, fileData.headerInfo.TITLE, fileData.headerInfo.ARTIST]);

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
                originalLines: noteLines,
                headerInfo: header,
                syncedLines: []
            });

            setMetadata(MetadataParser.parseMetadata(header));

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

    const handleOriginalFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) handleFileRead(file);
    }, [handleFileRead]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setUI(prev => ({ ...prev, isDragging: true }));
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setUI(prev => ({ ...prev, isDragging: false }));
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setUI(prev => ({ ...prev, isDragging: false }));

        const files = e.dataTransfer.files;
        if (files.length > 0) handleFileRead(files[0]);
    }, [handleFileRead]);

    // ========================================================================
    // LYRICS HANDLERS
    // ========================================================================
    const handleNewLyricsChange = useCallback((e) => {
        setLyrics(e.target.value);
    }, []);

    const handleNewLyricsFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLyrics(event.target.result);
                showNotification('Lyrics file loaded', 'success');
            };
            reader.onerror = () => showNotification('Error reading lyrics file', 'error');
            reader.readAsText(file);
        }
    }, [showNotification]);

    const loadOriginalLyrics = useCallback(() => {
        if (fileData.originalLines.length === 0) {
            showNotification('No original file loaded', 'error');
            return;
        }

        try {
            const originalLyrics = LyricsProcessor.extractOriginalLyrics(fileData.originalLines);
            setLyrics(originalLyrics);
            showNotification('Original lyrics loaded with syllable separators', 'success');
        } catch (error) {
            logger.error('Error loading original lyrics:', error);
            showNotification('Error loading original lyrics: ' + error.message, 'error');
        }
    }, [fileData.originalLines, showNotification]);

    // ========================================================================
    // SYNCHRONIZATION
    // ========================================================================
    const autoSync = useCallback(() => {
        setUI(prev => ({ ...prev, isLoading: true }));
        setSyncWarnings([]);

        try {
            const synchronizer = new LyricsSynchronizer(fileData.originalLines, lyrics);
            const warnings = synchronizer.validate();
            const synced = synchronizer.synchronize();

            setFileData(prev => ({ ...prev, syncedLines: synced }));
            setSyncWarnings(warnings);

            if (warnings.length === 0) {
                showNotification('Synchronization completed successfully!', 'success');
            } else {
                showNotification('Synchronization completed with warnings', 'warning');
            }
        } catch (error) {
            logger.error('Error during synchronization:', error);
            showNotification('Error during synchronization: ' + error.message, 'error');
        } finally {
            setUI(prev => ({ ...prev, isLoading: false }));
        }
    }, [fileData.originalLines, lyrics, showNotification]);

    // ========================================================================
    // OUTPUT GENERATION
    // ========================================================================
    const generateAndDownload = useCallback(() => {
        try {
            const output = FileManager.generateFile(fileData.headerInfo, metadata, fileData.syncedLines);

            const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'song_new.txt';
            link.click();
            window.URL.revokeObjectURL(url);

            showNotification('File generated and downloaded successfully!', 'success');
        } catch (error) {
            logger.error('Error generating file:', error);
            showNotification('Error generating file: ' + error.message, 'error');
        }
    }, [fileData.headerInfo, fileData.syncedLines, metadata, showNotification]);

    const generateAndCopy = useCallback(() => {
        try {
            const output = FileManager.generateFile(fileData.headerInfo, metadata, fileData.syncedLines);

            navigator.clipboard.writeText(output)
                .then(() => showNotification('File generated and copied to clipboard!', 'success'))
                .catch(() => showNotification('Failed to copy to clipboard', 'error'));
        } catch (error) {
            logger.error('Error generating file:', error);
            showNotification('Error generating file: ' + error.message, 'error');
        }
    }, [fileData.headerInfo, fileData.syncedLines, metadata, showNotification]);

    // ========================================================================
    // PREVIEW EDIT HANDLER
    // ========================================================================
    const updateSyncedLine = useCallback((index, newText) => {
        setFileData(prev => {
            const newSynced = [...prev.syncedLines];
            const item = newSynced[index];
            const parsed = UltraStarParser.parseNoteLine(item.line);
            if (parsed) {
                const newLine = UltraStarParser.buildNoteLine({ ...parsed, text: newText });
                newSynced[index] = { ...item, line: newLine };
            }
            return { ...prev, syncedLines: newSynced };
        });
    }, []);

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
            <NotificationToast notification={notification} />

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-purple-600 mb-6">
                    UltraStar Lyrics Editor
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <FileUploadZone
                        onFileLoad={handleOriginalFileUpload}
                        fileInfo={fileInfo}
                        isDragging={ui.isDragging}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    />

                    <LyricsEditor
                        lyrics={lyrics}
                        onChange={handleNewLyricsChange}
                        onLoadFile={handleNewLyricsFileUpload}
                        onLoadOriginal={loadOriginalLyrics}
                        hasOriginalFile={fileData.originalLines.length > 0}
                    />
                </div>

                {fileData.originalLines.length > 0 && (
                    <div className="mb-6">
                        <MetadataEditor
                            title={metadata.title}
                            language={metadata.language}
                            onTitleChange={(value) => setMetadata(prev => ({ ...prev, title: value }))}
                            onLanguageChange={(value) => setMetadata(prev => ({ ...prev, language: value }))}
                        />
                        <GapEditor
                            minutes={metadata.gapMinutes}
                            seconds={metadata.gapSeconds}
                            milliseconds={metadata.gapMilliseconds}
                            onMinutesChange={(value) => setMetadata(prev => ({ ...prev, gapMinutes: value }))}
                            onSecondsChange={(value) => setMetadata(prev => ({ ...prev, gapSeconds: value }))}
                            onMillisecondsChange={(value) => setMetadata(prev => ({ ...prev, gapMilliseconds: value }))}
                        />
                    </div>
                )}

                {fileData.originalLines.length > 0 && lyrics && (
                    <div className="mb-6 text-center">
                        <button
                            onClick={autoSync}
                            disabled={ui.isLoading}
                            className={`px-6 py-3 rounded-lg font-semibold transition inline-flex items-center gap-2 ${
                                ui.isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                            type="button"
                        >
                            {ui.isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Synchronizing...</span>
                                </>
                            ) : (
                                <>
                                    <span>🎵</span>
                                    <span>Auto-sync</span>
                                </>
                            )}
                        </button>
                        <p className="text-xs text-gray-600 mt-2">
                            Lyrics will be aligned to original timings
                        </p>
                    </div>
                )}

                <WarningsDisplay warnings={syncWarnings} />

                <SyncPreview
                    syncedLines={fileData.syncedLines}
                    onLineUpdate={updateSyncedLine}
                    bpm={fileData.headerInfo.BPM ? parseFloat(fileData.headerInfo.BPM) : null}
                    gapMs={TimeConverter.componentsToMs(metadata.gapMinutes, metadata.gapSeconds, metadata.gapMilliseconds)}
                />

                {fileData.syncedLines.length > 0 && (
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

                <div className="mt-8 bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Load your original UltraStar file</li>
                        <li>Paste the new lyrics in the text area</li>
                        <li>Click "Auto-sync"</li>
                        <li>Review and adjust manually if necessary</li>
                        <li>Generate and download or copy the synchronized file</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
