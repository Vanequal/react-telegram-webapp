// store/slices/postSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section, publishing_method }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/v1/post/create?section_key=${section}`, {
        message_text,
        publishing_method,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка создания поста');
    }
  }
);

export const createPostPreview = createAsyncThunk(
  'post/createPreview',
  async ({ section_key, theme_id, message_text }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/v1/post/create_preview?section_key=${section_key}&theme_id=${theme_id}`, {
        message_text
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка предпросмотра поста');
    }
  }
);


const postSlice = createSlice({
  name: 'post',
  initialState: {
    loading: false,
    error: null,
    preview: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(createPostPreview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPostPreview.fulfilled, (state, action) => {
        state.loading = false;
        state.preview = action.payload;
      })
      .addCase(createPostPreview.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export default postSlice.reducer;
