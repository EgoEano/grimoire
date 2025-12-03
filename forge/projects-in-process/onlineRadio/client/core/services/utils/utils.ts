export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let lastCall: number | null = null;
    return function (...args: Parameters<T>) {
        if (!lastCall) {
            func(...args);
            lastCall = setTimeout(() => {
                lastCall = null;
            }, delay);
        }
    };
}