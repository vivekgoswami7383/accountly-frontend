import { useState, MouseEvent } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ShopOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';
import { primaryNav, activeTabIndex, isRootTab } from './navConfig';

const DRAWER = 240;
const APPBAR = 64;
const BOTTOMNAV = 64;
const CONTENT_BOTTOM_GAP = `calc(${BOTTOMNAV + 12}px + env(safe-area-inset-bottom, 0px))`;

const AppLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const businessName = user?.business?.business_name || 'Accountly';
  const showBottomNav = !isDesktop && isRootTab(location.pathname);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login', { state: { from: '' } });
  };

  const profileMenu = (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
      <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
        <ListItemIcon><UserOutlined /></ListItemIcon>
        Profile
      </MenuItem>
      <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
        <ListItemIcon><SettingOutlined /></ListItemIcon>
        Settings
      </MenuItem>
      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
        <ListItemIcon sx={{ color: 'error.main' }}><LogoutOutlined /></ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  const avatarButton = (
    <IconButton onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 15 }}>
        {(user?.name || 'U').charAt(0).toUpperCase()}
      </Avatar>
    </IconButton>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        background: `linear-gradient(180deg, #1A1A1A 0%, #2D2D2D 100%)`,
        backgroundAttachment: 'fixed'
      }}
    >
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER, boxSizing: 'border-box', bgcolor: 'background.paper', borderRight: `1px solid ${theme.palette.divider}` }
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <ShopOutlined />
            <Typography variant="h6" fontWeight={700} noWrap>
              {businessName}
            </Typography>
          </Toolbar>
          <List sx={{ px: 1 }}>
            {primaryNav.map((item) => {
              const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
              return (
                <ListItemButton
                  key={item.path}
                  selected={active}
                  onClick={() => navigate(item.path)}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'inherit' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
          </List>
        </Drawer>
      )}

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: isDesktop ? `calc(100% - ${DRAWER}px)` : '100%',
          ml: isDesktop ? `${DRAWER}px` : 0,
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <ShopOutlined />
            <Typography variant="h6" fontWeight={700} noWrap>
              {businessName}
            </Typography>
          </Box>
          {avatarButton}
        </Toolbar>
      </AppBar>
      {profileMenu}

      <Box
        component="main"
        sx={{
          ml: isDesktop ? `${DRAWER}px` : 0,
          width: isDesktop ? `calc(100% - ${DRAWER}px)` : '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          pt: `${APPBAR}px`,
          pb: showBottomNav ? CONTENT_BOTTOM_GAP : 3,
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: '100vh'
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '100%', pt: 2 }}>
          <Outlet />
        </Box>
      </Box>

      {showBottomNav && (
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            pb: 'max(6px, calc(env(safe-area-inset-bottom, 0px) - 8px))'
          }}
        >
          <BottomNavigation
            showLabels
            value={activeTabIndex(location.pathname)}
            onChange={(_, v) => navigate(primaryNav[v].path)}
            sx={{
              height: BOTTOMNAV,
              bgcolor: 'transparent',
              px: 0.5,
              '& .MuiBottomNavigationAction-root': { minWidth: 0, py: 0.75 },
              '& .anticon': { fontSize: 21 },
              '& .MuiBottomNavigationAction-label': { fontSize: '0.7rem', mt: 0.5 }
            }}
          >
            {primaryNav.map((item) => (
              <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default AppLayout;
