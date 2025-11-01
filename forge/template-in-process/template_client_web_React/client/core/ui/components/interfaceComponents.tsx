import React, { Children, Dispatch, SetStateAction, useMemo } from 'react';
import {
  Pressable,
  Text,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';


//#region Atoms
//#region Button
type Props_ButtonStyleGroup = {
  button?: ViewStyle;
  text?: TextStyle;
  pressed?: ViewStyle;
  disabled?: ViewStyle;
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
  style?: Props_ButtonStyleGroup;
  textStyle?: TextStyle;
  children?: React.ReactNode;
};

const baseStyle_Button = StyleSheet.create({
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
});
export function Button({
    title,
    onPress,
    onLongPress,
    disabled = false,
    android_ripple,
    style = {},
    children
}: Props_Button) {
    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={disabled}
            android_ripple={android_ripple}
            style={({ pressed }) => [
                baseStyle_Button.button,
                pressed && baseStyle_Button.pressed,
                disabled && baseStyle_Button.disabled,
                style?.button,
                pressed && style?.pressed,
                disabled && style?.disabled,
            ]}
        >
            {children ?? <Text style={[baseStyle_Button.text, style?.text]}>{title ?? ''}</Text>}
        </Pressable>
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
    closable: boolean, 
    style?: ViewStyle, 
    children: React.ReactNode;
};
export function Modal({
    isShow, 
    setIsShow, 
    closable = true, 
    children, 
    style, 
}: ModalProps) {

    const style_inner = useMemo(() => StyleSheet.create({
        main: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000cf',
            ...(style ?? {})
        },
    }), [style]);
  
    const toggleShow = () => {
        if (closable) setIsShow?.(s => !s);
    };

  if (!isShow) return null;

  return (
    <Pressable
      onPress={toggleShow}
      style={style_inner.main}
    >
      {children}
    </Pressable>
  );
}
//#endregion

//#region ModalCard !!!!!!!!!!!!!!!!!!!!!!!!!!
{/* <ModalCard isShow={isShow} setIsShow={setIsShow}>children</ModalCard> */}
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
};
export function ModalCard({
    isShow,
    setIsShow,
    isHasCross = true,
    closable = true,
    children,
    style,
}: ModalCardProps) {

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
            //flex: 1,
            backgroundColor: '#fff',
            borderRadius: 12,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            ...(style?.card ?? {})
        },
    }), [style]);

    return (
        <Modal 
            isShow={isShow} 
            setIsShow={setIsShow} 
            closable={closable}
            style={style_inner.modal}
        >
            <View style={style_inner.wrapper}>
                {isHasCross && (
                    <Pressable
                        style={style_inner.closeButton}
                            onPress={() => setIsShow(false)}
                            hitSlop={10}
                        >
                        <Text style={style_inner.closeButtonText}>⛌</Text>
                    </Pressable>
                )}
                <CView
                    isScrollable={false}
                    isAllowHorizontalScroll={false}
                    showsVerticalScrollIndicator={false}
                    style={style_inner.card}
                >
                    {children}
                </CView> 

            </View>
        </Modal>
    );
}
//#endregion

//#region CView 
{/* 
    <CView
        isScrollable={isScrollable}
        isAllowHorizontalScroll={isAllowHorizontalScroll}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        style={style}
    ></CView> 
*/}
type CViewProps = {
    isScrollable: boolean;
    isAllowHorizontalScroll: boolean;
    showsVerticalScrollIndicator: boolean;
    style?: ViewStyle;
    children: React.ReactNode;
};
export function CView({ 
    isScrollable = false,
    isAllowHorizontalScroll = false,
    showsVerticalScrollIndicator = true,
    style = {}, 
    children, 
}: CViewProps) {
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
        <ScrollView 
            style={{width: '100%'}}
            contentContainerStyle={style_inner.main}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            bounces={true}
            horizontal={isAllowHorizontalScroll}
        >
            {children}
        </ScrollView> :
        <View style={style_inner.main}>
            {children}
        </View>
  );
};
//#endregion



//#endregion
