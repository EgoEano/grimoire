export type TransactionType = 'expense' | 'income';

export type CategoryId = string;

export interface Category {
    id: CategoryId;
    label: string;
    color: string;
    isDefault?: boolean;
}

export interface Transaction {
    id: string;
    amount: number;
    categoryId: CategoryId;
    date: string; // ISO string
    type: TransactionType;
    note?: string;
}

export interface DailyStats {
    date: string;
    totalExpense: number;
    totalIncome: number;
}

export interface CategoryStats {
    categoryId: CategoryId;
    total: number;
    percentage: number;
}

export interface Stats {
    totalExpense: number;
    totalIncome: number;
    balance: number;
    byCategory: CategoryStats[];
    daily: DailyStats[];
}
