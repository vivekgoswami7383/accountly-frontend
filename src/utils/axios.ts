import axios from 'axios';

const axiosServices = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'ngrok-skip-browser-warning': 'true' }
});

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
