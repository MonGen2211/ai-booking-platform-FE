import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { Attachment, ApiError } from '../../api/types';
import { attachmentApi } from '../../api/attachmentApi';
import { privateThunk } from '../../app/async';
import { privateReset } from '../auth/authSlice';
import { saveBlob } from '../../utils/format';
export const uploadAttachment = privateThunk('attachments/upload', (file: File) => attachmentApi.upload(file));
export const removeAttachment = privateThunk('attachments/remove', async (id: string) => { await attachmentApi.remove(id); return id; });
export const downloadAttachment = privateThunk('attachments/download', async (file: Attachment) => { saveBlob(await attachmentApi.download(file.id), file.originalName); });
interface State { items: Attachment[]; pending: number; error: ApiError | null; requests: string[] }
const initialState: State = { items: [], pending: 0, error: null, requests: [] };
const slice = createSlice({ name: 'attachments', initialState, reducers: { clearAttachments: () => initialState }, extraReducers: b => {
  b.addCase(privateReset, () => initialState);
  b.addCase(uploadAttachment.fulfilled, (s,a) => { if(s.requests.includes(a.meta.requestId)) s.items.push(a.payload); });
  b.addCase(removeAttachment.fulfilled, (s,a) => { if(s.requests.includes(a.meta.requestId)) s.items = s.items.filter(f => f.id !== a.payload); });
  b.addMatcher(isAnyOf(uploadAttachment.pending,removeAttachment.pending,downloadAttachment.pending), (s,a) => { s.pending++; s.error = null; s.requests.push(a.meta.requestId); });
  b.addMatcher(isAnyOf(uploadAttachment.fulfilled,removeAttachment.fulfilled,downloadAttachment.fulfilled,uploadAttachment.rejected,removeAttachment.rejected,downloadAttachment.rejected), (s,a) => { if(!s.requests.includes(a.meta.requestId)) return; s.pending--; s.requests = s.requests.filter(id => id !== a.meta.requestId); if(isAnyOf(uploadAttachment.rejected,removeAttachment.rejected,downloadAttachment.rejected)(a)) s.error = a.payload || null; });
} });
export const { clearAttachments } = slice.actions;
export default slice.reducer;
