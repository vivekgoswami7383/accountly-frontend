import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import { SaveOutlined, EditOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';

// ==============================|| SETTINGS PAGE ||============================== //

const SettingsPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    language: 'English',
    timezone: 'UTC+5:30 (IST)',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR (₹)',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [field]: event.target.value
    });
  };

  const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [field]: event.target.checked
    });
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the settings
    console.log('Saving settings:', settings);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <MainCard title="Settings">
      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">General Settings</Typography>
                {!isEditing ? (
                  <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                    Edit Settings
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave}>
                      Save Changes
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="settings-language">Language</InputLabel>
                    <TextField
                      fullWidth
                      id="settings-language"
                      value={settings.language}
                      onChange={handleInputChange('language')}
                      disabled={!isEditing}
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Gujarati">Gujarati</option>
                    </TextField>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="settings-timezone">Timezone</InputLabel>
                    <TextField
                      fullWidth
                      id="settings-timezone"
                      value={settings.timezone}
                      onChange={handleInputChange('timezone')}
                      disabled={!isEditing}
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="UTC+5:30 (IST)">UTC+5:30 (IST)</option>
                      <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
                      <option value="UTC-5 (EST)">UTC-5 (EST)</option>
                    </TextField>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="settings-date-format">Date Format</InputLabel>
                    <TextField
                      fullWidth
                      id="settings-date-format"
                      value={settings.dateFormat}
                      onChange={handleInputChange('dateFormat')}
                      disabled={!isEditing}
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </TextField>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1.25}>
                    <InputLabel htmlFor="settings-currency">Currency</InputLabel>
                    <TextField
                      fullWidth
                      id="settings-currency"
                      value={settings.currency}
                      onChange={handleInputChange('currency')}
                      disabled={!isEditing}
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="INR (₹)">INR (₹)</option>
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                    </TextField>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Notification Settings
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleSwitchChange('emailNotifications')}
                      disabled={!isEditing}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch checked={settings.smsNotifications} onChange={handleSwitchChange('smsNotifications')} disabled={!isEditing} />
                  }
                  label="SMS Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch checked={settings.pushNotifications} onChange={handleSwitchChange('pushNotifications')} disabled={!isEditing} />
                  }
                  label="Push Notifications"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default SettingsPage;
