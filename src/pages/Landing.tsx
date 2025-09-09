import { useEffect, useState } from 'react';
import { Box, Typography, Stack, Button, Card, CardContent, Grid } from '@mui/material';
import { SettingOutlined, MobileOutlined, LoginOutlined } from '@ant-design/icons';

const Landing = () => {
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOptions(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleMobileApp = () => {
    window.location.href = '/mobile/dashboard';
  };

  const handleAdminPanel = () => {
    window.location.href = '/app/dashboard';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  if (!showOptions) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4">Accountly</Typography>
          <Typography variant="h6">Loading...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.main',
        color: 'white',
        p: 3
      }}
    >
      <Box sx={{ maxWidth: 600, width: '100%' }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography variant="h3" fontWeight="bold">
            Welcome to Accountly
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Choose your interface
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={handleMobileApp}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <MobileOutlined style={{ fontSize: '3rem', color: '#1976d2', marginBottom: '1rem' }} />
                  <Typography variant="h5" gutterBottom>
                    Mobile App
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Khatabook-style interface for business owners. Simple, mobile-first design for daily operations.
                  </Typography>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }} startIcon={<MobileOutlined />}>
                    Open Mobile App
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={handleAdminPanel}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <SettingOutlined style={{ fontSize: '3rem', color: '#1976d2', marginBottom: '1rem' }} />
                  <Typography variant="h5" gutterBottom>
                    Admin Panel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Full admin interface with all modules. Business management, user roles, and system administration.
                  </Typography>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }} startIcon={<SettingOutlined />}>
                    Open Admin Panel
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={handleLogin}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <LoginOutlined style={{ fontSize: '3rem', color: '#1976d2', marginBottom: '1rem' }} />
                  <Typography variant="h5" gutterBottom>
                    Login
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access your account with proper authentication. Required for admin features and user management.
                  </Typography>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }} startIcon={<LoginOutlined />}>
                    Login to Account
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Box>
  );
};

export default Landing;
