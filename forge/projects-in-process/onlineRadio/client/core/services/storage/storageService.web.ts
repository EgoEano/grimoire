import { Platform } from "react-native";

type StorageType = {
    get<T = any>(key: string): Promise<T | null>;
    set<T = any>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
};

const Storage: StorageType = {
    async get<T = any>(key: string): Promise<T | null> {
        try {
            const value = localStorage.getItem(key);
            return value ? (JSON.parse(value) as T) : null;
        } catch {
            return null;
        }
    },

    async set<T = any>(key: string, value: T): Promise<void> {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn("Storage error", e);
        }
    },

    async remove(key: string): Promise<void> {
        try {
            localStorage.removeItem(key);
        } catch {}
    },
};

export default Storage;
