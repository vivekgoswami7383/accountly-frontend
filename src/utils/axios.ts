import axios from 'axios';

const { REACT_APP_API_URL, REACT_APP_API_PORT } = process.env;

const resolveBaseURL = () => {
  if (REACT_APP_API_URL) return REACT_APP_API_URL;
  if (typeof window !== 'undefined' && window.location && REACT_APP_API_PORT) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${REACT_APP_API_PORT}`;
  }
  return '';
};

const axiosServices = axios.create({ baseURL: resolveBaseURL() });

axiosServices.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('serviceToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/login';
    }
    return Promise.reject(
      (error && error.response && error.response.data) || (error && error.message) || 'Network error - could not reach the server'
    );
  }
);

export default axiosServices;
