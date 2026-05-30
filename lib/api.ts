import axios from 'axios';

export const BASE_URL = 'https://elib.tgphanoi.org/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== 'undefined' && (error.response?.status === 401 || error.response?.status === 403)) {
      document.cookie = 'user_token=; path=/; max-age=0';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
