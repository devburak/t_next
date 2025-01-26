// src/theme.js
import { createTheme } from '@mui/material/styles';

// Özel tema ayarlarınızı burada tanımlayın
const theme = createTheme({
  palette: {
    primary: {
      main: '#2C3E50', // Örneğin, ana renk
    },
    secondary: {
      main: '#34495E', // İkincil renk
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#ffffff', // Arka plan rengi
    },
    
  },
  typography: {
    // Tipografi ayarlarınızı buraya ekleyebilirsiniz
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
    },
    // Diğer tipografi ayarları...
  },
  components: {
    // Bileşen bazlı özelleştirmeler
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Buton metinlerini büyük harfe çevirmemek için
        },
      },
    },
}
  // Diğer tema ayarları (spacing, breakpoints, etc.)
});

export default theme;
