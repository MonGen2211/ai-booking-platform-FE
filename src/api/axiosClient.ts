import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { API_URL } from '../constants';
import { apiError } from '../utils/errors';

export const axiosClient = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 20000 });
let token: string | undefined;
let generation = 0;
let queue: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();
export const sessionGeneration = () => generation;
export function clearSession() { token = undefined; generation++; listeners.forEach(fn => fn()); }
export function onSessionCleared(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

// Read the generation before sending, so a late response cannot restore a logged-out session.
export async function request<T>(config: AxiosRequestConfig, privateRequest = false): Promise<T> {
  const current = generation;
  const execute = async () => {
    if (privateRequest && current !== generation) throw { code: 'STALE_SESSION', message: 'Phiên đã thay đổi.' };
    try {
      const response = await axiosClient.request<T>({ ...config, headers: { ...config.headers, ...(privateRequest && token ? { Authorization: `Bearer ${token}` } : {}) } });
      if (privateRequest && current !== generation) throw { code: 'STALE_SESSION', message: 'Phiên đã thay đổi.' };
      const next = response.headers['x-access-token'];
      if (current === generation && typeof next === 'string') token = next;
      return response.data;
    } catch (error) {
      const normalized = apiError(error);
      if (privateRequest && normalized.status === 401 && normalized.code !== 'AUTH_REFRESH_RACE' && current === generation) clearSession();
      throw normalized;
    }
  };
  if (!privateRequest) return execute();
  const result = queue.then(execute, execute);
  queue = result.catch(() => undefined);
  return result;
}
