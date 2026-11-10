import { request } from './axiosClient';
import type { Attachment } from './types';
export const attachmentApi = {
  upload: (file: File) => { const data = new FormData(); data.append('file', file); return request<Attachment>({ method: 'POST', url: '/me/attachments', data }, true); },
  remove: (id: string) => request<void>({ method: 'DELETE', url: `/me/attachments/${encodeURIComponent(id)}` }, true),
  download: (id: string) => request<Blob>({ url: `/me/attachments/${encodeURIComponent(id)}`, responseType: 'blob' }, true),
};
