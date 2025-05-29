// src/theme.js
import { createTheme } from "@mui/material/styles";

const baseTheme = {
  typography: {
    fontFamily: "'Poppins', sans-serif",
    button: {
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  transitions: {
    duration: {
      enteringScreen: 300,
      leavingScreen: 200,
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",
    primary: {
      main: "#6366f1",
      contrastText: "#fff",
    },
    secondary: {
      main: "#10b981",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#818cf8",
      contrastText: "#fff",
    },
    secondary: {
      main: "#34d399",
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
  },
});
