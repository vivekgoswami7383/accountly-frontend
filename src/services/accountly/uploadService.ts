import axios from 'utils/axios';
import { UploadCategory } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const uploadService = {
  async uploadFile(file: File, category: UploadCategory, entityId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (entityId) formData.append('entity_id', entityId);
    const res = await axios.post('/api/upload', formData);
    return unwrap(res) as { key: string; url: string };
  }
};

export default uploadService;
