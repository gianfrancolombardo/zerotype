export { };

declare global {
    interface Window {
        electronAPI: {
            onStatusUpdate: (callback: (data: { status: string; text?: string; message?: string }) => void) => void;
            saveSettings: (settings: { hotkey: string; model: string }) => void;
            getSettings: () => Promise<{ hotkey: string; model: string }>;
        };
    }
}
