import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useBudgetStore } from '../hooks/useBudgetStore';
import { Header } from '../components/GradientHeader';
import { theme as lightTheme, darkTheme } from '../theme';
import { useStyleContext } from '../../../core/services/providers/styleProvider';
import { View, Text, Button } from '../../../core/ui/components/interfaceComponents';
import { CategorySelector } from '../components/CategorySelector';

export const SettingsScreen = () => {
    const { clearAll } = useBudgetStore();
    const { theme, currentTheme, themesContainer, initTheme, selectTheme, addTheme } = useStyleContext();

    const [isCategorySelectorShow, setIsCategorySelectorShow] = useState(false);

    useEffect(() => {
        addTheme('light', lightTheme);
        addTheme('dark', darkTheme);
        initTheme('light');
    }, []);

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to delete all transactions? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: clearAll
                },
            ]
        );
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme?.tokens.colors.background,
        },
        content: {
            paddingHorizontal: theme?.tokens.sizes.spacing.md,
            width: '100%',
            gap: theme?.tokens.sizes.spacing.xl,
        },
        card: {
        },
        //Filter
        filterContainer: {
            flexDirection: 'row',
            backgroundColor: theme?.tokens.colors.surface,
            padding: 4,
            borderRadius: theme?.tokens.sizes.radius.lg,
        },
        themeButton: {
            flex: 1,
            paddingVertical: theme?.tokens.sizes.spacing.sm,
            borderWidth: 0,
            backgroundColor: 'transparent',
        },
        sectionTitle: {
            marginBottom: theme?.tokens.sizes.spacing.md,
            color: theme?.tokens.colors.onSurface,
        },
        dropDataButton: {
            backgroundColor: 'rgba(255, 0, 85, 0.2)',
            paddingVertical: theme?.tokens.sizes.spacing.sm,
            paddingHorizontal: theme?.tokens.sizes.spacing.xl,
            borderRadius: theme?.tokens.sizes.radius.md,
            borderWidth: 1,
            borderColor: theme?.tokens.colors.error,
            alignItems: 'center',
            width: '100%',
        },
        buttonText: {
            color: theme?.tokens.colors.error,
            fontWeight: '600',
        },
        text: {
            color: theme?.tokens.colors.onSurface,
        },
        subtext: {
            marginTop: theme?.tokens.sizes.spacing.sm,
            color: theme?.tokens.colors.onSurface,
            opacity: 0.7,
        },
    }), [theme]);

    if (!theme) return null;

    return (
        <View style={styles.container}>
            <Header title="Settings" />
            <View style={styles.content}>

                {/* Themes */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle} variant="subtitle">Theme</Text>
                    <View style={styles.filterContainer}>
                        {Object.keys(themesContainer).map((themeName) => (
                            <Button
                                key={themeName}
                                variant={currentTheme === themeName ? 'primary' : 'secondary'}
                                style={{
                                    button: {
                                        ...styles.themeButton,
                                        ...(currentTheme === themeName && { backgroundColor: theme?.components.button.primary.container.backgroundColor }),
                                    },
                                }}
                                onPress={() => selectTheme(themeName)}
                            >
                                <Text
                                    colorVariant={currentTheme === themeName ? 'primary' : 'secondary'}
                                    variant='label'
                                >
                                    {(themeName.charAt(0).toUpperCase() + themeName.slice(1))}
                                </Text>
                            </Button>
                        ))}
                    </View>
                </View>

                {/* Data Management */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle} variant="subtitle">Data Management</Text>
                    <Button
                        onPress={handleClearData}
                        style={{ button: styles.dropDataButton }}
                    >
                        <Text style={styles.buttonText} variant="label">Clear All Data</Text>
                    </Button>
                </View>

                {/* Categories */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle} variant="subtitle">Categories</Text>
                    <Button
                        style={{
                        }}
                        onPress={() => setIsCategorySelectorShow(true)}
                    >
                        <Text>Manage Categories</Text>
                    </Button>
                </View>

                {/* About */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle} variant="subtitle">About</Text>
                    <Text style={styles.text} variant="body">Budget Micro v1.0</Text>
                    <Text style={styles.subtext} variant="label">Neofuturistic Finance Tracker</Text>
                </View>
            </View>
            <CategorySelector
                isShow={isCategorySelectorShow}
                setIsShow={setIsCategorySelectorShow}
                selectedId={'0'}
                onSelect={() => setIsCategorySelectorShow(false)}
                isSettingsMode={true}
            />

        </View>
    );
};