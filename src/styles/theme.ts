import { createTheme } from '@mui/material/styles';
import { esES } from '@mui/material/locale';

// Create a theme instance.
const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#142334', // Azul del botón original
      },
      secondary: {
        main: '#6c757d', // Un gris secundario
      },
    },
    typography: {
      fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            
          }
        }
      }
    }
  },
  esES,
);

export default theme;
