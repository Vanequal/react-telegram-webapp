import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section_key, theme_id, publishing_method, files = [], content_type }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // 👇 главное — JSON.stringify в поле `data`
      formData.append('data', JSON.stringify({
        message_text,
        publishing_method
      }));

      for (const file of files) {
        formData.append('files', file);
      }

      const res = await axios.post('/api/v1/post/', formData, {
        params: { section_key, theme_id, content_type },
        // НЕ указываем Content-Type
      });

      return res.data;
    } catch (err) {
      console.error('Ошибка запроса:', JSON.stringify(err?.response?.data?.detail, null, 2));
      return rejectWithValue(err?.response?.data?.detail || 'Ошибка создания поста');
    }
  }
);

export const createPostPreview = createAsyncThunk(
  'post/createPreview',
  async ({ section_key, theme_id, message_text, files, content_type }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/api/v1/post/preview`,
        { message_text },
        {
          params: {
            section_key,
            theme_id,
            content_type
          }
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка предпросмотра поста');
    }
  }
);

export const fetchPostsInSection = createAsyncThunk(
  'post/fetchPostsInSection',
  async ({ section_key, theme_id, content_type }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/post/posts`, {
        params: { section_key, theme_id, content_type }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки постов');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'post/fetchPostById',
  async ({ post_id, section_key, theme_id, content_type }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/post/${post_id}`, {
        params: { section_key, theme_id, content_type }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки поста');
    }
  }
);


export const fetchPostComments = createAsyncThunk(
  'post/fetchComments',
  async ({ post_id, section_key, theme_id, content_type }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/comment/comments`, {
        params: { post_id, section_key, theme_id, content_type }
      });
      return { postId: post_id, comments: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев');
    }
  }
);

export const createComment = createAsyncThunk(
  'post/createComment',
  async ({ post_id, message_text, parent_id = null, section_key, theme_id, content_type }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/v1/comment/create`, {
        message_text,
        reply_to_message_id: parent_id ?? null,
        files: []
      }, {
        params: { post_id, section_key, theme_id, content_type }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Ошибка добавления комментария');
    }
  }
);

export const reactToPost = createAsyncThunk(
  'post/reactToPost',
  async ({ post_id, reaction }, { rejectWithValue }) => {
    try {
      await axios.post(`/api/v1/post/react`, { post_id, reaction });
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
    posts: [],
    selectedPost: null
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
        state.loading = false;
        state.error = action.payload;
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
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchPostsInSection.fulfilled, (state, action) => {
        state.posts = action.payload;
      })
      .addCase(fetchPostsInSection.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchPostComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.comments[postId] = comments;
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(createComment.fulfilled, (state, action) => {
        const comment = action.payload;
        const post_id = comment.post_id;
        if (!state.comments[post_id]) {
          state.comments[post_id] = [];
        }
        state.comments[post_id].push(comment);
      });
  }
});

export default postSlice.reducer;
