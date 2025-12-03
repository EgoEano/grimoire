import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, Stats, CategoryId, Category } from '../types/budget';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BudgetState {
    transactions: Transaction[];
    categories: Category[];
    themeMode: 'light' | 'dark';
    isInitialized: boolean;
}

const initialState: BudgetState = {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    themeMode: 'dark',
    isInitialized: false,
};

const budgetSlice = createSlice({
    name: 'budget',
    initialState: {
        transactions: [],
        categories: DEFAULT_CATEGORIES,
        themeMode: 'dark',
        isInitialized: false,
    } as BudgetState,
    reducers: {
        setTransactions: (state, action: PayloadAction<Transaction[]>) => {
            state.transactions = action.payload;
        },
        addTransaction: (state, action: PayloadAction<Transaction>) => {
            state.transactions.unshift(action.payload);
        },
        deleteTransaction: (state, action: PayloadAction<string>) => {
            state.transactions = state.transactions.filter(t => t.id !== action.payload);
        },
        clearAll: (state) => {
            state.transactions = [];
            state.categories = DEFAULT_CATEGORIES;
        },
        setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.themeMode = action.payload;
        },
        // Category Reducers
        addCategory: (state, action: PayloadAction<Category>) => {
            state.categories.push(action.payload);
        },
        updateCategory: (state, action: PayloadAction<Category>) => {
            const index = state.categories.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.categories[index] = action.payload;
            }
        },
        deleteCategory: (state, action: PayloadAction<CategoryId>) => {
            state.categories = state.categories.filter(c => c.id !== action.payload);
        },
        setCategories: (state, action: PayloadAction<Category[]>) => {
            state.categories = action.payload;
        },
        setInitialized: (state, action: PayloadAction<boolean>) => {
            state.isInitialized = action.payload;
        }
    },
});

export const {
    setTransactions,
    addTransaction,
    deleteTransaction,
    clearAll,
    setThemeMode,
    addCategory,
    updateCategory,
    deleteCategory,
    setCategories,
    setInitialized
} = budgetSlice.actions;
export default budgetSlice.reducer;
