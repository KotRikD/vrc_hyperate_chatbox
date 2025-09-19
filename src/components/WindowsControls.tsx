import { Box, HStack } from '@chakra-ui/react';
import { useCallback } from 'react';

export function WindowsControls() {
    const handleMinimize = useCallback(() => {
        // @ts-ignore
        window.electronAPI.windowMinimize();
    }, []);

    const handleClose = useCallback(() => {
        // @ts-ignore
        window.electronAPI.windowClose();
    }, []);

    return (
        <HStack spacing={0} style={{ WebkitAppRegion: 'no-drag' } as any}>
            {/* Minimize */}
            <Box
                w="46px"
                h="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                transition="background 0.15s"
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={handleMinimize}
            >
                <Box w="10px" h="1px" bg="whiteAlpha.800" />
            </Box>

            {/* Close */}
            <Box
                w="46px"
                h="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                transition="background 0.15s"
                _hover={{ bg: 'red.600' }}
                onClick={handleClose}
            >
                <Box
                    w="10px"
                    h="10px"
                    position="relative"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '0',
                        width: '10px',
                        height: '1px',
                        bg: 'white',
                        transform: 'translateY(-50%) rotate(45deg)'
                    }}
                    _after={{
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '0',
                        width: '10px',
                        height: '1px',
                        bg: 'white',
                        transform: 'translateY(-50%) rotate(-45deg)'
                    }}
                />
            </Box>
        </HStack>
    );
}
