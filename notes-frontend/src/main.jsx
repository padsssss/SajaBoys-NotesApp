import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import './index.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f0ff', // Cyan neon
      dark: '#00c4d4',
      light: '#33f3ff',
    },
    secondary: {
      main: '#ff00ff', // Magenta neon
      dark: '#cc00cc',
      light: '#ff33ff',
    },
    error: {
      main: '#ff0066', // Pink neon
    },
    warning: {
      main: '#ffaa00', // Orange neon
    },
    success: {
      main: '#00ff88', // Green neon
    },
    background: {
      default: '#0a0a0f',
      paper: '#151520',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Rajdhani", "Exo 2", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.05em',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.5)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00c4d4 0%, #cc00cc 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(21, 21, 32, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 240, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(21, 21, 32, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 240, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 240, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f0ff',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
            },
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);