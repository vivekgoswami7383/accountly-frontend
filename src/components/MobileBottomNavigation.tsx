import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import { HomeOutlined, UserOutlined, FileTextOutlined, MoreOutlined } from '@ant-design/icons';

const MobileBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Home',
      icon: <HomeOutlined />,
      path: '/mobile/dashboard',
      badge: null
    },
    {
      label: 'Customers',
      icon: <UserOutlined />,
      path: '/mobile/customer',
      badge: null
    },
    {
      label: 'Transactions',
      icon: <FileTextOutlined />,
      path: '/mobile/transaction',
      badge: 3 // Mock pending transactions count
    },
    {
      label: 'More',
      icon: <MoreOutlined />,
      path: '/mobile/more',
      badge: null
    }
  ];

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    const selectedItem = navigationItems[newValue];
    if (selectedItem) {
      navigate(selectedItem.path);
    }
  };

  const getCurrentTab = () => {
    const currentPath = location.pathname;
    const tabIndex = navigationItems.findIndex((item) => currentPath.startsWith(item.path) && item.path !== '/');
    return tabIndex >= 0 ? tabIndex : 0;
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentTab()}
        onChange={handleChange}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0 8px',
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }
        }}
      >
        {navigationItems.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            icon={
              item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
            sx={{
              fontSize: '0.75rem',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                fontWeight: 500
              }
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNavigation;
