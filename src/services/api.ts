import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config';

// Instância central de HTTP
const baseURL = API_BASE_URL;

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const apiMessage = (error.response?.data as any)?.message;
    const message = apiMessage || error.message || 'Erro de requisição';
    const final = status ? `${message} (HTTP ${status})` : message;
    return Promise.reject(new Error(final));
  },
);

export default api;
