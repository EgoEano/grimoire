import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback,
} from "react";
import fetchRequest from "../connection/fetchRequest";

import type { ReactNode } from "react";
import type { FetchResponse } from "../connection/fetchRequest";

type UserData = Record<string, any>

interface UserDataContextType {
    user: UserData | null;
    loading: boolean;
    error: string | null;
    fetchUser: () => Promise<void>;
}

interface UserDataProviderProps {
    children: ReactNode;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        fetchRequest({
            url: "/profile/data",
            method: "GET",
            type: "json",
            onSuccess: (result: FetchResponse<UserData>) => {
                if (result.status === 200 && result.response) {
                    setUser(result.response);
                    setError(null);
                } else {
                    setUser(null);
                    setError(result.message ?? "Unknown error");
                }
            },
            onError: (err: any) => {
                setUser(null);
                setError((err && err.message) || "Error fetching user");
            },
            onFinally: () => {
                setLoading(false);
            },
        });
    }, []);

    const value = useMemo<UserDataContextType>(() => ({
        user,
        loading,
        error,
        fetchUser,
    }), [user, loading, error, fetchUser]);

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
};

export const useUser = (): UserDataContextType => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error("useUser must be used within a UserDataProvider");
    }
    return context;
};