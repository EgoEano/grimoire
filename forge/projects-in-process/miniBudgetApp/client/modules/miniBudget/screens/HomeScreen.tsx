import React, { useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native'; // Keep TouchableOpacity for FAB if needed, or use Button
import { useNavigation } from '@react-navigation/native';
import { theme as lightTheme, darkTheme } from '../theme';
import { useBudgetStore } from '../hooks/useBudgetStore';
import { TransactionItem } from '../components/TransactionItem';
import { Header } from '../components/GradientHeader';
import { formatCurrency } from '../utils/format';
import { useStyleContext } from '../../../core/services/providers/styleProvider';
import { View, Text, Button, ModalCard } from '../../../core/ui/components/interfaceComponents';
import { Transaction } from '../types/budget';

export const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const { theme, initTheme, addTheme } = useStyleContext();

    const { transactions, getTotalStats, deleteTransaction } = useBudgetStore();
    const stats = getTotalStats();

    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
    const [isTransactionDetailsModalVisible, setIsTransactionDetailsModalVisible] = React.useState(false);

    useEffect(() => {
        addTheme('light', lightTheme);
        addTheme('dark', darkTheme);
        initTheme('light');
    }, []);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            width: '100%',
            flex: 1,
            backgroundColor: theme?.tokens.colors.background,
        },
        scrollContent: {
            padding: theme?.tokens.sizes.spacing.md,
            paddingBottom: 100,
            width: '100%',
        },
        balanceCard: {
            paddingHorizontal: theme?.tokens.sizes.spacing.lg,
            marginBottom: theme?.tokens.sizes.spacing.lg,
        },
        balanceLabel: {
            color: theme?.tokens.colors.onSurface,
            opacity: 0.7,
            marginBottom: theme?.tokens.sizes.spacing.sm,
        },
        balanceValue: {
            fontSize: 40,
            marginBottom: theme?.tokens.sizes.spacing.lg,
            textShadowColor: theme?.tokens.colors.primary,
            textShadowRadius: 10,
            fontWeight: 'bold',
            color: theme?.tokens.colors.onSurface,
        },
        statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.1)',
            paddingTop: theme?.tokens.sizes.spacing.md,
            width: '100%',
        },
        statLabel: {
            marginBottom: 4,
            opacity: 0.7,
            color: theme?.tokens.colors.onSurface,
        },
        statValue: {
            fontWeight: '600',
            fontSize: 20,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme?.tokens.sizes.spacing.md,
            width: '100%',
        },
        sectionTitle: {
            fontWeight: '600',
            fontSize: 24,
            color: theme?.tokens.colors.onBackground,
        },
        seeAll: {
            color: theme?.tokens.colors.primary,
            fontSize: 16,
            fontWeight: '600',
        },
        list: {
            backgroundColor: theme?.tokens.colors.surface,
            borderRadius: theme?.tokens.sizes.radius.lg,
            padding: theme?.tokens.sizes.spacing.md,
            width: '100%',
        },
        emptyText: {
            textAlign: 'center',
            padding: theme?.tokens.sizes.spacing.lg,
            opacity: 0.5,
            color: theme?.tokens.colors.onSurface,
        },
        fab: {
            position: 'absolute',
            bottom: theme?.tokens.sizes.spacing.xl,
            right: theme?.tokens.sizes.spacing.xl,
            width: 64,
            height: 64,
            shadowColor: theme?.tokens.colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 5,
        },
        fabIcon: {
            lineHeight: 26,
            fontWeight: '600',
        },
        modalContent: {
            padding: theme?.tokens.sizes.spacing.lg,
            alignItems: 'center',
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: theme?.tokens.sizes.spacing.md,
        },
        modalRow: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            width: '100%',
            minWidth: '100%',
            marginBottom: theme?.tokens.sizes.spacing.sm,
            paddingVertical: theme?.tokens.sizes.spacing.xs,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.05)',
            gap: theme?.tokens.sizes.spacing.md,
            flexWrap: 'nowrap',
        },
        modalLabel: {
            flex: 1,
            opacity: 0.7,
        },
        modalValue: {
            maxWidth: '60%',
            fontWeight: '600',
            flexShrink: 1,
        },
    }), [theme]);

    const handleTransactionPress = (transaction: any) => {
        setSelectedTransaction(transaction);
        setIsTransactionDetailsModalVisible(true);
    };

    const handleDeleteTransaction = (id: string) => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteTransaction(id)
                }
            ]
        );
    };

    if (!theme) return null; // Wait for theme initialization

    return (
        <View style={styles.container}>
            <Header
                title="Budget Micro"
                action={{ icon: '⚙️', onPress: () => navigation.navigate('Settings') }}
            />

            <View isScrollable={true} style={styles.scrollContent}>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel} variant="body">Total Balance</Text>
                    <Text style={styles.balanceValue} variant="title">{formatCurrency(stats.balance)}</Text>
                    <View style={styles.statsRow}>
                        <View style={{ alignItems: 'flex-start' }}>
                            <Text style={styles.statLabel} variant="label">Income</Text>
                            <Text style={[styles.statValue, { color: theme.tokens.colors.success }]} variant="body">
                                +{formatCurrency(stats.totalIncome)}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.statLabel} variant="label">Expenses</Text>
                            <Text style={[styles.statValue, { color: theme.tokens.colors.error }]} variant="body">
                                -{formatCurrency(stats.totalExpense)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle} variant="subtitle">Recent Transactions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
                        <Text style={styles.seeAll} variant="label">See Stats</Text>
                    </TouchableOpacity>
                </View>

                <View
                    style={styles.list}
                    isScrollable={true}
                >
                    {transactions.map(t => (
                        <TransactionItem
                            key={t.id}
                            transaction={t as any}
                            onPress={() => handleTransactionPress(t)}
                            onLongPress={() => handleDeleteTransaction(t.id)}
                        />
                    ))}
                    {transactions.length === 0 && (
                        <Text style={styles.emptyText} variant="body">No transactions yet.</Text>
                    )}
                </View>
            </View>

            <Button
                onPress={() => { navigation.navigate('AddTransaction') }}
                style={{
                    button: styles.fab
                }}
            >
                <Text variant="title" style={styles.fabIcon}>+</Text>
            </Button>

            <ModalCard
                isShow={isTransactionDetailsModalVisible}
                setIsShow={setIsTransactionDetailsModalVisible}
                isHasCross={true}
            >
                {selectedTransaction && (
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle} colorVariant='secondary' variant="title">Transaction Details</Text>

                        <View style={styles.modalRow}>
                            <Text style={styles.modalLabel} colorVariant='secondary' variant="body">Type</Text>
                            <Text
                                style={[
                                    styles.modalValue,
                                    { color: selectedTransaction.type === 'expense' ? theme.tokens.colors.error : theme.tokens.colors.success }
                                ]}
                                colorVariant='secondary'
                                variant="body"
                            >
                                {selectedTransaction.type === 'expense' ? 'Expense' : 'Income'}
                            </Text>
                        </View>

                        <View style={styles.modalRow}>
                            <Text style={styles.modalLabel} colorVariant='secondary' variant="body">Amount</Text>
                            <Text style={styles.modalValue} colorVariant='secondary' variant="body">
                                {formatCurrency(selectedTransaction.amount)}
                            </Text>
                        </View>

                        <View style={styles.modalRow}>
                            <Text style={styles.modalLabel} colorVariant='secondary' variant="body">Date</Text>
                            <Text style={styles.modalValue} colorVariant='secondary' variant="body">
                                {new Date(selectedTransaction.date).toLocaleDateString()}
                            </Text>
                        </View>

                        {selectedTransaction.note && (
                            <View style={styles.modalRow}>
                                <Text style={styles.modalLabel} colorVariant='secondary' variant="body">Description</Text>
                                <Text style={styles.modalValue} colorVariant='secondary' variant="body">
                                    {selectedTransaction.note}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ModalCard>
        </View>
    );
};

