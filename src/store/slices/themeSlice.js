import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../shared/api/axios';

export const fetchTheme = createAsyncThunk(
  'theme/fetchTheme',
  async (theme_id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/v1/themes/${theme_id}`);
      return response.data;
    } catch (err) {
      console.error('Theme fetch error:', err);
      return rejectWithValue(err.response?.data?.detail || 'Fetch theme error');
    }
  }
);

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTheme.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.theme = action.payload;
      })
      .addCase(fetchTheme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default themeSlice.reducer;
