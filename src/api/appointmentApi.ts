import { request } from './axiosClient';
import type { Appointment, BookingInput, Page, Rebook } from './types';
const path = (id: string) => `/me/appointments/${encodeURIComponent(id)}`;
export const appointmentApi = {
  create: (data: BookingInput, key: string) => request<Appointment>({ method: 'POST', url: '/appointments', data, headers: { 'Idempotency-Key': key } }, true),
  list: (params: { page?: number; status?: string }) => request<Page<Appointment>>({ url: '/me/appointments', params: { ...params, pageSize: 6 } }, true),
  detail: (id: string) => request<Appointment>({ url: path(id) }, true),
  rebook: (id: string) => request<Rebook>({ url: `${path(id)}/rebook` }, true),
  cancel: (id: string, data: { expectedVersion: number; reason: string; note: string }) => request<Appointment>({ method: 'POST', url: `${path(id)}/cancel`, data }, true),
  reschedule: (id: string, data: { expectedVersion: number; newSlotId: string }) => request<Appointment>({ method: 'POST', url: `${path(id)}/reschedule`, data }, true),
  calendarLink: (id: string) => request<{ url: string }>({ url: `${path(id)}/calendar-link` }, true),
  ics: (id: string) => request<Blob>({ url: `${path(id)}/calendar.ics`, responseType: 'blob' }, true),
};
