import { Box, HStack } from '@chakra-ui/react';
import { useCallback } from 'react';

export function MacOSControls() {
    const handleMinimize = useCallback(() => {
        // @ts-ignore
        window.electronAPI.windowMinimize();
    }, []);

    const handleClose = useCallback(() => {
        // @ts-ignore
        window.electronAPI.windowClose();
    }, []);

    return (
        <HStack
            spacing={2}
            pr={4}
            style={{ WebkitAppRegion: 'no-drag' } as any}
        >
            {/* Close - Red */}
            <Box
                w="12px"
                h="12px"
                borderRadius="full"
                bg="linear-gradient(135deg, #ff5f56, #ff3b30)"
                cursor="pointer"
                position="relative"
                transition="all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                className="window-control"
                _hover={{
                    transform: 'scale(1.15)',
                    boxShadow: '0 0 18px rgba(255, 95, 86, 0.8)',
                    '& .control-icon': { opacity: 1 }
                }}
                onClick={handleClose}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Box
                    className="control-icon"
                    w="6px"
                    h="6px"
                    position="relative"
                    opacity={0}
                    transition="opacity 0.15s"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '6px',
                        height: '1.5px',
                        bg: 'rgba(0,0,0,0.8)',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        borderRadius: 'full'
                    }}
                    _after={{
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '6px',
                        height: '1.5px',
                        bg: 'rgba(0,0,0,0.8)',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        borderRadius: 'full'
                    }}
                />
            </Box>

            {/* Minimize - Yellow */}
            <Box
                w="12px"
                h="12px"
                borderRadius="full"
                bg="linear-gradient(135deg, #ffbd2e, #ffaa00)"
                cursor="pointer"
                position="relative"
                transition="all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                className="window-control"
                _hover={{
                    transform: 'scale(1.15)',
                    boxShadow: '0 0 15px rgba(255, 189, 46, 0.7)',
                    '& .control-icon': { opacity: 1 }
                }}
                onClick={handleMinimize}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Box
                    className="control-icon"
                    w="6px"
                    h="1.5px"
                    bg="rgba(0,0,0,0.8)"
                    borderRadius="full"
                    opacity={0}
                    transition="opacity 0.15s"
                />
            </Box>
        </HStack>
    );
}
