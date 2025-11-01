import Keychain from "react-native-keychain";

export async function saveSecret<T>(key: string, value: T): Promise<boolean | null> {
    try {
        const set = await Keychain.setGenericPassword(
            "meta", 
            JSON.stringify(value), 
            { service: `app.${key}` }
        );
        return !!set;
    } catch (e) {
        console.error("Failed to save secret:", e);
        return null;
    }
}

export async function loadSecret<T = any>(key: string): Promise<T | null> {
    try {
        const result = await Keychain.getGenericPassword({ service: `app.${key}` });
        return result ? (JSON.parse(result.password) as T) : null;
    } catch (e) {
        console.error("Failed to load secret:", e);
        return null;
    }
}

export async function deleteSecret(key: string): Promise<boolean | null> {
    try {
        const del = await Keychain.resetGenericPassword({ service: `app.${key}` });
        return !!del;
    } catch (e) {
        console.error("Failed to delete secret:", e);
        return null;
    }
}
