import { useEffect, useState } from 'react';
import wordsStorage from '../storages/wordsStorage';
import statsStorage from '../storages/statsStorage';
import type { Word, WordStats } from '../types/types';

export function useWordsByCollection(collectionId: string) {
    const [words, setWords] = useState<(Word & { stats: WordStats })[]>([]);

    useEffect(() => {
        async function load() {
            const collection = await wordsStorage.getCollection(collectionId);
            if (!collection) return;

            const stats = await statsStorage.loadStats();

            const result = collection.words.map((w) => {
                return {
                    ...w,
                    stats: stats[w.id] || { level: 0, timestamp: 0 },
                };
            });

            setWords(result);
        }

        load();
    }, [collectionId]);

    return { words };
}
