import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import qs from 'qs';

export const authWithTelegram = createAsyncThunk(
  'auth/telegram',
  async (initData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/api/v1/auth/telegram',
        qs.stringify({ init_data: initData }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Telegram-InitData': initData
          }
        }
      );

      return response.data; 
    } catch (err) {
      console.error('Auth error:', err);
      return rejectWithValue(err.response?.data?.detail || 'Auth error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(authWithTelegram.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authWithTelegram.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(authWithTelegram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;
