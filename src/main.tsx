import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './styles.css';
// Import LocalizationProvider and AdapterDateFns
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Import the store hook
import { useLicenseStore } from './store/licenseStore';

// Define light theme options with explicit PaletteMode
const lightThemeOptions = {
  palette: {
    mode: 'light' as PaletteMode,
    primary: {
      main: '#1e88e5', // 10% less saturated blue (was #2196f3)
    },
    secondary: {
      main: '#e3004f', // 10% less saturated pink (was #f50057)
    },
    // You might want to define other light theme specifics here
    background: {
      default: '#f6f6f6',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
};

// Define dark theme options with explicit PaletteMode
const darkThemeOptions = {
  palette: {
    mode: 'dark' as PaletteMode,
    primary: {
      main: '#82d4fa', // 10% more saturated blue (was #90caf9)
    },
    secondary: {
      main: '#ff80ab', // 10% more saturated pink (was #f48fb1)
    },
    background: {
      default: '#303030',
      paper: '#424242',
    },
    // Define other dark theme specifics if needed
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
};

// Main component to render the app
const Main: React.FC = () => {
  // Get the theme mode from the store
  const themeMode = useLicenseStore((state) => state.themeMode);

  // Create the themes based on the mode
  const lightTheme = createTheme(lightThemeOptions);
  const darkTheme = createTheme(darkThemeOptions);

  // Select the active theme
  const activeTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <App />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

// Render the Main component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);