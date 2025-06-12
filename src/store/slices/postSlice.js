import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section_id, theme_id, publishing_method, files = [] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

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

export const reactToPost = createAsyncThunk(
  'post/reactToPost',
  async ({ post_id, reaction, section_id, theme_id }, { rejectWithValue }) => {
    try {
      console.log('📤 Отправляем реакцию:', {
        message_id: post_id,
        reaction,
        section_id,
        theme_id
      });
      
      const res = await axios.post(
        `/api/v1/messages/${post_id}/${reaction}`,
        { reaction },
        {
          params: {
            section_id,
            theme_id
          }
        }
      );
      
      console.log('📥 Получен ответ:', res.data);
      
      return { 
        post_id, 
        ...res.data
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
      const encodedUrl = encodeURIComponent(filePath);
      const downloadUrl = `${axios.defaults.baseURL}/api/v1/files/download/${encodedUrl}?url=${encodeURIComponent(filePath)}&mime_type=${encodeURIComponent(mimeType)}`;
      
      console.log(`✅ Сформирован URL для файла:`, {
        original: filePath,
        downloadUrl: downloadUrl
      });
      
      return { filePath, url: downloadUrl };
    } catch (err) {
      console.error('🔥 Ошибка формирования URL файла:', {
        error: err?.response?.data || err.message,
        filePath,
        status: err?.response?.status
      });
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

      .addCase(fetchPostsInSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsInSection.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = (action.payload || []).map(post => ({
          ...post,
          likes: post.reactions?.count_likes || 0,
          dislikes: post.reactions?.count_dislikes || 0,
          user_reaction: post.reactions?.user_reaction || null
        }));
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
        const post = action.payload;
        state.selectedPost = {
          ...post,
          likes: post.reactions?.count_likes || 0,
          dislikes: post.reactions?.count_dislikes || 0,
          user_reaction: post.reactions?.user_reaction || null
        };
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

      // ✅ ИСПРАВЛЕНО: Корректное обновление реакций
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { post_id, count_likes, count_dislikes, new_reaction } = action.payload;
        console.log('📊 Обновляем реакции для поста:', {
          post_id,
          count_likes,
          count_dislikes,
          new_reaction
        });
        
        // Обновляем конкретный пост, не затрагивая другие
        state.posts = state.posts.map(post => {
          if (post.id === post_id) {
            return {
              ...post,
              likes: count_likes,
              dislikes: count_dislikes,
              user_reaction: new_reaction,
              // Также обновляем вложенный объект reactions для консистентности
              reactions: {
                ...post.reactions,
                count_likes: count_likes,
                count_dislikes: count_dislikes,
                user_reaction: new_reaction
              }
            };
          }
          // Важно: возвращаем пост без изменений, если это не тот пост
          return post;
        });

        // Также обновляем selectedPost если он совпадает
        if (state.selectedPost && state.selectedPost.id === post_id) {
          state.selectedPost = {
            ...state.selectedPost,
            likes: count_likes,
            dislikes: count_dislikes,
            user_reaction: new_reaction,
            reactions: {
              ...state.selectedPost.reactions,
              count_likes: count_likes,
              count_dislikes: count_dislikes,
              user_reaction: new_reaction
            }
          };
        }
      })
      .addCase(reactToPost.rejected, (state, action) => {
        console.error('❌ Ошибка при отправке реакции:', action.payload);
        state.error = action.payload;
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