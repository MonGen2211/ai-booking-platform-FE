import { request } from './axiosClient';
import type { Availability, Doctor, Page } from './types';
export const doctorApi = {
  list: (params: { page?: number; pageSize?: number; search?: string }) => request<Page<Doctor>>({ url: '/doctors', params }),
  detail: (id: string) => request<Doctor>({ url: `/doctors/${encodeURIComponent(id)}` }),
  availability: (id: string, from: string, to: string) => request<Availability>({ url: `/doctors/${encodeURIComponent(id)}/availability`, params: { from, to } }),
};
