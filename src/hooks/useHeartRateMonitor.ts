import { useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

export const useHeartRateMonitor = () => {
    const [heartRate, setHeartRate] = useState<number | null>(null);
    const [lastHeartRate, setLastHeartRate] = useState<number | null>(null);
    const [connectionTime] = useState<Date>(new Date());
    const [isOnline, setIsOnline] = useState(true);
    const toast = useToast();

    useEffect(() => {
        // @ts-ignore
        const heartRateUpdated = window.electronAPI.onHeartRateUpdate(
            (newHeartRate: number) => {
                setLastHeartRate(heartRate);
                setHeartRate(newHeartRate);
                setIsOnline(true);
            }
        );

        const connectionCheck = setInterval(() => {
            setIsOnline(
                Date.now() - new Date(connectionTime).getTime() < 60000
            );
        }, 30000);

        return () => {
            heartRateUpdated?.();
            clearInterval(connectionCheck);
        };
    }, [heartRate, connectionTime]);

    const stopMonitoring = useCallback(() => {
        toast({
            title: 'Stopping Monitor',
            description: 'Hyperate connection terminated',
            status: 'info',
            duration: 2000,
            isClosable: true
        });
        // @ts-ignore
        window.electronAPI.stopHyperateMonitor();
    }, [toast]);

    return {
        heartRate,
        lastHeartRate,
        connectionTime,
        isOnline,
        stopMonitoring
    };
};
