import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useStyleContext } from '../../../core/services/providers/styleProvider';
import { View, Text } from '../../../core/ui/components/interfaceComponents';

interface GradientHeaderProps {
    title: string;
    action?: {
        icon: string; // Emoji or text for now
        onPress: () => void;
    };
}

export function Header({ title, action }: GradientHeaderProps) {
    const { theme } = useStyleContext();

    const styles = useMemo(() => StyleSheet.create({
        content: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme?.tokens.sizes.spacing.lg,
            paddingVertical: theme?.tokens.sizes.spacing.sm,
        },
        title: {
            textShadowColor: theme?.tokens.colors.primary,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
            fontWeight: 'bold',
        },
    }), [theme]);

    if (!theme) return null;

    return (
        <View style={styles.content}>
            <Text style={styles.title} variant="title" colorVariant={'secondary'}>{title}</Text>
            {action && (
                <TouchableOpacity onPress={action.onPress}>
                    <Text variant={'subtitle'}>{action.icon}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

