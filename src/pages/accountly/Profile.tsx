import { useState } from 'react';
import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { SquarePen } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import useSnackbar from 'hooks/useSnackbar';
import { c, DISPLAY } from 'themes/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, BottomActionBar, FOOTER_SPACE } from 'components/accountly/kit';

const Label = ({ children }: { children: string }) => (
  <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: c.grey, mb: 0.75, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
    {children}
  </Typography>
);

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
      showSnackbar({ message: 'Profile updated', type: 'success' });
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
    <>
      <AppHeader variant="screen" title="Profile" />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: editing ? FOOTER_SPACE : undefined }}>
        <Stack spacing={2.5}>
          <AppCard sx={{ p: 3, textAlign: 'center' }}>
            <Box
              sx={{ width: 76, height: 76, borderRadius: '50%', bgcolor: c.redDeep, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, mx: 'auto', mb: 1.5 }}
            >
              {(user?.name || 'U')[0].toUpperCase()}
            </Box>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17 }}>{user?.name || 'User'}</Typography>
            <Typography sx={{ color: c.grey, fontSize: 13, textTransform: 'capitalize' }}>{user?.role || 'Owner'}</Typography>
          </AppCard>

          <AppCard sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15 }}>Details</Typography>
              {!editing && (
                <Button size="small" variant="outlined" startIcon={<SquarePen size={15} />} onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
            </Stack>
            <Stack spacing={2.5}>
              <Box>
                <Label>Name</Label>
                <TextField fullWidth value={name} disabled={!editing} onChange={(e) => setName(e.target.value)} />
              </Box>
              <Box>
                <Label>Phone</Label>
                <TextField fullWidth value={phone} disabled={!editing} onChange={(e) => setPhone(e.target.value)} />
              </Box>
            </Stack>
          </AppCard>
        </Stack>
      </Container>

      {editing && (
        <BottomActionBar>
          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button fullWidth variant="contained" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Stack>
        </BottomActionBar>
      )}
    </>
  );
};

export default Profile;
