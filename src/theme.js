import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2C3E50' },
    secondary: { main: '#34495E' },
    error: { main: '#f44336' },
    background: { default: '#f7f9fc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
    divider: '#d6dde7',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, lineHeight: 1.35 },
    body1: { fontSize: '1rem' },
  },
  components: { MuiButton: { styleOverrides: { root: { textTransform: 'none' } } } },
});
export default theme;
