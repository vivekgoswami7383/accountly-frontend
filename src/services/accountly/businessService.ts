import axios from 'utils/axios';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export interface CreateBusinessRequest {
  business_name: string;
  user: { name: string; phone: string; password: string };
}

export const businessService = {
  async createBusiness(data: CreateBusinessRequest) {
    const res = await axios.post('/api/business', data);
    return unwrap(res);
  },

  async updateBusiness(id: string, data: { business_name?: string; business_type?: string; address?: string }) {
    const res = await axios.put(`/api/business/${id}`, data);
    return unwrap(res);
  }
};

export default businessService;
