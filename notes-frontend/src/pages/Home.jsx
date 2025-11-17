import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Note as NoteIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Wallet as WalletIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

function Home({ walletConnected, onConnectWallet, connecting }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Blockchain Secured',
      description: 'Your notes are stored securely on the Cardano blockchain, ensuring immutability and permanence.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description: 'Quick access to your notes with a modern, responsive interface built with React and Material UI.',
    },
    {
      icon: <WalletIcon sx={{ fontSize: 40 }} />,
      title: 'Wallet Integration',
      description: 'Connect your Cardano wallet to manage your notes and execute transactions seamlessly.',
    },
  ];

  const benefits = [
    'Permanent storage on Cardano blockchain',
    'Secure wallet-based authentication',
    'Beautiful, modern user interface',
    'Fast and responsive design',
    'Cross-platform compatibility',
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)`,
          color: isDark ? 'white' : 'text.primary',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            <NoteIcon 
              sx={{ 
                fontSize: 100, 
                color: 'primary.main',
                filter: 'drop-shadow(0 0 30px rgba(0, 240, 255, 1))',
                animation: 'float 3s ease-in-out infinite',
              }} 
            />
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold', 
                maxWidth: '800px',
                fontFamily: '"Orbitron", monospace',
                background: 'linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(0, 240, 255, 0.5)',
                animation: 'glow 3s ease-in-out infinite',
              }}
            >
              YOUR NOTES, FOREVER ON CARDANO
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                maxWidth: '600px', 
                opacity: 0.9,
                fontFamily: '"Rajdhani", sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              A decentralized notes application built on Cardano Testnet. Store, manage, and access your notes with
              blockchain security.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              {!walletConnected ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<WalletIcon />}
                  onClick={onConnectWallet}
                  disabled={connecting}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                    minWidth: 200,
                  }}
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/notes"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                    minWidth: 200,
                  }}
                >
                  Go to Notes
                </Button>
              )}
              <Button
                component={Link}
                to="/about"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: isDark ? 'white' : 'primary.main',
                  color: isDark ? 'white' : 'primary.main',
                  '&:hover': { borderColor: isDark ? 'white' : 'primary.main', bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)' },
                  minWidth: 200,
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            mb: 6,
            fontFamily: '"Orbitron", monospace',
            background: 'linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(0, 240, 255, 0.5)',
          }}
        >
          WHY CHOOSE OUR NOTES APP?
        </Typography>
        <Stack
          direction="row"
          spacing={4}
          sx={{
            overflowX: { xs: 'auto', md: 'visible' },
            pb: 1,
            flexWrap: { xs: 'nowrap', md: 'wrap' },
            justifyContent: { xs: 'flex-start', md: 'center' },
          }}
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                flex: { xs: '0 0 auto', md: '1 1 30%' },
                minWidth: { xs: 260, sm: 280 },
                maxWidth: { md: 360 },
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: { xs: 2, md: 3 },
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.1), transparent)',
                    transition: 'left 0.5s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 0 40px rgba(0, 240, 255, 0.4)',
                    borderColor: 'primary.main',
                    '&::before': {
                      left: '100%',
                    },
                  },
                }}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      color: 'primary.main', 
                      mb: 2,
                      filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.8))',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.2) rotate(5deg)',
                        filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 1))',
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      fontFamily: '"Orbitron", monospace',
                      color: 'primary.main',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontFamily: '"Rajdhani", sans-serif' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>
      </Container>

      {/* Benefits Section */}
      <Box 
        sx={{ 
          py: 8,
          position: 'relative',
          background: isDark 
            ? 'radial-gradient(circle at 30% 50%, rgba(0, 240, 255, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 30% 50%, rgba(0, 160, 220, 0.08) 0%, transparent 50%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 4,
                  fontFamily: '"Orbitron", monospace',
                  color: 'primary.main',
                  textShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
                }}
              >
                EVERYTHING YOU NEED
              </Typography>
              <Stack spacing={2}>
                {benefits.map((benefit, index) => (
                  <Stack 
                    key={index} 
                    direction="row" 
                    spacing={2} 
                    alignItems="center"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(0, 240, 255, 0.05)',
                        transform: 'translateX(10px)',
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        pl: 3,
                      },
                    }}
                  >
                    <CheckCircleIcon 
                      sx={{ 
                        color: 'success.main',
                        filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.8))',
                      }} 
                    />
                    <Typography 
                      variant="h6"
                      sx={{ 
                        fontFamily: '"Rajdhani", sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      {benefit}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  boxShadow: '0 0 40px rgba(0, 240, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
                    animation: 'pulse 3s ease-in-out infinite',
                  },
                }}
              >
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'primary.main',
                    fontFamily: '"Orbitron", monospace',
                    textShadow: '0 0 20px rgba(0, 240, 255, 0.8)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  GET STARTED TODAY
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.primary', 
                    mb: 3, 
                    opacity: 0.9,
                    fontFamily: '"Rajdhani", sans-serif',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Connect your Cardano wallet and start creating notes that will be permanently stored on the blockchain.
                </Typography>
                {!walletConnected ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<WalletIcon />}
                    onClick={onConnectWallet}
                    disabled={connecting}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to="/notes"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    View Your Notes
                  </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #00f0ff, #ff00ff) 1',
            boxShadow: '0 0 60px rgba(0, 240, 255, 0.3), inset 0 0 60px rgba(255, 0, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(0, 240, 255, 0.1), transparent)',
              animation: 'float 6s ease-in-out infinite',
            },
          }}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              fontFamily: '"Orbitron", monospace',
              background: 'linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(0, 240, 255, 0.5)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            READY TO START?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4, 
              opacity: 0.9,
              fontFamily: '"Rajdhani", sans-serif',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Join the decentralized future of note-taking
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {!walletConnected ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<WalletIcon />}
                onClick={onConnectWallet}
                disabled={connecting}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  minWidth: 200,
                }}
              >
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            ) : (
              <Button
                component={Link}
                to="/notes"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  minWidth: 200,
                }}
              >
                Go to Notes
              </Button>
            )}
            <Button
              component={Link}
              to="/about"
              variant="outlined"
              size="large"
              sx={{
              borderColor: isDark ? 'white' : 'primary.main',
              color: isDark ? 'white' : 'primary.main',
              '&:hover': { borderColor: isDark ? 'white' : 'primary.main', bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)' },
                minWidth: 200,
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Home;

