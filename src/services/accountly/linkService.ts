import axios from 'utils/axios';
import { LinkLookupStatus, LinkRequest, LinkStatus } from './types';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const linkService = {
  async lookup(customerId: string) {
    const res = await axios.get(`/api/link/lookup?customer_id=${customerId}`);
    return unwrap(res) as { status: LinkLookupStatus; link_id?: string };
  },

  async request(customerId: string) {
    const res = await axios.post('/api/link/request', { customer_id: customerId });
    return unwrap(res) as { link: { id: string; status: LinkStatus } };
  },

  async incoming() {
    const res = await axios.get('/api/link/incoming');
    return (unwrap(res)?.requests || []) as LinkRequest[];
  },

  async accept(id: string) {
    const res = await axios.post(`/api/link/${id}/accept`);
    return unwrap(res) as { customer_id: string };
  },

  async decline(id: string) {
    await axios.post(`/api/link/${id}/decline`);
  },

  async block(id: string) {
    await axios.post(`/api/link/${id}/block`);
  },

  async unlink(id: string) {
    await axios.post(`/api/link/${id}/unlink`);
  }
};

export default linkService;
