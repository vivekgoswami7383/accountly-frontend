import { Button, Grid, InputLabel, Stack, TextField } from '@mui/material';
import MainCard from 'components/MainCard';

const TabAccount = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="General Settings">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="business-name">Business Name</InputLabel>
                <TextField fullWidth defaultValue="Chandu_Bhai_16" id="business-name" placeholder="Business Name" autoFocus />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="business-email">Business Email</InputLabel>
                <TextField fullWidth defaultValue="chandu@gmail.com" id="business-email" placeholder="Business Email" />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="personal-address">Address</InputLabel>
                <TextField
                  fullWidth
                  defaultValue="Green pan, Maruti Chowk, L.H.Road, Varachha, Surat"
                  id="personal-address"
                  placeholder="Address"
                />
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <Button variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button variant="contained">Update Business</Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TabAccount;
