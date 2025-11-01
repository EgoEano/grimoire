import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, Dispatch, SetStateAction, useRef } from "react";
import { UserLocalRepository } from "../repositories/UserLocalRepository";
import { AuthService } from "../auth/authService";

import type { UserData } from "../auth/authService";

interface UserDataContextType { 
    readonly user: UserData | null;
    // setUser: Dispatch<SetStateAction<object | null>>;
    setUser: (
        value: UserData | null | ((prev: UserData | null) => UserData | null)
    ) => void;

    getAuthService: () => AuthService;
    getUserLocalRepo: () => UserLocalRepository;

    createUser: (p: LoginRequestProps) => Promise<boolean>;
    readUser: () => Promise<UserData | null>;

    readonly loading: boolean;
    readonly initialized: boolean;
    readonly error: any[];
    refreshUI: () => void;
};

interface LoginRequestProps {
    login: string, 
    password: string
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export const UserDataProvider = ({children}: { children: React.ReactNode }) => {
    const authService = useRef<AuthService>(new AuthService());
    const userLocalRepo = useRef<UserLocalRepository>(new UserLocalRepository());
    const userRef = useRef<UserData | null>(null);
    
    const [version, setVersion] = useState(0);
    const isLoading = useRef<boolean>(false); 
    const isInitialized = useRef<boolean>(false); 
    const error = useRef<any[]>([]);

    const getAuthService = () => authService.current;
    const getUserLocalRepo = () => userLocalRepo.current;
    const refreshUI = () => setVersion(v => v + 1);

    const setUser = (
        value: UserData | null | ((prev: UserData | null) => UserData | null)
    ) => {
        const prev = userRef.current;
        userRef.current = typeof value === "function" ? (value as any)(prev) : value;
        refreshUI(); 
    };
      

    //create
    const createUser = async ({
        login, password
    }: LoginRequestProps): Promise<boolean> => {
        isLoading.current = true;
        //#FIXME Сделать получение реальных данных
        const PSEUDO_device_id = 123;
        const PSEUDO_device_hash = 'QWE123';

        const sessData = await getAuthService()?.createSession({
            login, 
            password, 
            device_id: PSEUDO_device_id, 
            device_hash: PSEUDO_device_hash
        });

        let userDat: UserData | null = null;
        const userID = sessData?.payload?.user_id;
        if (sessData?.success && userID) {
            userDat = {
                user_id: userID,
                username: login
            };
            const localDBUser = await getUserLocalRepo()?.getUserById(userID);
            if (!localDBUser) await getUserLocalRepo()?.createUser(userDat);
        }

        isLoading.current = false;
        isInitialized.current = true;
        setUser(userDat);
        refreshUI();
        return !!userDat;
    }
    
    //read
    const readUser = async (): Promise<UserData | null> => {
        isLoading.current = true;
        const sessData = await getAuthService()?.getUserData();
        const userID = sessData?.user_id;
        let userDat: UserData | null = null;

        if (userID) {
            userDat = { user_id: userID };
            const localDBUser = await getUserLocalRepo()?.getUserById(userID);
            if (!localDBUser) {
                console.log('user is not found!');

                userDat = {"user_id": "1", "username": "admin"}
                //#FIXME Здесь должна быть логика запроса к серверу - проверить существует и актуален ли пользователь
                //и тогда userDat обогатится данными из localDBUser
                //или же забракуется если в бд такого нет или удален
            }
        } else {
            console.log('session is not found!');
        }

        isLoading.current = false;
        isInitialized.current = true;
        setUser(userDat);
        return userDat;
    }

    useEffect(() => {
        (async () => {
            try {
                await userLocalRepo.current.init();
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
        getAuthService,

        createUser,
        readUser,

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