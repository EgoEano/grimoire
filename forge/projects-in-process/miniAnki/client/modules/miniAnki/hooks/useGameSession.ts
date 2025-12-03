import { useState, useEffect } from "react";
import statsStorage from "../storages/statsStorage";
import type { Collection, Word, WordStats } from "../types/types";

export function useGameSession(collection: Collection) {
    const [stats, setStats] = useState<Record<string, WordStats>>({});
    const [queue, setQueue] = useState<Word[]>(collection?.words ?? []);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        (async () => {
            const st = await statsStorage.loadStats();
            setStats(st);

            const q = buildQueue(collection.words, st);
            setQueue(q);
        })();
    }, [collection.id]);

    const word = queue[index] || null;
    const stat = word ? stats[word.id] : { level: 0, timestamp: 0 };

    const mark = async (w: Word, success: boolean) => {
        await statsStorage.updateStat(w.id, success);
        const updatedStats = await statsStorage.loadStats();
        setStats(updatedStats);
        setIndex(i => i + 1);
    };

    return {
        word,
        stat,
        index,
        total: queue.length,
        markSuccess: (w: Word) => mark(w, true),
        markFail: (w: Word) => mark(w, false),
    };
}


function buildQueue(words: Word[], stats: Record<string, WordStats>): Word[] {
    if (!words) return [];

    let filtered = getFilteredQ(words, stats);
    if (!filtered || filtered.length == 0) filtered = getFilteredQ(words, stats, 5);
    if (!filtered || filtered.length == 0) filtered = getFilteredQ(words, stats, 7);

    return filtered.sort((a, b) => {
        const sa = stats[a.id]?.level ?? 0;
        const sb = stats[b.id]?.level ?? 0;
        return sa - sb;
    });
}

function getFilteredQ(words: Word[], stats: Record<string, WordStats>, level?: number): Word[] {
    if (!words) return [];
    return words.filter(w => {
        const st = stats[w.id];

        if (!level) return !st || st.timestamp <= Date.now();
        return !st || (st.level ?? 0) <= level;
    });
}