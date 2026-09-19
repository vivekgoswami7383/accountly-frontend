import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Divider, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { Search, Plus, FileText } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { fetchNotes } from 'store/reducers/accountly/notes';
import { formatDate } from 'utils/accountly/format';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import AppHeader from 'components/accountly/AppHeader';
import { AppCard, Fade, IconDot, ListRow } from 'components/accountly/kit';
import { NotesEmptyIllustration } from 'components/accountly/EmptyIllustration';

const notePreview = (content: string, title: string) => {
  const rest = content.startsWith(title) ? content.slice(title.length) : content;
  return rest.replace(/\s+/g, ' ').trim();
};

const Notes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const c = useAccountlyColors();
  const t = useT();
  const { notes, page, hasMore, loading, loadingMore } = useSelector((s) => s.notes);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (page === 0) dispatch(fetchNotes({ page: 1 }));
  }, [dispatch, page]);

  const loadMore = () => {
    if (hasMore && !loadingMore) dispatch(fetchNotes({ page: page + 1 }));
  };

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading || loadingMore);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }, [notes, query]);

  const addBtn = (
    <Box
      component="button"
      onClick={() => navigate('/note/new')}
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
      <AppHeader variant="screen" title={t('notes.title')} right={addBtn} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 2.25, pb: 3 }}>
        <Stack spacing={2}>
          {notes.length > 0 && (
            <TextField
              fullWidth
              placeholder={t('notes.searchNotes')}
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

          {loading ? (
            <AppCard sx={{ overflow: 'hidden' }}>
              {[0, 1, 2, 3].map((i) => (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ borderColor: c.line, ml: '68px' }} />}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="55%" height={20} />
                      <Skeleton variant="text" width="70%" height={16} />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </AppCard>
          ) : filtered.length === 0 ? (
            <AppCard sx={{ px: 3, py: 5, textAlign: 'center' }}>
              <Box sx={{ mb: 1.75 }}>
                <NotesEmptyIllustration />
              </Box>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 16 }}>
                {query ? t('contacts.noMatches') : t('notes.noNotesYet')}
              </Typography>
              <Typography sx={{ color: c.grey, fontSize: 13, mt: 0.5 }}>
                {query ? t('contacts.tryDifferent') : t('notes.noNotesSub')}
              </Typography>
            </AppCard>
          ) : (
            <Fade>
              <AppCard sx={{ overflow: 'hidden' }}>
                {filtered.map((n, i) => {
                  const preview = notePreview(n.content, n.title);
                  return (
                    <Box key={n.id}>
                      {i > 0 && <Divider sx={{ borderColor: c.line, ml: '68px' }} />}
                      <ListRow onClick={() => navigate(`/note/${n.id}`)}>
                        <IconDot size={40} bg={c.chipGrey} fg={c.slate}>
                          <FileText />
                        </IconDot>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: 14.5, color: c.ink }} noWrap>
                            {n.title}
                          </Typography>
                          <Typography sx={{ color: c.grey, fontSize: 12.5, mt: 0.25 }} noWrap>
                            {preview || formatDate(n.updatedAt)}
                          </Typography>
                        </Box>
                        <Typography sx={{ color: c.greyLight, fontSize: 11.5, fontWeight: 500, flexShrink: 0, alignSelf: 'flex-start', mt: 0.375 }}>
                          {formatDate(n.updatedAt)}
                        </Typography>
                      </ListRow>
                    </Box>
                  );
                })}
              </AppCard>

              {hasMore && !query && (
                <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
                  {loadingMore && <CircularProgress size={22} sx={{ color: c.red }} />}
                </Box>
              )}
            </Fade>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default Notes;
