import { request } from './axiosClient';
import type { Profile, ProfileInput } from './types';
export const patientProfileApi = {
  list: () => request<{ items: Profile[] }>({ url: '/me/patient-profiles' }, true),
  save: (data: ProfileInput, id?: string) => request<Profile>({ method: id ? 'PATCH' : 'POST', url: `/me/patient-profiles${id ? `/${encodeURIComponent(id)}` : ''}`, data }, true),
};
