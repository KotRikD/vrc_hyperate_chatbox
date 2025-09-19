import { ChakraProvider } from '@chakra-ui/react';
import { Box, Flex, ScaleFade, Spinner, Text, VStack } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';

import './app.css';
import { ConnectedHyperate, InitHyperate, TitleBar } from './components';
import Theme from './features/theme';
import { useConnectionState } from './hooks';

const root = createRoot(document.querySelector('div#js-root'));

export function App() {
    const { isConnected, isTransitioning } = useConnectionState();

    return (
        <Box
            w="100%"
            h="100vh"
            bg="linear-gradient(135deg, #1a1a1a 0%, #2d1b2e 50%, #1a1a1a 100%)"
            position="relative"
            overflow="hidden"
        >
            <TitleBar />

            <Box
                w="100%"
                h="calc(100vh - 40px)"
                position="relative"
                overflow="auto"
            >
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bgGradient="radial(circle at 30% 70%, rgba(230, 0, 0, 0.1) 0%, transparent 50%)"
                    opacity={isConnected ? 0.8 : 0.3}
                    transition="opacity 0.5s ease"
                />

                {isTransitioning ? (
                    <Flex w="100%" h="100%" align="center" justify="center">
                        <VStack spacing={4}>
                            <Spinner
                                size="xl"
                                color="primary.500"
                                thickness="4px"
                            />
                            <Text color="whiteAlpha.700" fontSize="sm">
                                {isConnected ? 'Stopping...' : 'Connecting...'}
                            </Text>
                        </VStack>
                    </Flex>
                ) : (
                    <>
                        <ScaleFade in={!isConnected} unmountOnExit>
                            <InitHyperate />
                        </ScaleFade>

                        <ScaleFade in={isConnected} unmountOnExit>
                            <Flex
                                w="100%"
                                h="100%"
                                align="center"
                                justify="center"
                                position="absolute"
                                top={0}
                                left={0}
                            >
                                <ConnectedHyperate />
                            </Flex>
                        </ScaleFade>
                    </>
                )}
            </Box>
        </Box>
    );
}

root.render(
    <ChakraProvider theme={Theme}>
        <App />
    </ChakraProvider>
);
