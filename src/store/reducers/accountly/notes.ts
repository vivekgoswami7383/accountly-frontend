import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import noteService from 'services/accountly/noteService';
import { CreateNoteRequest, Note, NoteFilter } from 'services/accountly/types';

interface NoteState {
  notes: Note[];
  hasLoadedGlobal: boolean;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
  loading: boolean;
  error: string | null;
  selectedNote: Note | null;
}

const initialState: NoteState = {
  notes: [],
  hasLoadedGlobal: false,
  page: 0,
  hasMore: true,
  loadingMore: false,
  loading: false,
  error: null,
  selectedNote: null
};

export const NOTES_PAGE_SIZE = 20;

const mapNote = (n: any): Note => ({
  id: n._id,
  title: n.title || '',
  content: n.content || '',
  createdAt: n.created_at || n.createdAt,
  updatedAt: n.updated_at || n.updatedAt
});

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (data: CreateNoteRequest, { rejectWithValue }) => {
    try {
      const res = await noteService.createNote(data);
      return res.note;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create note');
    }
  }
);

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (params: { filter?: NoteFilter; page: number; append?: boolean }, { rejectWithValue }) => {
    try {
      const filter: NoteFilter = { search: params.filter?.search || [], sort: { updated_at: -1 } };
      const data = await noteService.getNotes(filter, { page: params.page, limit: NOTES_PAGE_SIZE });
      return {
        page: params.page,
        append: Boolean(params.append),
        items: Array.isArray(data?.notes) ? data.notes : [],
        hasMore: Boolean(data?.has_more)
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch notes');
    }
  }
);

export const fetchNoteById = createAsyncThunk('notes/fetchNoteById', async (id: string, { rejectWithValue }) => {
  try {
    return await noteService.getNoteById(id);
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to fetch note');
  }
});

export const updateNoteById = createAsyncThunk(
  'notes/updateNoteById',
  async (params: { id: string; data: Partial<CreateNoteRequest> }, { rejectWithValue }) => {
    try {
      const res = await noteService.updateNote(params.id, params.data);
      return res.note;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update note');
    }
  }
);

export const deleteNoteById = createAsyncThunk(
  'notes/deleteNoteById',
  async (params: { id: string }, { rejectWithValue }) => {
    try {
      await noteService.deleteNote(params.id);
      return { noteId: params.id };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to delete note');
    }
  }
);

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setSelectedNote: (state, action: PayloadAction<Note | null>) => {
      state.selectedNote = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.loading = false;
        const mapped = mapNote(action.payload);
        state.notes.unshift(mapped);
        state.selectedNote = mapped;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNotes.pending, (state, action) => {
        if (action.meta.arg.append) state.loadingMore = true;
        else state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        const { page, append, items, hasMore } = action.payload;
        state.loading = false;
        state.loadingMore = false;
        state.hasLoadedGlobal = true;
        state.page = page;
        state.hasMore = hasMore;
        const mapped = items.map(mapNote);
        state.notes = append ? [...state.notes, ...mapped] : mapped;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNoteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedNote = mapNote(action.payload);
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateNoteById.fulfilled, (state, action) => {
        const mapped = mapNote(action.payload);
        const index = state.notes.findIndex((n) => n.id === mapped.id);
        if (index !== -1) state.notes[index] = mapped;
        state.selectedNote = mapped;
      })
      .addCase(updateNoteById.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteNoteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNoteById.fulfilled, (state, action) => {
        state.loading = false;
        const { noteId } = action.payload;
        state.notes = state.notes.filter((n) => n.id !== noteId);
        if (state.selectedNote?.id === noteId) state.selectedNote = null;
      })
      .addCase(deleteNoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setSelectedNote, setError } = noteSlice.actions;
export default noteSlice.reducer;
