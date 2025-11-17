import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Security as SecurityIcon,
  AccountBalanceWallet as WalletIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

function About() {
  const theme = useTheme();

  const techStack = [
    { name: 'React', description: 'Frontend framework' },
    { name: 'Material UI', description: 'UI component library' },
    { name: 'Spring Boot', description: 'Backend framework' },
    { name: 'PostgreSQL', description: 'Database' },
    { name: 'Cardano', description: 'Blockchain network' },
    { name: 'Lucid', description: 'Cardano SDK' },
  ];

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Blockchain Security',
      description: 'All notes are stored on the Cardano blockchain, ensuring immutability and permanent storage.',
    },
    {
      icon: <WalletIcon sx={{ fontSize: 40 }} />,
      title: 'Wallet Integration',
      description: 'Connect your Cardano wallet (Nami, Lace, Eternl, or Flint) to manage your notes securely.',
    },
    {
      icon: <StorageIcon sx={{ fontSize: 40 }} />,
      title: 'Decentralized Storage',
      description: 'Your data is stored on the blockchain, not on centralized servers. You own your data.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          About Notes App
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
          A decentralized notes application built on Cardano Testnet, combining modern web technologies with
          blockchain security.
        </Typography>
      </Box>

      {/* Mission Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 6, background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)` }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'white', mb: 2 }}>
          Our Mission
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', fontSize: '1.1rem', lineHeight: 1.8 }}>
          We believe in the power of decentralized technology to give users true ownership of their data. Notes App
          leverages the Cardano blockchain to provide a secure, permanent, and user-controlled note-taking experience.
          Your notes are stored on-chain, ensuring they can never be lost, censored, or controlled by third parties.
        </Typography>
      </Paper>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Technology Stack */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          Technology Stack
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {techStack.map((tech, index) => (
            <Grid item key={index}>
              <Chip
                label={`${tech.name} - ${tech.description}`}
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.9rem', py: 2.5, px: 1 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* How It Works */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          How It Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  1
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Connect Wallet
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Connect your Cardano wallet to authenticate and access your notes. We support Nami, Lace, Eternl, and
                Flint wallets.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  2
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Create Notes
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Create, edit, and manage your notes through our intuitive interface. Each note is stored securely on the
                blockchain.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  3
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Blockchain Storage
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Your notes are permanently stored on the Cardano blockchain, ensuring they can never be lost or
                modified without your permission.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Benefits */}
      <Paper elevation={2} sx={{ p: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Why Choose Blockchain-Based Notes?
        </Typography>
        <Stack spacing={2}>
          {[
            'Permanent storage - Your notes can never be lost',
            'Decentralized - No single point of failure',
            'Secure - Protected by blockchain cryptography',
            'Transparent - All transactions are verifiable',
            'User-owned - You control your data completely',
          ].map((benefit, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="center">
              <CheckCircleIcon color="primary" />
              <Typography variant="body1">{benefit}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* Footer Note */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="body2" color="text.secondary">
          Built with ❤️ on Cardano Testnet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Version 1.0.0
        </Typography>
      </Box>
    </Container>
  );
}

export default About;

