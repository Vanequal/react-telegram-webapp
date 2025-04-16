import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const authWithTelegram = createAsyncThunk(
  'auth/telegram',
  async (initData, { rejectWithValue }) => {
    try {
      await axios.post('/auth/telegram', { initData });
      const response = await axios.get('/me');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Auth error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(authWithTelegram.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authWithTelegram.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(authWithTelegram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;