import { Box, HStack, Image, Text, VStack } from '@chakra-ui/react';

// @ts-ignore
import HeartPulse from '../assets/heart-pulse.svg';
import { isMacOS } from '../utils/platformUtils';
import { MacOSControls } from './MacOSControls';
import { WindowsControls } from './WindowsControls';

export function TitleBar() {
    const isMac = isMacOS();

    return (
        <Box
            h="40px"
            w="100%"
            bgGradient="linear(to-r, #1f1f23, #2a2a2e, #1f1f23)"
            backdropFilter="blur(20px)"
            borderBottom="1px solid"
            borderBottomColor="whiteAlpha.200"
            position="relative"
            className="titlebar"
            style={{ WebkitAppRegion: 'drag' } as any}
            _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                bgGradient:
                    'linear(to-r, transparent, whiteAlpha.300, transparent)'
            }}
        >
            <HStack h="100%" spacing={0}>
                {/* macOS: Controls first, Windows: Title first */}
                {isMac && <MacOSControls />}

                {/* App Title with Glow Effect */}
                <HStack
                    flex={1}
                    px={isMac ? 4 : 6}
                    spacing={3}
                    justify={isMac ? 'center' : 'flex-start'}
                >
                    <Box position="relative">
                        <Image
                            src={HeartPulse}
                            w="20px"
                            h="20px"
                            filter="drop-shadow(0 0 8px rgba(230, 0, 0, 0.6))"
                            className="heart-pulse-titlebar"
                        />
                    </Box>
                    <VStack spacing={0} align={isMac ? 'center' : 'start'}>
                        <Text
                            fontSize="sm"
                            fontWeight="700"
                            color="white"
                            textShadow="0 0 10px rgba(255, 255, 255, 0.3)"
                            letterSpacing="0.02em"
                        >
                            VRC Hyperate
                        </Text>
                    </VStack>
                </HStack>

                {/* Windows: Controls last */}
                {!isMac && <WindowsControls />}
            </HStack>
        </Box>
    );
}
