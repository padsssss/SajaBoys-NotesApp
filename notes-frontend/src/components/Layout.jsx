import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Note as NoteIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Wallet as WalletIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { ColorModeContext } from '../main';

function Layout({ children, walletConnected, walletAddr, onConnectWallet, onDisconnectWallet, connecting }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const isDark = theme.palette.mode === 'dark';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Notes', path: '/notes', icon: <NoteIcon /> },
    { label: 'About', path: '/about', icon: <InfoIcon /> },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', pt: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
        Notes App
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {walletConnected && (
        <Box sx={{ p: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Chip
              icon={<WalletIcon />}
              label={`${walletAddr?.slice(0, 10)}...${walletAddr?.slice(-6)}`}
              color="success"
              size="small"
            />
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={onDisconnectWallet}
              fullWidth
            >
              Disconnect
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: isDark ? 'rgba(21, 21, 32, 0.9)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.2)' : '0 2px 16px rgba(0,0,0,0.06)',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <NoteIcon 
              sx={{ 
                display: { xs: 'flex', md: 'flex' }, 
                mr: 1, 
                color: 'primary.main',
                filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.8))',
                animation: 'pulse 2s ease-in-out infinite',
              }} 
            />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: '"Orbitron", monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'primary.main',
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 },
                textShadow: '0 0 20px rgba(0, 240, 255, 0.8)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  textShadow: '0 0 30px rgba(0, 240, 255, 1)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              SAJA NOTES APP
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4, gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    my: 2,
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    display: 'block',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    borderBottom: location.pathname === item.path ? 2 : 0,
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    position: 'relative',
                    textShadow: location.pathname === item.path ? '0 0 10px rgba(0, 240, 255, 0.8)' : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent',
                      textShadow: '0 0 15px rgba(0, 240, 255, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&::after': location.pathname === item.path ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
                      boxShadow: '0 0 10px rgba(0, 240, 255, 0.8)',
                    } : {},
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: { xs: 1, md: 0 }, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                <IconButton
                  color="inherit"
                  onClick={toggleColorMode}
                  sx={{
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                  }}
                >
                  {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              {walletConnected ? (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <Chip
                    icon={<WalletIcon />}
                    label={`${walletAddr?.slice(0, 10)}...${walletAddr?.slice(-6)}`}
                    sx={{
                      bgcolor: 'rgba(0, 255, 136, 0.1)',
                      color: 'success.main',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
                      fontFamily: '"Orbitron", monospace',
                      fontWeight: 600,
                    }}
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={onDisconnectWallet}
                    sx={{
                      borderColor: 'error.main',
                      color: 'error.main',
                      '&:hover': {
                        borderColor: 'error.main',
                        bgcolor: 'rgba(255, 0, 102, 0.1)',
                        boxShadow: '0 0 20px rgba(255, 0, 102, 0.4)',
                      },
                    }}
                  >
                    Disconnect
                  </Button>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<WalletIcon />}
                  onClick={onConnectWallet}
                  disabled={connecting}
                  size="small"
                  sx={{ 
                    display: { xs: 'none', md: 'flex' },
                    fontFamily: '"Orbitron", monospace',
                  }}
                >
                  Connect Wallet
                </Button>
              )}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: isDark ? 'rgba(21, 21, 32, 0.8)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0, 240, 255, 0.2)',
          boxShadow: isDark ? '0 -5px 20px rgba(0, 0, 0, 0.3)' : '0 -2px 10px rgba(0,0,0,0.06)',
        }}
      >
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Notes App. Built on Cardano Testnet.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button component={Link} to="/about" size="small" color="inherit">
                About
              </Button>
              <Typography variant="body2" color="text.secondary">
                Version 1.0.0
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;

