import axios from 'utils/axios';
import { CreateNoteRequest, NoteFilter } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const noteService = {
  async createNote(data: CreateNoteRequest) {
    const res = await axios.post('/api/note', data);
    return unwrap(res);
  },

  async getNotes(filter?: NoteFilter, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (filter) query.set('filter', JSON.stringify(filter));
    if (params) {
      query.set('page', String(params.page ?? 1));
      query.set('limit', String(params.limit ?? 20));
    }
    const qs = query.toString();
    const res = await axios.get(`/api/note${qs ? `?${qs}` : ''}`);
    return unwrap(res);
  },

  async getNoteById(id: string) {
    const res = await axios.get(`/api/note/${id}`);
    return unwrap(res).note;
  },

  async updateNote(id: string, data: Partial<CreateNoteRequest>) {
    const res = await axios.put(`/api/note/${id}`, data);
    return unwrap(res);
  },

  async deleteNote(id: string) {
    const res = await axios.delete(`/api/note/${id}`);
    return unwrap(res);
  }
};

export default noteService;
