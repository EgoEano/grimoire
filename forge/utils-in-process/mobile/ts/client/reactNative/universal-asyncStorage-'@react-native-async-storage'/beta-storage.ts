import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isWeb = Platform.OS === "web";

// Web
const webStorage = {
  async get(key: string) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage error", e);
    }
  },

  async remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

// React Native
const nativeStorage = {
  async get(key: string) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("AsyncStorage error", e);
    }
  },

  async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  },
};

// публичный API
export const storage = isWeb ? webStorage : nativeStorage;
