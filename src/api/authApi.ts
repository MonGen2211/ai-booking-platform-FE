import { request } from './axiosClient';
import type { User } from './types';
export interface Credentials { email: string; password: string }
async function csrf() { return (await request<{ csrfToken: string }>({ url: '/auth/csrf' })).csrfToken; }
export const authApi = {
  me: () => request<User>({ url: '/auth/me' }, true),
  authenticate: async (mode: 'login' | 'register', data: Credentials) => request<User>({ method: 'POST', url: `/auth/${mode}`, data, headers: { 'X-CSRF-Token': await csrf() } }, true),
  logout: async () => request<void>({ method: 'POST', url: '/auth/logout', headers: { 'X-CSRF-Token': await csrf() } }, true),
};
