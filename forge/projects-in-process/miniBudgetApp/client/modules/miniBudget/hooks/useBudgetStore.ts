import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {
    addTransaction,
    deleteTransaction,
    clearAll,
    setTransactions,
    addCategory,
    updateCategory,
    deleteCategory,
    setCategories,
    setInitialized
} from '../store/slice';
import { Transaction, Stats, Category, CategoryId } from '../types/budget';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mini_budget_transactions';
const CATEGORIES_STORAGE_KEY = '@mini_budget_categories';

export const useBudgetStore = () => {
    const dispatch = useDispatch();
    const transactions = useSelector((state: RootState) => state.budget.transactions);
    const categories = useSelector((state: RootState) => state.budget.categories);
    const isInitialized = useSelector((state: RootState) => state.budget.isInitialized);

    // Load from storage on mount
    useEffect(() => {
        const loadData = async () => {
            if (isInitialized) return;

            try {
                const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                if (jsonValue != null) {
                    dispatch(setTransactions(JSON.parse(jsonValue)));
                }

                const categoriesValue = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
                if (categoriesValue != null) {
                    dispatch(setCategories(JSON.parse(categoriesValue)));
                }

                dispatch(setInitialized(true));
            } catch (e) {
                console.error('Failed to load data', e);
            }
        };
        loadData();
    }, [dispatch, isInitialized]);

    // Save to storage on change
    useEffect(() => {
        const saveData = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
            } catch (e) {
                console.error('Failed to save transactions', e);
            }
        };
        saveData();
    }, [transactions]);

    useEffect(() => {
        const saveCategories = async () => {
            try {
                await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
            } catch (e) {
                console.error('Failed to save categories', e);
            }
        };
        saveCategories();
    }, [categories]);

    const handleAddTransaction = (t: Transaction) => {
        dispatch(addTransaction(t));
    };

    const handleDeleteTransaction = (id: string) => {
        dispatch(deleteTransaction(id));
    };

    const handleClearAll = () => {
        dispatch(clearAll());
    };

    // Category Actions
    const handleAddCategory = (c: Category) => {
        dispatch(addCategory(c));
    };

    const handleUpdateCategory = (c: Category) => {
        dispatch(updateCategory(c));
    };

    const handleDeleteCategory = (id: CategoryId) => {
        dispatch(deleteCategory(id));
    };

    const getDailyTotal = (): number => {
        const today = new Date().toISOString().split('T')[0];
        return transactions
            .filter(t => t.date.startsWith(today) && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const calculateStats = (filteredTransactions: Transaction[]): Stats => {
        const totalExpense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        // Group by category
        const byCategory = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const existing = acc.find(c => c.categoryId === t.categoryId);
                if (existing) {
                    existing.total += t.amount;
                } else {
                    acc.push({ categoryId: t.categoryId, total: t.amount, percentage: 0 });
                }
                return acc;
            }, [] as any[]);

        byCategory.forEach(c => {
            c.percentage = totalExpense > 0 ? (c.total / totalExpense) * 100 : 0;
        });

        return {
            totalExpense,
            totalIncome,
            balance: totalIncome - totalExpense,
            byCategory,
            daily: [],
        };
    };

    const getWeeklyStats = (): Stats => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentTransactions = transactions.filter(t => new Date(t.date) >= oneWeekAgo);
        return calculateStats(recentTransactions);
    };

    const getMonthlyStats = (): Stats => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        return calculateStats(monthlyTransactions);
    };

    const getTotalStats = (): Stats => {
        return calculateStats(transactions);
    };

    return {
        transactions,
        categories,
        addTransaction: handleAddTransaction,
        deleteTransaction: handleDeleteTransaction,
        clearAll: handleClearAll,
        addCategory: handleAddCategory,
        updateCategory: handleUpdateCategory,
        deleteCategory: handleDeleteCategory,
        getDailyTotal,
        getWeeklyStats,
        getMonthlyStats,
        getTotalStats,
    };
};
