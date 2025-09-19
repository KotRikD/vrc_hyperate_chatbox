export interface HyperateOptions {
    includeUpDownIcon: boolean;
    include24HourFormat: boolean;
    vrcOscCompatibility: boolean;
    vrcHrOscCompatibility: boolean;
}

export type HyperateOptionsAction =
    | {
          type: 'includeUpDownIcon';
          value: boolean;
      }
    | {
          type: 'include24HourFormat';
          value: boolean;
      }
    | {
          type: 'vrcOscCompatibility';
          value: boolean;
      }
    | {
          type: 'vrcHrOscCompatibility';
          value: boolean;
      };

export interface StartHyperateMonitorParams {
    code: string;
    formattedString?: string;
    options: HyperateOptions;
}
