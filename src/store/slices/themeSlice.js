import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const fetchTheme = createAsyncThunk('theme/fetchTheme', async (theme_id = 1) => {
  const response = await axios.get(`/api/v1/theme/${theme_id}`);
  return response.data;
});



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
