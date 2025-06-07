import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section_id, theme_id, publishing_method, files = [] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // ✅ ИСПРАВЛЕНО: добавляем файлы в FormData
      files.forEach((file) => {
        formData.append('files', file);
      });

      // ✅ ИСПРАВЛЕНО: правильная структура данных
      const dataPayload = {
        text: message_text,
        publishing_method: publishing_method || 'original'
      };

      const res = await axios.post('/api/v1/messages', formData, {
        params: {
          section_id,
          theme_id,
          data: JSON.stringify(dataPayload)
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('[DEBUG] Успешно создан пост с файлами:', files.length);
      return res.data;
    } catch (err) {
      console.error('🔥 Ошибка создания поста:', err?.response?.data || err.message);
      return rejectWithValue(err?.response?.data?.error || err?.response?.data?.detail || 'Ошибка создания поста');
    }
  }
);


export const createPostPreview = createAsyncThunk(
  'post/createPreview',
  async ({ section_id, theme_id, text }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/api/v1/messages/gpt`,
        { text },
        {
          params: { section_id, theme_id }
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
  async ({ section_key, theme_id, limit = 100 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/posts`, {
        params: {
          section_id: section_key,
          theme_id: theme_id,
          limit: limit
        }
      });

      return res.data;
    } catch (err) {
      console.error('🔥 Ошибка загрузки постов:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки постов');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'post/fetchPostById',
  async ({ post_id, section_id, theme_id }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/posts/${post_id}`, {
        params: {
          section_id: section_id,
          theme_id: theme_id
        }
      });

      return res.data;
    } catch (err) {
      console.error('🔥 Ошибка загрузки поста:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки поста');
    }
  }
);

export const fetchPostComments = createAsyncThunk(
  'post/fetchComments',
  async ({ post_id, section_key, theme_id, type = 'post' }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/comments`, {
        params: {
          type,
          message_id: post_id,
          section_id: section_key,
          theme_id
        }
      });

      return { postId: post_id, comments: res.data };
    } catch (err) {
      console.error('🔥 Ошибка загрузки комментариев:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев');
    }
  }
);

export const createComment = createAsyncThunk(
  'post/createComment',
  async ({ post_id, message_text, parent_id = null, section_key, theme_id, type = 'post' }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/v1/comments`, {
        text: message_text,
        reply_to_id: parent_id,
        files: []
      }, {
        params: {
          message_id: post_id,
          section_id: section_key,
          theme_id,
          type
        }
      });

      return res.data;
    } catch (err) {
      console.error('🔥 Ошибка добавления комментария:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка добавления комментария');
    }
  }
);

// ✅ ИСПРАВЛЕНО: Новый endpoint для реакций
export const reactToPost = createAsyncThunk(
  'post/reactToPost',
  async ({ post_id, reaction, section_id, theme_id }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/api/v1/messages/${post_id}/${reaction}`,
        { reaction }, // тело запроса
        {
          params: {
            section_id,
            theme_id
          }
        }
      );
      
      return { 
        post_id, 
        count_likes: res.data.count_likes,
        count_dislikes: res.data.count_dislikes,
        old_reaction: res.data.old_reaction,
        new_reaction: res.data.new_reaction
      };
    } catch (err) {
      console.error('🔥 Ошибка реакции:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка при отправке реакции');
    }
  }
);

export const fetchDownloadUrl = createAsyncThunk(
  'post/fetchDownloadUrl',
  async ({ filePath, mimeType = 'application/octet-stream' }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/files/download/${encodeURIComponent(filePath)}`, {
        params: {
          url: filePath,
          mime_type: mimeType
        }
      });

      return { filePath, url: res.data };
    } catch (err) {
      console.error('🔥 Ошибка загрузки файла:', err?.response?.data || err.message);
      return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки ссылки');
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
    fileLinks: {},
    selectedPost: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPosts: (state) => {
      state.posts = [];
    },
  },
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

      // ✅ Исправлено - добавлены состояния загрузки
      .addCase(fetchPostsInSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsInSection.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload || [];
      })
      .addCase(fetchPostsInSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.posts = [];
      })

      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
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
      })

      // ✅ НОВОЕ: Обновление лайков/дислайков после реакции
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { post_id, count_likes, count_dislikes } = action.payload;
        const post = state.posts.find(p => p.id === post_id);
        if (post) {
          post.likes = count_likes;
          post.dislikes = count_dislikes;
        }
      })

      .addCase(fetchDownloadUrl.fulfilled, (state, action) => {
        const { filePath, url } = action.payload;
        state.fileLinks = {
          ...state.fileLinks,
          [filePath]: url
        };
      })
      .addCase(fetchDownloadUrl.rejected, (state, action) => {
        console.warn('Ошибка загрузки файла:', action.payload);
      });
  }
});

export const { clearError, clearPosts } = postSlice.actions;

export default postSlice.reducer;