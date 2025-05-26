import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const authWithTelegram = createAsyncThunk(
  'auth/telegram',
  async (initData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/api/v1/auth/telegram',
        { init_data: initData },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const token = response.headers['new-access-token'];
      const userData = response.data;

      if (!token) throw new Error('Токен не найден в заголовках');

      sessionStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { user: userData, token };
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
    token: null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      sessionStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
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
      })
      .addCase(authWithTelegram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
