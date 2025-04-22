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

      const { user, token } = response.data;

      // сохраняем токен на фронте
      sessionStorage.setItem('token', token);

      return { user };
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
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      sessionStorage.removeItem('token');
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
        state.loading = false;
      })
      .addCase(authWithTelegram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export const selectUser = (state) => state.auth.user;

export default authSlice.reducer;
