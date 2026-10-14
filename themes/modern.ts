import { createTheme, alpha } from "@mui/material"
import { Inter } from 'next/font/google'

// Typography variants and palette extensions (tertiary, paperGray, dataGrid, nav, cfde, ...)
// are declared via module augmentation in themes/cfde.ts and themes/enrichr-kg.ts.

export const inter_modern = Inter({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})

const ink = {
    900: "#0F172A",
    700: "#334155",
    600: "#475569",
    500: "#64748B",
    400: "#94A3B8",
    300: "#CBD5E1",
    200: "#E2E8F0",
    100: "#F1F5F9",
    50: "#F8FAFC",
}

const accent = {
    main: "#4F46E5",
    light: "#A5B4FC",
    dark: "#3730A3",
    soft: "#EEF2FF",
}

const radius = 12

export const kf_modern_theme = createTheme({
    shape: {
        borderRadius: radius,
    },
    typography: {
        fontFamily: inter_modern.style.fontFamily,
        h1: { fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" },
        h2: { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" },
        h3: { fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" },
        h4: { fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" },
        h5: { fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" },
        h6: { fontSize: 15, fontWeight: 600 },
        // header title (Logo size="large" / "small")
        cfde: { fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 },
        cfde_small: { fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" },
        subtitle1: { fontSize: 15, fontWeight: 400, lineHeight: 1.6 },
        subtitle2: { fontSize: 14, fontWeight: 500 },
        body1: { fontSize: 15, fontWeight: 400 },
        body2: { fontSize: 14, fontWeight: 400 },
        caption: { fontSize: 12.5, fontWeight: 500, color: ink[500] },
        overline: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.6 },
        button: { fontWeight: 600, textTransform: "none" },
        nav: { fontSize: 14, fontWeight: 500, color: ink[600] },
        nav_small: { fontSize: 14, fontWeight: 600, color: ink[900] },
        footer: { fontSize: 14, fontWeight: 400 },
        stats_h3: { fontSize: 24, fontWeight: 600, color: ink[400] },
        stats_sub: { fontSize: 14, fontWeight: 500, color: ink[400] },
    },
    palette: {
        background: {
            default: "#F6F7FB",
            paper: "#FFFFFF",
        },
        text: {
            primary: ink[900],
            secondary: ink[600],
        },
        divider: ink[200],
        // soft tint; used by filled chips and contained primary buttons
        primary: {
            main: accent.soft,
            light: "#F5F7FF",
            dark: accent.main,
            contrastText: accent.dark,
        },
        // brand accent; used by icon buttons, switches, sliders, links, CTA buttons
        secondary: {
            main: accent.main,
            light: accent.light,
            dark: accent.dark,
            contrastText: "#FFFFFF",
        },
        tertiary: {
            main: "#F6F7FB",
            light: "#FFFFFF",
            dark: ink[200],
            contrastText: ink[900],
        },
        paperGray: {
            main: ink[50],
            light: "#FFFFFF",
            dark: ink[300],
        },
        dataGrid: {
            main: ink[100],
            contrastText: ink[700],
        },
        action: {
            hover: alpha(accent.main, 0.06),
            selected: alpha(accent.main, 0.12),
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                },
                "::selection": {
                    background: alpha(accent.main, 0.18),
                },
            },
        },
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
                color: "inherit",
            },
            styleOverrides: {
                root: {
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "saturate(180%) blur(12px)",
                    borderBottom: `1px solid ${ink[200]}`,
                    boxShadow: "none",
                    color: ink[900],
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: { borderRadius: radius },
            },
            variants: [
                {
                    props: { variant: 'rounded-top' },
                    style: {
                        borderTopLeftRadius: '1rem',
                        borderTopRightRadius: '1rem',
                    },
                }
            ],
        },
        MuiCard: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: `1px solid ${ink[200]}`,
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.04)",
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: 20,
                    "&:last-child": { paddingBottom: 20 },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    marginTop: 6,
                    borderRadius: 12,
                    border: `1px solid ${ink[200]}`,
                    boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.25)",
                },
                list: { padding: 6 },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontSize: 14,
                    minHeight: 36,
                },
            },
        },
        MuiPopover: {
            styleOverrides: {
                paper: { borderRadius: 12 },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                paper: {
                    marginTop: 4,
                    borderRadius: 12,
                    border: `1px solid ${ink[200]}`,
                    boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.25)",
                },
                option: { fontSize: 14 },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: ({ ownerState }) => ({
                    textTransform: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: "8px 16px",
                    ...(ownerState.variant === 'contained' &&
                        ownerState.color === 'primary' && {
                        backgroundColor: accent.soft,
                        color: accent.dark,
                        '&:hover': { backgroundColor: "#E0E7FF" },
                    }),
                    ...(ownerState.variant === 'outlined' && {
                        borderColor: ink[300],
                    }),
                }),
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: 7,
                    transition: "background-color 120ms ease, color 120ms ease",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    borderRadius: 8,
                    fontWeight: 500,
                    ...(ownerState.variant !== 'outlined' &&
                        ownerState.color === 'primary' && {
                        backgroundColor: accent.soft,
                        color: accent.dark,
                        '& .MuiChip-deleteIcon': {
                            color: alpha(accent.dark, 0.45),
                            '&:hover': { color: accent.dark },
                        },
                    }),
                    ...(ownerState.variant !== 'outlined' &&
                        (ownerState.color === 'default' || ownerState.color === undefined) && {
                        backgroundColor: ink[100],
                        color: ink[700],
                    }),
                }),
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: "#FFFFFF",
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: ink[400],
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: accent.main,
                        borderWidth: 1.5,
                        boxShadow: `0 0 0 3px ${alpha(accent.main, 0.12)}`,
                    },
                },
                notchedOutline: {
                    borderColor: ink[300],
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontSize: 14,
                    '&.Mui-focused': { color: accent.main },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: { background: 'white' },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: ink[300],
                    '&.Mui-checked': { color: accent.main },
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                },
            },
        },
        MuiSwitch: {
            defaultProps: {
                color: "secondary",
            },
        },
        MuiSlider: {
            styleOverrides: {
                thumb: {
                    width: 16,
                    height: 16,
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.25)",
                },
                rail: { opacity: 1, backgroundColor: ink[200] },
                valueLabel: {
                    borderRadius: 6,
                    fontSize: 12,
                    backgroundColor: ink[900],
                },
            },
        },
        MuiTooltip: {
            defaultProps: {
                arrow: true,
            },
            styleOverrides: {
                tooltip: {
                    backgroundColor: ink[900],
                    fontSize: 12,
                    fontWeight: 500,
                    borderRadius: 6,
                    padding: "6px 10px",
                },
                arrow: { color: ink[900] },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: { minHeight: 40 },
                indicator: {
                    height: 3,
                    borderRadius: 3,
                    backgroundColor: accent.main,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 14,
                    minHeight: 40,
                    color: ink[500],
                    '&.Mui-selected': { color: accent.main },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    alignItems: "center",
                },
                standardInfo: {
                    backgroundColor: "#EFF6FF",
                    border: "1px solid #DBEAFE",
                },
                standardError: {
                    border: "1px solid #FECACA",
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: ink[200] },
            },
        },
        MuiLink: {
            defaultProps: {
                underline: "hover",
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: { background: ink[100] },
            },
        },
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    "& .MuiInputBase-root, & .MuiInputLabel-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                        fontSize: "0.875rem"
                    },
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.color === 'tertiary' && { color: accent.main }),
                }),
            },
        },
    }
})
