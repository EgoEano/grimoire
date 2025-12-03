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
import { throttle } from "../utils/utils";

import type { StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { ReactNode } from 'react';

type ScreenCategory = "compact" | "spacious";
type RNStyle = StyleProp<ViewStyle | TextStyle | ImageStyle>;

interface StyleVariants {
    main: RNStyle;
    compact?: RNStyle;
    spacious?: RNStyle;
}

interface StyleProviderContext {
    styles: Record<string, RNStyle>;
    dimensions: CustomDimensions;
    add: (name: string, styleVariants: StyleVariants | RNStyle) => void;
    addGroup: (group: Record<string, StyleVariants | RNStyle>) => void;
}

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
    const stylesRef = useRef<Record<string, StyleVariants>>({});
    const screenCategory = useRef<ScreenCategory>(getScreenCategory());
    const dimensionsRef = useRef<CustomDimensions>(getDimensions());

    const updateUI = throttle(() => {
        setVersion(v => v + 1);
    }, 150);

    const add = useCallback((name: string, styleVariants: StyleVariants | RNStyle) => {
        if (typeof name !== 'string' || name.trim().length === 0) {
            console.error(`StyleServiceProvider. Style name must be a non-empty string.`);
            return;
        }
        if (!styleVariants || typeof styleVariants !== 'object') {
            console.error(`StyleServiceProvider. Invalid style object for '${name}'.`);
            return;
        }

        const isStyleVariants = 
            ('main' in styleVariants) ||
            ('compact' in styleVariants) ||
            ('spacious' in styleVariants);

        stylesRef.current[name] = {
            main: isStyleVariants ? ((styleVariants as StyleVariants).main || {}) : {}, 
            compact: isStyleVariants ? ((styleVariants as StyleVariants).compact || {}) : {},
            spacious: isStyleVariants ? ((styleVariants as StyleVariants).spacious || {}) : {},
        };

        updateUI();
    }, []);


    const addGroup = (group: Record<string, StyleVariants | RNStyle>) => {
        if (!group || typeof group !== 'object') {
            console.warn('StyleProvider: Invalid group passed to addGroup.');
            return;
        }

        for (const [name, styleVariants] of Object.entries(group)) {
            add(name, styleVariants);
        }
    };   
    
    const computedStyles = useMemo<Record<string, RNStyle>>(() => {
        const category = screenCategory.current;
        const result: Record<string, RNStyle> = {};
        for (const [name, variants] of Object.entries(stylesRef.current as Record<
            string,
            { main?: Record<string, RNStyle>; compact?: Record<string, RNStyle>; spacious?: Record<string, RNStyle> }
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
            dimensionsRef.current = getDimensions();

            updateUI();
        };

        const subscription = Dimensions.addEventListener("change", handleResize);
        return () => subscription?.remove();
    }, []);


    const value = useMemo<StyleProviderContext>(() => ({
        styles: computedStyles,
        get dimensions() {
            return dimensionsRef.current;
        },
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