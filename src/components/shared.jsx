import { useState } from 'react';
import { ULTRASTAR } from '../lyrics-editor/constants';

// ============================================================================
// SVG ICON COMPONENTS
// ============================================================================
export const Upload = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

export const Download = ({ className }) => (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const HelpIcon = ({ className }) => (
    <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================
export const ThemeToggle = () => {
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
export const NotificationToast = ({ notification }) => {
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
// PAGE LAYOUT COMPONENT
// ============================================================================
export const PageLayout = ({ notification, children }) => (
    <div className="min-h-screen bg-gradient-to-br from-theme-page-from to-theme-page-to">
        <NotificationToast notification={notification} />
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="bg-theme-card rounded-lg shadow-theme p-6">
                {children}
            </div>
        </div>
    </div>
);

// ============================================================================
// TOOL HEADER COMPONENT
// ============================================================================
export const ToolHeader = ({ title }) => (
    <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <a href="/" className="text-theme-accent hover:text-theme-accent-hover transition" aria-label="Back to home" title="Back to UltraStar Tools">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </a>
            <h1 className="text-3xl font-bold text-theme-title">
                {title}
            </h1>
        </div>
        <ThemeToggle />
    </div>
);

// ============================================================================
// INSTRUCTIONS BOX COMPONENT
// ============================================================================
export const InstructionsBox = ({ steps }) => (
    <div className="mb-6 bg-theme-info-bg rounded-lg p-4">
        <h3 className="font-semibold text-theme-info-title mb-2">📋 Instructions</h3>
        <ol className="text-sm text-theme-info-text space-y-1 list-decimal list-inside">
            {steps.map((step, index) => (
                <li key={index}>{step}</li>
            ))}
        </ol>
    </div>
);

// ============================================================================
// GENERATE BUTTONS COMPONENT
// ============================================================================
export const GenerateButtons = ({ onDownload, onCopy }) => (
    <div className="text-center mb-6">
        <div className="flex gap-4 justify-center">
            <button
                type="button"
                onClick={onDownload}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
            >
                <Download className="w-5 h-5" />
                Generate and download
            </button>
            <button
                type="button"
                onClick={onCopy}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
                📋
                Generate and copy to clipboard
            </button>
        </div>
    </div>
);

// ============================================================================
// FILE UPLOAD COMPONENT
// ============================================================================
export const FileUploadZone = ({ onFileLoad, fileInfo, isDragging, onDragOver, onDragLeave, onDrop, label = 'Load UltraStar File' }) => {
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
                {label}
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
