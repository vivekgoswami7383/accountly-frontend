import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Divider, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { Search, Phone, ChevronRight, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchContactsPage } from 'store/reducers/accountly/contacts';
import { useFormatAmount, formatPhone } from 'utils/accountly/format';
import { DISPLAY, avatarTint, initials, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, BalanceTag, Fade, ListRow } from 'components/accountly/kit';
import { ContactsEmptyIllustration } from 'components/accountly/EmptyIllustration';
import ContactNameLine from 'components/accountly/ContactNameLine';
import ContactTypeChips from 'components/accountly/ContactTypeChips';

const Contacts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const fmt = useFormatAmount();
  const { listItems: contacts, listPage, listHasMore, listLoading, listLoadingMore, listType } = useSelector((s) => s.contacts);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (listPage === 0) dispatch(fetchContactsPage({ page: 1 }));
  }, [dispatch, listPage]);

  const loadMore = () => {
    if (listHasMore && !listLoadingMore) dispatch(fetchContactsPage({ page: listPage + 1 }));
  };

  const sentinelRef = useInfiniteScroll(loadMore, listHasMore, listLoading || listLoadingMore);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((x) => x.name.toLowerCase().includes(q) || x.phone.includes(q));
  }, [contacts, query]);

  const addBtn = (
    <Box
      component="button"
      onClick={() => navigate('/contact/add')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        border: 'none',
        cursor: 'pointer',
        bgcolor: c.red,
        color: '#fff',
        fontWeight: 500,
        fontSize: 13,
        px: 1.5,
        py: 0.875,
        borderRadius: '999px',
        fontFamily: DISPLAY
      }}
    >
      <Plus size={15} /> {t('common.add')}
    </Box>
  );

  return (
    <>
      <AppHeader variant="root" title={t('contacts.title')} right={addBtn} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25 }}>
        <Stack spacing={2}>
          {(contacts.length > 0 || listType) && (
            <TextField
              fullWidth
              placeholder={t('contacts.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color={c.greyLight} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '16px', boxShadow: '0 1px 2px rgba(20,23,26,0.03)' }
              }}
            />
          )}

          {(contacts.length > 0 || listType) && (
            <ContactTypeChips value={listType} withAll scroll onChange={(next) => dispatch(fetchContactsPage({ page: 1, contactType: next }))} />
          )}

          {listLoading ? (
            <AppCard sx={{ overflow: 'hidden' }}>
              {[0, 1, 2, 3].map((i) => (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="55%" height={20} />
                      <Skeleton variant="text" width="35%" height={16} />
                    </Box>
                    <Skeleton variant="text" width={56} height={20} />
                  </Stack>
                </Box>
              ))}
            </AppCard>
          ) : filtered.length === 0 ? (
            <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
              <Box sx={{ mb: 1.75 }}>
                <ContactsEmptyIllustration />
              </Box>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16 }}>
                {query ? t('contacts.noMatches') : t('home.noContactsYet')}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>
                {query ? t('contacts.tryDifferent') : t('contacts.tapAddToCreate')}
              </Typography>
            </AppCard>
          ) : (
            <Fade>
              <AppCard sx={{ overflow: 'hidden' }}>
                {filtered.map((cust, i) => {
                  const get = cust.balance < 0;
                  const av = avatarTint(cust.name);
                  return (
                    <Box key={cust.id}>
                      {i > 0 && <Divider sx={{ borderColor: c.line, ml: '72px' }} />}
                      <ListRow onClick={() => navigate(`/contact/${cust.id}`)}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: cust.imageUrl ? 'transparent' : av.bg,
                            color: av.fg,
                            fontFamily: DISPLAY,
                            fontWeight: 500,
                            fontSize: 14,
                            flexShrink: 0,
                            overflow: 'hidden'
                          }}
                        >
                          {cust.imageUrl ? (
                            <Box component="img" src={cust.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            initials(cust.name)
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <ContactNameLine name={cust.name} linked={cust.linkStatus === 'active'} />
                          <Stack direction="row" alignItems="center" spacing={0.625} sx={{ minWidth: 0, mt: 0.25 }}>
                            <Phone size={12} color={c.greyLight} style={{ flexShrink: 0 }} />
                            <Typography sx={{ color: c.greyLight, fontSize: 12.5, fontWeight: 500 }} noWrap>
                              {formatPhone(cust.phone)}
                              {cust.contactType ? ` · ${t(`contactType.${cust.contactType}`)}` : ''}
                            </Typography>
                          </Stack>
                        </Box>
                        <Stack alignItems="center" spacing={0.375} sx={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                          <Typography sx={{ fontWeight: 500, fontSize: 14.5, color: get ? c.greenDeep : c.redDeep }} noWrap>
                            {fmt(cust.balance)}
                          </Typography>
                          <BalanceTag tone={get ? 'get' : 'give'} sx={{ alignSelf: 'center' }}>
                            {get ? t('home.youllGet') : t('home.youllGive')}
                          </BalanceTag>
                        </Stack>
                        <ChevronRight size={16} color={c.greyIcon} style={{ flexShrink: 0 }} />
                      </ListRow>
                    </Box>
                  );
                })}
              </AppCard>

              {listHasMore && !query && (
                <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
                  {listLoadingMore && <CircularProgress size={22} sx={{ color: c.red }} />}
                </Box>
              )}
            </Fade>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default Contacts;
