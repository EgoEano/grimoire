import storage from '../../../core/services/storage/storageService';
import type { Interval, StatsMap, WordStats } from '../types/types';

const KEY = 'word_stats';

const INTERVALS: Record<number, Interval> = {
    0: { offset: 0, name: "Now", level: 0 },          // Immediately available
    1: { offset: 1 * 60 * 1000, name: "1 min", level: 1 },             // 1 minute
    2: { offset: 5 * 60 * 1000, name: "5 min", level: 2 },            // 5 minutes
    3: { offset: 15 * 60 * 1000, name: "15 min", level: 3 },           // 15 minutes
    4: { offset: 6 * 60 * 60 * 1000, name: "6 hours", level: 4 },              // 6 hours
    5: { offset: 1 * 24 * 60 * 60 * 1000, name: "1 day", level: 5 },                // 1 day
    6: { offset: 7 * 24 * 60 * 60 * 1000, name: "7 days", level: 6 },               // 7 days
    7: { offset: 14 * 24 * 60 * 60 * 1000, name: "14 days", level: 7 },              // 14 days
};
const minInterval = 0;
const maxInterval = Object.keys(INTERVALS).length - 1;

function calculateNextTimestamp(level: number): Interval {
    const clamped = Math.max(minInterval, Math.min(level, maxInterval));
    const interval = INTERVALS[clamped as keyof typeof INTERVALS] ?? INTERVALS[minInterval]!;
    const newInterval = {
        offset: Date.now() + interval.offset,
        name: interval.name,
        level: interval.level
    };
    return newInterval;
}

export async function loadStats(): Promise<StatsMap> {
    return (await storage.get(KEY)) || {};
}

export async function saveStats(stats: StatsMap) {
    return storage.set(KEY, stats);
}

export async function updateStat(wordId: string, isSuccess: boolean) {
    const stats = await loadStats();
    const current = stats[wordId] || { level: 0, timestamp: 0 };

    if (isSuccess) {
        const data = calculateNextTimestamp(current.level + 1);
        current.level = data.level;
        current.timestamp = data.offset
    } else {
        current.level = 0;
        current.timestamp = Date.now();
    }

    stats[wordId] = current;
    await saveStats(stats);
}

export default {
    INTERVALS,
    calculateNextTimestamp,
    loadStats,
    saveStats,
    updateStat,
};
