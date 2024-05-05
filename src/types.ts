export interface StartHyperateMonitorParams {
    code: string;
    formattedString?: string;
    options: {
        includeUpDownIcon: boolean;
        include24HourFormat: boolean;
    }
}