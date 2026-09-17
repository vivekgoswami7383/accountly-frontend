import { ReactNode, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Camera } from 'lucide-react';
import { DISPLAY, AccountlyColors, useAccountlyColors } from 'themes/accountly';

const UploadableAvatar = ({
  size,
  imageUrl,
  fallback,
  bg,
  fg,
  uploading,
  onSelect
}: {
  size: number;
  imageUrl?: string | null;
  fallback: ReactNode;
  bg: string;
  fg: string;
  uploading?: boolean;
  onSelect: (file: File) => void;
}) => {
  const c: AccountlyColors = useAccountlyColors();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openPicker = () => !uploading && inputRef.current?.click();

  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <Box
        component="button"
        type="button"
        onClick={openPicker}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: 'none',
          p: 0,
          overflow: 'hidden',
          cursor: uploading ? 'default' : 'pointer',
          bgcolor: imageUrl ? 'transparent' : bg,
          color: fg,
          display: 'grid',
          placeItems: 'center',
          fontFamily: DISPLAY,
          fontWeight: 500,
          fontSize: size * 0.37
        }}
      >
        {imageUrl ? (
          <Box component="img" src={imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          fallback
        )}
      </Box>
      <Box
        component="button"
        type="button"
        onClick={openPicker}
        sx={{
          position: 'absolute',
          right: -2,
          bottom: -2,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: `2px solid ${c.surface}`,
          bgcolor: c.red,
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          cursor: uploading ? 'default' : 'pointer'
        }}
      >
        {uploading ? <CircularProgress size={13} sx={{ color: '#fff' }} /> : <Camera size={13} />}
      </Box>
      <Box
        component="input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={inputRef}
        onChange={(e: any) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onSelect(file);
        }}
        sx={{ display: 'none' }}
      />
    </Box>
  );
};

export default UploadableAvatar;
