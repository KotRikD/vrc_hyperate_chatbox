import {
    Alert,
    AlertDescription,
    AlertIcon,
    Badge,
    Box,
    Button,
    Checkbox,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    HStack,
    Input,
    ScaleFade,
    Text,
    Textarea,
    Tooltip,
    VStack
} from '@chakra-ui/react';

import { useHyperateInit } from '../hooks/useHyperateInit';
import { useHyperateOptions } from '../hooks/useHyperateOptions';

export function InitHyperate() {
    const {
        code,
        textFormat,
        isLoading,
        codeError,
        handleCodeChange,
        handleTextFormatChange,
        startMonitoring
    } = useHyperateInit();

    const { options, handleOptionChange } = useHyperateOptions();

    const handleSubmit = () => {
        startMonitoring(options);
    };

    return (
        <Box w="100%" maxW="500px" p={6}>
            <ScaleFade in={true} initialScale={0.9}>
                <VStack spacing={5} align="stretch">
                    {/* Hyperate Code Input */}
                    <FormControl isInvalid={!!codeError} isRequired>
                        <FormLabel
                            fontSize="md"
                            fontWeight="600"
                            color="whiteAlpha.900"
                        >
                            Hyperate Code
                        </FormLabel>
                        <Input
                            onChange={handleCodeChange}
                            defaultValue={code}
                            placeholder="Enter code (e.g. XXXX)"
                            variant="filled"
                            textTransform="uppercase"
                            maxLength={20}
                            size="lg"
                        />
                        {codeError && (
                            <FormErrorMessage>{codeError}</FormErrorMessage>
                        )}
                    </FormControl>

                    {/* Text Format */}
                    <FormControl>
                        <FormLabel
                            fontSize="md"
                            fontWeight="600"
                            color="whiteAlpha.900"
                        >
                            Display Format
                        </FormLabel>
                        <Textarea
                            onChange={handleTextFormatChange}
                            defaultValue={textFormat}
                            placeholder="❤❤❤ {heartRate} {clock}"
                            variant="filled"
                            rows={3}
                            resize="none"
                        />
                        <FormHelperText>
                            Use{' '}
                            <Badge
                                colorScheme="primary"
                                fontSize="xs"
                                textTransform="none"
                            >
                                {'{heartRate}'}
                            </Badge>{' '}
                            for heart rate and{' '}
                            <Badge
                                colorScheme="accent"
                                fontSize="xs"
                                textTransform="none"
                            >
                                {'{clock}'}
                            </Badge>{' '}
                            for time
                        </FormHelperText>
                    </FormControl>

                    {/* Options in Two Columns */}
                    <HStack spacing={6} align="flex-start">
                        {/* Basic Options */}
                        <VStack spacing={3} align="stretch" flex={1}>
                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color="whiteAlpha.800"
                                mb={1}
                            >
                                Display Options
                            </Text>
                            <Box>
                                <Checkbox
                                    onChange={handleOptionChange(
                                        'includeUpDownIcon'
                                    )}
                                    defaultChecked={options.includeUpDownIcon}
                                    colorScheme="primary"
                                >
                                    <Tooltip label="Adds ↗ ↘ arrows to show heart rate trend">
                                        <Text fontSize="sm">
                                            Show trend arrows
                                        </Text>
                                    </Tooltip>
                                </Checkbox>
                            </Box>

                            <Box>
                                <Checkbox
                                    onChange={handleOptionChange(
                                        'include24HourFormat'
                                    )}
                                    defaultChecked={options.include24HourFormat}
                                    colorScheme="primary"
                                >
                                    <Tooltip label="Use 24-hour time format instead of 12-hour">
                                        <Text fontSize="sm">
                                            24-hour format
                                        </Text>
                                    </Tooltip>
                                </Checkbox>
                            </Box>
                        </VStack>

                        {/* Compatibility Options */}
                        <VStack spacing={3} align="stretch" flex={1}>
                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color="whiteAlpha.800"
                                mb={1}
                            >
                                OSC Compatibility
                            </Text>
                            <Box>
                                <Checkbox
                                    onChange={handleOptionChange(
                                        'vrcOscCompatibility'
                                    )}
                                    defaultChecked={options.vrcOscCompatibility}
                                    colorScheme="accent"
                                >
                                    <Tooltip label="Standard VRChat OSC parameter compatibility">
                                        <Text fontSize="sm">VRC OSC</Text>
                                    </Tooltip>
                                </Checkbox>
                            </Box>

                            <Box>
                                <Checkbox
                                    onChange={handleOptionChange(
                                        'vrcHrOscCompatibility'
                                    )}
                                    defaultChecked={
                                        options.vrcHrOscCompatibility
                                    }
                                    colorScheme="accent"
                                >
                                    <Tooltip label="HrOSC mod compatibility for VRChat">
                                        <Text fontSize="sm">VRC HrOSC</Text>
                                    </Tooltip>
                                </Checkbox>
                            </Box>
                        </VStack>
                    </HStack>

                    {/* Start Button */}
                    <Button
                        onClick={handleSubmit}
                        size="lg"
                        variant="solid"
                        bg="green.600"
                        color="white"
                        isLoading={isLoading}
                        loadingText="Connecting..."
                        disabled={!!codeError || !code}
                        mt={2}
                        _hover={{
                            bg: 'green.700',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)'
                        }}
                        _active={{
                            bg: 'green.800',
                            transform: 'translateY(0)'
                        }}
                        _disabled={{
                            bg: 'gray.500',
                            color: 'gray.300',
                            cursor: 'not-allowed'
                        }}
                        transition="all 0.2s"
                        fontWeight="600"
                    >
                        {isLoading
                            ? 'Connecting to Hyperate...'
                            : 'Start Monitoring'}
                    </Button>

                    {/* Info Alert */}
                    <Alert
                        status="info"
                        borderRadius="md"
                        fontSize="sm"
                        variant="subtle"
                    >
                        <AlertIcon />
                        <AlertDescription>
                            Make sure VRChat is running and OSC is enabled in
                            game settings
                        </AlertDescription>
                    </Alert>
                </VStack>
            </ScaleFade>
        </Box>
    );
}
