import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import qs from 'qs';

export const authWithTelegram = createAsyncThunk(
  'auth/telegram',
  async (initData, { rejectWithValue }) => {
    try {
      const formData = qs.stringify({ init_data: initData });

      const response = await axios.post('/auth/telegram', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

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
        state.user = action.payload; // здесь будет то, что пришло с бэка
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
