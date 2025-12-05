//#region Tokens
export type ColorTokens = {
    // base colors
    primary: string;
    primaryVariant: string;
    secondary: string;
    secondaryVariant: string;

    success: string;
    warning: string;
    error: string;

    background: string;
    surface: string;
    disabled: string;
    backdrop: string;

    // text
    onPrimary: string;
    onSecondary: string;
    onBackground: string;
    onSurface: string;
    onDisabled: string;
};

export type SizeTokens = {
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
    radius: {
        sm: number;
        md: number;
        lg: number;
    };
    borderWidth: {
        thin: number;
        thick: number;
    };
    backdrop: {
        opacity: number;
        blur: number;
    };
};

export type TypographyTokens = {
    fontFamily: string;

    fontSize: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };

    fontWeight: {
        regular: number;
        medium: number;
        bold: number;
    };

    lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
    };
};

export type StyleTokens = {
    colors: ColorTokens;
    sizes: SizeTokens;
    typography: TypographyTokens;
    elevation: {
        level0: number; // none
        level1: number; // card
        level2: number; // dropdown
        level3: number; // dialog
        level4: number; // modal
    };
};
//#endregion

//#region Semantics
export type ColorSemantics = {
    text: {
        primary: string;
        secondary: string;
        success: string;
        error: string;
        disabled: string;
        inverse: string;
    };
    surfaces: {
        base: string;
        elevated: string;
        sunken: string;
    };
    states: {
        focus: string;
        pressed: string;
        hovered: string;
    };
    borders: {
        default: string;
        focused: string;
        error: string;
    };
    buttons: {
        primary: {
            bg: string;
            text: string;
            border: string;
        };
        secondary: {
            bg: string;
            text: string;
            border: string;
        };
        success: {
            bg: string;
            text: string;
            border: string;
        };
        error: {
            bg: string;
            text: string;
            border: string;
        };
        disabled: {
            bg: string;
            text: string;
            border: string;
        };
    };
    overlays: {
        backdropColor: string;
        backdropOpacity: number;
        blur: number;
    };
};

export type SizeSemantics = {
    padding: {
        buttonSm: number;
        buttonMd: number;
        card: number;
    };
    radius: {
        button: number;
        input: number;
        card: number;
    };
};

export type TypographySemantics = {
    title: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
    };
    subtitle: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
    };
    body: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
    };
    label: {
        fontSize: number;
        fontWeight: number;
        lineHeight: number;
    };
};

export type StyleSemantics = {
    colors: ColorSemantics;
    sizes: SizeSemantics;
    typography: TypographySemantics;
};
//#endregion

//#region Component
export type ComponentStyles = {
    button: {
        primary: {
            container: any;
            text: any;
        };
        secondary: {
            container: any;
            text: any;
        };
        success: {
            container: any;
            text: any;
        };
        error: {
            container: any;
            text: any;
        };
        disabled: {
            container: any;
            text: any;
        };
    };

    card: {
        container: any;
        title: any;
        content: any;
    };

    input: {
        container: any;
        text: any;
        placeholder: any;
        focusedBorder: any;
        errorBorder: any;
    };

    listItem: {
        container: any;
        title: any;
        subtitle: any;
        icon: any;
    };

    modal: {
        overlay: any;
        container: any;
        title: any;
        content: any;
    };

    text: {
        title: any;
        subtitle: any;
        body: any;
        label: any;
    };
};

// Theme
export type Theme = {
    tokens: StyleTokens;
    semantics: StyleSemantics;
    components: ComponentStyles;
};
//#endregion