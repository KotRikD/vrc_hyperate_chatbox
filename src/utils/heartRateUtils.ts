export const getHeartRateColor = (rate: number | null): string => {
    if (!rate) return 'gray.400';
    if (rate < 60) return 'blue.400';
    if (rate < 100) return 'green.400';
    if (rate < 140) return 'yellow.400';
    if (rate < 180) return 'orange.400';
    return 'red.400';
};

export const getHeartRateZone = (
    rate: number | null
): { zone: string; color: string } => {
    if (!rate) return { zone: 'No Data', color: 'gray' };
    if (rate < 60) return { zone: 'Rest', color: 'blue' };
    if (rate < 100) return { zone: 'Light', color: 'green' };
    if (rate < 140) return { zone: 'Moderate', color: 'yellow' };
    if (rate < 180) return { zone: 'Vigorous', color: 'orange' };
    return { zone: 'Maximum', color: 'red' };
};

export const getHeartRateTrend = (
    current: number | null,
    previous: number | null
): string | null => {
    if (!current || !previous) return null;
    if (current > previous) return '↗️';
    if (current < previous) return '↘️';
    return '➡️';
};
