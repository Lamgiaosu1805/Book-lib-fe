import axios from 'axios';

const api = axios.create({
  baseURL: 'https://elib.tgphanoi.org/api',
});

export default api;
