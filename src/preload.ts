// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'
import { StartHyperateMonitorParams } from './types'

contextBridge.exposeInMainWorld('electronAPI', {
    startHyperateMonitor: (params: StartHyperateMonitorParams) => ipcRenderer.send('start-hyperate-monitor', params),
    stopHyperateMonitor: () => ipcRenderer.send('stop-hyperate-monitor'),

    onMonitorConnected: (callback: () => () => void) => {
        ipcRenderer.on('monitor-connected', callback)

        return () => ipcRenderer.off('monitor-connected', callback)
    },
    onMonitorStopped: (callback: () => () => void) => {
        ipcRenderer.on('monitor-stopped', callback)

        return () => ipcRenderer.off('monitor-stopped', callback)
    },
    onMonitorError: (callback: (error: string) => () => void) => {
        const callbackFormatted = (_event: any, error: any) => callback(error)
        ipcRenderer.on('monitor-error', callbackFormatted)

        return () => ipcRenderer.off('monitor-error', callbackFormatted)
    },
    onHeartbeatSent: (callback: () => () => void) => {
        ipcRenderer.on('heartbeat-sent', () => callback)

        return () => ipcRenderer.off('heartbeat-sent', () => callback)
    },
    onHeartRateUpdate: (callback: (newHeartRate: number) => () => void) => {
        const callbackFormatted = (_event: any, newHeartRate: any) => callback(newHeartRate)
        ipcRenderer.on('heartrate-update', callbackFormatted)

        return () => ipcRenderer.off('heartrate-update', callbackFormatted)
    }
})