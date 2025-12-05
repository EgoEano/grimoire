import React, { createContext, useContext, useState, useRef, useMemo } from "react";

type SystemDataContextType = {
    getSysValue: (key: string) => any | null;
    setSysValue: (k: string, v: any) => void;
    setSysValues: (datas: object) => void;
}

const SystemDataContext = createContext<SystemDataContextType | null>(null);

export const SystemDataProvider = ({children}: { children: React.ReactNode }) => {
    const dataRef = useRef<Record<string, any>>({});
    const [version, setVersion] = useState(0);

    const getSysValue = (key: string) => dataRef.current[key];

    const setSysValue = (key: string, value: any) => {
        dataRef.current[key] = value;
        setVersion(v => v + 1); // обновляем UI только если нужно
    };

    const setSysValues = (values: Record<string, any>) => {
        Object.assign(dataRef.current, values);
        setVersion(v => v + 1);
    };

    const value = useMemo<SystemDataContextType>(() => ({
        getSysValue,
        setSysValue,
        setSysValues,
    }),[version]);

    return (
        <SystemDataContext.Provider value={value}>
            {children}
        </SystemDataContext.Provider>
    );
}

export const useSystemData = ():SystemDataContextType  => {
    const context = useContext(SystemDataContext);
    if (!context) {
        throw new Error("useSystemData must be used within a SystemDataProvider");
    }
    return context;
};