import axios from 'axios';

export const BASE_URL = 'https://elib.tgphanoi.org/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== 'undefined' && (error.response?.status === 401 || error.response?.status === 403)) {
      const requestUrl = String(error.config?.url || '');
      const authRequestPaths = ['/admin/login', '/user/login', '/user/register'];
      const isAuthRequest = authRequestPaths.some((path) => requestUrl.includes(path));

      if (!isAuthRequest) {
        if (window.location.pathname.startsWith('/admin')) {
          document.cookie = 'token=; path=/; max-age=0';
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        } else {
          document.cookie = 'user_token=; path=/; max-age=0';
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
