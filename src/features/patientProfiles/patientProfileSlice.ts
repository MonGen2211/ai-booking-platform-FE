import { createSlice } from '@reduxjs/toolkit';
import type { ApiError, LoadStatus, Profile, ProfileInput } from '../../api/types';
import { patientProfileApi } from '../../api/patientProfileApi';
import { privateThunk } from '../../app/async';
import { privateReset } from '../auth/authSlice';
export const fetchProfiles = privateThunk<{ items: Profile[] }, void>('profiles/list', () => patientProfileApi.list());
export const saveProfile = privateThunk('profiles/save', (arg: { data: ProfileInput; id?: string }) => patientProfileApi.save(arg.data, arg.id));
interface State { items: Profile[]; status: LoadStatus; saving: boolean; error: ApiError | null; request?: string; saveRequest?: string }
const initialState: State = { items: [], status: 'idle', saving: false, error: null };
const slice = createSlice({ name: 'profiles', initialState, reducers: {}, extraReducers: b => {
  b.addCase(privateReset, () => initialState);
  b.addCase(fetchProfiles.pending, (s,a) => { s.status = 'loading'; s.error = null; s.request = a.meta.requestId; });
  b.addCase(fetchProfiles.fulfilled, (s,a) => { if(s.request === a.meta.requestId) { s.items = a.payload.items; s.status = 'succeeded'; } });
  b.addCase(fetchProfiles.rejected, (s,a) => { if(s.request === a.meta.requestId) { s.error = a.payload || null; s.status = 'failed'; } });
  b.addCase(saveProfile.pending, (s,a) => { s.saving = true; s.error = null; s.saveRequest = a.meta.requestId; });
  b.addCase(saveProfile.fulfilled, (s,a) => { if(s.saveRequest === a.meta.requestId) { s.saving = false; const i = s.items.findIndex(p => p.id === a.payload.id); if(i < 0) s.items.push(a.payload); else s.items[i] = a.payload; } });
  b.addCase(saveProfile.rejected, (s,a) => { if(s.saveRequest === a.meta.requestId) { s.saving = false; s.error = a.payload || null; } });
} });
export default slice.reducer;
