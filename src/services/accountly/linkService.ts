import axios from 'utils/axios';
import { BlockedLink, LinkImportStatus, LinkLookupStatus, LinkRequest, LinkStatus } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const linkService = {
  async lookup(contactId: string) {
    const res = await axios.get(`/api/link/lookup?contact_id=${contactId}`);
    return unwrap(res) as { status: LinkLookupStatus; link_id?: string };
  },

  async request(contactId: string) {
    const res = await axios.post('/api/link/request', { contact_id: contactId });
    return unwrap(res) as { link: { id: string; status: LinkStatus } };
  },

  async incoming() {
    const res = await axios.get('/api/link/incoming');
    return (unwrap(res)?.requests || []) as LinkRequest[];
  },

  async accept(id: string) {
    const res = await axios.post(`/api/link/${id}/accept`);
    return unwrap(res) as { contact_id: string; import_started: boolean };
  },

  async decline(id: string) {
    await axios.post(`/api/link/${id}/decline`);
  },

  async block(id: string) {
    await axios.post(`/api/link/${id}/block`);
  },

  async blocked() {
    const res = await axios.get('/api/link/blocked');
    return (unwrap(res)?.blocked || []) as BlockedLink[];
  },

  async unblock(id: string) {
    await axios.post(`/api/link/${id}/unblock`);
  },

  async importStatus(id: string) {
    const res = await axios.get(`/api/link/${id}/import-status`);
    return unwrap(res) as LinkImportStatus;
  },

  async retryImport(id: string) {
    await axios.post(`/api/link/${id}/import-history`);
  },

  async unlink(id: string) {
    await axios.post(`/api/link/${id}/unlink`);
  }
};

export default linkService;
