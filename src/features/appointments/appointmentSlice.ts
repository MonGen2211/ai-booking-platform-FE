import { createSlice } from '@reduxjs/toolkit';
import type { ApiError, Appointment, BookingInput, LoadStatus, Page } from '../../api/types';
import { appointmentApi } from '../../api/appointmentApi';
import { privateThunk } from '../../app/async';
import { privateReset } from '../auth/authSlice';
import { saveBlob } from '../../utils/format';
export const fetchAppointments = privateThunk('appointments/list', (params: { page?: number; status?: string }) => appointmentApi.list(params));
export const fetchAppointment = privateThunk('appointments/detail', (id: string) => appointmentApi.detail(id));
export const createAppointment = privateThunk('appointments/create', (arg: { data: BookingInput; key: string }) => appointmentApi.create(arg.data, arg.key));
export const cancelAppointment = privateThunk('appointments/cancel', (arg: { id: string; expectedVersion: number; reason: string; note: string }) => appointmentApi.cancel(arg.id, { expectedVersion: arg.expectedVersion, reason: arg.reason, note: arg.note }));
export const rescheduleAppointment = privateThunk('appointments/reschedule', (arg: { id: string; expectedVersion: number; newSlotId: string }) => appointmentApi.reschedule(arg.id, { expectedVersion: arg.expectedVersion, newSlotId: arg.newSlotId }));
export const rebookAppointment = privateThunk('appointments/rebook', (id: string) => appointmentApi.rebook(id));
export const getCalendarLink = privateThunk('appointments/calendar', (id: string) => appointmentApi.calendarLink(id));
export const downloadIcs = privateThunk('appointments/ics', async (arg: { id: string; code: string }) => { saveBlob(await appointmentApi.ics(arg.id), `${arg.code}.ics`); });
interface State { list: Page<Appointment> | null; detail: Appointment | null; listStatus: LoadStatus; detailStatus: LoadStatus; listError: ApiError | null; detailError: ApiError | null; listRequest?: string; detailRequest?: string; revision: number; mutations: string[] }
const initialState: State = { list: null, detail: null, listStatus: 'idle', detailStatus: 'idle', listError: null, detailError: null, revision: 0, mutations: [] };
const slice = createSlice({ name: 'appointments', initialState, reducers: { closeAppointment(s) { s.detail = null; s.detailStatus = 'idle'; s.detailError = null; s.detailRequest = undefined; } }, extraReducers: b => {
  b.addCase(privateReset, () => initialState);
  b.addCase(fetchAppointments.pending, (s,a) => { s.listRequest = a.meta.requestId; s.listStatus = 'loading'; s.listError = null; });
  b.addCase(fetchAppointments.fulfilled, (s,a) => { if(s.listRequest === a.meta.requestId) { s.list = a.payload; s.listStatus = 'succeeded'; } });
  b.addCase(fetchAppointments.rejected, (s,a) => { if(s.listRequest === a.meta.requestId) { s.listStatus = 'failed'; s.listError = a.payload || null; } });
  b.addCase(fetchAppointment.pending, (s,a) => { s.detailRequest = a.meta.requestId; s.detail = null; s.detailStatus = 'loading'; s.detailError = null; });
  b.addCase(fetchAppointment.fulfilled, (s,a) => { if(s.detailRequest === a.meta.requestId) { s.detail = a.payload; s.detailStatus = 'succeeded'; } });
  b.addCase(fetchAppointment.rejected, (s,a) => { if(s.detailRequest === a.meta.requestId) { s.detailStatus = 'failed'; s.detailError = a.payload || null; } });
  for(const thunk of [createAppointment, cancelAppointment, rescheduleAppointment]) {
    b.addCase(thunk.pending, (s,a) => { s.mutations.push(a.meta.requestId); });
    b.addCase(thunk.fulfilled, (s,a) => { if(!s.mutations.includes(a.meta.requestId)) return; s.mutations = s.mutations.filter(id => id !== a.meta.requestId); s.revision++; if(s.detail?.id === a.payload.id) s.detail = a.payload; });
    b.addCase(thunk.rejected, (s,a) => { s.mutations = s.mutations.filter(id => id !== a.meta.requestId); });
  }
} });
export const { closeAppointment } = slice.actions;
export default slice.reducer;
