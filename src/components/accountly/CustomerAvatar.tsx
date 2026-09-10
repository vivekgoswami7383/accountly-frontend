import { Avatar, SxProps, Theme } from '@mui/material';

interface CustomerAvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  sx?: SxProps<Theme>;
}

const dims: Record<NonNullable<CustomerAvatarProps['size']>, { d: number; f: number }> = {
  small: { d: 32, f: 14 },
  medium: { d: 40, f: 16 },
  large: { d: 48, f: 18 },
  xlarge: { d: 60, f: 24 }
};

const getInitials = (name: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('') || 'C';

const CustomerAvatar = ({ name, size = 'medium', sx }: CustomerAvatarProps) => {
  const { d, f } = dims[size];
  return (
    <Avatar
      sx={{
        width: d,
        height: d,
        fontSize: f,
        fontWeight: 700,
        flexShrink: 0,
        bgcolor: 'primary.main',
        color: 'common.white',
        ...sx
      }}
    >
      {getInitials(name)}
    </Avatar>
  );
};

export default CustomerAvatar;
