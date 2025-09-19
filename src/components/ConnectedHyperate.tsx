import {
    Alert,
    AlertDescription,
    AlertIcon,
    Badge,
    Box,
    Button,
    HStack,
    Image,
    ScaleFade,
    SlideFade,
    Text,
    VStack
} from '@chakra-ui/react';

// @ts-ignore
import HeartPulse from '../assets/heart-pulse.svg';
import { useHeartRateMonitor } from '../hooks/useHeartRateMonitor';
import {
    getHeartRateColor,
    getHeartRateTrend,
    getHeartRateZone
} from '../utils/heartRateUtils';

export function ConnectedHyperate() {
    const {
        heartRate,
        lastHeartRate,
        connectionTime,
        isOnline,
        stopMonitoring
    } = useHeartRateMonitor();

    const heartRateZone = getHeartRateZone(heartRate);
    const heartRateTrend = getHeartRateTrend(heartRate, lastHeartRate);

    return (
        <Box w="100%" maxW="400px" p={6}>
            <SlideFade in={true} offsetY="20px">
                <VStack spacing={6} align="stretch">
                    {/* Status Header */}
                    <HStack justify="space-between" align="center">
                        <Badge
                            colorScheme={isOnline ? 'green' : 'red'}
                            variant="subtle"
                            fontSize="xs"
                        >
                            {isOnline ? '🟢 Connected' : '🔴 Disconnected'}
                        </Badge>
                        <Text fontSize="xs" color="whiteAlpha.600">
                            since {connectionTime.toLocaleTimeString()}
                        </Text>
                    </HStack>

                    {/* Main Heart Rate Display */}
                    <Box textAlign="center" py={4}>
                        <HStack justify="center" spacing={6} align="center">
                            <VStack spacing={2}>
                                <ScaleFade
                                    in={heartRate !== null}
                                    initialScale={0.8}
                                >
                                    <Text
                                        fontSize="7xl"
                                        fontWeight="900"
                                        color={getHeartRateColor(heartRate)}
                                        lineHeight="0.8"
                                        textShadow="0 0 30px currentColor"
                                    >
                                        {!heartRate ? '--' : heartRate}
                                    </Text>
                                </ScaleFade>
                                <Text
                                    fontSize="lg"
                                    fontWeight="600"
                                    color="whiteAlpha.700"
                                    mt={-2}
                                >
                                    BPM
                                </Text>
                                <Badge
                                    colorScheme={heartRateZone.color}
                                    fontSize="xs"
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                    variant="solid"
                                >
                                    {heartRateZone.zone}
                                </Badge>
                            </VStack>

                            <VStack spacing={1} align="center">
                                <Image
                                    className="heart-pulsate"
                                    src={HeartPulse}
                                    w="80px"
                                    h="80px"
                                />
                                {heartRateTrend && (
                                    <Text fontSize="3xl">{heartRateTrend}</Text>
                                )}
                            </VStack>
                        </HStack>
                    </Box>

                    <HStack justify="center" spacing={8}>
                        <VStack spacing={0}>
                            <Text
                                fontSize="lg"
                                fontWeight="700"
                                color={getHeartRateColor(lastHeartRate)}
                            >
                                {lastHeartRate || '--'}
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.600">
                                PREVIOUS
                            </Text>
                        </VStack>

                        <VStack spacing={0}>
                            <Text fontSize="lg">{isOnline ? '💗' : '💔'}</Text>
                            <Text fontSize="xs" color="whiteAlpha.600">
                                STATUS
                            </Text>
                        </VStack>
                    </HStack>

                    <Button
                        onClick={stopMonitoring}
                        size="lg"
                        variant="outline"
                        colorScheme="red"
                    >
                        Stop Monitoring
                    </Button>

                    <Alert
                        status="success"
                        borderRadius="md"
                        fontSize="sm"
                        variant="subtle"
                    >
                        <AlertIcon />
                        <AlertDescription>
                            Data is being sent to VRChat via OSC
                        </AlertDescription>
                    </Alert>
                </VStack>
            </SlideFade>
        </Box>
    );
}
