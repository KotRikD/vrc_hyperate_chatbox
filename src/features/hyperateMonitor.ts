import { format } from 'date-fns/format';
import * as osc from 'node-osc';
import WebSocket from 'ws';

import { debouncedSkip } from '../utils';
import { StartHyperateMonitorParams } from '../utils/types';
import { TypedEventEmitter } from './typedEventEmitter';

interface HyperateMonitorEventsMap {
    'monitor-connected': object;
    'monitor-stopped': object;
    'monitor-error': string;

    'heartbeat-sent': object;
    'heartrate-update': number;
}

const HR_REF = '1';

export class HyperateMonitor {
    code = '';
    isConnected = false;
    isGlobalStop = false;
    previousHeartRate = 0;

    options = {
        isUpDownIconEnabled: false,
        is24HoursFormatEnabled: true,
        textFormat: '❤❤❤ {heartRate} {hours}',
        vrcOscCompatibility: true,
        vrcHrOscCompatibility: true
    };

    websocket: WebSocket;
    oscClient: osc.Client;
    eventEmitter: TypedEventEmitter<HyperateMonitorEventsMap>;

    reconnectIntervalId: NodeJS.Timeout = null;

    constructor() {
        this.oscClient = new osc.Client('localhost', 9000);
        this.eventEmitter = new TypedEventEmitter<HyperateMonitorEventsMap>();

        this.reconnectInterval = this.reconnectInterval.bind(this);
        this.heartbeat = this.heartbeat.bind(this);
        this.sendChatboxMessage = debouncedSkip(
            this.sendChatboxMessage.bind(this),
            3000
        ); // 3 sec before next call
    }

    get hyperrateSocket() {
        return `wss://app.hyperate.io/ws/${encodeURIComponent(this.code)}?token=${encodeURIComponent(__HYPERATE_API_KEY__)}`;
    }

    start() {
        this.isGlobalStop = false;
        this.openConnection();
        this.reconnectIntervalId = setInterval(
            this.reconnectInterval,
            60 * 1000
        );
    }

    stop() {
        this.isGlobalStop = true;
        if (this.isConnected) {
            this.websocket.close();
        }
        clearInterval(this.reconnectIntervalId);
    }

    setCode(newCode: string) {
        this.code = newCode;
    }

    heartbeat() {
        if (!this.isConnected) {
            console.log(
                ">>> heartbeat error: can't invoke heartbeat without socket that are open!"
            );
            this.eventEmitter.emit(
                'monitor-error',
                "can't invoke heartbeat without socket that are open!"
            );
            return;
        }

        this.websocket.send(
            JSON.stringify({
                topic: 'phoenix',
                event: 'heartbeat',
                payload: {},
                ref: HR_REF
            })
        );
        this.heartbeatSent();
    }
    async openConnection() {
        console.log('>>> Starting hyperate monitor');

        let wsInterval: NodeJS.Timeout | undefined;

        this.websocket = new WebSocket(this.hyperrateSocket, {
            headers: {
                'user-agent': 'VRCHyperateMonitor/1.0'
            }
        });

        this.websocket.on('open', () => {
            this.websocket.send(
                JSON.stringify({
                    topic: `hr:${this.code}`,
                    event: 'phx_join',
                    payload: {},
                    ref: HR_REF
                })
            );
            this.isConnected = true;

            console.log('>>> hyperate connected');
            this.monitorConnected();
        });

        this.websocket.on('error', (error) => {
            console.log('error ->', error);
            this.eventEmitter.emit('monitor-error', error.message);
            this.monitorStopped();
            this.isConnected = false;
        });

        this.websocket.on('close', () => {
            this.isConnected = false;
            this.monitorStopped();
            clearInterval(wsInterval);
        });

        this.websocket.on('message', (data: any) => {
            const jsonData = JSON.parse(data);

            console.log(jsonData);

            if (
                jsonData.event === 'phx_reply' &&
                jsonData.payload.status === 'ok' &&
                jsonData.topic === `hr:${this.code}`
            ) {
                /**
                 * Sending heartbeat each 15 seconds, to being online
                 */
                wsInterval = setInterval(this.heartbeat, 15 * 1000);
            }
            if (jsonData.event === 'hr_update') {
                const newHeartRate = jsonData.payload.hr;

                if (
                    newHeartRate === 0 ||
                    newHeartRate === this.previousHeartRate
                ) {
                    return;
                }

                let heartRateString = `${newHeartRate}`;

                if (this.options.isUpDownIconEnabled) {
                    // replace with enable up/down icons
                    if (newHeartRate > this.previousHeartRate) {
                        heartRateString += '⬆️';
                    } else if (newHeartRate < this.previousHeartRate) {
                        heartRateString += '⬇️';
                    }
                }

                this.heartbeatUpdated(newHeartRate);
                this.previousHeartRate = newHeartRate;

                if (this.options.textFormat.length) {
                    this.sendChatboxMessage(
                        this.options.textFormat
                            .replace('{heartRate}', heartRateString)
                            .replace(
                                '{clock}',
                                format(
                                    new Date(),
                                    this.options.is24HoursFormatEnabled
                                        ? 'HH:mm'
                                        : 'p'
                                )
                            )
                    );
                }

                if (this.options.vrcOscCompatibility) {
                    this.sendVRCOscHeart(newHeartRate);
                }

                if (this.options.vrcHrOscCompatibility) {
                    this.sendHrOscHeart(newHeartRate);
                }

                console.log('New heartbeat:', newHeartRate);
            }
        });
    }

    reconnectInterval() {
        if (!this.isConnected && !this.isGlobalStop) {
            this.openConnection();
        }
    }

    setOptions(
        newOptions: StartHyperateMonitorParams['options'],
        formattedString?: string
    ) {
        console.log('Options to start monitor with:', newOptions);

        this.options.textFormat =
            typeof formattedString === 'string' && formattedString !== null
                ? formattedString
                : '';

        this.options.isUpDownIconEnabled = newOptions.includeUpDownIcon;
        this.options.is24HoursFormatEnabled = newOptions.include24HourFormat;
        this.options.vrcOscCompatibility = newOptions.vrcOscCompatibility;
        this.options.vrcHrOscCompatibility = newOptions.vrcHrOscCompatibility;
    }

    monitorConnected() {
        this.eventEmitter.emit('monitor-connected', {});
        if (this.options.vrcHrOscCompatibility) {
            this.sendHrOscEnabled(true);
        }
    }

    monitorStopped() {
        this.eventEmitter.emit('monitor-stopped', {});
        if (this.options.vrcHrOscCompatibility) {
            this.sendHrOscEnabled(false);
        }
    }

    heartbeatSent() {
        this.eventEmitter.emit('heartbeat-sent', {});
    }

    heartbeatUpdated(newHeartRate: number) {
        this.eventEmitter.emit('heartrate-update', newHeartRate);
    }

    sendChatboxMessage(message: string) {
        this.oscClient.send({
            address: '/chatbox/input',
            args: [
                {
                    type: 'string',
                    value: message
                },
                { type: 'boolean', value: true }
            ]
        });
    }

    sendVRCOscHeart(newHeartRate: number) {
        this.oscClient.send({
            address: '/avatar/parameters/VRCOSC/Heartrate/Enabled',
            args: [
                {
                    type: 'boolean',
                    value: true
                }
            ]
        });
        this.oscClient.send({
            address: '/avatar/parameters/VRCOSC/Heartrate/Units',
            args: [
                {
                    type: 'float',
                    value: (newHeartRate % 10) / 10
                }
            ]
        });
        this.oscClient.send({
            address: '/avatar/parameters/VRCOSC/Heartrate/Tens',
            args: [
                {
                    type: 'float',
                    value: Math.floor((newHeartRate % 100) / 10) / 10
                }
            ]
        });
        this.oscClient.send({
            address: '/avatar/parameters/VRCOSC/Heartrate/Hundreds',
            args: [
                {
                    type: 'float',
                    value: Math.floor(newHeartRate / 100)
                }
            ]
        });
        this.oscClient.send({
            address: '/avatar/parameters/VRCOSC/Heartrate/Normalised',
            args: [
                {
                    type: 'float',
                    value: newHeartRate / 200
                }
            ]
        });
    }

    sendHrOscHeart(newHeartRate: number) {
        this.oscClient.send({
            address: '/avatar/parameters/hr_percent',
            args: [
                {
                    type: 'float',
                    // newHeartRate / max_heartrate (i guess 200 is enough for most people.... yeah?)
                    value: newHeartRate / 200
                }
            ]
        });
    }

    sendHrOscEnabled(state: boolean) {
        this.oscClient.send({
            address: '/avatar/parameters/hr_connected',
            args: [
                {
                    type: 'boolean',
                    value: state
                }
            ]
        });
    }
}
