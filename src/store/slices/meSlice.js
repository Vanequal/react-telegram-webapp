import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const fetchCurrentUser = createAsyncThunk(
  'me/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/user/me');
      return response.data;
    } catch (err) {
      console.error('Fetch current user error:', err);
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch user');
    }
  }
);

const meSlice = createSlice({
  name: 'me',
  initialState: {
    currentUser: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default meSlice.reducer;
