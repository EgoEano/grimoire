import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { View, Text, InputText, Button } from '../../../core/ui/components/interfaceComponents';
import { useStyleContext } from '../../../core/services/providers/styleProvider';
import { Category } from '../types/budget';

interface CategoryFormProps {
    initialValues?: Partial<Category>;
    onSubmit: (category: Omit<Category, 'id'>) => void;
    onCancel: () => void;
}

const COLORS = [
    '#FF0055', // Red/Pink
    '#00F0FF', // Cyan
    '#7000FF', // Purple
    '#c23434', // Error Red
    '#FFB800', // Yellow
    '#00FF9D', // Green
    '#FF00FF', // Magenta
    '#818181ff', // Grey
];

export const CategoryForm = ({ initialValues, onSubmit, onCancel }: CategoryFormProps) => {
    const { theme } = useStyleContext();
    const [label, setLabel] = useState(initialValues?.label || '');
    const [color, setColor] = useState(initialValues?.color || COLORS[0]);

    const handleSubmit = () => {
        if (!label.trim()) return;
        onSubmit({
            label,
            color,
        });
    };

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            gap: 30,
        },
        colorGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 8,
        },
        colorOption: {
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: 'transparent',
        },
        selectedColor: {
            borderColor: theme?.tokens.colors.onSurface,
        },
        row: {
            flexDirection: 'row',
            gap: 12,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 16,
        },
        button: {
            flex: 1,
        }
    });

    return (
        <View style={styles.container}>
            <Text colorVariant='secondary' variant="subtitle">Category Details</Text>

            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text colorVariant='secondary' variant="label">Name</Text>
                    <InputText
                        value={label}
                        variant={'secondary'}
                        onChange={setLabel}
                        placeholder="Category Name"
                    />
                </View>
            </View>

            <View>
                <Text colorVariant='secondary' variant="label">Color</Text>
                <View style={styles.colorGrid}>
                    {COLORS.map(c => (
                        <TouchableOpacity
                            key={c}
                            style={[
                                styles.colorOption,
                                { backgroundColor: c },
                                color === c && styles.selectedColor
                            ]}
                            onPress={() => setColor(c)}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.buttonRow}>
                <Button
                    onPress={onCancel}
                    variant="secondary"
                    style={{ button: styles.button }}
                >
                    <Text colorVariant='secondary'>Cancel</Text>
                </Button>
                <Button
                    onPress={handleSubmit}
                    style={{ button: styles.button }}
                >
                    <Text>Save</Text>
                </Button>
            </View>
        </View>
    );
};
