import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Создание поста - используем новый endpoint /api/v1/posts
export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section_key, theme_id, publishing_method = 'original', files = [] }, { rejectWithValue }) => {
    try {
      // Готовим данные согласно новому API
      const requestData = {
        data: {
          text: message_text,
          type: 'post',
          publishing_method: publishing_method
        },
        attachments: files || []
      };

      const requestConfig = {
        params: {
          section_key: section_key,
          theme_id: theme_id
        },
        headers: {
          'Content-Type': 'application/json'
        }
      };

      console.log('Отправляем запрос на создание поста:', {
        url: '/api/v1/posts',
        data: requestData,
        params: requestConfig.params
      });

      // Используем новый endpoint
      const res = await axios.post('/api/v1/posts', requestData, requestConfig);

      console.log('✅ Пост успешно создан:', res.data);
      return res.data;
    } catch (err) {
      console.error('🔥 Ошибка создания поста:', err?.response?.data || err.message);
      return rejectWithValue(err?.response?.data?.detail || err?.response?.data?.error || 'Ошибка создания поста');
    }
  }
);

// Создание превью поста - используем новый endpoint /api/v1/messages/openai
export const createPostPreview = createAsyncThunk(
  'post/createPreview',
  async ({ section_key, theme_id, text }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/api/v1/messages/openai`,
        { text },
        {
          params: { section_key, theme_id }
        }
      );
      
      // API возвращает openai_text, а фронт ожидает gpt_text
      return {
        original_text: res.data.original_text,
        gpt_text: res.data.openai_text || res.data.gpt_text
      };
    } catch (err) {
      console.error('🔥 Ошибка создания превью:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка предпросмотра поста');
    }
  }
);

// Получение постов в секции - endpoint остался тот же
export const fetchPostsInSection = createAsyncThunk(
  'post/fetchPostsInSection',
  async ({ section_key, theme_id, limit = 100, offset = 0 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/posts`, {
        params: {
          section_key: section_key,
          theme_id: theme_id,
          limit: limit,
          offset: offset
        }
      });

      return res.data;
    } catch (err) {
      console.error('🔥 Ошибка загрузки постов:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки постов');
    }
  }
);

// Получение конкретного поста - endpoint изменился на /api/v1/posts/{message_id}
export const fetchPostById = createAsyncThunk(
  'post/fetchPostById',
  async ({ message_id, section_key, theme_id }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/posts/${message_id}`, {
        params: {
          section_key: section_key,
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

// Получение комментариев - используем данные из поста, так как комментарии приходят в поле comments
export const fetchPostComments = createAsyncThunk(
  'post/fetchComments',
  async ({ post_id, section_key, theme_id }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isLoading = state.post.commentsLoadingFlags[post_id];
      const hasComments = state.post.comments[post_id];

      if (isLoading || hasComments) {
        return { postId: post_id, comments: hasComments || [] };
      }

      console.log('📥 Загрузка комментариев через получение поста:', {
        message_id: post_id,
        section_key: section_key,
        theme_id
      });

      // Получаем пост целиком, комментарии в нем уже есть
      const res = await axios.get(`/api/v1/posts/${post_id}`, {
        params: {
          section_key: section_key,
          theme_id: theme_id
        }
      });

      console.log('✅ Комментарии загружены:', res.data.comments);
      return { postId: post_id, comments: res.data.comments || [] };
    } catch (err) {
      console.error('🔥 Ошибка загрузки комментариев:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев');
    }
  }
);

// Создание комментария - оставляем старый endpoint, так как новый не описан
export const createComment = createAsyncThunk(
  'post/createComment',
  async ({ post_id, message_text, section_key, theme_id, files = [] }, { rejectWithValue }) => {
    try {
      console.log('📤 Создание комментария:', {
        text: message_text,
        post_id: post_id,
        section_key: section_key,
        theme_id,
        files_count: files.length
      });

      const dataPayload = {
        text: message_text,
        type: 'comment',
        content_id: post_id,
      };

      let requestBody;
      let requestConfig = {
        params: {
          section_key: section_key,
          theme_id: theme_id,
          data: JSON.stringify(dataPayload)
        }
      };

      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        requestBody = formData;
        requestConfig.headers = {
          'Content-Type': 'multipart/form-data'
        };
      } else {
        requestBody = null;
        requestConfig.headers = {
          'Content-Type': 'application/json'
        };
      }

      console.log('📋 Отправляем запрос с параметрами:', {
        url: '/api/v1/messages',
        params: requestConfig.params,
        hasFiles: files.length > 0,
        hasBody: !!requestBody
      });

      const res = await axios.post('/api/v1/messages', requestBody, requestConfig);

      console.log('✅ Комментарий создан:', res.data);

      return {
        ...res.data,
        post_id: post_id,
        text: res.data.text,
        author: res.data.author,
        created_at: res.data.created_at,
        id: res.data.id
      };
    } catch (err) {
      console.error('🔥 Ошибка создания комментария:', {
        error: err?.response?.data || err.message,
        status: err?.response?.status,
        headers: err?.response?.headers
      });

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

// Реакция на пост - endpoint правильный, но убираем лишний параметр
export const reactToPost = createAsyncThunk(
  'post/reactToPost',
  async ({ post_id, reaction, section_key, theme_id }, { rejectWithValue }) => {
    try {
      console.log('📤 Отправляем реакцию:', {
        message_id: post_id,
        reaction,
        section_key,
        theme_id
      });

      // Убираем дублирование reaction в URL и body
      const res = await axios.post(
        `/api/v1/messages/${post_id}/${reaction}`,
        { reaction }, // Оставляем body для совместимости, хотя реакция уже в URL
        {
          params: {
            section_key,
            theme_id
          }
        }
      );

      console.log('📥 Получен ответ на реакцию:', res.data);

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

// Получение ссылки на файл - оставляем без изменений
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
    clearPreview: (state) => {
      state.preview = null;
    },
    setCommentsLoadingFlag: (state, action) => {
      const { postId, loading } = action.payload;
      state.commentsLoadingFlags[postId] = loading;
    },
  },
  extraReducers: (builder) => {
    builder
      // Создание поста
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        // Добавляем новый пост в начало списка
        const newPost = {
          ...action.payload,
          likes: action.payload.reactions?.count_likes || 0,
          dislikes: action.payload.reactions?.count_dislikes || 0,
          user_reaction: action.payload.reactions?.user_reaction || null
        };
        state.posts.unshift(newPost);
        state.preview = null; // Очищаем превью после публикации
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Создание превью
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

      // Получение постов
      .addCase(fetchPostsInSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsInSection.fulfilled, (state, action) => {
        state.loading = false;
        state.postsLoaded = true;

        // Нормализуем данные для совместимости
        const newPosts = (action.payload || []).map(post => ({
          ...post,
          likes: post.reactions?.count_likes || 0,
          dislikes: post.reactions?.count_dislikes || 0,
          user_reaction: post.reactions?.user_reaction || null,
          comments_count: post.comments?.length || 0
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

      // Получение конкретного поста
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
          user_reaction: post.reactions?.user_reaction || null,
          comments_count: post.comments?.length || 0
        };
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Получение комментариев
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

          // Обновляем счетчик комментариев в посте
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

      // Создание комментария
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

        // Обновляем счетчик комментариев
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

      // Реакции на пост
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { post_id, count_likes, count_dislikes, new_reaction } = action.payload;
        console.log('📊 Обновляем реакции для поста:', {
          post_id,
          count_likes,
          count_dislikes,
          new_reaction
        });

        // Обновляем в списке постов
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

        // Обновляем выбранный пост
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

      // Загрузка файлов
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

export const { clearError, clearPosts, clearComments, clearPreview, setCommentsLoadingFlag } = postSlice.actions;

export default postSlice.reducer;