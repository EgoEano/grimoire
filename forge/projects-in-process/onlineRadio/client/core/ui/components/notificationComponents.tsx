import { Button, View, ModalCard } from "@client/core/ui/components/interfaceComponents";
import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";

import type { NotifyItem, DialogItem } from "@client/core/types/notificationTypes";

const style = StyleSheet.create({
    //confirm
    confirmModal: {
        minWidth: 200,
        maxWidth: '90%',
        flex: 1,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
    },
    confirmTextArea: {
        maxWidth: '90%',
        gap: 16,
    },
    confirmSubtitle: {
        fontSize: 21,
    },
    confirmButtonArea: { 
        width: '100%',
        display: 'flex', 
        flex: 1,
        justifyContent: 'space-around',
        flexDirection: 'row',
        marginTop: 16,
    },
    confirmButton: {
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
    },
    //notify
    notifyWrapper: {
        position: 'absolute',
        alignItems: 'flex-start',
        left: 10,
        bottom: 10,
        maxWidth: 500,
    },
    notifyCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderColor: '#000',
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        margin: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    }
});


export function NotifyView({ 
    queue,
    timeout,
    handleClose
}: { 
    queue: NotifyItem[];
    timeout: number;
    handleClose: (id: string) => void;
}) {
    return (
        <View
            isScrollable={false}
            isAllowHorizontalScroll={false}
            showsVerticalScrollIndicator={false}
            style={style.notifyWrapper}
        >
            {queue.map(item => (
                <NotifyCard
                    key={item.id}
                    item={item}
                    timeout={item?.timeout ?? timeout}
                    handleClose={handleClose}
                />
            ))}
        </View>
    );
}

export function NotifyCard({
    item,
    timeout,
    handleClose,
}: {
    item: NotifyItem;
    timeout: number;
    handleClose: (id: string) => void;
}) {
    const {id, message, header} = item;

    useEffect(() => {
        const tm = setTimeout(() => {
            handleClose(id);
        }, timeout * 1000);

        return () => clearTimeout(tm);
    }, []);

    return (
        <View style={style.notifyCard}>
            {header && <Text>{header}</Text>}
            <Text>{message}</Text>
        </View>
    );
}

export function DialogView({ 
    item,
    handleClose,
    confirmText = "OK",
    cancelText = "Cancel",
}: { 
    item: DialogItem;
    handleClose: () => void;
    confirmText?: string;
    cancelText?: string;
}) {
    if (!item) return null;

    const { type, header, message, onConfirm, onCancel, resolve } = item;
  
    const handleConfirm = async () => {
        handleClose();
        onConfirm?.({});
        resolve(true);
    };

    const handleCancel = async () => {
        handleClose();
        onCancel?.({});
        resolve(false);
    };

    return (
        <ModalCard 
            isShow={true} 
            setIsShow={() => null}
            isHasCross={false}
            closable={false}
            style={{
                card: style.confirmModal
            }}
        >
            <View style={style.confirmTextArea}>
                {header && <Text style={style.confirmSubtitle}>{header}</Text>}
                <Text>{message}</Text>
            </View>
            <View style={style.confirmButtonArea}>
                <Button 
                    title={confirmText} 
                    style={{
                        button: style.confirmButton
                    }}
                    onPress={handleConfirm}
                />
                {(type === 'confirm') && <Button 
                    title={cancelText} 
                    style={{
                        button: style.confirmButton
                    }}
                    onPress={handleCancel}
                />}
            </View>
        </ModalCard>
    );
}