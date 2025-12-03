import { StyleTokens } from '../../../core/types/themeTypes';

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const theme: DeepPartial<StyleTokens> = {
    colors: {
        primary: "#1f1f1f",
        primaryVariant: "#000000",
        secondary: "#ffffff",
        secondaryVariant: "#00004a",

        success: "#3CB371",
        warning: "#e6cf00",
        error: "#c23434",

        background: "#F5F6FA",
        surface: "#FFFFFF",
        disabled: "#CED0CE",
        backdrop: "#1f1f1f",

        onPrimary: "#F5F6FA",
        onSecondary: "#1f1f1f",
        onBackground: "#1f1f1f",
        onSurface: "#1f1f1f",
        onDisabled: "#888888"
    },
    sizes: {
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
        },
        radius: {
            sm: 8,
            md: 16,
            lg: 24,
        },
        borderWidth: {
            thin: 1,
            thick: 2,
        },
        backdrop: {
            opacity: 0.7,
            blur: 5,
        }
    },
    typography: {
        fontFamily: 'System',
        fontSize: {
            sm: 14,
            md: 16,
            lg: 20,
            xl: 32,
        },
        fontWeight: {
            regular: 400,
            medium: 600,
            bold: 700,
        },
        lineHeight: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.8,
        }
    },
    elevation: {
        level0: 0,
        level1: 4,
        level2: 8,
        level3: 12,
        level4: 16,
    }
};

export const darkTheme: DeepPartial<StyleTokens> = {
    ...theme,
    colors: {
        primary: "#F5F6FA",
        primaryVariant: "#FFFFFF",
        secondary: "#1f1f1f",
        secondaryVariant: "#000000",

        success: "#3CB371",
        warning: "#e6cf00",
        error: "#c23434",

        background: "#1f1f1f",
        surface: "#2b2b2b",
        disabled: "#555555",
        backdrop: "#000000",

        onPrimary: "#1f1f1f",
        onSecondary: "#F5F6FA",
        onBackground: "#F5F6FA",
        onSurface: "#F5F6FA",
        onDisabled: "#AAAAAA"
    }
};