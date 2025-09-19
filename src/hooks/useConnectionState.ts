import { useEffect, useState } from 'react';

export const useConnectionState = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        // @ts-ignore
        const monitorConnected = window.electronAPI.onMonitorConnected(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setIsConnected(true);
                setIsTransitioning(false);
            }, 300);
        });

        // @ts-ignore
        const monitorStopped = window.electronAPI.onMonitorStopped(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setIsConnected(false);
                setIsTransitioning(false);
            }, 300);
        });

        return () => [monitorConnected, monitorStopped].forEach((fn) => fn?.());
    }, []);

    return {
        isConnected,
        isTransitioning
    };
};
