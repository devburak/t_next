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
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none' } } },
    MuiModal: {
      defaultProps: { disablePortal: false, disableScrollLock: false, hideBackdrop: false },
    },
    MuiDialog: {
      defaultProps: { disablePortal: false, disableScrollLock: false, hideBackdrop: false, scroll: 'paper' },
      styleOverrides: {
        container: { overscrollBehavior: 'contain' },
        paper: { overscrollBehavior: 'contain' },
      },
    },
    MuiBackdrop: {
      styleOverrides: { root: { backgroundColor: 'rgba(15, 23, 42, 0.56)' } },
    },
  },
});
export default theme;
