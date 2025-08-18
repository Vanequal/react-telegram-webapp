import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Загрузка файлов через обновленный endpoint
export const uploadFiles = createAsyncThunk(
  'post/uploadFiles',
  async (files, { rejectWithValue }) => {
    try {
      if (!files || files.length === 0) {
        return [];
      }

      console.log('📤 Загружаем файлы:', files.length);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      // Используем обновленный endpoint
      const res = await axios.post('/api/v1/messages/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Файлы загружены:', res.data);
      return res.data;
    } catch (err) {
      console.error('🔥 Ошибка загрузки файлов:', err?.response?.data || err.message);
      return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки файлов');
    }
  }
);

// Создание поста - исправленная версия с поддержкой файлов
export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section_key, theme_id, publishing_method = 'original', files = [] }, { rejectWithValue, dispatch }) => {
    try {
      // Сначала загружаем файлы, если они есть
      let uploadedFiles = [];
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap();
        uploadedFiles = uploadResult;
      }

      // FIX: Преобразуем 'gpt' в 'openai' для соответствия API
      const apiPublishingMethod = publishing_method === 'gpt' ? 'openai' : publishing_method;

      // Готовим данные согласно API
      const requestData = {
        data: {
          text: message_text,
          type: 'post',
          publishing_method: apiPublishingMethod
        },
        attachments: uploadedFiles || []
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

      console.log('📤 Отправляем запрос на создание поста:', {
        url: '/api/v1/posts',
        data: requestData,
        params: requestConfig.params,
        attachments_count: uploadedFiles.length,
        publishing_method: apiPublishingMethod
      });

      const res = await axios.post('/api/v1/posts', requestData, requestConfig);

      console.log('✅ Пост успешно создан:', res.data);

      return {
        ...res.data,
        uploaded_files: uploadedFiles
      };
    } catch (err) {
      console.error('🔥 Ошибка создания поста:', err?.response?.data || err.message);

      if (err?.response?.data?.error?.details) {
        console.error('📋 Детали ошибок валидации:', err.response.data.error.details);
      }

      return rejectWithValue(
        err?.response?.data?.error?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        'Ошибка создания поста'
      );
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

// Получение постов в секции
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

// Получение конкретного поста
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

// Создание комментария - исправленная версия с загрузкой файлов
export const createComment = createAsyncThunk(
  'post/createComment',
  async ({ post_id, message_text, section_key, theme_id, files = [] }, { rejectWithValue, dispatch }) => {
    try {
      // Сначала загружаем файлы, если они есть
      let uploadedFiles = [];
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap();
        uploadedFiles = uploadResult;
      }

      console.log('📤 Создание комментария:', {
        text: message_text,
        content_id: post_id,
        section_key: section_key,
        theme_id,
        files_count: uploadedFiles.length
      });

      // Готовим данные согласно API
      const requestData = {
        data: {
          text: message_text,
          type: 'comment',
          content_id: post_id,
        },
        attachments: uploadedFiles || []
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

      console.log('📋 Отправляем запрос на создание комментария:', {
        url: '/api/v1/comments',
        data: requestData,
        params: requestConfig.params
      });

      const res = await axios.post('/api/v1/comments', requestData, requestConfig);

      console.log('✅ Комментарий создан:', res.data);

      return {
        ...res.data,
        post_id: post_id,
        uploaded_files: uploadedFiles
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

// Получение комментариев
export const fetchPostComments = createAsyncThunk(
  'post/fetchComments',
  async ({ post_id, section_key, theme_id }, { rejectWithValue, getState }) => {
    try {
      console.log('📥 Загрузка комментариев:', {
        message_id: post_id,
        section_key: section_key,
        theme_id
      });

      const res = await axios.get('/api/v1/comments', {
        params: {
          message_id: post_id,
          section_key: section_key,
          theme_id: theme_id,
          limit: 100,
          offset: 0
        }
      });

      console.log('✅ Комментарии загружены:', res.data);
      return { postId: post_id, comments: res.data || [] };
    } catch (err) {
      console.error('🔥 Ошибка загрузки комментариев:', err?.response?.data || err.message);
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев');
    }
  }
);

// Реакция на пост - обновлен endpoint на PATCH
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

      // Используем PATCH вместо POST и новый endpoint
      const res = await axios.patch(
        `/api/v1/messages/${post_id}/update_reaction`,
        { reaction },
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

// Получение ссылки на файл - обновленная версия для нового endpoint
export const fetchDownloadUrl = createAsyncThunk(
  'post/fetchDownloadUrl',
  async ({ attachmentUrl }, { rejectWithValue }) => {
    try {
      // Согласно Swagger: GET /api/v1/messages/attachments/{attachment_url}
      // attachment_url передается как path parameter без дополнительного encodeURIComponent
      const downloadUrl = `${axios.defaults.baseURL}/api/v1/messages/attachments/${attachmentUrl}`;

      console.log(`✅ Сформирован URL для файла:`, {
        original: attachmentUrl,
        downloadUrl: downloadUrl
      });

      return { attachmentUrl, url: downloadUrl };
    } catch (err) {
      console.error('🔥 Ошибка формирования URL файла:', {
        error: err?.response?.data || err.message,
        attachmentUrl,
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
    uploadedFiles: [],
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
    clearUploadedFiles: (state) => {
      state.uploadedFiles = [];
    },
    setCommentsLoadingFlag: (state, action) => {
      const { postId, loading } = action.payload;
      state.commentsLoadingFlags[postId] = loading;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedFiles = action.payload;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

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
        state.uploadedFiles = []; // Очищаем загруженные файлы
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

        // Всегда обновляем комментарии, убираем лишние проверки
        state.comments[postId] = comments || [];

        // Обновляем счетчик комментариев в посте
        const postIndex = state.posts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            comments_count: comments ? comments.length : 0
          };
        }

        console.log('✅ Комментарии сохранены в store:', {
          postId,
          commentsCount: comments?.length || 0,
          comments: comments
        });
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

      // Реакции на пост - обновлен для работы с новым PATCH endpoint
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { post_id, count_likes, count_dislikes, new_reaction } = action.payload;
        console.log('📊 Обновляем реакции для поста/комментария:', {
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

        // Обновляем реакции в комментариях
        Object.keys(state.comments).forEach(postKey => {
          const postComments = state.comments[postKey];
          if (postComments && Array.isArray(postComments)) {
            // Ищем комментарий для обновления
            const commentIndex = postComments.findIndex(comment => comment.id === post_id);
            if (commentIndex !== -1) {
              state.comments[postKey][commentIndex] = {
                ...state.comments[postKey][commentIndex],
                reactions: {
                  ...state.comments[postKey][commentIndex].reactions,
                  count_likes: count_likes,
                  count_dislikes: count_dislikes,
                  user_reaction: new_reaction
                }
              };
            }

            // Также проверяем ответы (replies) в комментариях
            postComments.forEach((comment, commentIdx) => {
              if (comment.replies && Array.isArray(comment.replies)) {
                const replyIndex = comment.replies.findIndex(reply => reply.id === post_id);
                if (replyIndex !== -1) {
                  state.comments[postKey][commentIdx].replies[replyIndex] = {
                    ...state.comments[postKey][commentIdx].replies[replyIndex],
                    reactions: {
                      ...state.comments[postKey][commentIdx].replies[replyIndex].reactions,
                      count_likes: count_likes,
                      count_dislikes: count_dislikes,
                      user_reaction: new_reaction
                    }
                  };
                }
              }
            });
          }
        });
      })
      .addCase(reactToPost.rejected, (state, action) => {
        console.error('❌ Ошибка при отправке реакции:', action.payload);
        state.error = action.payload;
      })

      // Загрузка файлов
      .addCase(fetchDownloadUrl.fulfilled, (state, action) => {
        const { attachmentUrl, url } = action.payload;
        state.fileLinks = {
          ...state.fileLinks,
          [attachmentUrl]: url
        };
      })
      .addCase(fetchDownloadUrl.rejected, (state, action) => {
        console.warn('Ошибка загрузки файла:', action.payload);
      });
  }
});

export const { clearError, clearPosts, clearComments, clearPreview, clearUploadedFiles, setCommentsLoadingFlag } = postSlice.actions;

export default postSlice.reducer;