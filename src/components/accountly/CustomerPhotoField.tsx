import { useRef } from 'react';
import { Avatar, Badge, Box, IconButton } from '@mui/material';
import { CameraOutlined } from '@ant-design/icons';

interface CustomerPhotoFieldProps {
  name: string;
  image: string | null;
  onImageChange: (dataUrl: string | null) => void;
}

const initials = (name: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

const CustomerPhotoField = ({ name, image, onImageChange }: CustomerPhotoFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImageChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <IconButton
            size="small"
            onClick={() => inputRef.current?.click()}
            sx={{ bgcolor: 'primary.main', color: '#fff', width: 24, height: 24, '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <CameraOutlined style={{ fontSize: 12 }} />
          </IconButton>
        }
      >
        <Avatar src={image || undefined} sx={{ width: 80, height: 80, fontSize: 24, fontWeight: 700, bgcolor: 'primary.main' }}>
          {initials(name)}
        </Avatar>
      </Badge>
    </Box>
  );
};

export default CustomerPhotoField;
