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


export function createDataProvider() {
    const Context = createContext();

    const useDataContext = () => {
        const ctx = useContext(Context);
        if (!ctx) throw new Error('useDataContext must be used within its DataProvider');
        return ctx;
    };

    const DataProvider = ({ 
        children, 
        initialFilters = {}, 
        initialData = null,
        fetchFn 
    }) => {
        const [data, setData] = useState(initialData ?? []);
        const fetchFnRef = useRef(fetchFn);
        const [filters, setFilters] = useState(initialFilters);
        const [error, setError] = useState(null);
        const [isLoading, setLoading] = useState(false);

        useEffect(() => {
            fetchFnRef.current = fetchFn;
        }, [fetchFn]);

        const refresh = useCallback(async (customFilters = filters) => {
            if (!fetchFnRef.current) return;
            setLoading(true);
            try {
                const result = await fetchFnRef.current(customFilters);
                setData(result);
            } catch (err) {
                setData([]);
                setError(err);
            } finally {
                setLoading(false);
            }
        }, [filters, fetchFn]);

        useEffect(() => {
            refresh();
        }, [refresh]);

        const updateFilters = (newFilters) => {
            setFilters((prev) => ({ ...prev, ...newFilters }));
        };

        return (
            <Context.Provider value={{
                data,
                setData,
                filters,
                error,
                isLoading,
                updateFilters,
                refresh
            }}>
                {children}
            </Context.Provider>
        );
    };

    return {
        DataProvider,
        useDataContext,
    };
}