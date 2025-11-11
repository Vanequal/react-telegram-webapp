import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '@/shared/api/axios'

// ✅ Загрузка файлов - endpoint остается прежним
export const uploadFiles = createAsyncThunk('post/uploadFiles', async (files, { rejectWithValue }) => {
  try {
    if (!files || files.length === 0) {
      return []
    }

    console.log('📤 Загружаем файлы:', files.length)

    const formData = new FormData()
    files.forEach(file => {
      formData.append('attachments', file)
    })

    const res = await axios.post('/api/v1/messages/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('✅ Файлы загружены:', res.data)
    return res.data
  } catch (err) {
    console.error('🔥 Ошибка загрузки файлов:', err?.response?.data || err.message)
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки файлов')
  }
})

// ✅ Создание поста - ИСПРАВЛЕН endpoint и параметры
export const createPost = createAsyncThunk('post/create', async ({ message_text, section_code, theme_id, type = 'post', is_openai_generated = false, ratio = 99, files = [] }, { rejectWithValue, dispatch }) => {
  try {
    // Сначала загружаем файлы, если они есть
    let uploadedFiles = []
    if (files && files.length > 0) {
      const uploadResult = await dispatch(uploadFiles(files)).unwrap()
      uploadedFiles = uploadResult
    }

    // ✅ Готовим данные согласно Swagger
    const requestData = {
      type: type, // "post" по умолчанию
      text: message_text,
      is_openai_generated: is_openai_generated,
      ratio: ratio, // 99 по умолчанию
    }

    console.log('📤 Отправляем запрос на создание поста:', {
      url: `/api/v1/messages/${section_code}/posts`,
      data: requestData,
      params: { theme_id },
      attachments_count: uploadedFiles.length,
    })

    // ✅ НОВЫЙ endpoint с section_code в пути
    const res = await axios.post(`/api/v1/messages/${section_code}/posts`, requestData, {
      params: { theme_id },
    })

    console.log('✅ Пост успешно создан:', res.data)

    return {
      ...res.data,
      uploaded_files: uploadedFiles,
    }
  } catch (err) {
    console.error('🔥 Ошибка создания поста:', err?.response?.data || err.message)
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка создания поста')
  }
})

// ✅ Создание превью поста - ИСПРАВЛЕН endpoint и параметры
export const createPostPreview = createAsyncThunk('post/createPreview', async ({ section_code, theme_id, text }, { rejectWithValue }) => {
  try {
    console.log('📤 Запрос превью от OpenAI:', { section_code, theme_id, text })

    const res = await axios.post(
      `/api/v1/messages/openai`,
      { text },
      {
        params: {
          section_code, // ✅ Изменено с section_key
          theme_id
        },
      }
    )

    console.log('✅ Превью получено:', res.data)

    return {
      original_text: res.data.original_text,
      openai_text: res.data.openai_text, // ✅ Оставляем как openai_text
    }
  } catch (err) {
    console.error('🔥 Ошибка создания превью:', err?.response?.data || err.message)

    // ✅ Обработка случая когда OpenAI отключен (status 403)
    if (err?.response?.status === 403) {
      return rejectWithValue('OpenAI временно недоступен')
    }

    return rejectWithValue(err.response?.data?.detail || 'Ошибка предпросмотра поста')
  }
})

// ✅ Получение постов в секции - ИСПРАВЛЕН endpoint
export const fetchPostsInSection = createAsyncThunk('post/fetchPostsInSection', async ({ section_code, theme_id, limit = 100, offset = 0 }, { rejectWithValue }) => {
  try {
    console.log('📥 Загружаем посты:', { section_code, theme_id, limit, offset })

    // ✅ НОВЫЙ endpoint с section_code в пути
    const res = await axios.get(`/api/v1/messages/${section_code}/posts`, {
      params: {
        theme_id,
        limit,
        offset,
      },
    })

    console.log('✅ Посты загружены:', res.data?.length || 0)
    return res.data
  } catch (err) {
    console.error('🔥 Ошибка загрузки постов:', err?.response?.data || err.message)
    return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки постов')
  }
})

// ✅ Получение конкретного поста - endpoint не изменился (его нет в Swagger)
// Предполагаю что он тоже должен быть изменен, но пока оставим как есть
export const fetchPostById = createAsyncThunk('post/fetchPostById', async ({ message_id, section_code, theme_id }, { rejectWithValue }) => {
  try {
    // TODO: Уточнить у бэкендера правильный endpoint для получения одного поста
    const res = await axios.get(`/api/v1/messages/${section_code}/posts/${message_id}`, {
      params: { theme_id },
    })

    return res.data
  } catch (err) {
    console.error('🔥 Ошибка загрузки поста:', err?.response?.data || err.message)
    return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки поста')
  }
})

// ✅ Создание комментария - НОВЫЙ endpoint для комментариев
export const createComment = createAsyncThunk(
  'post/createComment',
  async ({ post_id, message_text, section_code, theme_id, reply_to_message_id = null, files = [] }, { rejectWithValue, dispatch }) => {
    try {
      // Загружаем файлы если есть
      let uploadedFiles = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFiles = uploadResult
      }

      console.log('📤 Создание комментария:', {
        text: message_text,
        content_id: post_id,
        reply_to_message_id,
        section_code,
        theme_id,
        files_count: uploadedFiles.length,
      })

      // ✅ Структура данных согласно Swagger для комментариев
      const requestData = {
        type: 'comment',
        text: message_text,
        content_id: post_id, // ← ID поста к которому комментарий
        reply_to_message_id: reply_to_message_id, // ← ID комментария (для replies)
      }

      console.log('📋 Отправляем запрос на создание комментария:', {
        url: `/api/v1/messages/${section_code}/comments`,
        data: requestData,
        params: { theme_id },
      })

      // ✅ НОВЫЙ endpoint специально для комментариев
      const res = await axios.post(
        `/api/v1/messages/${section_code}/comments`,
        requestData,
        {
          params: { theme_id },
        }
      )

      console.log('✅ Комментарий создан:', res.data)

      return {
        ...res.data,
        post_id: post_id,
        uploaded_files: uploadedFiles,
      }
    } catch (err) {
      console.error('🔥 Ошибка создания комментария:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка добавления комментария')
    }
  }
)

// ✅ Получение комментариев - НОВЫЙ endpoint
export const fetchPostComments = createAsyncThunk(
  'post/fetchComments',
  async ({ post_id, section_code, theme_id, limit = 100, offset = 0 }, { rejectWithValue }) => {
    try {
      console.log('📥 Загрузка комментариев:', {
        post_id,
        section_code,
        theme_id,
      })

      // ✅ НОВЫЙ endpoint специально для комментариев
      const res = await axios.get(`/api/v1/messages/${section_code}/comments`, {
        params: {
          theme_id,
          limit,
          offset,
        },
      })

      // ✅ Фильтруем комментарии для конкретного поста по content_id
      const allComments = res.data || []
      const postComments = allComments.filter(item =>
        item.message_comment?.content_id === post_id
      )

      console.log('✅ Комментарии загружены:', {
        total: allComments.length,
        forThisPost: postComments.length
      })

      return { postId: post_id, comments: postComments }
    } catch (err) {
      console.error('🔥 Ошибка загрузки комментариев:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев')
    }
  }
)

// ✅ Реакция на пост - endpoint не указан в Swagger
// TODO: Уточнить у бэкендера правильный endpoint для реакций
export const reactToPost = createAsyncThunk('post/reactToPost', async ({ post_id, reaction, section_code, theme_id }, { rejectWithValue }) => {
  try {
    console.log('📤 Отправляем реакцию:', {
      message_id: post_id,
      reaction,
      section_code,
      theme_id,
    })

    // TODO: Уточнить правильный endpoint
    const res = await axios.patch(
      `/api/v1/messages/${post_id}/update_reaction`,
      { reaction },
      {
        params: {
          section_code, // ✅ Изменено с section_key
          theme_id,
        },
      }
    )

    console.log('📥 Получен ответ на реакцию:', res.data)

    return {
      post_id,
      ...res.data,
    }
  } catch (err) {
    console.error('🔥 Ошибка реакции:', err?.response?.data || err.message)
    return rejectWithValue(err.response?.data?.detail || 'Ошибка при отправке реакции')
  }
})

// ✅ Получение ссылки на файл - endpoint остается прежним
export const fetchDownloadUrl = createAsyncThunk('post/fetchDownloadUrl', async ({ attachmentUrl }, { rejectWithValue }) => {
  try {
    const downloadUrl = `${axios.defaults.baseURL}/api/v1/messages/attachments/${attachmentUrl}`

    console.log(`✅ Сформирован URL для файла:`, {
      original: attachmentUrl,
      downloadUrl: downloadUrl,
    })

    return { attachmentUrl, url: downloadUrl }
  } catch (err) {
    console.error('🔥 Ошибка формирования URL файла:', err?.response?.data || err.message)
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки ссылки')
  }
})

// ✅ Создание задачи (task)
export const createTask = createAsyncThunk(
  'post/createTask',
  async ({ message_text, section_code, theme_id, ratio = null, files = [] }, { rejectWithValue, dispatch }) => {
    try {
      // Загружаем файлы если есть
      let uploadedFiles = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFiles = uploadResult
      }

      console.log('📤 Создание задачи:', {
        text: message_text,
        section_code,
        theme_id,
        ratio,
        files_count: uploadedFiles.length,
      })

      // ✅ Структура данных согласно Swagger
      const requestData = {
        type: 'task',
        text: message_text,
        is_openai_generated: false,
        ratio: ratio || 1, // Коэффициент задачи
      }

      // ✅ Создаем задачу через /posts endpoint
      const res = await axios.post(`/api/v1/messages/${section_code}/posts`, requestData, {
        params: { theme_id },
      })

      console.log('✅ Задача создана:', res.data)

      return {
        ...res.data,
        uploaded_files: uploadedFiles,
      }
    } catch (err) {
      console.error('🔥 Ошибка создания задачи:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка создания задачи')
    }
  }
)

// ✅ Получение задач (tasks)
export const fetchTasks = createAsyncThunk(
  'post/fetchTasks',
  async ({ section_code, theme_id, limit = 100, offset = 0 }, { rejectWithValue }) => {
    try {
      console.log('📥 Загрузка задач:', { section_code, theme_id, limit, offset })

      // ✅ Endpoint для получения задач
      const res = await axios.get(`/api/v1/messages/${section_code}/tasks`, {
        params: {
          theme_id,
          limit,
          offset,
        },
      })

      console.log('✅ Задачи загружены:', res.data?.length || 0)
      return res.data
    } catch (err) {
      console.error('🔥 Ошибка загрузки задач:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки задач')
    }
  }
)

// ✅ Взять задачу в работу
export const acceptTask = createAsyncThunk(
  'post/acceptTask',
  async ({ task_message_id, section_code, theme_id, is_partially, description = '', expires_at }, { rejectWithValue }) => {
    try {
      console.log('📤 Берем задачу в работу:', {
        task_message_id,
        section_code,
        theme_id,
        is_partially,
        description,
        expires_at,
      })

      // ✅ Структура данных согласно Swagger
      const requestData = {
        type: 'task',
        text: description, // Описание того, что будет делать исполнитель
        is_partially: is_partially, // true/false - частично или полностью
        expires_at: expires_at, // Дата окончания
      }

      // ✅ Берем задачу в работу через /tasks endpoint
      // ВАЖНО: здесь нужно указать message_id задачи
      const res = await axios.post(`/api/v1/messages/${section_code}/tasks`, requestData, {
        params: {
          theme_id,
          message_id: task_message_id // ← ID задачи которую берем
        },
      })

      console.log('✅ Задача взята в работу:', res.data)

      return {
        ...res.data,
        task_message_id,
      }
    } catch (err) {
      console.error('🔥 Ошибка принятия задачи:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка принятия задачи')
    }
  }
)

// ✅ Отметить задачу как выполненную
export const completeTask = createAsyncThunk(
  'post/completeTask',
  async ({ task_message_id, section_code, theme_id, description, files = [] }, { rejectWithValue, dispatch }) => {
    try {
      // Загружаем файлы результата
      let uploadedFiles = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFiles = uploadResult
      }

      console.log('📤 Отмечаем задачу выполненной:', {
        task_message_id,
        description,
        files_count: uploadedFiles.length,
      })

      // ✅ Создаем комментарий с результатами выполнения
      const commentResult = await dispatch(
        createComment({
          post_id: task_message_id,
          message_text: description,
          section_code,
          theme_id,
          files: files,
        })
      ).unwrap()

      console.log('✅ Задача отмечена как выполненная')

      return {
        task_message_id,
        comment: commentResult,
        uploaded_files: uploadedFiles,
      }
    } catch (err) {
      console.error('🔥 Ошибка завершения задачи:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка завершения задачи')
    }
  }
)

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
    tasksLoading: false,
    taskError: null,
  },
  reducers: {
    clearError: state => {
      state.error = null
      state.commentError = null
    },
    clearPosts: state => {
      state.posts = []
      state.postsLoaded = false
      state.commentsLoadingFlags = {}
    },
    clearComments: (state, action) => {
      if (action.payload) {
        delete state.comments[action.payload]
        delete state.commentsLoadingFlags[action.payload]
      } else {
        state.comments = {}
        state.commentsLoadingFlags = {}
      }
    },
    clearPreview: state => {
      state.preview = null
    },
    clearUploadedFiles: state => {
      state.uploadedFiles = []
    },
    setCommentsLoadingFlag: (state, action) => {
      const { postId, loading } = action.payload
      state.commentsLoadingFlags[postId] = loading
    },
  },
  extraReducers: builder => {
    builder
      .addCase(uploadFiles.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.loading = false
        state.uploadedFiles = action.payload
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Создание поста
      .addCase(createPost.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false

        // ✅ API возвращает объект с полями message и message_post
        const { message, message_post } = action.payload

        const newPost = {
          id: message.id,
          author_id: message.author_id,
          theme_id: message.theme_id,
          section_code: message.section_code,
          text: message.text,
          type: message.type,
          created_at: message.created_at,
          updated_at: message.updated_at,
          media_files_ids: message.media_files_ids || [],
          is_openai_generated: message_post?.is_openai_generated || false,
          ratio: message_post?.ratio || 99,
          // TODO: Добавить reactions когда будет известна структура
        }

        state.posts.unshift(newPost)
        state.preview = null
        state.uploadedFiles = []
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Создание превью
      .addCase(createPostPreview.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createPostPreview.fulfilled, (state, action) => {
        state.loading = false
        state.preview = action.payload
      })
      .addCase(createPostPreview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Получение постов
      .addCase(fetchPostsInSection.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPostsInSection.fulfilled, (state, action) => {
        state.loading = false
        state.postsLoaded = true

        // ✅ API возвращает массив объектов с полями message и message_post
        const newPosts = (action.payload || []).map(item => ({
          id: item.message.id,
          author_id: item.message.author_id,
          theme_id: item.message.theme_id,
          section_code: item.message.section_code,
          text: item.message.text,
          type: item.message.type,
          created_at: item.message.created_at,
          updated_at: item.message.updated_at,
          media_files_ids: item.message.media_files_ids || [],
          is_openai_generated: item.message_post?.is_openai_generated || false,
          ratio: item.message_post?.ratio || 99,
          // TODO: Добавить reactions когда будет известна структура
        }))

        state.posts = newPosts
      })
      .addCase(fetchPostsInSection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.posts = []
        state.postsLoaded = false
      })

      // Получение конкретного поста
      .addCase(fetchPostById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false
        const { message, message_post } = action.payload

        state.selectedPost = {
          id: message.id,
          author_id: message.author_id,
          theme_id: message.theme_id,
          section_code: message.section_code,
          text: message.text,
          type: message.type,
          created_at: message.created_at,
          updated_at: message.updated_at,
          media_files_ids: message.media_files_ids || [],
          is_openai_generated: message_post?.is_openai_generated || false,
          ratio: message_post?.ratio || 99,
        }
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Получение комментариев
      .addCase(fetchPostComments.pending, (state, action) => {
        const postId = action.meta.arg.post_id
        state.commentsLoading = true
        state.commentError = null
        state.commentsLoadingFlags[postId] = true
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload
        state.commentsLoading = false
        state.commentsLoadingFlags[postId] = false

        state.comments[postId] = comments || []

        // Обновляем счетчик комментариев в посте
        const postIndex = state.posts.findIndex(post => post.id === postId)
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            comments_count: comments ? comments.length : 0,
          }
        }

        console.log('✅ Комментарии сохранены в store:', {
          postId,
          commentsCount: comments?.length || 0,
        })
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        const postId = action.meta.arg?.post_id
        state.commentsLoading = false
        state.commentError = action.payload
        if (postId) {
          state.commentsLoadingFlags[postId] = false
        }
      })

      .addCase(createComment.pending, state => {
        state.commentsLoading = true
        state.commentError = null
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.commentsLoading = false
        const { message, message_comment, post_id } = action.payload

        const newComment = {
          id: message.id,
          author_id: message.author_id,
          theme_id: message.theme_id,
          section_code: message.section_code,
          text: message.text,
          type: message.type,
          created_at: message.created_at,
          updated_at: message.updated_at,
          media_files_ids: message.media_files_ids || [],
          content_id: message_comment?.content_id || null, // ← ID поста
          reply_to_message_id: message_comment?.reply_to_message_id || null, // ← ID родительского комментария
        }

        if (!state.comments[post_id]) {
          state.comments[post_id] = []
        }

        state.comments[post_id].push(newComment)

        // Обновляем счетчик комментариев в постах
        const postIndex = state.posts.findIndex(post => post.id === post_id)
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            comments_count: (state.posts[postIndex].comments_count || 0) + 1,
          }
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.commentsLoading = false
        state.commentError = action.payload
      })
      // Реакции на пост
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { post_id, count_likes, count_dislikes, new_reaction } = action.payload
        console.log('📊 Обновляем реакции:', {
          post_id,
          count_likes,
          count_dislikes,
          new_reaction,
        })

        // Обновляем в списке постов
        const postIndex = state.posts.findIndex(post => post.id === post_id)
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            likes: count_likes,
            dislikes: count_dislikes,
            user_reaction: new_reaction,
          }
        }

        // Обновляем выбранный пост
        if (state.selectedPost && state.selectedPost.id === post_id) {
          state.selectedPost = {
            ...state.selectedPost,
            likes: count_likes,
            dislikes: count_dislikes,
            user_reaction: new_reaction,
          }
        }

        // Обновляем реакции в комментариях
        Object.keys(state.comments).forEach(postKey => {
          const postComments = state.comments[postKey]
          if (postComments && Array.isArray(postComments)) {
            const commentIndex = postComments.findIndex(comment => comment.id === post_id)
            if (commentIndex !== -1) {
              state.comments[postKey][commentIndex] = {
                ...state.comments[postKey][commentIndex],
                likes: count_likes,
                dislikes: count_dislikes,
                user_reaction: new_reaction,
              }
            }
          }
        })
      })
      .addCase(reactToPost.rejected, (state, action) => {
        console.error('❌ Ошибка при отправке реакции:', action.payload)
        state.error = action.payload
      })

      // Загрузка файлов
      .addCase(fetchDownloadUrl.fulfilled, (state, action) => {
        const { attachmentUrl, url } = action.payload
        state.fileLinks = {
          ...state.fileLinks,
          [attachmentUrl]: url,
        }
      })
      .addCase(fetchDownloadUrl.rejected, (state, action) => {
        console.warn('Ошибка загрузки файла:', action.payload)
      })
      // Создание задачи
      .addCase(createTask.pending, state => {
        state.tasksLoading = true
        state.taskError = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasksLoading = false

        const { message, message_post } = action.payload

        const newTask = {
          id: message.id,
          author_id: message.author_id,
          theme_id: message.theme_id,
          section_code: message.section_code,
          text: message.text,
          type: 'task', // ← ВАЖНО
          created_at: message.created_at,
          updated_at: message.updated_at,
          media_files_ids: message.media_files_ids || [],
          ratio: message_post?.ratio || null,
          status: 'idle',
          is_partially: false,
          expires_at: null,
        }

        state.posts.unshift(newTask)
        state.preview = null
        state.uploadedFiles = []
      })
      .addCase(createTask.rejected, (state, action) => {
        state.tasksLoading = false
        state.taskError = action.payload
      })
      // Получение задач
      .addCase(fetchTasks.pending, state => {
        state.tasksLoading = true
        state.taskError = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasksLoading = false

        const tasks = (action.payload || []).map(item => ({
          id: item.message.id,
          author_id: item.message.author_id,
          theme_id: item.message.theme_id,
          section_code: item.message.section_code,
          text: item.message.text,
          type: 'task', // ← ВАЖНО
          created_at: item.message.created_at,
          updated_at: item.message.updated_at,
          media_files_ids: item.message.media_files_ids || [],
          ratio: item.message_post?.ratio || null,
          is_partially: item.message_task?.is_partially || false,
          status: item.message_task?.status || 'idle',
          expires_at: item.message_task?.expires_at || null,
        }))

        // Заменяем только задачи в posts
        state.posts = state.posts.filter(p => p.type !== 'task').concat(tasks)
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.tasksLoading = false
        state.taskError = action.payload
      })

      .addCase(acceptTask.pending, state => {
        state.tasksLoading = true
        state.taskError = null
      })

      .addCase(acceptTask.fulfilled, (state, action) => {
        state.tasksLoading = false

        const { task_message_id, message, message_task } = action.payload

        // Обновляем задачу в списке
        const taskIndex = state.posts.findIndex(post => post.id === task_message_id)
        if (taskIndex !== -1) {
          state.posts[taskIndex] = {
            ...state.posts[taskIndex],
            status: message_task?.status || 'in_progress',
            is_partially: message_task?.is_partially || false,
            expires_at: message_task?.expires_at || null,
            executor_description: message?.text || '',
          }
        }
      })
      .addCase(acceptTask.rejected, (state, action) => {
        state.tasksLoading = false
        state.taskError = action.payload
      })

      // Завершение задачи
      .addCase(completeTask.pending, state => {
        state.tasksLoading = true
        state.taskError = null
      })

      .addCase(completeTask.fulfilled, (state, action) => {
        state.tasksLoading = false

        const { task_message_id } = action.payload

        // Обновляем статус на completed
        const taskIndex = state.posts.findIndex(post => post.id === task_message_id)
        if (taskIndex !== -1) {
          state.posts[taskIndex] = {
            ...state.posts[taskIndex],
            status: 'completed',
          }
        }
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.tasksLoading = false
        state.taskError = action.payload
      })
  },
})

export const { clearError, clearPosts, clearComments, clearPreview, clearUploadedFiles, setCommentsLoadingFlag } = postSlice.actions

// ✅ Селекторы
export const selectPosts = state => state.post.posts
export const selectSelectedPost = state => state.post.selectedPost
export const selectComments = postId => state => state.post.comments[postId] || []
export const selectPostsLoading = state => state.post.loading
export const selectPostsError = state => state.post.error
export const selectPreview = state => state.post.preview
export const selectTasks = state => state.post.posts.filter(p => p.type === 'task')

export default postSlice.reducer