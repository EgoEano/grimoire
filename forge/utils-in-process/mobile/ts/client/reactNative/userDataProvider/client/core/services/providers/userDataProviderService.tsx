import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { UserLocalRepository } from "../../db/repositories/UserDataLocalRepository";

import { NewUserData, NewUserDataSettings, UserData, UserDataSettings, UpdateUserData } from "../../types/UserDataTypes";

interface UserDataContextType { 
    readonly user: UserData | null;
    setUser: (
        value: UserData | null | ((prev: UserData | null) => UserData | null)
    ) => void;

    getUserLocalRepo: () => UserLocalRepository;

    createUser: (user: NewUserData) => Promise<boolean>;
    readUser: (userID: string) => Promise<UserData | null>;
    updateUser: (userID: string, updates: UpdateUserData) => Promise<boolean>;
    deleteUser: (userID: string) => Promise<boolean>;

    createUserSettings: (userId: number) => Promise<boolean>;
    readUserSettings: (userId: number) => Promise<UserDataSettings | null>;
    updateUserSettings: (
        userId: number, 
        updates: Partial<UserDataSettings>
    ) => Promise<boolean>;
    deleteUserSettings: (userId: number) => Promise<boolean>;
    resetUserSettings: (userId: number) => Promise<boolean>;

    readonly loading: boolean;
    readonly initialized: boolean;
    readonly error: any[];
    refreshUI: () => void;
};

const UserDataContext = createContext<UserDataContextType | null>(null);

export const UserDataProvider = ({children}: { children: React.ReactNode }) => {
    const userLocalRepo = useRef<UserLocalRepository>(new UserLocalRepository());
    const userRef = useRef<UserData | null>(null);
    
    const [version, setVersion] = useState(0);
    const isLoading = useRef<boolean>(false); 
    const isInitialized = useRef<boolean>(false); 
    const error = useRef<any[]>([]);

    const getUserLocalRepo = () => userLocalRepo.current;
    const refreshUI = () => setVersion(v => v + 1);

    const setUser = (
        value: UserData | null | ((prev: UserData | null) => UserData | null)
    ) => {
        const prev = userRef.current;
        userRef.current = typeof value === "function" ? (value as any)(prev) : value;
        refreshUI(); 
    };
      
    //#region User
    //create
    const createUser = async (user: NewUserData): Promise<boolean> => {
        isLoading.current = true;

        let localDBUser = await getUserLocalRepo()?.getUserByUserId(user.user_id);
        if (!localDBUser) {
            await getUserLocalRepo()?.createUser(user);
            localDBUser = await getUserLocalRepo()?.getUserByUserId(user.user_id);
        }

        isLoading.current = false;
        isInitialized.current = true;
        setUser(localDBUser);
        refreshUI();
        return !!localDBUser;
    }
    
    //read
    const readUser = async (userID: string): Promise<UserData | null> => {
        isLoading.current = true;
        const user: UserData | null = await getUserLocalRepo()?.getUserByUserId(userID);
        isLoading.current = false;
        if (user) isInitialized.current = true;
        return user;
    }

    // update
    const updateUser = async (userID: string, updates: UpdateUserData): Promise<boolean> => {
        isLoading.current = true;
        const success = await getUserLocalRepo()?.updateUser(userID, updates);
        if (success) {
            const updatedUser = await getUserLocalRepo()?.getUserByUserId(userID);
            setUser(updatedUser || null);
            refreshUI();
        }
        isLoading.current = false;
        return !!success;
    };

    // delete
    const deleteUser = async (userID: string): Promise<boolean> => {
        const success = await getUserLocalRepo()?.deleteUser(userID);
        if (success) {
            setUser(null);
            refreshUI();
        }
        return success;
    };
    //#endregion

    //#region Settings
    // create
    const createUserSettings = async (userId: number): Promise<boolean> => {
        await getUserLocalRepo().ensureInit();
        const existing = await getUserLocalRepo().getUserSettings(userId);
        if (existing) return true;

        const defaultSettings: NewUserDataSettings = {
            user_id: Number(userId),
            theme: 1, // system
            font_size: 2, // medium
            language: 1, // en
            is_notifications_active: true
        };
        return await getUserLocalRepo().createUserSettings(defaultSettings);
    };

    // read
    const readUserSettings = async (userId: number): Promise<UserDataSettings | null> => {
        return await getUserLocalRepo().getUserSettings(userId);
    };

    // update
    const updateUserSettings = async (
        userId: number, 
        updates: Partial<UserDataSettings>
    ): Promise<boolean> => {
        return await getUserLocalRepo().updateUserSettings(userId, updates);
    };

    // delete
    const deleteUserSettings = async (userId: number): Promise<boolean> => {
        await getUserLocalRepo().ensureInit();
        return await getUserLocalRepo().deleteUserSettings(userId);
    };

    const resetUserSettings = async (userId: number): Promise<boolean> => {
        await getUserLocalRepo().ensureInit();
        return await getUserLocalRepo().resetUserSettings(userId);
    };
    //#endregion

    useEffect(() => {
        (async () => {
            try {
                await userLocalRepo.current.init();

                if (!userRef.current) {
                    const defUser: UserData | null = await getUserLocalRepo()?.getUserByUserId('default');
                    setUser(defUser);
                    if (defUser) isInitialized.current = true;
                    refreshUI();
                }
            } catch (e) {
                error.current.push(e);
                refreshUI();
            }
        })();
      
        return () => {
            userLocalRepo.current?.close();
        };
    }, []);
    
    const value = useMemo(() => ({ 
        get user() {
            return userRef.current;
        }, 
        setUser, 

        getUserLocalRepo,

        createUser,
        readUser,
        updateUser,
        deleteUser,

        // Settings region methods
        createUserSettings,
        readUserSettings,
        updateUserSettings,
        deleteUserSettings,
        resetUserSettings,

        get loading() {
            return isLoading.current;
        },
        get initialized() {
            return isInitialized.current;
        },
        get error() {
            return error.current;
        },
        refreshUI,
    }), [version]);


    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
}

export const useUser = ():UserDataContextType  => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error("useUser must be used within a UserDataProvider");
    }
    return context;
};