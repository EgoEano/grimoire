import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';


// export const {
//   DataProvider: NameProvider,
//   useDataContext: nameContext,
// } = createDataProvider();

/*
<NameProvider 
    fetchFn={fetchUsers} 
    initialFilters={initialData}
>

</NameProvider>
*/

//const { data, filters, error, isLoading, updateFilters, refresh } = nameContext();


export interface DataProviderContextType<T, F = Record<string, any>> {
    data: T[];
    setData: React.Dispatch<React.SetStateAction<T[]>>;
    filters: F;
    error: unknown;
    isLoading: boolean;
    updateFilters: (newFilters: Partial<F>) => void;
    refresh: (customFilters?: Partial<F>) => Promise<void>;
}

export interface DataProviderProps<T, F = Record<string, any>> {
    children: React.ReactNode;
    initialFilters?: F;
    initialData?: T[] | null;
    fetchFn: (filters: F) => Promise<T[]>;
}

export function createDataProvider<T, F = Record<string, any>>() {
    const Context = createContext<DataProviderContextType<T, F> | null>(null);

    const useDataContext = () => {
        const ctx = useContext(Context);
        if (!ctx) throw new Error('useDataContext must be used within its DataProvider');
        return ctx;
    };

    const DataProvider: React.FC<DataProviderProps<T, F>> = ({
        children,
        initialFilters = {} as F,
        initialData = null,
        fetchFn
    }) => {
        const [data, setData] = useState<T[]>(initialData ?? []);
        const fetchFnRef = useRef(fetchFn);
        const [filters, setFilters] = useState<F>(initialFilters);
        const [error, setError] = useState<unknown>(null);
        const [isLoading, setLoading] = useState<boolean>(false);

        useEffect(() => {
            fetchFnRef.current = fetchFn;
        }, [fetchFn]);

        const refresh = useCallback(
            async (customFilters: Partial<F> = filters) => {
                if (!fetchFnRef.current) return;
                setLoading(true);
                try {
                    const result = await fetchFnRef.current({ ...filters, ...customFilters } as F);
                    setData(result);
                } catch (err) {
                    setData([]);
                    setError(err);
                } finally {
                    setLoading(false);
                }
            },
            [filters, fetchFn]
        );

        useEffect(() => {
            refresh();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [refresh]);

        const updateFilters = (newFilters: Partial<F>) => {
            setFilters((prev) => ({ ...prev, ...newFilters }));
        };

        return (
            <Context.Provider
                value={{
                    data,
                    setData,
                    filters,
                    error,
                    isLoading,
                    updateFilters,
                    refresh
                }}
            >
                {children}
            </Context.Provider>
        );
    };

    return {
        DataProvider,
        useDataContext,
    };
}