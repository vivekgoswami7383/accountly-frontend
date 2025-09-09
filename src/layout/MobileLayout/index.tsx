import { Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery, Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { BellOutlined, SearchOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useRef } from 'react';

// project import
import MobileBottomNavigation from 'components/MobileBottomNavigation';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';

// ==============================|| MOBILE LAYOUT ||============================== //

const MobileLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { container } = useConfig();
  const { logout, user } = useAuth();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLButtonElement>(null);

  // Force mobile layout on all screen sizes for now
  // You can change this to only show on mobile devices
  const forceMobile = true;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error(err);
    }
    setProfileMenuOpen(false);
  };

  const handleProfileMenuToggle = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  if (!isMobile && !forceMobile) {
    // Fallback to regular layout on desktop
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Mobile Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {user?.business?.business_name || 'Accountly'}
          </Typography>

          <IconButton color="inherit" aria-label="search">
            <SearchOutlined />
          </IconButton>

          <IconButton color="inherit" aria-label="notifications">
            <BellOutlined />
          </IconButton>

          <IconButton ref={profileMenuRef} color="inherit" aria-label="profile" onClick={handleProfileMenuToggle}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
              {user?.first_name
                ? user.first_name.charAt(0).toUpperCase()
                : user?.name
                ? user.name.split(' ')[0]?.charAt(0)?.toUpperCase() || 'U'
                : 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuRef.current}
        open={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem
          onClick={() => {
            setProfileMenuOpen(false);
            navigate('/mobile/profile');
          }}
        >
          <UserOutlined style={{ marginRight: 8 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutOutlined style={{ marginRight: 8 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          paddingTop: '56px', // Height of AppBar
          paddingBottom: '70px', // Height of BottomNavigation
          overflow: 'auto',
          backgroundColor: 'background.default'
        }}
      >
        <Box
          sx={{
            ...(container && { px: { xs: 1, sm: 2 } }),
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Bottom Navigation */}
      <MobileBottomNavigation />
    </Box>
  );
};

export default MobileLayout;
