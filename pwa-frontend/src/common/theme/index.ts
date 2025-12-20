import { createTheme } from "@mui/material";
import archivo from "../fonts/Archivo-Italic-VariableFont_wdth,wght.ttf";
import "../styles/colors.module.scss";

const getCssVariable = (variable: string) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
};

export const theme = createTheme({
  palette: {
    primary: {
      main: getCssVariable("--primary-main"),
      light: getCssVariable("--primary-light"),
      dark: getCssVariable("--primary-dark"),
    },
    secondary: {
      main: getCssVariable("--secondary-main"),
    },
    error: { main: getCssVariable("--error-main") },
    warning: { main: getCssVariable("--warning-main") },
    info: { main: getCssVariable("--info-main") },
    success: { main: getCssVariable("--success-main") },
    background: {
      default: getCssVariable("--background-default"),
      paper: getCssVariable("--background-paper"),
    },
    mode: "light",
  },
  typography: {
    fontFamily: `"archivo", "vazir"`,
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    button: { textTransform: "none", color: "#615d9b" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'archivo';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('samim'), local('samim'), url(${archivo}) format('truetype');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          color: "#615d9b",
          backgroundColor: "#e4e3f3ff",
          ":hover": {
            backgroundColor: "#8A84E2",
            color: "white",
          },
          ":focus": {
            backgroundColor: "#615d9b",
            color: "white",
          },
        },
      },
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          backgroundColor: "#f5f5f5ff",
          "& .Mui-focused": {
            // Target the focused state
            color: "#8A84E2",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          padding: "7px",
          "& input:-webkit-autofill": {
            transition: "background-color 600000s 0s, color 600000s 0s",
          },
        },
      },
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});
