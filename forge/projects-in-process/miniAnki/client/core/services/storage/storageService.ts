import storage from './storageService.web';

type StorageType = {
    get<T = any>(key: string): Promise<T | null>;
    set<T = any>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
};

const Storage: StorageType = {
    async get<T = any>(key: string): Promise<T | null> {
        try {
            const value = storage.getItem(key);
            return value ? (JSON.parse(value) as T) : null;
        } catch {
            return null;
        }
    },

    async set<T = any>(key: string, value: T): Promise<void> {
        try {
            storage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn("Storage error", e);
        }
    },

    async remove(key: string): Promise<void> {
        try {
            storage.removeItem(key);
        } catch {}
    },
};

export default Storage;
