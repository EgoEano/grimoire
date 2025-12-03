import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../types/budget';
import { getCategory } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/format';
import { useStyleContext } from '../../../core/services/providers/styleProvider';
import { View, Text } from '../../../core/ui/components/interfaceComponents';

interface TransactionItemProps {
    transaction: Transaction;
    onLongPress?: (id: string) => void;
    onPress?: (id: string) => void;
}

import { useBudgetStore } from '../hooks/useBudgetStore';

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onLongPress, onPress }) => {
    const { categories } = useBudgetStore();
    const category = getCategory(transaction.categoryId, categories);
    const isExpense = transaction.type === 'expense';
    const { theme } = useStyleContext();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: theme?.tokens.sizes.spacing.md,
            paddingHorizontal: theme?.tokens.sizes.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.05)',
        },
        left: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        details: {
            justifyContent: 'center',
            alignItems: 'flex-start',
        },
        category: {
            fontSize: 16,
            marginBottom: 2,
            color: theme?.tokens.colors.onSurface,
            fontWeight: '600',
        },
        date: {
            color: theme?.tokens.colors.onSurface,
            opacity: 0.6,
        },
        right: {
            alignItems: 'flex-end',
        },
        amount: {
            fontWeight: '700',
            fontSize: 16,
        },
    }), [theme]);

    if (!theme) return null;

    return (
        <TouchableOpacity
            style={styles.container}
            onLongPress={() => onLongPress && onLongPress(transaction.id)}
            onPress={() => onPress && onPress(transaction.id)}
            activeOpacity={0.7}
        >
            <View style={styles.left}>
                <View style={styles.details}>
                    <Text style={styles.category} variant="body">{`${category.label}${transaction?.note ? ` - ${transaction?.note?.slice(0, 20)?.trim()}${transaction?.note.length >= 20 ? '...':''}` : ''}`}</Text>
                    <Text style={styles.date} variant="label">{formatDate(transaction.date)}</Text>
                </View>
            </View>

            <View style={styles.right}>
                <Text style={[
                    styles.amount,
                    { color: isExpense ? theme.tokens.colors.onSurface : theme.tokens.colors.success }
                ]} variant="body">
                    {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

