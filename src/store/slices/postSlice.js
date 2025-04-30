// store/slices/postSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section_key, theme_id, publishing_method }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/v1/post/create?section_key=${section_key}&theme_id=${theme_id}`, {
        message_text,
        publishing_method,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка создания поста');
    }
  }
);

export const fetchPostComments = createAsyncThunk(
  'post/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/post/comments?post_id=${postId}`);
      return { postId, comments: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев');
    }
  }
);

export const createComment = createAsyncThunk(
  'post/createComment',
  async ({ post_id, message_text, parent_id = null }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/v1/post/comment/create', {
        post_id,
        message_text,
        parent_id,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка добавления комментария');
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

export const reactToPost = createAsyncThunk(
  'post/reactToPost',
  async ({ post_id, reaction }, { rejectWithValue }) => {
    try {
      await axios.post(`/api/v1/post/react`, {
        post_id,
        reaction,
      });
      return { post_id, reaction };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка при отправке реакции');
    }
  }
);


const postSlice = createSlice({
  name: 'post',
  initialState: {
    loading: false,
    error: null,
    preview: null,
    comments: {},
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
      })
      .addCase(fetchPostComments.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.comments[postId] = comments; 
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { post_id } = action.payload;
        if (!state.comments[post_id]) state.comments[post_id] = [];
        state.comments[post_id].push(action.payload);
      })      
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default postSlice.reducer;
