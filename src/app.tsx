import { createRoot } from 'react-dom/client';
import { Button, ChakraProvider, Checkbox, Flex, Image, Input, Text, Textarea} from '@chakra-ui/react'
import Theme from './features/theme';
import { useCallback, useEffect, useReducer, useState } from 'react';
// @ts-ignore
import HeartPulse from './assets/heart-pulse.svg';

import './app.css';

const root = createRoot(document.querySelector('div#js-root'));

interface State {
    includeUpDownIcon: boolean;
    include24HourFormat: boolean;
    vrcOscCompatibility: boolean;
    vrcHrOscCompatibility: boolean;
}

type Actions = {
    type: 'includeUpDownIcon';
    value: boolean;
} | {
    type: 'include24HourFormat';
    value: boolean;
} | {
    type: 'vrcOscCompatibility';
    value: boolean;
} | {
    type: 'vrcHrOscCompatibility';
    value: boolean;
}

function InitHyperate() {
    const [code, setCode] = useState<string>(localStorage.getItem("last-hyperate-code"));
    const [textFormat, setTextFormat] = useState<string>(localStorage.getItem("text-format") || '❤❤❤ {heartRate} {clock}')
    const [options, dispatchOption] = useReducer((state: State, action: Actions) => {
        const { type } = action;
        switch (type) {
            case 'includeUpDownIcon':
                state.includeUpDownIcon = action.value;
                break;
            case 'include24HourFormat':
                state.include24HourFormat = action.value;
                break;
            case 'vrcOscCompatibility':
                state.vrcOscCompatibility = action.value;
                break;
            case 'vrcHrOscCompatibility': 
                state.vrcHrOscCompatibility = action.value;
                break;
            default:
                // no-default
        }

        return state;
    }, {
        includeUpDownIcon: false,
        include24HourFormat: false,
        vrcOscCompatibility: true,
        vrcHrOscCompatibility: false,
    })

    const onEnterCode = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        setCode(e.currentTarget.value)
        if (e.currentTarget.value) {
            localStorage.setItem('last-hyperate-code', e.currentTarget.value)
        }
    }, [setCode])

    const onChangeTextFormat = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
        setTextFormat(e.currentTarget.value)
        if (e.currentTarget.value) {
            localStorage.setItem('text-format', e.currentTarget.value)
        }
    }, [textFormat])

    const onOptionChange = useCallback((type: Actions['type']) => (e: React.FormEvent<HTMLInputElement>) => {
        e.preventDefault();

        dispatchOption({
            type,
            value: e.currentTarget.checked
        })
    }, [options])

    const onSubmit = useCallback(() => {
        // @ts-ignore
        window.electronAPI.startHyperateMonitor({
            code,
            formattedString: textFormat,
            options
        });
    }, [code, textFormat, options])

    return (
        <Flex w="100%" direction="column" alignItems="center" justifyContent="center" p={4} gap={2}>
            <Input onChange={onEnterCode} w="320px" defaultValue={code} placeholder='enter hyperate code here (ex. XXXX)' required/>
            <Textarea onChange={onChangeTextFormat} defaultValue={textFormat} placeholder={`use {heartRate} for heartRate and {clock} for clock!

example: ❤❤❤ {heartRate} {clock}`} />
            <Checkbox onChange={onOptionChange('includeUpDownIcon')} defaultChecked={options.includeUpDownIcon}>Add up/down icons after rate</Checkbox>
            <Checkbox onChange={onOptionChange('include24HourFormat')} defaultChecked={options.include24HourFormat}>Use 24 hour format</Checkbox>
            <Checkbox onChange={onOptionChange('vrcOscCompatibility')} defaultChecked={options.vrcOscCompatibility}>VRC OSC Compatibility</Checkbox>
            <Checkbox onChange={onOptionChange('vrcHrOscCompatibility')} defaultChecked={options.vrcHrOscCompatibility}>VRC HrOSC Compatibility</Checkbox>
            <Button w="320px" onClick={onSubmit}>Start</Button>
        </Flex>
    )
}

function ConnectedHyperate() {
    const [heartRate, setHeartRate] = useState<number | null>(null);

    useEffect(() => {
        // @ts-ignore
        const heartRateUpdated = window.electronAPI.onHeartRateUpdate((newHeartRate) => {
            setHeartRate(newHeartRate)
        });

        return () => [heartRateUpdated].forEach((fn) => fn())
    }, [setHeartRate])

    const onSubmit = useCallback(() => {
        // @ts-ignore
        window.electronAPI.stopHyperateMonitor();
    }, [])

    return (
        <Flex w="100%" h="100%" direction="column" alignItems="center" justifyContent="center" gap={2}>
            <Flex w="100%" direction="row" alignItems="center" justifyContent="center" gap="10px">
                <Text fontWeight={600} fontSize={52}>
                    {!heartRate ? '--' : `${heartRate}`} BPM
                </Text>
                <Image className="heart-pulsate" src={HeartPulse} w="48px" h="48px"/>
            </Flex>
            <Button w="320px" onClick={onSubmit}>Stop</Button>
        </Flex>
    )
}

function App() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // @ts-ignore
        const monitorConnected = window.electronAPI.onMonitorConnected(() => {
            setIsConnected(true);
        })
        // @ts-ignore
        const monitorStopped = window.electronAPI.onMonitorStopped(() => {
            setIsConnected(false);
        })

        return () => [monitorConnected, monitorStopped].forEach((fn) => fn())
    }, [isConnected])

    return (
        !isConnected ? <InitHyperate/> : <ConnectedHyperate/>
    )
}

root.render(
    <ChakraProvider theme={Theme}>
        <App/>
    </ChakraProvider>
);