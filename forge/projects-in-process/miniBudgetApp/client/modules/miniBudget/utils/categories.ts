import { Category, CategoryId } from '../types/budget';
import { theme } from '../theme';

const tColors = theme.colors!;

export const DEFAULT_CATEGORIES: Category[] = [
    {
        id: 'food',
        label: 'Food',
        color: '#FF0055', // Pink/Red Neon, expense accent
        isDefault: true,
    },
    {
        id: 'transport',
        label: 'Transport',
        color: '#00F0FF', // Cyan Neon
        isDefault: true,
    },
    {
        id: 'subs',
        label: 'Subs',
        color: '#7000FE', // Purple Neon
        isDefault: true,
    },
    {
        id: 'health',
        label: 'Health',
        color: '#c23434', // Error color, close to red
        isDefault: true,
    },
    {
        id: 'fun',
        label: 'Fun',
        color: '#FFB800', // Yellow/Gold for fun
        isDefault: true,
    },
    {
        id: 'other',
        label: 'Other',
        color: '#A0A0B0', // Muted/secondary text for other
        isDefault: true,
    },
];

export const INCOME_DEFAULT_CATEGORIES: Category[] = [
    {
        id: 'income',
        label: 'Income',
        color: '#3CB371',
        isDefault: true,
    }
];

export const getCategory = (id: CategoryId, categories: Category[]): Category => {
    // Now for income we will use default item
    if (id === 'income') return INCOME_DEFAULT_CATEGORIES[0];

    return categories.find(c => c.id === id) || categories.find(c => c.id === 'other') || DEFAULT_CATEGORIES[5];
};
