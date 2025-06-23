import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section_id, theme_id, publishing_method, files = [] }, { rejectWithValue }) => {
    try {
      // Подготавливаем данные для query параметра
      const dataPayload = {
        text: message_text,
        type: 'post', 
        publishing_method: publishing_method || 'original'
      };

      const requestConfig = {
        params: {
          section_id: section_id,
          theme_id: theme_id,
          data: JSON.stringify(dataPayload)
        }
      };

      let requestBody;

      if (files && files.length > 0) {
        // Если есть файлы - используем FormData
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        requestBody = formData;
        requestConfig.headers = {
          'Content-Type': 'multipart/form-data'
        };
      } else {
        // Если нет файлов - отправляем пустое тело или null
        requestBody = null;
        requestConfig.headers = {
          'Content-Type': 'application/json'
        };
      }

      console.log('Отправляем запрос:', {
        hasFiles: files.length > 0,
        filesCount: files.length,
        params: requestConfig.params
      });

      // Отправляем запрос
      const res = await axios.post('/api/v1/messages', requestBody, requestConfig);

      console.log('[DEBUG] Успешно создан пост:', res.data);
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
  async ({ post_id, section_key, theme_id, type = 'post' }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isLoading = state.post.commentsLoadingFlags[post_id];
      const hasComments = state.post.comments[post_id];
      
      if (isLoading || hasComments) {
        return { postId: post_id, comments: hasComments || [] };
      }

      console.log('📥 Загрузка комментариев:', {
        message_id: post_id,
        section_id: section_key,
        theme_id,
        type
      });

      const res = await axios.get(`/api/v1/comments`, {
        params: {
          type: type,
          message_id: post_id,
          section_id: section_key,
          theme_id
        }
      });

      console.log('✅ Комментарии загружены:', res.data);
      return { postId: post_id, comments: res.data };
    } catch (err) {
      console.error('🔥 Ошибка загрузки комментариев:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев');
    }
  }
);

export const createComment = createAsyncThunk(
  'post/createComment',
  async ({ post_id, message_text, section_key, theme_id, files = [] }, { rejectWithValue }) => {
    try {
      console.log('📤 Создание комментария с type: "comment":', {
        text: message_text,
        post_id: post_id,
        section_id: section_key,
        theme_id
      });

      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });
      
      const dataPayload = {
        text: message_text,
        type: 'comment', 
        parent_id: post_id,
        publishing_method: 'original'
      };

      const res = await axios.post('/api/v1/messages', formData, {
        params: {
          section_id: section_key,
          theme_id: theme_id,
          data: JSON.stringify(dataPayload)
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Комментарий создан с type:', res.data);
      
      return { 
        ...res.data, 
        post_id: post_id,
        text: res.data.text,
        author: res.data.author,
        created_at: res.data.created_at,
        id: res.data.id
      };
    } catch (err) {
      console.error('🔥 Ошибка создания комментария:', err?.response?.data || err.message);
      
      if (err.response?.data?.detail) {
        console.error('📋 Детали ошибки:', err.response.data.detail);
      }
      
      return rejectWithValue(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        err.response?.data?.message ||
        'Ошибка добавления комментария'
      );
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
    selectedPost: null,
    commentsLoading: false,
    commentError: null,
    commentsLoadingFlags: {}, 
    postsLoaded: false, 
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.commentError = null;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.postsLoaded = false;
      state.commentsLoadingFlags = {};
    },
    clearComments: (state, action) => {
      if (action.payload) {
        delete state.comments[action.payload];
        delete state.commentsLoadingFlags[action.payload];
      } else {
        state.comments = {};
        state.commentsLoadingFlags = {};
      }
    },

    setCommentsLoadingFlag: (state, action) => {
      const { postId, loading } = action.payload;
      state.commentsLoadingFlags[postId] = loading;
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
        state.postsLoaded = false;
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
        state.postsLoaded = true; 

        const newPosts = (action.payload || []).map(post => ({
          ...post,
          likes: post.reactions?.count_likes || 0,
          dislikes: post.reactions?.count_dislikes || 0,
          user_reaction: post.reactions?.user_reaction || null
        }));
        const postsChanged = JSON.stringify(state.posts.map(p => p.id)) !== JSON.stringify(newPosts.map(p => p.id));
        
        if (postsChanged) {
          state.posts = newPosts;
        }
      })
      .addCase(fetchPostsInSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.posts = [];
        state.postsLoaded = false;
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

      .addCase(fetchPostComments.pending, (state, action) => {
        const postId = action.meta.arg.post_id;
        state.commentsLoading = true;
        state.commentError = null;
        state.commentsLoadingFlags[postId] = true;
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.commentsLoading = false;
        state.commentsLoadingFlags[postId] = false;
        
        if (!state.comments[postId] || state.comments[postId].length !== comments.length) {
          state.comments[postId] = comments || [];
          
          const postIndex = state.posts.findIndex(post => post.id === postId);
          if (postIndex !== -1) {
            state.posts[postIndex] = {
              ...state.posts[postIndex],
              comments_count: comments ? comments.length : 0
            };
          }
        }
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        const postId = action.meta.arg?.post_id;
        state.commentsLoading = false;
        state.commentError = action.payload;
        if (postId) {
          state.commentsLoadingFlags[postId] = false;
        }
      })

      .addCase(createComment.pending, (state) => {
        state.commentsLoading = true;
        state.commentError = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.commentsLoading = false;
        const comment = action.payload;
        const post_id = comment.post_id;
        
        console.log('✅ Комментарий добавлен в store:', comment);

        if (!state.comments[post_id]) {
          state.comments[post_id] = [];
        }

        state.comments[post_id].push(comment);

        const postIndex = state.posts.findIndex(post => post.id === post_id);
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            comments_count: (state.posts[postIndex].comments_count || 0) + 1
          };
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentError = action.payload;
      })

      .addCase(reactToPost.fulfilled, (state, action) => {
        const { post_id, count_likes, count_dislikes, new_reaction } = action.payload;
        console.log('📊 Обновляем реакции для поста:', {
          post_id,
          count_likes,
          count_dislikes,
          new_reaction
        });
        
        const postIndex = state.posts.findIndex(post => post.id === post_id);
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            likes: count_likes,
            dislikes: count_dislikes,
            user_reaction: new_reaction,
            reactions: {
              ...state.posts[postIndex].reactions,
              count_likes: count_likes,
              count_dislikes: count_dislikes,
              user_reaction: new_reaction
            }
          };
        }

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

export const { clearError, clearPosts, clearComments, setCommentsLoadingFlag } = postSlice.actions;

export default postSlice.reducer;