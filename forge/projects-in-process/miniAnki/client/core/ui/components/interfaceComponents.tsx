import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
    Pressable as RNPressable,
    Text as RNText,
    StyleSheet,
    View as RNView,
    ScrollView as RNScrollView,
    TextInput as RNTextInput,
} from 'react-native';

import type { Dispatch, SetStateAction } from 'react';
import type {
    ViewStyle,
    TextStyle,
    GestureResponderEvent,
    StyleProp,
    TextProps as RNTextProps
} from 'react-native';

import { useStyleContext } from "@client/core/services/providers/styleProvider";


//#region Atoms
//#region Button
type Props_ButtonStyleGroup = {
    button?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
    pressed?: StyleProp<ViewStyle>;
    disabled?: StyleProp<ViewStyle>;
};
type Props_Button = {
    title?: string;
    onPress?: (event: GestureResponderEvent) => void;
    onLongPress?: (event: GestureResponderEvent) => void;
    disabled?: boolean;
    android_ripple?: {
        color?: string;
        borderless?: boolean;
        radius?: number;
        foreground?: boolean;
    };
    variant?: 'primary' | 'secondary' | "success" | "error" | "disabled";
    style?: Props_ButtonStyleGroup;
    textStyle?: StyleProp<TextStyle>;
    children?: React.ReactNode;
};
export function Button({
    title,
    onPress,
    onLongPress,
    disabled = false,
    android_ripple,
    style = {},
    variant = 'primary',
    children,
}: Props_Button) {
    const {theme} = useStyleContext();

    const style_inner = useMemo(() => StyleSheet.create({
        button: {
            backgroundColor: '#1e90ff',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            alignItems: 'center',
        },
        pressed: {
            opacity: 0.6,
            transform: [{ scale: 0.97 }],
        },
        disabled: {
            opacity: 0.4,
        },
        text: {
            color: 'white',
            fontSize: 16,
        },
    }), []);

    return (
        <RNPressable
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={disabled}
            android_ripple={android_ripple}
            style={({ pressed }) => [
                style_inner.button,
                pressed && style_inner.pressed,
                disabled && style_inner.disabled,

                theme?.components.button[variant]?.container,
                disabled && theme?.components.button.disabled.container,

                style?.button,
                pressed && style?.pressed,
                disabled && style?.disabled,
            ]}
        >
            {children ?? <RNText style={[
                style_inner.text, 
                theme?.components.button[variant]?.text,
                style?.text
            ]}>{title ?? ''}</RNText>}
        </RNPressable>
    );
}

//#endregion

//#region Text
type TextStyleGroup = {
    title?: StyleProp<TextStyle>;
    body?: StyleProp<TextStyle>;
    label?: StyleProp<TextStyle>;
};

type TextProps = RNTextProps & {
    variant?: "title" | "subtitle" |  "body" | "label";
    colorVariant?: "primary" | "secondary";
    style?: StyleProp<TextStyle>;
    [key: string]: any;
};

export function Text({ 
    variant = "body", colorVariant = "primary", style, children, ...props 
}: TextProps) {
    const { theme } = useStyleContext();

    const textStyle = useMemo(() => {
        const t = theme?.components?.text;
        const color = theme?.semantics.colors.text[colorVariant] ?? theme?.semantics.colors.text.primary
        if (!t) return style;
        const baseStyle = t?.[variant] ?? {};

        return [baseStyle, {color}, style];
    }, [theme, variant, style, colorVariant]);

    return (
        <RNText style={textStyle} {...props}>
            {children}
        </RNText>
    );
}

//#endregion

//#region InputText:string
{/* <InputText value={"value"} onChange={onChange} style={style}/> */ }
type Props_InputTextGroup = {
    container?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
    placeholder?: StyleProp<ViewStyle>;
    focused?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
};

type InputTextProps = {
    value: string;
    name?: string;
    placeholder?: string;
    onChange?: (val: string, name?: string | null) => void;
    error?: boolean;
    variant?: "primary" | "secondary" | "success" | "error" | "disabled" | "inverse";
    style?: Props_InputTextGroup;
    [key: string]: any;
};

export function InputText({
    value,
    name,
    placeholder = '',
    onChange,
    error = false,
    style = {},
    variant = "primary",
    ...props 
}: InputTextProps) {
    const {theme} = useStyleContext();

    const [focused, setFocused] = useState(false);
        
    const handleChange = (val: string) => {
        onChange?.(val, name ?? null);
    };

    const style_inner = useMemo(() => {
        const base = theme?.components.input;
        const color = theme?.semantics.colors.text[variant] ?? theme?.semantics.colors.text.primary
        console.log('color ' + color);
        
        return StyleSheet.create({
            container: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(base?.container ?? {}),
                ...(base?.text ?? {}),
                color,
                ...(style?.container ?? {}),
                ...(style?.text ?? {}),
                ...(focused ? base?.focusedBorder : {}),
                ...(focused ? style?.focused : {}),
                ...(error ? base?.errorBorder : {}),
                ...(error ? style?.error : {}),
            },
            text: {
                ...(base?.text ?? {}),
                color,
                ...(style?.text ?? {}),
            },
            placeholder: {
                ...(base?.placeholder ?? {}),
                color,
                ...(style?.placeholder ?? {}),
            }
        });
    }, [theme, focused, error, style, variant]);

    return (
        <RNTextInput 
            value={value} 
            onChangeText={handleChange} 
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={style_inner.container} 
            placeholder={placeholder}
            placeholderTextColor={style_inner.placeholder}
            {...props} 
        />
    );
}
//#endregion

//#endregion

//#region Moleculas
//#region Modal
{/* 
    <Modal
        isShow={isShow} 
        setIsShow={setIsShow}
        closable={closable}
    >
        content
    </Modal> 
*/}
type ModalProps = {
    isShow: boolean,
    setIsShow: Dispatch<SetStateAction<boolean>>,
    closable?: boolean,
    style?: StyleProp<ViewStyle>,
    children: React.ReactNode;
};
export function Modal({
    isShow,
    setIsShow,
    closable = true,
    children,
    style = {},
}: ModalProps) {
    const {theme} = useStyleContext();

    const style_inner = useMemo(() => StyleSheet.create({
        main: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000cf',
            backdropFilter: `blur(${theme?.semantics.colors.overlays.blur ?? 0}px)`,
            ...(theme?.components.modal.overlay ?? {}),
            ...(style ?? {})
        },
    }), [style]);

    const toggleShow = () => {
        if (closable) setIsShow?.(s => !s);
    };

    if (!isShow) return null;

    return (
        <RNPressable
            onPress={toggleShow}
            style={style_inner.main}
        >
            <RNPressable onPress={() => { }}>
                {children}
            </RNPressable>
        </RNPressable>
    );
}
//#endregion

//#region ModalCard
{/* 
    <ModalCard 
        isShow={isShow} 
        setIsShow={setIsShow}
    >
        children
    </ModalCard> 
*/}
type ModalCardProps = {
    isShow: boolean,
    setIsShow: Dispatch<SetStateAction<boolean>>,
    isHasCross?: boolean,
    closable?: boolean,
    children: React.ReactNode,
    style?: ModalCard_StyleGroupProps,
};
type ModalCard_StyleGroupProps = {
    modal?: ViewStyle;
    wrapper?: ViewStyle;
    card?: ViewStyle;
    content?: ViewStyle;
};
export function ModalCard({
    isShow,
    setIsShow,
    isHasCross = true,
    closable = true,
    children,
    style,
}: ModalCardProps) {
    const { theme } = useStyleContext();

    const style_inner = useMemo(() => StyleSheet.create({
        modal: style?.modal ?? {},
        wrapper: {
            position: 'relative',
            maxWidth: '100%',
            maxHeight: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            ...(style?.wrapper ?? {})
        },
        closeButton: {
            position: 'absolute',
            top: -32,
            right: 10,
            backgroundColor: 'transparent',
            borderColor: '#00000000',
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
        },
        closeButtonText: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 24,
            lineHeight: 20,
        },
        card: {
            position: 'relative',
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: 12,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            ...(style?.card ?? {})
        },
        content: style?.content ?? {}
    }), [style]);

    return (
        <Modal
            isShow={isShow}
            setIsShow={setIsShow}
            closable={closable}
            style={style_inner.modal}
        >
            <View style={style_inner.wrapper} >
                {isHasCross && (
                    <RNPressable
                        style={style_inner.closeButton}
                        onPress={() => setIsShow(false)}
                        hitSlop={10}
                    >
                        <RNText style={style_inner.closeButtonText}>⛌</RNText>
                    </RNPressable>
                )}
                <Card
                    isScrollable={false}
                    isAllowHorizontalScroll={false}
                    showsVerticalScrollIndicator={false}
                    style={{
                        card: style_inner.card,
                        content: style_inner.content,
                    }}
                >
                    {children}
                </Card>
            </View>
        </Modal>
    );
}
//#endregion

//#region View 
{/* 
    <View
        isScrollable={isScrollable}
        isAllowHorizontalScroll={isAllowHorizontalScroll}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        style={style}
    ></View> 
*/}
type ViewProps = React.ComponentProps<any> & {
    isScrollable?: boolean;
    isAllowHorizontalScroll?: boolean;
    showsVerticalScrollIndicator?: boolean;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
    [key: string]: any;
};
export function View({
    isScrollable = false,
    isAllowHorizontalScroll = false,
    showsVerticalScrollIndicator = true,
    style = {},
    children,
    ...props
}: ViewProps) {
    const style_inner = useMemo(() => StyleSheet.create({
        main: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            ...style
        }
    }), [style]);

    return (
        isScrollable ?
            <RNScrollView
                style={{ width: '100%' }}
                contentContainerStyle={style_inner.main}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                bounces={true}
                horizontal={isAllowHorizontalScroll}
                {...props}
            >
                {children}
            </RNScrollView> :
            <RNView style={style_inner.main} {...props}>
                {children}
            </RNView>
    );
};
//#endregion

//#region Card
type Card_StyleGroupProps = {
    card?: StyleProp<ViewStyle>;
    content?: StyleProp<ViewStyle>;
};
type CardProps = {
    isScrollable?: boolean;
    isAllowHorizontalScroll?: boolean;
    showsVerticalScrollIndicator?: boolean;
    style?: Card_StyleGroupProps;
    children: React.ReactNode;
    [key: string]: any;
};
export function Card({
    isScrollable = false,
    isAllowHorizontalScroll = false,
    showsVerticalScrollIndicator = true,
    style = {},
    children,
    ...props
}: CardProps) {
    const { theme } = useStyleContext();

    const cardTheme = theme?.components.card

    const styleInner = useMemo(() => StyleSheet.create({
        card: {
            position: 'relative',
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: 12,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            ...(cardTheme?.container ?? {}),
            ...(style?.card ?? {})
        },
        content: {
            width: '100%',
            flex: 1,
            ...(cardTheme?.content ?? {}),
            ...(style?.content ?? {})
        }
    }), [style, theme]);

    return (
        <View
            isScrollable={isScrollable}
            isAllowHorizontalScroll={isAllowHorizontalScroll}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            style={styleInner.card}
        >
            <View style={styleInner.content}>
                {children}
            </View>
        </View>
    );
}
//#endregion


//#region FormContent
type FormContentContextType = {
    values: Record<string, any>;
    handleChange: (value: any, key: string) => void;
    handleSubmit: (options?: any) => void;
    handleCancel: (options?: any) => void;
};

interface FormContentProps {
    formData?: Record<string, any>;
    formDataRules?: Record<string, ((value: any, data: Record<string, any>) => boolean) | undefined>;
    onSubmit?: (params: { data: Record<string, any>; options?: any; validation: { success: boolean; errors: string[] } }) => void;
    onCancel?: (params: { data: Record<string, any>; options?: any; validation: { success: boolean; errors: string[] } }) => void;
    onChange?: (params: { values: Record<string, any>; lastChangedKey: string | null }) => any;
    isResetOnAction?: boolean;
    children?: React.ReactNode | ((args: { 
        values: Record<string, any>; 
        handleChange: (v: any, k: string) => void; 
        handleSubmit: (options?: any) => void ;
        handleCancel: (options?: any) => void ;
    }) => React.ReactNode);
    style?: React.CSSProperties;
    [key: string]: any;
};

type FormContentAction = {
    type: 'update_field';
    key: string;
    value: any;
} | {
    type: 'set_values';
    values: Record<string, any>;
} | {
    type: 'reset';
    initial: Record<string, any>;
};

const style_FormContent = StyleSheet.create({main: { 
    width: '100%',
    display: "flex", 
    flexDirection: "column", 
    gap: 10,
}});
const formReducer = (
    state: Record<string, any>, 
    action: FormContentAction
) => {
    switch(action.type) {
        case 'update_field':
            return { ...state, [action.key]: action.value };
        case 'set_values':
            return { ...action.values };
        case 'reset':
            return {};
        default:
            return state;
    }
};

const FormContentContext = createContext<FormContentContextType | null>(null);
export const useFormContext = () => useContext(FormContentContext);

export function FormContent({ 
    formData = {}, 
    formDataRules = {}, 
    onSubmit,
    onCancel,
    onChange, 
    isResetOnAction = true,
    children, 
    style = {}, 
    ...props 
}: FormContentProps) {
    const initial = useRef<Record<string, any>>(formData);
    const [values, dispatch] = useReducer(formReducer, formData);
    const lastChangedKey = useRef<string | null>(null);
    
    const handleChange = (value: any, key: string) => {
        if (!key) return;
        lastChangedKey.current = key;
        dispatch({ type: 'update_field', key, value });
    };
  
    const validateData = (data: any, rules: any) => {
        const errors: string[] = [];
        Object.entries(data).forEach(([k, v]) => { 
            const rule = rules[k];
            if (
                rule && 
                typeof rule === 'function' &&
                !rule(v, data)
            ) {
                errors.push(k);
            }
        });
    
        return {
            success: errors.length === 0,
            errors: errors,
        }
    };
  
    const handleSubmit = (options: any) => {
        const validation = validateData(values, formDataRules);
        onSubmit?.({
            data: values, 
            options, 
            validation, 
        });
        if (isResetOnAction) handleReset();
    };

    const handleCancel = (options: any) => {
        const validation = validateData(values, formDataRules);
        onCancel?.({
            data: values, 
            options, 
            validation, 
        });
        if (isResetOnAction) handleReset();
    };

    const handleReset = () => {
        dispatch({ type: "reset", initial: initial.current });
    };

    const shallowEqual = useCallback((a: any, b: any) => {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (let key of keysA) {
            if (a[key] !== b[key]) return false;
        }
        return true;
    }, []);
  
    useEffect(() => {
        if (!onChange) return;

        const updated = onChange?.({values, lastChangedKey: lastChangedKey.current});
        if (!updated) return;

        if (!shallowEqual(updated, values)) {
            dispatch({ type: 'set_values', values: updated.data ?? updated });
        }
    }, [values]);
  
    return (
        <FormContentContext.Provider value={{values, handleChange, handleSubmit, handleCancel}}>
            <View 
                style={{...style_FormContent.main, ...style}} 
                {...props}
            >
                {typeof children === "function" ? children({ values, handleChange, handleSubmit, handleCancel }) : children}
            </View>
        </FormContentContext.Provider>
    );
}
  
//#endregion


//#endregion
