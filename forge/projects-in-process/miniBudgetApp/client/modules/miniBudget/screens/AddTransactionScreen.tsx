import React, { useState, useEffect, useMemo } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme as lightTheme, darkTheme } from '../theme';
import { useBudgetStore } from '../hooks/useBudgetStore';
import { Header } from '../components/GradientHeader';
import { CategorySelector } from '../components/CategorySelector';
import { CategoryId, TransactionType } from '../types/budget';
import { useStyleContext } from '../../../core/services/providers/styleProvider';
import { View, Text, InputText, Button } from '../../../core/ui/components/interfaceComponents';

export const AddTransactionScreen = () => {
    const navigation = useNavigation();
    const { addTransaction } = useBudgetStore();
    const { theme, initTheme, addTheme } = useStyleContext();

    useEffect(() => {
        addTheme('light', lightTheme);
        addTheme('dark', darkTheme);
        initTheme('light');
    }, []);

    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState<TransactionType>('expense');
    const [categoryId, setCategoryId] = useState<CategoryId>('food');

    const [isCategorySelectorShow, setIsCategorySelectorShow] = useState(false);
    const { categories } = useBudgetStore();
    const selectedCategory = categories.find(c => c.id === categoryId) || categories[0];

    const handleSave = () => {
        if (!amount) return;

        addTransaction({
            id: Date.now().toString(),
            amount: parseFloat(amount),
            categoryId: type === 'expense' ? categoryId : 'income',
            date: new Date().toISOString(),
            type,
            note,
        });

        navigation.goBack();
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'space-between',
            backgroundColor: theme?.tokens.colors.background,
            paddingHorizontal: theme?.tokens.sizes.spacing.md,
            paddingTop: theme?.tokens.sizes.spacing.sm,
            paddingBottom: theme?.tokens.sizes.spacing.lg,
        },
        typeContainer: {
            flexDirection: 'row',
            marginBottom: theme?.tokens.sizes.spacing.lg,
            backgroundColor: theme?.tokens.colors.surface,
            borderRadius: theme?.tokens.sizes.radius.md,
            padding: 4,
            width: '100%',
        },
        typeButton: {
            flex: 1,
            paddingVertical: theme?.tokens.sizes.spacing.sm,
            alignItems: 'center',
            borderRadius: theme?.tokens.sizes.radius.sm,
        },
        activeTypeExpense: {
            backgroundColor: theme?.tokens.colors.error,
        },
        activeTypeIncome: {
            backgroundColor: theme?.tokens.colors.success,
        },
        typeText: {
            fontSize: 14,
            color: theme?.tokens.colors.onSurface,
            fontWeight: '600',
        },
        activeTypeText: {
            color: '#fff',
        },
        inputContainer: {
            marginBottom: theme?.tokens.sizes.spacing.lg,
            width: '100%',
        },
        label: {
            marginBottom: theme?.tokens.sizes.spacing.sm,
            marginLeft: theme?.tokens.sizes.spacing.sm,
            color: theme?.tokens.colors.onSurface,
        },
        input: {
            fontSize: 32,
            fontWeight: 'bold',
            backgroundColor: theme?.tokens.colors.surface,
            borderRadius: theme?.tokens.sizes.radius.md,
            padding: theme?.tokens.sizes.spacing.md,
            color: theme?.tokens.colors.onSurface,
            textAlign: 'center',
        },
        inputSmall: {
            fontSize: 16,
            backgroundColor: theme?.tokens.colors.surface,
            borderRadius: theme?.tokens.sizes.radius.md,
            padding: theme?.tokens.sizes.spacing.md,
            color: theme?.tokens.colors.onSurface,
        },
        selectedCategoryContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme?.tokens.colors.surface,
            padding: theme?.tokens.sizes.spacing.md,
            borderRadius: theme?.tokens.sizes.radius.md,
            marginBottom: theme?.tokens.sizes.spacing.lg,
            borderWidth: 1,
            borderColor: selectedCategory?.color || 'transparent',
        },
        selectedCategoryBorderIncome: {
            borderColor: '#3CB371',
        },
        selectedCategoryIcon: {
            fontSize: 24,
            marginRight: 16,
            color: theme?.tokens.colors.onSurface,
        },
        selectedCategoryLabel: {
            fontSize: 18,
            fontWeight: '600',
            color: theme?.tokens.colors.onSurface,
            flex: 1,
        },
        changeText: {
            fontSize: 14,
            color: theme?.tokens.colors.primary,
        },
        saveButton: {
            width: '100%',
            shadowColor: theme?.tokens.colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 5,
        },
        saveText: {
            fontWeight: '600',
            letterSpacing: 1,
        },
    }), [theme, selectedCategory]);

    if (!theme) return null;

    return (
        <>
            <View
                style={styles.container}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => Keyboard.dismiss()}
            >
                <Header title="Add New" />

                <View style={styles.typeContainer}>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'expense' && styles.activeTypeExpense]}
                        onPress={() => setType('expense')}
                    >
                        <Text style={[styles.typeText, type === 'expense' && styles.activeTypeText]} variant="label">Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'income' && styles.activeTypeIncome]}
                        onPress={() => setType('income')}
                    >
                        <Text style={[styles.typeText, type === 'income' && styles.activeTypeText]} variant="label">Income</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label} variant="label">Amount</Text>
                    <InputText
                        value={amount}
                        onChange={setAmount}
                        keyboardType="numeric"
                        placeholder="0.00"
                        style={{
                            container: styles.input,
                        }}
                        placeholderTextColor={theme.tokens.colors.onDisabled}
                        autoFocus
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label} variant="label">Category</Text>
                    <Button
                        disabled={type === 'income'}
                        style={{
                            button: { ...styles.selectedCategoryContainer, ...(type === 'income' && styles.selectedCategoryBorderIncome) },
                        }}
                        onPress={() => setIsCategorySelectorShow(true)}
                    >
                        <Text style={styles.selectedCategoryLabel} variant="label">{type === 'expense' ? selectedCategory?.label : 'Income'}</Text>
                        <Text style={styles.changeText}>Change</Text>
                    </Button>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label} variant="label">Note (Optional)</Text>
                    <InputText
                        value={note}
                        onChange={setNote}
                        placeholder="What was this for?"
                        style={{
                            container: styles.inputSmall,
                        }}
                        placeholderTextColor={theme.tokens.colors.onDisabled}
                    />
                </View>

                <Button
                    onPress={handleSave}
                    style={{ button: styles.saveButton }}
                >
                    <Text style={styles.saveText} variant="label">SAVE TRANSACTION</Text>
                </Button>
            </View>
            <CategorySelector
                isShow={isCategorySelectorShow}
                setIsShow={setIsCategorySelectorShow}
                selectedId={categoryId}
                onSelect={setCategoryId}
            />
        </>
    );
};
