import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import './index.css';

export const ColorModeContext = React.createContext({ mode: 'dark', toggleColorMode: () => {} });

function ThemedRoot() {
  const getInitialMode = () => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('color-mode') : null;
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
    };

  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      window.localStorage.setItem('color-mode', mode);
    } catch {}
    try {
      document.body.dataset.theme = mode;
    } catch {}
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    const isDark = mode === 'dark';
    return createTheme({
      palette: {
        mode,
        primary: {
          main: '#00f0ff',
          dark: '#00c4d4',
          light: '#33f3ff',
        },
        secondary: {
          main: '#ff00ff',
          dark: '#cc00cc',
          light: '#ff33ff',
        },
        error: {
          main: '#ff0066',
        },
        warning: {
          main: '#ffaa00',
        },
        success: {
          main: '#00ff88',
        },
        background: {
          default: isDark ? '#0a0a0f' : '#f7f8fb',
          paper: isDark ? '#151520' : '#ffffff',
        },
        text: {
          primary: isDark ? '#ffffff' : '#111111',
          secondary: isDark ? '#b0b0b0' : '#4d4d4d',
        },
      },
      typography: {
        fontFamily: '"Orbitron", "Rajdhani", "Exo 2", -apple-system, BlinkMacSystemFont, sans-serif',
        h1: { fontWeight: 700, letterSpacing: '0.05em' },
        h2: { fontWeight: 700, letterSpacing: '0.05em' },
        h3: { fontWeight: 600, letterSpacing: '0.03em' },
        h4: { fontWeight: 600, letterSpacing: '0.03em' },
        h5: { fontWeight: 600, letterSpacing: '0.02em' },
        h6: { fontWeight: 600, letterSpacing: '0.02em' },
      },
      shape: { borderRadius: 16 },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              letterSpacing: '0.05em',
              boxShadow: isDark ? '0 0 20px rgba(0, 240, 255, 0.3)' : '0 0 12px rgba(0, 240, 255, 0.2)',
              '&:hover': {
                boxShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.5)' : '0 0 18px rgba(0, 240, 255, 0.35)',
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
              background: isDark ? 'rgba(21, 21, 32, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: isDark ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(0, 240, 255, 0.15)',
              boxShadow: isDark
                ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 240, 255, 0.1)'
                : '0 4px 18px rgba(0, 0, 0, 0.08), 0 0 10px rgba(0, 240, 255, 0.08)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              background: isDark ? 'rgba(21, 21, 32, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: isDark ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(0, 240, 255, 0.15)',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 196, 212, 0.35)',
                },
                '&:hover fieldset': {
                  borderColor: isDark ? 'rgba(0, 240, 255, 0.5)' : 'rgba(0, 196, 212, 0.55)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00f0ff',
                  boxShadow: isDark ? '0 0 20px rgba(0, 240, 255, 0.3)' : '0 0 12px rgba(0, 240, 255, 0.25)',
                },
              },
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemedRoot />
  </React.StrictMode>,
);