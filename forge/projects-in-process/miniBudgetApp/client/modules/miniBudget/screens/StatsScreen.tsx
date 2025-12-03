import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useBudgetStore } from '../hooks/useBudgetStore';
import { Header } from '../components/GradientHeader';
import { theme as lightTheme, darkTheme } from '../theme';
import { formatCurrency } from '../utils/format';
import { getCategory } from '../utils/categories';
import { useStyleContext } from '../../../core/services/providers/styleProvider';
import { View, Text, Button } from '../../../core/ui/components/interfaceComponents';

export const StatsScreen = () => {
    const { getWeeklyStats, getMonthlyStats, getTotalStats, categories } = useBudgetStore();
    const { theme, initTheme, addTheme } = useStyleContext();
    const [timeRange, setTimeRange] = React.useState<'week' | 'month' | 'all'>('week');

    useEffect(() => {
        addTheme('light', lightTheme);
        addTheme('dark', darkTheme);
        initTheme('light');
    }, []);

    const stats = useMemo(() => {
        switch (timeRange) {
            case 'week': return getWeeklyStats();
            case 'month': return getMonthlyStats();
            case 'all': return getTotalStats();
            default: return getWeeklyStats();
        }
    }, [timeRange, getWeeklyStats, getMonthlyStats, getTotalStats]);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme?.tokens.colors.background,
        },
        content: {
            padding: theme?.tokens.sizes.spacing.md,
            paddingBottom: 100,
        },
        sectionTitle: {
            marginBottom: theme?.tokens.sizes.spacing.md,
            marginTop: theme?.tokens.sizes.spacing.lg,
            color: theme?.tokens.colors.onSurface,
            fontWeight: '600',
        },
        //Filter
        filterContainer: {
            flexDirection: 'row',
            backgroundColor: theme?.tokens.colors.surface,
            padding: 4,
            borderRadius: theme?.tokens.sizes.radius.lg,
            marginBottom: theme?.tokens.sizes.spacing.md,
        },
        filterButton: {
            flex: 1,
            paddingVertical: theme?.tokens.sizes.spacing.sm,
            borderWidth: 0,
            backgroundColor: 'transparent',
        },
        //Summary
        summaryContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme?.tokens.sizes.spacing.lg,
            gap: theme?.tokens.sizes.spacing.sm,
        },
        summaryCard: {
            flex: 1,
            padding: theme?.tokens.sizes.spacing.md,
            borderRadius: theme?.tokens.sizes.radius.md,
            backgroundColor: theme?.tokens.colors.surface,
            alignItems: 'center',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        summaryLabel: {
            fontSize: 12,
            color: theme?.tokens.colors.onSurface,
            opacity: 0.6,
            marginBottom: 4,
        },
        summaryValue: {
            fontSize: 16,
            fontWeight: 'bold',
        },
        chartContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 220,
        },
        //Progress Bar
        centerText: {
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
        },
        centerLabel: {
            fontSize: 14,
            color: theme?.tokens.colors.onSurface,
            opacity: 0.6,
        },
        centerValue: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme?.tokens.colors.onSurface,
        },
        //Category List
        categoryList: {
            gap: theme?.tokens.sizes.spacing.md,
        },
        categoryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme?.tokens.colors.surface,
            borderRadius: theme?.tokens.sizes.radius.md,
        },
        categoryContent: {
            width: '100%',
            flex: 1,
            paddingVertical: theme?.tokens.sizes.spacing.md,
        },
        categoryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: theme?.tokens.sizes.spacing.md,
        },
        categoryName: {
            fontWeight: '500',
            color: theme?.tokens.colors.onSurface,
        },
        categoryAmount: {
            fontWeight: '600',
            color: theme?.tokens.colors.onSurface,
        },
        progressBarFill: {
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            borderRadius: theme?.tokens.sizes.radius.md,
            opacity: 0.4,
        },


    }), [theme]);

    if (!theme) return null;

    // Donut Chart Logic
    const radius = 80;
    const strokeWidth = 20;
    const center = radius + strokeWidth;
    const circumference = 2 * Math.PI * radius;

    // Sort categories by total amount
    const sortedCategories = [...stats.byCategory].sort((a, b) => b.total - a.total);
    const totalForChart = sortedCategories.reduce((sum, cat) => sum + cat.total, 0);

    return (
        <View style={styles.container}>
            <Header title="Statistics" />

            <View isScrollable={true} style={styles.content}>

                {/* Time Range Selector */}
                <View style={styles.filterContainer}>
                    {(['week', 'month', 'all'] as const).map((range) => (
                        <Button
                            key={range}
                            variant={timeRange === range ? 'primary' : 'secondary'}
                            style={{
                                button: {
                                    ...styles.filterButton,
                                    ...(timeRange === range && { backgroundColor: theme?.components.button.primary.container.backgroundColor }),
                                },
                            }}
                            onPress={() => setTimeRange(range)}
                        >
                            <Text
                                colorVariant={timeRange === range ? 'primary' : 'secondary'}
                                variant='label'
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </Text>
                        </Button>
                    ))}
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={[styles.summaryValue, { color: theme.tokens.colors.success }]}>
                            {formatCurrency(stats.totalIncome)}
                        </Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Expense</Text>
                        <Text style={[styles.summaryValue, { color: theme.tokens.colors.error }]}>
                            {formatCurrency(stats.totalExpense)}
                        </Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Balance</Text>
                        <Text style={[styles.summaryValue, { color: theme.tokens.colors.primary }]}>
                            {formatCurrency(stats.balance)}
                        </Text>
                    </View>
                </View>

                {/* Donut Chart */}
                <View style={styles.chartContainer}>
                    {stats.totalExpense > 0 ? (
                        <>
                            <Svg width={center * 2} height={center * 2}>
                                <G rotation="-90" origin={`${center}, ${center}`}>
                                    {/* Re-implementing with cumulative calculation */}
                                    {(() => {
                                        let cumulativePercentage = 0;
                                        return sortedCategories.map((cat) => {
                                            const category = getCategory(cat.categoryId, categories);
                                            const percentage = cat.total / totalForChart;
                                            const strokeDasharray = `${circumference} ${circumference}`;
                                            const strokeDashoffset = circumference * (1 - percentage);
                                            const rotation = cumulativePercentage * 360;

                                            cumulativePercentage += percentage;

                                            return (
                                                <Circle
                                                    key={cat.categoryId}
                                                    cx={center}
                                                    cy={center}
                                                    r={radius}
                                                    stroke={category.color}
                                                    strokeWidth={strokeWidth}
                                                    strokeDasharray={[percentage * circumference, circumference]}
                                                    strokeDashoffset={0}
                                                    rotation={rotation}
                                                    origin={`${center}, ${center}`}
                                                    fill="transparent"
                                                    strokeLinecap="round"
                                                />
                                            );
                                        });
                                    })()}
                                </G>
                            </Svg>
                            <View style={styles.centerText}>
                                <Text style={styles.centerLabel}>Total</Text>
                                <Text style={styles.centerValue}>{formatCurrency(stats.totalExpense)}</Text>
                            </View>
                        </>
                    ) : (
                        <Text style={{ color: theme.tokens.colors.onDisabled }}>No expenses for this period</Text>
                    )}
                </View>

                {/* Category List */}
                <View style={styles.categoryList}>
                    <Text style={styles.sectionTitle} variant="subtitle">Spending Details</Text>
                    {sortedCategories.map((cat) => {
                        const category = getCategory(cat.categoryId, categories);
                        const percentage = stats.totalExpense > 0 ? (cat.total / stats.totalExpense) * 100 : 0;

                        return (
                            <View key={cat.categoryId} style={styles.categoryItem}>
                                <View style={styles.categoryContent}>
                                    <View style={styles.categoryHeader}>
                                        <Text style={styles.categoryName}>{category.label}</Text>
                                        <Text style={styles.categoryAmount}>{formatCurrency(cat.total)}</Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        ...styles.progressBarFill,
                                        width: `${percentage}%`,
                                        backgroundColor: category.color
                                    }}
                                />
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};
