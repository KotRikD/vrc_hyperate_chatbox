export function debouncedSkip<T extends Function>(cb: T, wait = 20) {
    let h: number | NodeJS.Timeout = 0;
    let isWaiting = false;

    const callable = (...args: any) => {
        if (isWaiting) {
            return;
        }

        isWaiting = true;

        h = setTimeout(() => {
            isWaiting = false;
            cb(...args);
        }, wait);
    };
    return <T>(<any>callable);
}