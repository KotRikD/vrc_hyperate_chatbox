import { useToast } from '@chakra-ui/react';
import { useCallback, useState } from 'react';

import { HyperateOptions } from '../utils/types';
import { validateHyperateCode } from '../utils/validation';

export const useHyperateInit = () => {
    const [code, setCode] = useState<string>(
        localStorage.getItem('last-hyperate-code') || ''
    );
    const [textFormat, setTextFormat] = useState<string>(
        localStorage.getItem('text-format') || '❤❤❤ {heartRate} {clock}'
    );
    const [isLoading, setIsLoading] = useState(false);
    const [codeError, setCodeError] = useState('');
    const toast = useToast();

    const handleCodeChange = useCallback(
        (e: React.FormEvent<HTMLInputElement>) => {
            const value = e.currentTarget.value;
            setCode(value);
            const error = validateHyperateCode(value);
            setCodeError(error);

            if (value && !error) {
                localStorage.setItem('last-hyperate-code', value);
            }
        },
        []
    );

    const handleTextFormatChange = useCallback(
        (e: React.FormEvent<HTMLTextAreaElement>) => {
            const value = e.currentTarget.value;
            setTextFormat(value);
            if (value) {
                localStorage.setItem('text-format', value);
            }
        },
        []
    );

    const startMonitoring = useCallback(
        async (options: HyperateOptions) => {
            const error = validateHyperateCode(code);
            if (error) {
                setCodeError(error);
                toast({
                    title: 'Validation Error',
                    description: error,
                    status: 'error',
                    duration: 3000,
                    isClosable: true
                });
                return;
            }

            setIsLoading(true);
            try {
                // @ts-ignore
                await window.electronAPI.startHyperateMonitor({
                    code,
                    formattedString: textFormat,
                    options
                });
            } catch (error) {
                toast({
                    title: 'Connection Error',
                    description: 'Failed to connect to Hyperate',
                    status: 'error',
                    duration: 5000,
                    isClosable: true
                });
                setIsLoading(false);
            }
        },
        [code, textFormat, toast]
    );

    return {
        code,
        textFormat,
        isLoading,
        codeError,
        handleCodeChange,
        handleTextFormatChange,
        startMonitoring
    };
};
