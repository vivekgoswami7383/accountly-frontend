import { useState } from 'react';
import { Avatar, Box, Button, Card, Stack, TextField, Typography } from '@mui/material';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import ScreenHeader from 'components/accountly/ScreenHeader';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      showSnackbar({ message: 'Profile updated successfully', type: 'success' });
      setEditing(false);
    } catch (e: any) {
      showSnackbar({ message: e?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEditing(false);
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <ScreenHeader title="Profile" />

      <Card sx={{ borderRadius: 3, p: 3, mb: 2, textAlign: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 28, mx: 'auto', mb: 1.5 }}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6" fontWeight={700}>
          {user?.name || 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
          {user?.role || 'Owner'}
        </Typography>
      </Card>

      <Card sx={{ borderRadius: 3, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Profile Information
          </Typography>
          {!editing && (
            <Button size="small" variant="outlined" startIcon={<EditOutlined />} onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </Stack>

        <Stack spacing={2.5}>
          <TextField label="Name" fullWidth value={name} disabled={!editing} onChange={(e) => setName(e.target.value)} />
          <TextField label="Phone" fullWidth value={phone} disabled={!editing} onChange={(e) => setPhone(e.target.value)} />
          <TextField label="Role" fullWidth value={user?.role || ''} disabled sx={{ textTransform: 'capitalize' }} />

          {editing && (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<SaveOutlined />} disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </Stack>
          )}
        </Stack>
      </Card>
    </Box>
  );
};

export default Profile;
