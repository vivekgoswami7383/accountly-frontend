import { useState } from 'react';
import { Button, Box, Stack, TextField, Typography, Avatar, Paper } from '@mui/material';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';

// ==============================|| MOBILE PROFILE PAGE ||============================== //

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || ''
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || ''
    });
    setIsEditing(false);
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 2, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '1.5rem'
          }}
        >
          {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <Typography variant="h6" gutterBottom>
          {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.name || 'User'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.role || 'User Role'}
        </Typography>
      </Paper>

      {/* Profile Form */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">Profile Information</Typography>
          {!isEditing && (
            <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => setIsEditing(true)} size="small">
              Edit
            </Button>
          )}
        </Stack>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.first_name}
            onChange={handleInputChange('first_name')}
            disabled={!isEditing}
            placeholder="Enter your first name"
            size="small"
          />

          <TextField
            fullWidth
            label="Last Name"
            value={formData.last_name}
            onChange={handleInputChange('last_name')}
            disabled={!isEditing}
            placeholder="Enter your last name"
            size="small"
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={!isEditing}
            placeholder="Enter your email"
            size="small"
          />

          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={handleInputChange('phone')}
            disabled={!isEditing}
            placeholder="Enter your phone number"
            size="small"
          />

          <TextField fullWidth label="Role" value={formData.role} disabled placeholder="Your role" size="small" />

          {/* Action Buttons at the bottom */}
          {isEditing && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleCancel} size="small">
                Cancel
              </Button>
              <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave} size="small">
                Save
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
