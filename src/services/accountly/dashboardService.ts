import axios from 'utils/axios';
import { DashboardStatisticsResponse } from './types';
import { todayStr } from 'utils/accountly/due';

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const dashboardService = {
  async getDashboardStatistics(): Promise<DashboardStatisticsResponse> {
    const res = await axios.get(`/api/dashboard/statistics?today=${todayStr()}`);
    return unwrap(res);
  }
};

export default dashboardService;
