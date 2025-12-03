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
import { templateTokens, createSemantics, createComponents } from "@client/core/ui/styles/themes";

import type { ReactNode } from 'react';
import type { Theme, StyleTokens } from "@client/core/types/themeTypes";


type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface StyleProviderContext {
    styles: Record<string, Record<string, any>>;
    dimensions: CustomDimensions;
    theme: Theme | null;
    createTheme: (partialTokens?: DeepPartial<StyleTokens> | null) => void;
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
    const stylesRef = useRef<Record<string, any>>({});
    const themeRef = useRef<Theme | null>(null);
    const screenCategory = useRef<ScreenCategory>(getScreenCategory());
    const dimensionsRef = useRef<CustomDimensions>(getDimensions());

    const updateUI = () => setVersion(v => v + 1);

    const add = useCallback((name: string, styleVariants: any) => {
        if (typeof name !== 'string' || name.trim().length === 0) {
            console.error(`StyleServiceProvider. Style name must be a non-empty string.`);
            return;
        }
        if (!styleVariants || typeof styleVariants !== 'object') {
            console.error(`StyleServiceProvider. Invalid style object for '${name}'.`);
            return;
        }        

        stylesRef.current[name] = {
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
        updateUI();

    };   
    
    const styles = useMemo<Record<string, Record<string, any>>>(() => {
        const category = screenCategory.current;
        const result: Record<string, Record<string, any>> = {};
        for (const [name, variants] of Object.entries(stylesRef.current as Record<
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

    const createTheme = (partialTokens?: DeepPartial<StyleTokens> | null) => {
        themeRef.current = buildTheme(partialTokens);
        updateUI();
    };

    useEffect(() => {
        const handleResize = (dims: DimensionsArgs) => {
            if (!dims.window) return;

            const newCategory = getScreenCategory(dims.window.width);
            screenCategory.current = newCategory;
            dimensionsRef.current = getDimensions();

            updateUI();
        };

        const subscription = Dimensions.addEventListener("change", handleResize);
        return () => subscription?.remove();
    }, []);


    const value = useMemo<StyleProviderContext>(() => ({
        styles,
        get dimensions() {
            return dimensionsRef.current;
        },
        get theme() {
            return themeRef.current;
        },
        createTheme,
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

export const buildTheme = (partialTokens?: DeepPartial<StyleTokens> | null): Theme => {
    const mergedTokens: StyleTokens = {
        colors: partialTokens?.colors ? {
            ...templateTokens.colors,
            ...(partialTokens?.colors || {})
        } : templateTokens.colors,
        sizes: partialTokens?.sizes ? {
            spacing: {
                ...templateTokens.sizes.spacing,
                ...(partialTokens?.sizes.spacing || {})
            },
            radius: {
                ...templateTokens.sizes.radius,
                ...(partialTokens?.sizes.radius || {})
            },
            borderWidth: {
                ...templateTokens.sizes.borderWidth,
                ...(partialTokens?.sizes.borderWidth || {})
            },
            backdrop: {
                ...templateTokens.sizes.backdrop,
                ...(partialTokens?.sizes.backdrop || {})
            }
        } : templateTokens.sizes,
        typography: partialTokens?.typography ? {
            fontFamily: partialTokens?.typography.fontFamily ?? templateTokens.typography.fontFamily,
            fontSize: {
                ...templateTokens.typography.fontSize,
                ...(partialTokens?.typography.fontSize || {})
            },
            fontWeight: {
                ...templateTokens.typography.fontWeight,
                ...(partialTokens?.typography.fontWeight || {})
            },
            lineHeight: {
                ...templateTokens.typography.lineHeight,
                ...(partialTokens?.typography.lineHeight || {})
            }
        } : templateTokens.typography,
        elevation: {
            ...templateTokens.elevation,
            ...(partialTokens?.elevation || {})
        }
    };

    const semantics = createSemantics(mergedTokens);
    const components = createComponents(mergedTokens, semantics);

    return {
        tokens: mergedTokens,
        semantics,
        components
    };
};