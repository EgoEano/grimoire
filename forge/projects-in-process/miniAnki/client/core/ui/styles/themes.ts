import type { StyleTokens, StyleSemantics, Theme, ComponentStyles } from "@client/core/types/themeTypes";

export const templateTokens: StyleTokens = {
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
            xl: 32
        },
        radius: {
            sm: 4,
            md: 12,
            lg: 16
        },
        borderWidth: {
            thin: 1,
            thick: 3
        },
        backdrop: {
            opacity: 0.8,
            blur: 5
        }
    },
    typography: {
        fontFamily: "System",
        fontSize: {
            sm: 12,
            md: 16,
            lg: 20,
            xl: 24,
        },
        fontWeight: {
            regular: 400,
            medium: 500,
            bold: 700
        },
        lineHeight: {
            tight: 1.1,
            normal: 1.2,
            relaxed: 1.3
        }
    },
    elevation: {
        level0: 0,
        level1: 2,
        level2: 4,
        level3: 8,
        level4: 16
    }
};

export const createSemantics = (tokens: StyleTokens): StyleSemantics => ({
    colors: {
        text: {
            primary: tokens.colors.onPrimary,
            secondary: tokens.colors.onBackground,
            success: tokens.colors.success,
            error: tokens.colors.error,
            disabled: tokens.colors.onDisabled,
            inverse: tokens.colors.onPrimary
        },
        surfaces: {
            base: tokens.colors.background,
            elevated: tokens.colors.surface,
            sunken: tokens.colors.disabled
        },
        states: {
            focus: tokens.colors.primaryVariant,
            pressed: tokens.colors.secondaryVariant,
            hovered: tokens.colors.secondary
        },
        borders: {
            default: tokens.colors.primary,
            focused: tokens.colors.primaryVariant,
            error: tokens.colors.error
        },
        buttons: {
            primary: {
                bg: tokens.colors.primary,
                text: tokens.colors.onPrimary,
                border: tokens.colors.primaryVariant
            },
            secondary: {
                bg: tokens.colors.secondary,
                text: tokens.colors.onSecondary,
                border: tokens.colors.secondaryVariant
            },
            success: {
                bg: tokens.colors.success,
                text: tokens.colors.onPrimary,
                border: tokens.colors.success
            },
            error: {
                bg: tokens.colors.error,
                text: tokens.colors.onPrimary,
                border: tokens.colors.error
            },
            disabled: {
                bg: tokens.colors.disabled,
                text: tokens.colors.onDisabled,
                border: tokens.colors.disabled
            }
        },
        overlays: {
            backdropColor: tokens.colors.backdrop,
            backdropOpacity: tokens.sizes.backdrop.opacity,
            blur: tokens.sizes.backdrop.blur
        }
    },
    sizes: {
        padding: {
            buttonSm: tokens.sizes.spacing.sm,
            buttonMd: tokens.sizes.spacing.md,
            card: tokens.sizes.spacing.lg
        },
        radius: {
            button: tokens.sizes.radius.md,
            input: tokens.sizes.radius.md,
            card: tokens.sizes.radius.lg
        }
    },
    typography: {
        title: {
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            lineHeight: tokens.typography.fontSize.xl * tokens.typography.lineHeight.relaxed
        },
        subtitle: {
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.bold,
            lineHeight: tokens.typography.fontSize.lg * tokens.typography.lineHeight.relaxed
        },
        body: {
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.medium,
            lineHeight: tokens.typography.fontSize.md * tokens.typography.lineHeight.normal
        },
        label: {
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.regular,
            lineHeight: tokens.typography.fontSize.sm * tokens.typography.lineHeight.tight
        }
    }
});

const semantics: StyleSemantics = createSemantics(templateTokens);

export const createComponents = (tokens: StyleTokens, semantics: StyleSemantics): ComponentStyles => ({
    button: {
        primary: {
            container: {
                backgroundColor: semantics.colors.buttons.primary.bg,
                borderColor: semantics.colors.buttons.primary.border,
                borderWidth: tokens.sizes.borderWidth.thin,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.primary.text,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            }
        },
        secondary: {
            container: {
                backgroundColor: semantics.colors.buttons.secondary.bg,
                borderColor: semantics.colors.buttons.secondary.border,
                borderWidth: tokens.sizes.borderWidth.thick,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.secondary.text,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            }
        },
        success: {
            container: {
                backgroundColor: semantics.colors.buttons.success.bg,
                borderColor: semantics.colors.buttons.success.border,
                borderWidth: tokens.sizes.borderWidth.thin,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.success.text,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            }
        },
        error: {
            container: {
                backgroundColor: semantics.colors.buttons.error.bg,
                borderColor: semantics.colors.buttons.error.border,
                borderWidth: tokens.sizes.borderWidth.thin,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.error.text,
                fontSize: semantics.typography.body.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            }
        },
        disabled: {
            container: {
                backgroundColor: semantics.colors.buttons.disabled.bg,
                borderColor: semantics.colors.buttons.disabled.border,
                borderWidth: tokens.sizes.borderWidth.thin,
                borderRadius: semantics.sizes.radius.button,
                paddingVertical: semantics.sizes.padding.buttonMd,
            },
            text: {
                color: semantics.colors.buttons.disabled.text,
                fontSize: semantics.typography.label.fontSize,
                fontWeight: semantics.typography.label.fontWeight,
            }
        }
    },
    card: {
        container: {
            backgroundColor: semantics.colors.surfaces.elevated,
            borderRadius: semantics.sizes.radius.card,
            padding: semantics.sizes.padding.card,
            elevation: tokens.elevation.level1,
        },
        title: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.title.fontSize,
            fontWeight: semantics.typography.title.fontWeight,
            lineHeight: semantics.typography.title.lineHeight,
        },
        content: {
            color: semantics.colors.text.secondary,
            fontSize: semantics.typography.body.fontSize,
            lineHeight: semantics.typography.body.lineHeight,
        }
    },
    input: {
        container: {
            backgroundColor: semantics.colors.surfaces.base,
            borderRadius: semantics.sizes.radius.input,
            borderColor: semantics.colors.borders.default,
            borderWidth: tokens.sizes.borderWidth.thin,
            padding: tokens.sizes.spacing.md,
        },
        text: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.body.fontSize,
        },
        placeholder: {
            color: semantics.colors.text.secondary,
            fontSize: semantics.typography.body.fontSize,
        },
        focusedBorder: {
            borderColor: semantics.colors.borders.focused,
        },
        errorBorder: {
            borderColor: semantics.colors.borders.error,
        }
    },
    listItem: {
        container: {
            backgroundColor: semantics.colors.surfaces.base,
            padding: tokens.sizes.spacing.md,
        },
        title: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.body.fontSize,
            fontWeight: tokens.typography.fontWeight.medium,
        },
        subtitle: {
            color: semantics.colors.text.secondary,
            fontSize: tokens.typography.fontSize.sm,
        },
        icon: {
            color: semantics.colors.text.secondary,
        }
    },
    modal: {
        overlay: {
            backgroundColor: `${semantics.colors.overlays.backdropColor}${Math.round((semantics.colors.overlays.backdropOpacity) * 255).toString(16).padStart(2, '0')}`,
            blur: semantics.colors.overlays.blur,
        },
        container: {
            backgroundColor: semantics.colors.surfaces.elevated,
            borderRadius: semantics.sizes.radius.card,
            padding: semantics.sizes.padding.card,
            elevation: tokens.elevation.level4,
        },
        title: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.title.fontSize,
            fontWeight: semantics.typography.title.fontWeight,
            lineHeight: semantics.typography.title.lineHeight,
        },
        content: {
            color: semantics.colors.text.secondary,
            fontSize: semantics.typography.body.fontSize,
            lineHeight: semantics.typography.body.lineHeight,
        }
    },
    text: {
        title: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.title.fontSize,
            fontWeight: semantics.typography.title.fontWeight,
            lineHeight: semantics.typography.title.lineHeight,
        },
        subtitle: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.subtitle.fontSize,
            fontWeight: semantics.typography.subtitle.fontWeight,
            lineHeight: semantics.typography.subtitle.lineHeight,
        },
        body: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.body.fontSize,
            fontWeight: semantics.typography.body.fontWeight,
            lineHeight: semantics.typography.body.lineHeight,
        },
        label: {
            color: semantics.colors.text.primary,
            fontSize: semantics.typography.label.fontSize,
            fontWeight: semantics.typography.label.fontWeight,
        }
    }
});

const theme: Theme = {
    tokens: templateTokens,
    semantics: semantics,
    components: createComponents(templateTokens, semantics)
};