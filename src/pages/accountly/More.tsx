import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Card, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { UserOutlined, SettingOutlined, BarChartOutlined, LogoutOutlined, RightOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';

const More = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { state: { from: '' } });
  };

  const items = [
    { label: 'Profile', icon: <UserOutlined />, path: '/profile' },
    { label: 'Settings', icon: <SettingOutlined />, path: '/settings' },
    { label: 'Reports', icon: <BarChartOutlined />, path: '/reports' }
  ];

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Card sx={{ borderRadius: 3, p: 2.5, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', fontSize: 24 }}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {user?.role || 'Owner'}
          </Typography>
        </Box>
      </Card>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <List disablePadding>
          {items.map((item) => (
            <ListItemButton key={item.path} onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              <RightOutlined style={{ opacity: 0.5 }} />
            </ListItemButton>
          ))}
        </List>
      </Card>

      <Button
        fullWidth
        variant="outlined"
        color="error"
        startIcon={<LogoutOutlined />}
        onClick={handleLogout}
        sx={{ borderRadius: 3, py: 1.5 }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default More;
