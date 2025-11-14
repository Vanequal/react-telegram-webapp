import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '@/shared/api/axios'

// ============================================================================
// ФАЙЛЫ
// ============================================================================

// ✅ Загрузка файлов через /upload_files
export const uploadFiles = createAsyncThunk('post/uploadFiles', async (files, { rejectWithValue }) => {
  try {
    if (!files || files.length === 0) {
      return []
    }

    console.log('📤 Загружаем файлы:', files.length)

    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file) // ← Согласно Swagger параметр называется 'files'
    })

    const res = await axios.post('/api/v1/messages/upload_files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('✅ Файлы загружены, получены IDs:', res.data)
    return res.data // Возвращает массив UUID
  } catch (err) {
    console.error('🔥 Ошибка загрузки файлов:', err?.response?.data || err.message)
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки файлов')
  }
})

// ============================================================================
// ПОСТЫ (POSTS)
// ============================================================================

// ✅ Создание поста
export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section_code, theme_id, is_openai_generated = false, ratio = 1, files = [] }, { rejectWithValue, dispatch }) => {
    try {
      // Сначала загружаем файлы, если они есть
      let uploadedFileIds = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFileIds = uploadResult || []
      }

      // ✅ Готовим данные согласно Swagger
      const requestData = {
        type: 'post',
        text: message_text,
        media_file_ids: uploadedFileIds,
        is_openai_generated: is_openai_generated,
        ratio: ratio,
      }

      console.log('📤 Создание поста:', {
        url: `/api/v1/messages/${section_code}/posts`,
        data: requestData,
        params: { theme_id },
      })

      const res = await axios.post(`/api/v1/messages/${section_code}/posts`, requestData, {
        params: { theme_id },
      })

      console.log('✅ Пост создан:', res.data)

      return {
        ...res.data,
        uploaded_file_ids: uploadedFileIds,
      }
    } catch (err) {
      console.error('🔥 Ошибка создания поста:', err?.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.detail || 'Ошибка создания поста')
    }
  }
)

// ✅ Получение постов в секции
export const fetchPostsInSection = createAsyncThunk(
  'post/fetchPostsInSection',
  async ({ section_code, theme_id, limit = 100, offset = 0 }, { rejectWithValue }) => {
    try {
      console.log('📥 Загрузка постов:', { section_code, theme_id, limit, offset })

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
  }
)

// ✅ Получение конкретного поста (если есть такой endpoint)
export const fetchPostById = createAsyncThunk(
  'post/fetchPostById',
  async ({ message_id, section_code, theme_id }, { rejectWithValue }) => {
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
  }
)

// ============================================================================
// КОММЕНТАРИИ (COMMENTS)
// ============================================================================

// ✅ Создание комментария
export const createComment = createAsyncThunk(
  'post/createComment',
  async ({ post_id, message_text, section_code, theme_id, reply_to_message_id = null, files = [] }, { rejectWithValue, dispatch }) => {
    try {
      // Загружаем файлы если есть
      let uploadedFileIds = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFileIds = uploadResult || []
      }

      console.log('📤 Создание комментария:', {
        text: message_text,
        content_id: post_id,
        reply_to_message_id,
        section_code,
        theme_id,
        files_count: uploadedFileIds.length,
      })

      // ✅ Структура данных согласно Swagger для комментариев
      const requestData = {
        type: 'comment',
        text: message_text,
        media_file_ids: uploadedFileIds,
        content_id: post_id, // ← ID поста к которому комментарий
        reply_to_message_id: reply_to_message_id, // ← ID комментария (для replies)
      }

      const res = await axios.post(`/api/v1/messages/${section_code}/comments`, requestData, {
        params: { theme_id },
      })

      console.log('✅ Комментарий создан:', res.data)

      return {
        ...res.data,
        post_id: post_id,
        uploaded_file_ids: uploadedFileIds,
      }
    } catch (err) {
      console.error('🔥 Ошибка создания комментария:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка добавления комментария')
    }
  }
)

// ✅ Получение комментариев
export const fetchPostComments = createAsyncThunk(
  'post/fetchComments',
  async ({ post_id, section_code, theme_id, limit = 100, offset = 0 }, { rejectWithValue }) => {
    try {
      console.log('📥 Загрузка комментариев:', {
        post_id,
        section_code,
        theme_id,
      })

      const res = await axios.get(`/api/v1/messages/${section_code}/comments`, {
        params: {
          theme_id,
          limit,
          offset,
        },
      })

      // ✅ Фильтруем комментарии для конкретного поста по content_id
      const allComments = res.data || []
      const postComments = allComments.filter(item => item.message_comment?.content_id === post_id)

      console.log('✅ Комментарии загружены:', {
        total: allComments.length,
        forThisPost: postComments.length,
      })

      return { postId: post_id, comments: postComments }
    } catch (err) {
      console.error('🔥 Ошибка загрузки комментариев:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев')
    }
  }
)

// ============================================================================
// ЗАДАЧИ (TASKS)
// ============================================================================

// ✅ Создание задачи (через /posts endpoint!)
// Endpoint /tasks используется только для принятия в работу!
export const createTask = createAsyncThunk(
  'post/createTask',
  async ({ message_text, section_code, theme_id, ratio = null, files = [] }, { rejectWithValue, dispatch }) => {
    try {
      // Сначала загружаем файлы
      let uploadedFileIds = []
      if (files && files.length > 0) {
        console.log('📤 Загружаем файлы для задачи:', files.length)
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFileIds = uploadResult || []
        console.log('✅ Файлы загружены, IDs:', uploadedFileIds)
      }

      console.log('📤 Создание задачи через /posts:', {
        text: message_text,
        section_code,
        theme_id,
        ratio,
        files_count: uploadedFileIds.length,
      })

      // ✅ Создаем задачу через /posts endpoint!
      // Задача = это пост с ratio
      const requestData = {
        type: 'post',
        text: message_text,
        media_file_ids: uploadedFileIds,
        is_openai_generated: false,
        ratio: ratio || 1, // Задача отличается от обычного поста наличием ratio
      }

      console.log('📋 Отправляем данные в /posts:', requestData)

      // ⚠️ ВАЖНО: Создаем через /posts, а не через /tasks!
      const res = await axios.post(`/api/v1/messages/${section_code}/posts`, requestData, {
        params: { theme_id },
      })

      console.log('✅ Задача создана через /posts, ответ от API:', res.data)
      console.log('📊 Структура ответа:', {
        message: res.data.message,
        message_post: res.data.message_post,
        ratio: res.data.message_post?.ratio,
      })

      return {
        ...res.data,
        ratio: ratio, // Сохраняем для совместимости
        uploaded_file_ids: uploadedFileIds,
      }
    } catch (err) {
      console.error('🔥 Ошибка создания задачи:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка создания задачи')
    }
  }
)

// ✅ Получение задач
// Задачи = это посты с ratio, получаем через /posts endpoint
export const fetchTasks = createAsyncThunk(
  'post/fetchTasks',
  async ({ section_code, theme_id, limit = 100, offset = 0 }, { rejectWithValue }) => {
    try {
      console.log('📥 Загрузка задач (через /posts с фильтрацией по ratio):', { 
        section_code, 
        theme_id, 
        limit, 
        offset 
      })

      // ⚠️ Получаем через /posts, затем фильтруем по ratio
      const res = await axios.get(`/api/v1/messages/${section_code}/posts`, {
        params: {
          theme_id,
          limit,
          offset,
        },
      })

      // Фильтруем только те посты, у которых есть ratio (это задачи)
      const allPosts = res.data || []
      const tasks = allPosts.filter(item => {
        const ratio = item.message_post?.ratio
        return ratio && ratio > 0 // Задача = пост с ratio > 0
      })

      console.log('✅ Получено постов:', allPosts.length)
      console.log('✅ Из них задач (с ratio):', tasks.length)
      
      return tasks
    } catch (err) {
      console.error('🔥 Ошибка загрузки задач:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки задач')
    }
  }
)

// ✅ Взять задачу в работу (или создать исполнение задачи)
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
      // Используем тот же endpoint /tasks для создания исполнения
      const requestData = {
        type: 'task',
        text: description, // Описание того, что будет делать исполнитель
        media_file_ids: [],
        is_partially: is_partially,
      }

      // ✅ Добавляем expires_at только если он указан
      if (expires_at) {
        requestData.expires_at = expires_at
      }

      // TODO: Уточнить у бэкендера - нужен ли отдельный endpoint или параметр message_id
      const res = await axios.post(`/api/v1/messages/${section_code}/tasks`, requestData, {
        params: {
          theme_id,
          message_id: task_message_id, // ← ID задачи которую берем (если поддерживается)
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

// ✅ Отметить задачу как выполненную (создаем комментарий с результатами)
export const completeTask = createAsyncThunk(
  'post/completeTask',
  async ({ task_message_id, section_code, theme_id, description, files = [] }, { rejectWithValue, dispatch }) => {
    try {
      // Загружаем файлы результата
      let uploadedFileIds = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFileIds = uploadResult || []
      }

      console.log('📤 Отмечаем задачу выполненной:', {
        task_message_id,
        description,
        files_count: uploadedFileIds.length,
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
        uploaded_file_ids: uploadedFileIds,
      }
    } catch (err) {
      console.error('🔥 Ошибка завершения задачи:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка завершения задачи')
    }
  }
)

// ============================================================================
// OPENAI / ПРЕВЬЮ
// ============================================================================

// ✅ Создание превью поста через OpenAI
export const createPostPreview = createAsyncThunk(
  'post/createPreview',
  async ({ section_code, theme_id, text }, { rejectWithValue }) => {
    try {
      console.log('📤 Запрос превью от OpenAI:', { section_code, theme_id, text })

      const res = await axios.post(
        `/api/v1/messages/openai`,
        { text },
        {
          params: {
            section_code,
            theme_id,
          },
        }
      )

      console.log('✅ Превью получено:', res.data)

      return {
        original_text: res.data.original_text,
        openai_text: res.data.openai_text,
      }
    } catch (err) {
      console.error('🔥 Ошибка создания превью:', err?.response?.data || err.message)

      // ✅ Обработка случая когда OpenAI отключен (status 403)
      if (err?.response?.status === 403) {
        return rejectWithValue('OpenAI временно недоступен')
      }

      return rejectWithValue(err.response?.data?.detail || 'Ошибка предпросмотра поста')
    }
  }
)

// ============================================================================
// РЕАКЦИИ
// ============================================================================

// ✅ Реакция на пост/комментарий
// TODO: Этот endpoint не указан в новом Swagger - нужно уточнить у бэкендера
export const reactToPost = createAsyncThunk(
  'post/reactToPost',
  async ({ post_id, reaction, section_code, theme_id }, { rejectWithValue }) => {
    try {
      console.log('📤 Отправляем реакцию:', {
        message_id: post_id,
        reaction,
        section_code,
        theme_id,
      })

      // TODO: Уточнить правильный endpoint для реакций
      const res = await axios.patch(
        `/api/v1/messages/${post_id}/update_reaction`,
        { reaction },
        {
          params: {
            section_code,
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
  }
)

// ============================================================================
// ФАЙЛЫ / ССЫЛКИ
// ============================================================================

// ✅ Получение ссылки на файл
export const fetchDownloadUrl = createAsyncThunk(
  'post/fetchDownloadUrl',
  async ({ attachmentUrl }, { rejectWithValue }) => {
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
  }
)

// ============================================================================
// SLICE
// ============================================================================

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
      state.taskError = null
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
      // ========================================================================
      // ЗАГРУЗКА ФАЙЛОВ
      // ========================================================================
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

      // ========================================================================
      // СОЗДАНИЕ ПОСТА
      // ========================================================================
      .addCase(createPost.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false

        const { message, message_post } = action.payload

        const newPost = {
          id: message.id,
          author_id: message.author_id,
          theme_id: message.theme_id,
          section_code: message.section_code,
          text: message.text,
          type: 'post', // Локально ставим тип для фильтрации
          created_at: message.created_at,
          updated_at: message.updated_at,
          media_file_ids: message.media_file_ids || [],
          is_openai_generated: message_post?.is_openai_generated || false,
          ratio: message_post?.ratio || 1,
        }

        state.posts.unshift(newPost)
        state.preview = null
        state.uploadedFiles = []
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ========================================================================
      // ПОЛУЧЕНИЕ ПОСТОВ
      // ========================================================================
      .addCase(fetchPostsInSection.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPostsInSection.fulfilled, (state, action) => {
        state.loading = false
        state.postsLoaded = true

        const newPosts = (action.payload || []).map(item => ({
          id: item.message.id,
          author_id: item.message.author_id,
          theme_id: item.message.theme_id,
          section_code: item.message.section_code,
          text: item.message.text,
          type: 'post', // Локально ставим тип
          created_at: item.message.created_at,
          updated_at: item.message.updated_at,
          media_file_ids: item.message.media_file_ids || [],
          is_openai_generated: item.message_post?.is_openai_generated || false,
          ratio: item.message_post?.ratio || 1,
        }))

        state.posts = newPosts
      })
      .addCase(fetchPostsInSection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.posts = []
        state.postsLoaded = false
      })

      // ========================================================================
      // ПОЛУЧЕНИЕ КОНКРЕТНОГО ПОСТА
      // ========================================================================
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
          type: 'post',
          created_at: message.created_at,
          updated_at: message.updated_at,
          media_file_ids: message.media_file_ids || [],
          is_openai_generated: message_post?.is_openai_generated || false,
          ratio: message_post?.ratio || 1,
        }
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ========================================================================
      // ПОЛУЧЕНИЕ КОММЕНТАРИЕВ
      // ========================================================================
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

        state.comments[postId] = (comments || []).map(item => ({
          id: item.message.id,
          author_id: item.message.author_id,
          theme_id: item.message.theme_id,
          section_code: item.message.section_code,
          text: item.message.text,
          type: 'comment',
          created_at: item.message.created_at,
          updated_at: item.message.updated_at,
          media_file_ids: item.message.media_file_ids || [],
          content_id: item.message_comment?.content_id || null,
          reply_to_message_id: item.message_comment?.reply_to_message_id || null,
        }))

        // Обновляем счетчик комментариев в посте
        const postIndex = state.posts.findIndex(post => post.id === postId)
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            comments_count: state.comments[postId].length,
          }
        }

        console.log('✅ Комментарии сохранены в store:', {
          postId,
          commentsCount: state.comments[postId].length,
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

      // ========================================================================
      // СОЗДАНИЕ КОММЕНТАРИЯ
      // ========================================================================
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
          type: 'comment',
          created_at: message.created_at,
          updated_at: message.updated_at,
          media_file_ids: message.media_file_ids || [],
          content_id: message_comment?.content_id || null,
          reply_to_message_id: message_comment?.reply_to_message_id || null,
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

      // ========================================================================
      // СОЗДАНИЕ ЗАДАЧИ
      // ========================================================================
      .addCase(createTask.pending, state => {
        state.tasksLoading = true
        state.taskError = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasksLoading = false

        // ⚠️ Теперь создание через /posts, поэтому структура ответа другая
        const { message, message_post, ratio } = action.payload

        console.log('✅ Сохраняем задачу в store (создана через /posts):', {
          id: message.id,
          text: message.text,
          ratio: ratio || message_post?.ratio,
        })

        const newTask = {
          id: message.id,
          author_id: message.author_id,
          theme_id: message.theme_id,
          section_code: message.section_code,
          text: message.text,
          type: 'task', // Локально ставим тип task (хотя создано через /posts)
          created_at: message.created_at,
          updated_at: message.updated_at,
          media_file_ids: message.media_file_ids || [],
          ratio: ratio || message_post?.ratio || 1, // Из payload или message_post
          
          // ✅ Статус по умолчанию 'idle' т.к. задача только создана
          // message_post не содержит информации о статусе задачи
          status: 'idle',
          is_partially: false,
          expires_at: null, // При создании через /posts нет expires_at
          
          // Дополнительные поля от message_post
          is_openai_generated: message_post?.is_openai_generated || false,
        }

        console.log('📦 Объект задачи для store:', newTask)

        state.posts.unshift(newTask)
        state.preview = null
        state.uploadedFiles = []

        console.log('✅ Задача добавлена в store, всего постов:', state.posts.length)
        console.log('🔍 Статус добавленной задачи:', newTask.status)
      })
      .addCase(createTask.rejected, (state, action) => {
        state.tasksLoading = false
        state.taskError = action.payload
        console.error('❌ Ошибка при создании задачи:', action.payload)
      })

      // ========================================================================
      // ПОЛУЧЕНИЕ ЗАДАЧ
      // ========================================================================
      .addCase(fetchTasks.pending, state => {
        state.tasksLoading = true
        state.taskError = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasksLoading = false

        // ⚠️ Теперь задачи = посты с ratio
        const tasks = (action.payload || []).map(item => ({
          id: item.message.id,
          author_id: item.message.author_id,
          theme_id: item.message.theme_id,
          section_code: item.message.section_code,
          text: item.message.text,
          type: 'task', // Локально ставим тип task для фильтрации
          created_at: item.message.created_at,
          updated_at: item.message.updated_at,
          media_file_ids: item.message.media_file_ids || [],
          ratio: item.message_post?.ratio || 1,
          is_openai_generated: item.message_post?.is_openai_generated || false,
          
          // ✅ Статус задачи определяем по наличию message_task
          // Если есть message_task - значит кто-то взялся за задачу
          status: item.message_task ? (item.message_task.status || 'in_progress') : 'idle',
          is_partially: item.message_task?.is_partially || false,
          expires_at: item.message_task?.expires_at || null,
        }))

        console.log('✅ Загружено задач:', tasks.length)
        console.log('📊 Статусы задач:', tasks.map(t => ({ id: t.id, status: t.status })))

        // Заменяем только задачи, оставляя другие типы постов
        state.posts = state.posts.filter(p => p.type !== 'task').concat(tasks)
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.tasksLoading = false
        state.taskError = action.payload
      })

      // ========================================================================
      // ПРИНЯТИЕ ЗАДАЧИ В РАБОТУ
      // ========================================================================
      .addCase(acceptTask.pending, state => {
        state.tasksLoading = true
        state.taskError = null
      })
      .addCase(acceptTask.fulfilled, (state, action) => {
        state.tasksLoading = false

        const { task_message_id, message, message_task } = action.payload

        console.log('✅ Обновляем задачу в store после принятия:', task_message_id)

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

      // ========================================================================
      // ЗАВЕРШЕНИЕ ЗАДАЧИ
      // ========================================================================
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

      // ========================================================================
      // ПРЕВЬЮ ОТ OPENAI
      // ========================================================================
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

      // ========================================================================
      // РЕАКЦИИ
      // ========================================================================
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

      // ========================================================================
      // ЗАГРУЗКА ССЫЛОК НА ФАЙЛЫ
      // ========================================================================
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
  },
})

// ============================================================================
// EXPORTS
// ============================================================================

export const { clearError, clearPosts, clearComments, clearPreview, clearUploadedFiles, setCommentsLoadingFlag } = postSlice.actions

// Селекторы
export const selectPosts = state => state.post.posts
export const selectSelectedPost = state => state.post.selectedPost
export const selectComments = postId => state => state.post.comments[postId] || []
export const selectPostsLoading = state => state.post.loading
export const selectPostsError = state => state.post.error
export const selectPreview = state => state.post.preview
export const selectTasks = state => state.post.posts.filter(p => p.type === 'task')
export const selectTasksLoading = state => state.post.tasksLoading
export const selectTaskError = state => state.post.taskError
export const selectCommentsLoading = state => state.post.commentsLoading
export const selectCommentError = state => state.post.commentError

export default postSlice.reducer