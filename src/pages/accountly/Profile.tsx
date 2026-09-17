import { useEffect, useRef, useState } from 'react';
import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';
import { Check, SquarePen } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import { formatPhone } from 'utils/accountly/format';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, BottomActionBar, FOOTER_SPACE, FormAlert } from 'components/accountly/kit';
import UploadableAvatar from 'components/accountly/UploadableAvatar';
import { MAX_NAME_LENGTH } from 'utils/accountly/limits';
import uploadService from 'services/accountly/uploadService';

const Label = ({ children }: { children: string }) => {
  const c = useAccountlyColors();
  return (
    <Typography sx={{ fontWeight: 500, fontSize: 12.5, color: c.grey, mb: 0.75, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
      {children}
    </Typography>
  );
};

const Profile = () => {
  const { user, business, updateProfile, updateBusiness } = useAuth();
  const c = useAccountlyColors();
  const t = useT();
  const isOwner = user?.role === 'owner';
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState(business?.business_name || '');
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
  }, []);

  const userId = (user as any)?._id || user?.id;

  const handleAvatarSelect = async (file: File) => {
    if (!userId) return;
    setError(null);
    setAvatarUploading(true);
    try {
      const uploaded = await uploadService.uploadFile(file, 'avatar', userId);
      await updateProfile({ avatar_key: uploaded.key });
    } catch (e: any) {
      setError(e?.message || t('profile.failedAvatarUpload'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (isOwner && user?.business_id && businessName.trim() !== (business?.business_name || '')) {
        await updateBusiness({ business_name: businessName.trim() });
      }
      await updateProfile({ name: name.trim() });
      setEditing(false);
      setJustSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setJustSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message || t('profile.failedUpdate'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setBusinessName(business?.business_name || '');
    setName(user?.name || '');
    setError(null);
    setEditing(false);
  };

  return (
    <>
      <AppHeader variant="screen" title={t('profile.title')} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: editing ? FOOTER_SPACE : undefined }}>
        <Stack spacing={2.5}>
          <FormAlert message={error} />
          <AppCard sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ mb: 1.5 }}>
              <UploadableAvatar
                size={76}
                imageUrl={user?.avatar_url}
                fallback={(user?.name || 'U')[0].toUpperCase()}
                bg={c.redDeep}
                fg="#fff"
                uploading={avatarUploading}
                onSelect={handleAvatarSelect}
              />
            </Box>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 17, wordBreak: 'break-word' }}>
              {user?.name || 'User'}
            </Typography>
            <Typography sx={{ color: c.grey, fontSize: 13 }}>{t(`role.${user?.role || 'owner'}`)}</Typography>
          </AppCard>

          <AppCard sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 15 }}>{t('common.details')}</Typography>
              {!editing && justSaved && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: c.greenDeep }}>
                  <Check size={15} />
                  <Typography sx={{ fontWeight: 500, fontSize: 13 }}>{t('profile.updated')}</Typography>
                </Stack>
              )}
              {!editing && !justSaved && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SquarePen size={15} />}
                  onClick={() => {
                    setJustSaved(false);
                    setEditing(true);
                  }}
                >
                  {t('common.edit')}
                </Button>
              )}
            </Stack>
            <Stack spacing={2.5}>
              <Box>
                <Label>{t('profile.businessName')}</Label>
                <TextField
                  fullWidth
                  value={businessName}
                  disabled={!editing || !isOwner}
                  onChange={(e) => setBusinessName(e.target.value)}
                  inputProps={{ maxLength: MAX_NAME_LENGTH }}
                />
              </Box>
              <Box>
                <Label>{t('common.name')}</Label>
                <TextField
                  fullWidth
                  value={name}
                  disabled={!editing}
                  onChange={(e) => setName(e.target.value)}
                  inputProps={{ maxLength: MAX_NAME_LENGTH }}
                />
              </Box>
              <Box>
                <Label>{t('common.phone')}</Label>
                <TextField fullWidth value={formatPhone(user?.phone)} disabled />
              </Box>
            </Stack>
          </AppCard>
        </Stack>
      </Container>

      {editing && (
        <BottomActionBar>
          <Stack direction="row" spacing={1.5}>
            <Button fullWidth variant="outlined" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button fullWidth variant="contained" disabled={saving} onClick={handleSave}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </Stack>
        </BottomActionBar>
      )}
    </>
  );
};

export default Profile;
