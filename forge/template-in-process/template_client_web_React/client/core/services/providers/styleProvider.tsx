import React, { 
    createContext, 
    useContext, 
    useState, 
    useCallback, 
    useMemo,
    useEffect,
    useRef
 } from "react";
import { Dimensions } from 'react-native';

import type { ReactNode } from 'react';


interface StyleProviderContext {
    styles: Record<string, Record<string, any>>;
    dimensions: React.MutableRefObject<CustomDimensions>;
    add: (name: string, styleVariants: any) => void;
    addGroup: (group: Record<string, any>) => void;

}

type ScreenCategory = "compact" | "spacious";

interface DimensionsArgs { 
    window: { width: number, height: number, scale: number, fontScale: number } 
}

interface CustomDimensions {
    width: number,
    height: number,
    visibleWidth: number,
    visibleHeight: number,
}


const getScreenCategory = (width?: number | null): ScreenCategory =>  (width ?? Dimensions.get('window').width) < 1000 ? "compact" : "spacious";  
const getDimensions = (): CustomDimensions => {
    const wndw = Dimensions.get('window');
    const vv = (globalThis as any).visualViewport;
    return {
        width: wndw.width,
        height: wndw.height,
        visibleWidth: vv?.width ?? wndw.width,
        visibleHeight: vv?.height ?? wndw.height,
    };
};

const StyleContext = createContext<StyleProviderContext | null>(null);

export const StyleProvider = ({children}: { children: ReactNode }) => {
    const [version, setVersion] = useState(0);
    const styles = useRef<Record<string, any>>({});
    const screenCategory = useRef<ScreenCategory>(getScreenCategory());
    const dimensions = useRef<CustomDimensions>(getDimensions());


    const add = useCallback((name: string, styleVariants: any) => {
        if (typeof name !== 'string' || name.trim().length === 0) {
            console.error(`StyleServiceProvider. Style name must be a non-empty string.`);
            return;
        }
        if (!styleVariants || typeof styleVariants !== 'object') {
            console.error(`StyleServiceProvider. Invalid style object for '${name}'.`);
            return;
        }        

        styles.current[name] = {
            main: styleVariants?.main || styleVariants || {},
            compact: styleVariants?.compact || {},
            spacious: styleVariants?.spacious || {},
        };
    }, []);


    const addGroup = (group: Record<string, any>) => {
        if (!group || typeof group !== 'object') {
            console.warn('StyleProvider: Invalid group passed to addGroup.');
            return;
        }

        for (const [name, styleVariants] of Object.entries(group)) {
            add(name, styleVariants);
        }
        setVersion(v => v + 1);

    };   
    
    const computedStyles = useMemo<Record<string, Record<string, any>>>(() => {
        const category = screenCategory.current;
        const result: Record<string, Record<string, any>> = {};
        for (const [name, variants] of Object.entries(styles.current as Record<
            string,
            { main?: Record<string, any>; compact?: Record<string, any>; spacious?: Record<string, any> }
        >)) {
            result[name] = {
              ...(variants.main ?? {}),
              ...(variants[category as keyof typeof variants] ?? {}),
            };
        }        
        return result;
    }, [version]);

    useEffect(() => {
        const handleResize = (dims: DimensionsArgs) => {
            if (!dims.window) return;

            const newCategory = getScreenCategory(dims.window.width);
            screenCategory.current = newCategory;
            dimensions.current = getDimensions();

            setVersion(v => v + 1);
        };

        const subscription = Dimensions.addEventListener("change", handleResize);
        return () => subscription?.remove();
    }, []);


    const value = useMemo<StyleProviderContext>(() => ({
        styles: computedStyles,
        dimensions,
        add,
        addGroup,
    }),[version]);

    return (
        <StyleContext.Provider value={value}>
            {children}
        </StyleContext.Provider>
    );
}

export const useStyleContext = (): StyleProviderContext => {
    const context = useContext(StyleContext);
    if (!context) {
      throw new Error('useStyleContext must be used within a StyleProvider');
    }
    return context;
  };