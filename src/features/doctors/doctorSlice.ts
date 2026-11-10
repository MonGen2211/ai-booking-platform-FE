import { createSlice } from '@reduxjs/toolkit';
import type { ApiError, Availability, Doctor, LoadStatus, Page } from '../../api/types';
import { doctorApi } from '../../api/doctorApi';
import { createAppThunk } from '../../app/async';
import { apiError } from '../../utils/errors';
export const fetchDoctors = createAppThunk('doctors/list', async (arg: { page?: number; search?: string }, { rejectWithValue }) => { try { return await doctorApi.list({ ...arg, pageSize: 6 }); } catch (e) { return rejectWithValue(apiError(e)); } });
export const fetchDoctorOptions = createAppThunk('doctors/options', async (page: number, { rejectWithValue }) => {
  try { return await doctorApi.list({ page, pageSize: 5 }); }
  catch (error) { return rejectWithValue(apiError(error)); }
}, { condition: (page, { getState }) => {
  const options = (getState() as { doctors: State }).doctors.options;
  return options.status !== 'loading' && page === options.page + 1 && (page === 1 || page <= options.totalPages);
} });
export const fetchDoctor = createAppThunk('doctors/detail', async (id: string, { rejectWithValue }) => { try { return await doctorApi.detail(id); } catch (e) { return rejectWithValue(apiError(e)); } });
export const fetchAvailability = createAppThunk('doctors/availability', async (arg: { id: string; from: string; to: string }, { rejectWithValue }) => { try { return await doctorApi.availability(arg.id, arg.from, arg.to); } catch (e) { return rejectWithValue(apiError(e)); } });
interface State { list: Page<Doctor> | null; detail: Doctor | null; availability: Availability | null; listStatus: LoadStatus; detailStatus: LoadStatus; slotStatus: LoadStatus; listError: ApiError | null; detailError: ApiError | null; slotError: ApiError | null; listRequest?: string; detailRequest?: string; slotRequest?: string; options: { items: Doctor[]; page: number; total: number; totalPages: number; status: LoadStatus; error: ApiError | null; request?: string } }
const initialState: State = { list: null, detail: null, availability: null, listStatus: 'idle', detailStatus: 'idle', slotStatus: 'idle', listError: null, detailError: null, slotError: null, options: { items: [], page: 0, total: 0, totalPages: 0, status: 'idle', error: null } };
const slice = createSlice({ name: 'doctors', initialState, reducers: { clearAvailability(s) { s.availability = null; s.slotRequest = undefined; s.slotStatus = 'idle'; s.slotError = null; } }, extraReducers: b => {
  b.addCase(fetchDoctorOptions.pending, (s,a) => { s.options.status = 'loading'; s.options.error = null; s.options.request = a.meta.requestId; });
  b.addCase(fetchDoctorOptions.fulfilled, (s,a) => {
    if (s.options.request !== a.meta.requestId) return;
    const merged = new Map(s.options.items.map(item => [item.id, item]));
    a.payload.items.forEach(item => merged.set(item.id, item));
    s.options.items = [...merged.values()];
    s.options.page = a.payload.page;
    s.options.total = a.payload.total;
    // Empty responses terminate loading even if stale server totals claim more pages.
    s.options.totalPages = a.payload.items.length ? a.payload.totalPages : a.payload.page;
    s.options.status = 'succeeded';
  });
  b.addCase(fetchDoctorOptions.rejected, (s,a) => { if (s.options.request === a.meta.requestId) { s.options.status = 'failed'; s.options.error = a.payload || null; } });
  b.addCase(fetchDoctors.pending, (s,a) => { s.listRequest = a.meta.requestId; s.listStatus = 'loading'; s.listError = null; });
  b.addCase(fetchDoctors.fulfilled, (s,a) => { if(s.listRequest === a.meta.requestId) { s.list = a.payload; s.listStatus = 'succeeded'; } });
  b.addCase(fetchDoctors.rejected, (s,a) => { if(s.listRequest === a.meta.requestId) { s.listStatus = 'failed'; s.listError = a.payload || null; } });
  b.addCase(fetchDoctor.pending, (s,a) => { s.detailRequest = a.meta.requestId; s.detail = null; s.detailStatus = 'loading'; s.detailError = null; });
  b.addCase(fetchDoctor.fulfilled, (s,a) => { if(s.detailRequest === a.meta.requestId) { s.detail = a.payload; s.detailStatus = 'succeeded'; } });
  b.addCase(fetchDoctor.rejected, (s,a) => { if(s.detailRequest === a.meta.requestId) { s.detailStatus = 'failed'; s.detailError = a.payload || null; } });
  b.addCase(fetchAvailability.pending, (s,a) => { s.slotRequest = a.meta.requestId; s.availability = null; s.slotStatus = 'loading'; s.slotError = null; });
  b.addCase(fetchAvailability.fulfilled, (s,a) => { if(s.slotRequest === a.meta.requestId) { s.availability = a.payload; s.slotStatus = 'succeeded'; } });
  b.addCase(fetchAvailability.rejected, (s,a) => { if(s.slotRequest === a.meta.requestId) { s.slotStatus = 'failed'; s.slotError = a.payload || null; } });
} });
export const { clearAvailability } = slice.actions;
export default slice.reducer;
