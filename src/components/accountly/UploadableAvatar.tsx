import { ReactNode, useRef } from 'react';
import { Box } from '@mui/material';
import { Camera, X } from 'lucide-react';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';

const UploadableAvatar = ({
  size,
  imageUrl,
  fallback,
  bg,
  fg,
  editable = true,
  onSelect,
  onRemove
}: {
  size: number;
  imageUrl?: string | null;
  fallback: ReactNode;
  bg: string;
  fg: string;
  editable?: boolean;
  onSelect: (file: File) => void;
  onRemove?: () => void;
}) => {
  const c = useAccountlyColors();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const openPicker = () => editable && inputRef.current?.click();

  const badgeSx = {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: `2px solid ${c.surface}`,
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    p: 0
  } as const;

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
          cursor: editable ? 'pointer' : 'default',
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
      {editable && (
        <Box component="button" type="button" onClick={openPicker} aria-label="Change photo" sx={{ ...badgeSx, right: -2, bottom: -2, bgcolor: c.red }}>
          <Camera size={13} />
        </Box>
      )}
      {editable && imageUrl && onRemove && (
        <Box component="button" type="button" onClick={onRemove} aria-label="Remove photo" sx={{ ...badgeSx, right: -2, top: -2, bgcolor: c.slate }}>
          <X size={13} />
        </Box>
      )}
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
