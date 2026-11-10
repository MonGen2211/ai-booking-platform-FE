import { createAsyncThunk } from '@reduxjs/toolkit';
import { sessionGeneration } from '../api/axiosClient';
import { apiError } from '../utils/errors';
import type { ApiError } from '../api/types';
// Check both before and after HTTP: queued or late work from an old account is discarded.
export const createAppThunk = createAsyncThunk.withTypes<{ rejectValue: ApiError }>();
export function privateThunk<Returned, Arg>(name: string, work: (arg: Arg) => Promise<Returned>) {
  return createAppThunk<Returned, Arg>(name, async (arg, { rejectWithValue }) => {
    const current = sessionGeneration();
    try { const result = await work(arg); if (current !== sessionGeneration()) throw { code: 'STALE_SESSION', message: 'Phiên đã thay đổi.' }; return result; }
    catch (error) { return rejectWithValue(apiError(error)); }
  });
}
