// store/slices/sectionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/shared/api/axios';

export const fetchSection = createAsyncThunk(
  'section/fetchSection',
  async ({ section_key, theme_id, content_type }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/section/${section_key}`, {
        params: { theme_id, content_type }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка получения секции');
    }
  }
);


export const fetchPosts = createAsyncThunk(
  'section/fetchPosts',
  async ({ section_key, theme_id, content_type }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/post/posts`, {
        params: { section_key, theme_id, content_type }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка получения постов');
    }
  }
);


export const fetchPostById = createAsyncThunk(
  'section/fetchPostById',
  async ({ section_key, post_id }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/section/${section_key}/post/${post_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка получения поста');
    }
  }
);


const sectionSlice = createSlice({
  name: 'section',
  initialState: {
    data: null,
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSection.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchSection.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = Array.isArray(action.payload) ? action.payload : [];
      });
  }
});

export default sectionSlice.reducer;
