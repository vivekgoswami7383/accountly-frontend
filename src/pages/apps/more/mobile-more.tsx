import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  SettingOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import useAuth from 'hooks/useAuth';

// ==============================|| MOBILE MORE ||============================== //

const MobileMore = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
  };

  const menuItems = [
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: <UserOutlined />, action: () => navigate('/mobile/profile') },
        { label: 'Settings', icon: <SettingOutlined />, action: () => navigate('/mobile/settings') }
      ]
    },
    {
      title: 'Business',
      items: [
        { label: 'Reports', icon: <BarChartOutlined />, action: () => console.log('Reports') },
        { label: 'Export Data', icon: <FileTextOutlined />, action: () => console.log('Export') }
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help & FAQ', icon: <QuestionCircleOutlined />, action: () => console.log('Help') },
        { label: 'About', icon: <InfoCircleOutlined />, action: () => console.log('About') }
      ]
    }
  ];

  return (
    <Box sx={{ pb: 12 }}>
      {/* User Info */}
      <MainCard sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Box>
          <Box>
            <Typography variant="h6">{user?.name || 'User'}</Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.role || 'User'}
            </Typography>
          </Box>
        </Stack>
      </MainCard>

      {/* Menu Items */}
      {menuItems.map((section, sectionIndex) => (
        <MainCard key={sectionIndex} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {section.title}
          </Typography>
          <List>
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex}>
                <ListItem button onClick={item.action} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
                {itemIndex < section.items.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </MainCard>
      ))}

      {/* Logout */}
      <MainCard>
        <List>
          <ListItem button onClick={handleLogout} sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutOutlined />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </MainCard>
    </Box>
  );
};

export default MobileMore;
