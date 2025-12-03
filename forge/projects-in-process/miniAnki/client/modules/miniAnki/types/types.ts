export type Word = {
    id: string;
    front: string;
    back: string;
};

export type WordStats = {
    level: number;
    timestamp: number;
};

export type StatsMap = Record<string, WordStats>;

export type Collection = {
    id: string;
    title: string;
    words: Word[];
};

export type Interval = {
    offset: number;
    name: string;
    level: number;
};