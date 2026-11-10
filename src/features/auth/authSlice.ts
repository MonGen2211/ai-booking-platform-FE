import { createAction, createSlice } from '@reduxjs/toolkit';
import type { ApiError, LoadStatus, User } from '../../api/types';
import { authApi } from '../../api/authApi';
import type { Credentials } from '../../api/authApi';
import { clearSession } from '../../api/axiosClient';
import { createAppThunk, privateThunk } from '../../app/async';
import { apiError } from '../../utils/errors';
export const privateReset = createAction('session/privateReset');
export const bootstrap = createAppThunk<User, void>('auth/bootstrap', async (_, { rejectWithValue }) => {
  try { return await authApi.me(); } catch (e) { return rejectWithValue(apiError(e)); }
}, { condition: (_, { getState }) => (getState() as { auth: AuthState }).auth.bootstrapStatus === 'idle' });
export const authenticate = privateThunk('auth/authenticate', (arg: { mode: 'login' | 'register'; data: Credentials }) => authApi.authenticate(arg.mode, arg.data));
export const logout = createAppThunk<void, void>('auth/logout', async (_, { rejectWithValue }) => {
  try { await authApi.logout(); clearSession(); } catch (e) { return rejectWithValue(apiError(e)); }
});
interface AuthState { user: User | null; status: LoadStatus; bootstrapStatus: LoadStatus; error: ApiError | null; dialog: boolean }
const initialState: AuthState = { user: null, status: 'idle', bootstrapStatus: 'idle', error: null, dialog: false };
const slice = createSlice({ name: 'auth', initialState, reducers: {
  openAuth(s) { s.dialog = true; s.error = null; }, closeAuth(s) { s.dialog = false; s.error = null; },
  retryBootstrap(s) { s.bootstrapStatus = 'idle'; s.error = null; },
}, extraReducers: b => {
  b.addCase(privateReset, s => { s.user = null; s.status = 'idle'; });
  b.addCase(bootstrap.pending, s => { s.bootstrapStatus = 'loading'; });
  b.addCase(bootstrap.fulfilled, (s, a) => { s.user = a.payload; s.bootstrapStatus = 'succeeded'; s.error = null; });
  b.addCase(bootstrap.rejected, (s, a) => { s.bootstrapStatus = 'failed'; s.error = a.payload?.status === 401 && a.payload.code !== 'AUTH_REFRESH_RACE' ? null : a.payload || null; });
  b.addCase(authenticate.pending, s => { s.status = 'loading'; s.error = null; });
  b.addCase(authenticate.fulfilled, (s, a) => { s.user = a.payload; s.status = 'succeeded'; s.bootstrapStatus = 'succeeded'; s.dialog = false; });
  b.addCase(authenticate.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || null; });
  b.addCase(logout.pending, s => { s.status = 'loading'; s.error = null; });
  b.addCase(logout.fulfilled, s => { s.status = 'succeeded'; s.user = null; });
  b.addCase(logout.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || null; });
} });
export const { openAuth, closeAuth, retryBootstrap } = slice.actions;
export default slice.reducer;
