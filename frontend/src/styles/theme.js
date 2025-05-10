import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1e88e5" },
    secondary: { main: "#ff6d00" },
    background: { default: "#f7f9fc" },
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: { root: { boxShadow: "0 4px 20px rgba(0,0,0,.05)" } },
    },
    MuiDrawer: { styleOverrides: { paper: { border: 0 } } },
  },
});

export default theme;
