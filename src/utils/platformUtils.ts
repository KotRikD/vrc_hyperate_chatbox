export const getPlatform = (): string => {
    // @ts-ignore
    return window.electronAPI?.platform || 'win32';
};

export const isMacOS = (): boolean => {
    return getPlatform() === 'darwin';
};
