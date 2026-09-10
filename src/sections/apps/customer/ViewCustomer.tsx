import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import Avatar from 'components/@extended/Avatar';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';

export interface Props {
  open: boolean;
  customer: any;
  onClose: () => void;
}

const ViewCustomer = ({ open, customer, onClose }: Props) => {
  const theme = useTheme();

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      case 0:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return 'Active';
      case 2:
        return 'Inactive';
      case 0:
        return 'Deleted';
      default:
        return 'Unknown';
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <UserOutlined style={{ fontSize: '1.5rem' }} />
          <Typography variant="h4">Customer Details</Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
                  <Box sx={{ alignSelf: 'flex-end' }}>
                    <Chip
                      label={getStatusLabel(customer.status)}
                      color={getStatusColor(customer.status) as any}
                      size="small"
                      variant="light"
                    />
                  </Box>

                  <Avatar
                    alt="Customer Avatar"
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: theme.palette.primary.lighter,
                      fontSize: '2rem'
                    }}
                  >
                    <UserOutlined />
                  </Avatar>

                  <Stack spacing={1}>
                    <Typography variant="h5" fontWeight="bold">
                      {customer.first_name} {customer.last_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Customer
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h6" fontWeight="bold">
                          {customer.age || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Age
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={4}>
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h6" fontWeight="bold" color={customer.balance < 0 ? 'error.main' : 'text.primary'}>
                          ₹{customer.balance || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Balance
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={4}>
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="h6" fontWeight="bold">
                          {Math.floor(Math.random() * 1000) + 100}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Visits
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Stack spacing={2} sx={{ width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MailOutlined style={{ color: theme.palette.primary.main }} />
                      <Stack spacing={0}>
                        <Typography variant="caption" color="textSecondary">
                          Email
                        </Typography>
                        <Typography variant="body2">{customer.email || 'No email provided'}</Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneOutlined style={{ color: theme.palette.primary.main }} />
                      <Stack spacing={0}>
                        <Typography variant="caption" color="textSecondary">
                          Phone
                        </Typography>
                        <Typography variant="body2">{customer.phone || 'No phone provided'}</Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EnvironmentOutlined style={{ color: theme.palette.primary.main }} />
                      <Stack spacing={0}>
                        <Typography variant="caption" color="textSecondary">
                          Location
                        </Typography>
                        <Typography variant="body2">{customer.address || 'No address provided'}</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Personal Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {customer.first_name} {customer.last_name}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Age
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {customer.age || 'Not specified'}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Gender
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {customer.gender ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1) : 'Not specified'}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Balance
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color={customer.balance < 0 ? 'error.main' : 'text.primary'}>
                          ₹{customer.balance || 0}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Status
                        </Typography>
                        <Chip
                          label={getStatusLabel(customer.status)}
                          color={getStatusColor(customer.status) as any}
                          size="small"
                          variant="light"
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Address
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {customer.address || 'No address provided'}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {customer.email || 'No email provided'}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {customer.phone || 'No phone provided'}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Registration Date
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(customer.updated_at || customer.created_at).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    About
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {customer.about ||
                      'This is a valued customer who has been with us for some time. They appreciate quality service and have been a loyal patron of our business. We look forward to continuing to serve them with excellence.'}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button variant="contained" startIcon={<UserOutlined />}>
          View Transactions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCustomer;
