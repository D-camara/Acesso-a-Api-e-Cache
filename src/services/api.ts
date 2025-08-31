/**
 * COPILOT:
 * Gere um módulo TypeScript que exporta uma instância axios chamada `api`.
 * Requisitos:
 * - baseURL lido de process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com'
 * - timeout de 10000ms
 * - export default api
 * - defina tipos básicos de resposta quando aplicável
 * - inclua um interceptor simples para transformar erros em Error com message legível
 */

import axios, { AxiosError, AxiosInstance } from 'axios';

const baseURL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'Erro de requisição';
    return Promise.reject(new Error(message));
  }
);

export default api;
