import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Trash2, TriangleAlert } from 'lucide-react';
import { useDispatch, useSelector } from 'store';
import { createNote, fetchNoteById, updateNoteById, deleteNoteById, setSelectedNote } from 'store/reducers/accountly/notes';
import useSnackbar from 'hooks/useSnackbar';
import { DISPLAY, useAccountlyColors } from 'themes/accountly';
import { useT } from 'i18n/accountly';
import AppHeader from 'components/accountly/AppHeader';

const AUTOSAVE_DELAY = 800;

const splitContent = (raw: string) => {
  const idx = raw.indexOf('\n');
  return idx === -1 ? { title: raw, body: '' } : { title: raw.slice(0, idx), body: raw.slice(idx + 1) };
};

const NoteEditor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isNew = !id;
  const c = useAccountlyColors();
  const t = useT();
  const { showSnackbar } = useSnackbar();

  const { selectedNote } = useSelector((s) => s.notes);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [noteId, setNoteId] = useState<string | null>(isNew ? null : id || null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const content = title + (body ? `\n${body}` : '');

  const titleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement | null>(null);
  const loadedRef = useRef(isNew);
  const noteIdRef = useRef(noteId);
  const contentRef = useRef(content);
  const lastSavedRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const pendingRef = useRef(false);

  noteIdRef.current = noteId;
  contentRef.current = content;

  useEffect(() => {
    if (!isNew && id) dispatch(fetchNoteById(id));
    return () => {
      dispatch(setSelectedNote(null));
    };
  }, [dispatch, id, isNew]);

  useEffect(() => {
    if (!isNew && selectedNote && selectedNote.id === id && !loadedRef.current) {
      const split = splitContent(selectedNote.content);
      setTitle(split.title);
      setBody(split.body);
      lastSavedRef.current = selectedNote.content;
      loadedRef.current = true;
    }
  }, [selectedNote, id, isNew]);

  const flush = async (text: string): Promise<void> => {
    if (!text.trim()) return;
    if (savingRef.current) {
      pendingRef.current = true;
      return;
    }
    savingRef.current = true;
    setSaveStatus('saving');
    try {
      if (!noteIdRef.current) {
        const result = await dispatch(createNote({ content: text }));
        if (createNote.fulfilled.match(result)) {
          const newId = (result.payload as any)._id;
          noteIdRef.current = newId;
          setNoteId(newId);
          lastSavedRef.current = text;
          setSaveStatus('saved');
          navigate(`/note/${newId}`, { replace: true });
        } else {
          setSaveStatus('idle');
          showSnackbar({ message: t('note.failedSave'), type: 'error' });
        }
      } else {
        const result = await dispatch(updateNoteById({ id: noteIdRef.current, data: { content: text } }));
        if (updateNoteById.fulfilled.match(result)) {
          lastSavedRef.current = text;
          setSaveStatus('saved');
        } else {
          setSaveStatus('idle');
          showSnackbar({ message: t('note.failedSave'), type: 'error' });
        }
      }
    } finally {
      savingRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        await flush(contentRef.current);
      }
    }
  };

  useEffect(() => {
    if (!loadedRef.current) return undefined;
    if (content === lastSavedRef.current) return undefined;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      flush(content);
    }, AUTOSAVE_DELAY);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleBack = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (content.trim() && content !== lastSavedRef.current) {
      await flush(content);
    }
    navigate(-1);
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    if (!noteId) return;
    const result = await dispatch(deleteNoteById({ id: noteId }));
    if (deleteNoteById.fulfilled.match(result)) navigate(-1);
    else showSnackbar({ message: (result.payload as string) || t('note.failedDelete'), type: 'error' });
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      bodyInputRef.current?.focus();
      bodyInputRef.current?.setSelectionRange(0, 0);
    }
  };

  const handleBodyKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = e.target as HTMLTextAreaElement;
    if ((e.key === 'Backspace' || e.keyCode === 8) && el.selectionStart === 0 && el.selectionEnd === 0) {
      e.preventDefault();
      titleInputRef.current?.focus();
      const len = title.length;
      titleInputRef.current?.setSelectionRange(len, len);
    }
  };

  const headerRight = (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      {saveStatus !== 'idle' && (
        <Typography sx={{ color: c.greyLight, fontSize: 12, fontWeight: 500 }} noWrap>
          {saveStatus === 'saving' ? t('note.saving') : t('note.saved')}
        </Typography>
      )}
      {noteId && (
        <IconButton onClick={() => setConfirmDelete(true)} sx={{ color: c.red }}>
          <Trash2 size={19} />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <>
      <AppHeader variant="screen" onBack={handleBack} right={headerRight} />
      <Container maxWidth="sm" sx={{ px: 2.25, pt: 1.5, pb: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        <TextField
          autoFocus={isNew}
          fullWidth
          multiline
          variant="standard"
          placeholder={t('note.placeholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          inputRef={titleInputRef}
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: 21, lineHeight: 1.35, fontWeight: 700, color: c.ink, fontFamily: DISPLAY }
          }}
        />
        <TextField
          fullWidth
          multiline
          variant="standard"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleBodyKeyDown}
          inputRef={bodyInputRef}
          InputProps={{ disableUnderline: true, sx: { fontSize: 15.5, lineHeight: 1.6, color: c.ink, fontFamily: DISPLAY, mt: 1 } }}
          minRows={10}
        />
      </Container>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: DISPLAY, pt: 2.25, pb: 0.75, fontSize: '1.05rem' }}>
          <TriangleAlert size={18} color={c.red} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
          {t('note.deleteNoteQ')}
        </DialogTitle>
        <DialogContent sx={{ pt: '0 !important', pb: 1 }}>
          <DialogContentText sx={{ color: c.grey, fontSize: 13.5, lineHeight: 1.45 }}>{t('note.deleteNoteBody')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
          <Button onClick={() => setConfirmDelete(false)} variant="outlined">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDelete} variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NoteEditor;
