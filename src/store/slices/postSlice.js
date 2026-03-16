import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import axios from '@/shared/api/axios'
import logger from '@/shared/utils/logger'

// ============================================================================
// ФАЙЛЫ
// ============================================================================

// Вспомогательная функция: получить section_id и theme_id из state
const resolveIds = (state, section_code, section_id, theme_id) => {
  const sections = state.theme?.sections || []
  const resolvedSectionId = section_id
    || sections.find(s => s.section_code === section_code)?.section_id
  const rootThemeId = state.theme?.theme?.id
  // Если theme_id — не UUID (например число 1), используем id корневой темы
  const resolvedThemeId = (theme_id && typeof theme_id === 'string' && theme_id.length > 10)
    ? theme_id
    : rootThemeId
  return { resolvedSectionId, resolvedThemeId }
}

// Загрузка файлов через /api/v1/media_files/uploads
export const uploadFiles = createAsyncThunk('post/uploadFiles', async (files, { rejectWithValue }) => {
  try {
    if (!files || files.length === 0) {
      return []
    }

    logger.log('📤 Загружаем файлы:', files.length)

    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    // Используем fetch напрямую, чтобы браузер сам выставил Content-Type: multipart/form-data с boundary
    const baseURL = axios.defaults.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const token = sessionStorage.getItem('token')

    const fetchRes = await fetch(`${baseURL}/api/v1/media_files/uploads`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    if (!fetchRes.ok) {
      const errorData = await fetchRes.json().catch(() => ({}))
      logger.error('🔥 Ошибка загрузки файлов:', fetchRes.status, errorData)
      return rejectWithValue(errorData?.detail || `Ошибка загрузки файлов (${fetchRes.status})`)
    }

    const uuids = await fetchRes.json()
    logger.log('✅ Файлы загружены, получены IDs:', uuids)

    // Сохраняем соответствие UUID → оригинальное имя файла в sessionStorage
    try {
      const existing = JSON.parse(sessionStorage.getItem('mediaFileNames') || '{}')
      files.forEach((file, idx) => {
        if (uuids[idx]) existing[uuids[idx]] = file.name
      })
      sessionStorage.setItem('mediaFileNames', JSON.stringify(existing))
    } catch (_) {}

    return uuids
  } catch (err) {
    logger.error('🔥 Ошибка загрузки файлов:', err?.response?.data || err.message)
    return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки файлов')
  }
})

// ============================================================================
// ПОСТЫ (POSTS)
// ============================================================================

// Создание поста
export const createPost = createAsyncThunk(
  'post/create',
  async ({ message_text, section_code, section_id, theme_id, is_openai_generated = false, files = [] }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { resolvedSectionId, resolvedThemeId } = resolveIds(getState(), section_code, section_id, theme_id)

      let uploadedFileIds = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFileIds = uploadResult || []
      }

      const requestData = {
        text: message_text,
        media_file_ids: uploadedFileIds,
        is_openai_generated: is_openai_generated,
      }

      logger.log('📤 Создание поста:', { theme_id: resolvedThemeId, section_id: resolvedSectionId })

      const res = await axios.post('/api/v1/messages/posts', requestData, {
        params: { theme_id: resolvedThemeId, section_id: resolvedSectionId },
      })

      // API возвращает только { id }, загружаем полный пост
      const postRes = await axios.get(`/api/v1/messages/posts/${res.data.id}`, {
        params: { post_id: res.data.id },
      })

      logger.log('✅ Пост создан:', postRes.data)
      return { post: postRes.data, section_code }
    } catch (err) {
      logger.error('🔥 Ошибка создания поста:', err?.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.detail || 'Ошибка создания поста')
    }
  }
)

// Получение постов в секции
export const fetchPostsInSection = createAsyncThunk(
  'post/fetchPostsInSection',
  async ({ section_code, section_id, theme_id, limit = 100, offset = 0 }, { rejectWithValue, getState }) => {
    try {
      const { resolvedSectionId, resolvedThemeId } = resolveIds(getState(), section_code, section_id, theme_id)
      logger.log('📥 Загрузка постов:', { section_code, section_id: resolvedSectionId, theme_id: resolvedThemeId })

      const res = await axios.get('/api/v1/messages/posts', {
        params: { theme_id: resolvedThemeId, section_id: resolvedSectionId, limit, offset },
      })

      logger.log('✅ Посты загружены:', res.data?.length || 0)
      return res.data
    } catch (err) {
      logger.error('🔥 Ошибка загрузки постов:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки постов')
    }
  }
)

// Получение конкретного поста
export const fetchPostById = createAsyncThunk(
  'post/fetchPostById',
  async ({ message_id }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/v1/messages/posts/${message_id}`, {
        params: { post_id: message_id },
      })
      return res.data
    } catch (err) {
      logger.error('🔥 Ошибка загрузки поста:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || err?.message || 'Ошибка загрузки поста')
    }
  }
)

// ============================================================================
// КОММЕНТАРИИ (COMMENTS)
// ============================================================================

// Создание комментария
export const createComment = createAsyncThunk(
  'post/createComment',
  async ({ post_id, message_text, section_code, section_id, theme_id, reply_to_message_id = null, files = [] }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { resolvedSectionId, resolvedThemeId } = resolveIds(getState(), section_code, section_id, theme_id)

      let uploadedFileIds = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFileIds = uploadResult || []
      }

      const requestData = {
        text: message_text || '',
        is_openai_generated: false,
        media_file_ids: uploadedFileIds,
      }
      if (reply_to_message_id) {
        requestData.reply_to_message_id = reply_to_message_id
      }

      // POST /api/v1/messages/{content_id}/comments?theme_id=...&section_id=...&message_id=...
      const res = await axios.post(`/api/v1/messages/${post_id}/comments`, requestData, {
        params: { theme_id: resolvedThemeId, section_id: resolvedSectionId, message_id: post_id },
      })

      logger.log('✅ Комментарий создан:', res.data)
      return { id: res.data.id, post_id }
    } catch (err) {
      logger.error('🔥 Ошибка создания комментария:', err?.response?.data || err.message)
      const errorDetail = err.response?.data?.detail
      const errorMsg = Array.isArray(errorDetail)
        ? errorDetail.map(e => `${e.loc?.join('.')}: ${e.msg}`).join('; ')
        : (errorDetail || 'Ошибка добавления комментария')
      return rejectWithValue(errorMsg)
    }
  }
)

// Получение комментариев
export const fetchPostComments = createAsyncThunk(
  'post/fetchComments',
  async ({ post_id, section_code, section_id, theme_id, limit = 100, offset = 0 }, { rejectWithValue, getState }) => {
    try {
      logger.log('📥 Загрузка комментариев:', { post_id })

      // GET /api/v1/messages/{content_id}/comments?message_id=...
      const res = await axios.get(`/api/v1/messages/${post_id}/comments`, {
        params: { message_id: post_id, limit, offset },
      })

      const postComments = res.data || []
      logger.log('✅ Комментарии загружены:', postComments.length)
      return { postId: post_id, comments: postComments }
    } catch (err) {
      logger.error('🔥 Ошибка загрузки комментариев:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки комментариев')
    }
  }
)

// ============================================================================
// ЗАДАЧИ (TASKS)
// ============================================================================

// Создание задачи через /api/v1/messages/tasks
export const createTask = createAsyncThunk(
  'post/createTask',
  async ({ message_text, section_code, section_id, theme_id, ratio = 1, files = [] }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { resolvedSectionId, resolvedThemeId } = resolveIds(getState(), section_code, section_id, theme_id)

      let uploadedFileIds = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFileIds = uploadResult || []
      }

      const requestData = {
        text: message_text,
        media_file_ids: uploadedFileIds,
        is_openai_generated: false,
        ratio: ratio || 1,
      }

      logger.log('📤 Создание задачи:', { theme_id: resolvedThemeId, section_id: resolvedSectionId })

      const res = await axios.post('/api/v1/messages/tasks', requestData, {
        params: { theme_id: resolvedThemeId, section_id: resolvedSectionId },
      })

      // API возвращает только { id }, загружаем полную задачу
      const taskRes = await axios.get(`/api/v1/messages/tasks/${res.data.id}`, {
        params: { task_id: res.data.id },
      })

      logger.log('✅ Задача создана:', taskRes.data)
      return { task: taskRes.data, section_code }
    } catch (err) {
      logger.error('🔥 Ошибка создания задачи:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка создания задачи')
    }
  }
)

// Получение задач
export const fetchTasks = createAsyncThunk(
  'post/fetchTasks',
  async ({ section_code, section_id, theme_id, limit = 100, offset = 0 }, { rejectWithValue, getState }) => {
    try {
      const { resolvedSectionId, resolvedThemeId } = resolveIds(getState(), section_code, section_id, theme_id)
      logger.log('📥 Загрузка задач:', { section_code, section_id: resolvedSectionId })

      const tasksRes = await axios.get('/api/v1/messages/tasks', {
        params: { theme_id: resolvedThemeId, section_id: resolvedSectionId, limit, offset },
      })

      const tasks = tasksRes.data || []
      logger.log('✅ Получено задач:', tasks.length)

      // Для каждой задачи загружаем assignments (исполнения)
      const tasksWithAssignments = await Promise.all(
        tasks.map(async (task) => {
          try {
            const assignmentsRes = await axios.get(`/api/v1/messages/tasks/${task.id}/assignments`)
            const assignments = assignmentsRes.data || []
            return { ...task, assignments }
          } catch {
            return { ...task, assignments: [] }
          }
        })
      )

      return { tasks: tasksWithAssignments, section_code }
    } catch (err) {
      logger.error('🔥 Ошибка загрузки задач:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка загрузки задач')
    }
  }
)

// Взять задачу в работу (assignment)
export const acceptTask = createAsyncThunk(
  'post/acceptTask',
  async ({ task_message_id, section_code, section_id, theme_id, is_partially, description = '', expires_at }, { rejectWithValue, getState }) => {
    try {
      const { resolvedSectionId, resolvedThemeId } = resolveIds(getState(), section_code, section_id, theme_id)

      const requestData = {
        text: description || 'Берусь за задачу',
        media_file_ids: [],
        is_partially: !!is_partially,
      }
      if (expires_at) requestData.expires_at = expires_at

      // POST /api/v1/messages/tasks/{task_id}/assignment
      const res = await axios.post(`/api/v1/messages/tasks/${task_message_id}/assignment`, requestData, {
        params: { theme_id: resolvedThemeId, section_id: resolvedSectionId },
      })

      logger.log('✅ Задача взята в работу:', res.data)
      return { id: res.data.id, task_message_id }
    } catch (err) {
      logger.error('🔥 Ошибка принятия задачи:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка принятия задачи')
    }
  }
)

// Отметить задачу как выполненную
export const completeTask = createAsyncThunk(
  'post/completeTask',
  async ({ task_message_id, section_code, section_id, theme_id, description, files = [] }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { resolvedSectionId, resolvedThemeId } = resolveIds(getState(), section_code, section_id, theme_id)

      let uploadedFileIds = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFileIds = uploadResult || []
      }

      const requestData = {
        text: description || '',
        media_file_ids: uploadedFileIds,
        is_partially: false,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const res = await axios.post(`/api/v1/messages/tasks/${task_message_id}/assignment`, requestData, {
        params: { theme_id: resolvedThemeId, section_id: resolvedSectionId },
      })

      logger.log('✅ Задача выполнена:', res.data)
      return { task_message_id, completion_description: description, completion_files: files }
    } catch (err) {
      logger.error('🔥 Ошибка завершения задачи:', err?.response?.data || err.message)
      const errorMsg = err.response?.data?.detail || 'Ошибка завершения задачи'
      return rejectWithValue(typeof errorMsg === 'string' ? errorMsg : 'Ошибка завершения задачи')
    }
  }
)

// Создание комментария к задаче (через assignments endpoint)
export const createTaskComment = createAsyncThunk(
  'post/createTaskComment',
  async ({ post_id, message_text, section_code, section_id, theme_id, files = [] }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { resolvedSectionId, resolvedThemeId } = resolveIds(getState(), section_code, section_id, theme_id)

      let uploadedFileIds = []
      if (files && files.length > 0) {
        const uploadResult = await dispatch(uploadFiles(files)).unwrap()
        uploadedFileIds = uploadResult || []
      }

      const requestData = {
        text: message_text || '',
        media_file_ids: uploadedFileIds,
        is_partially: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const res = await axios.post(`/api/v1/messages/tasks/${post_id}/assignment`, requestData, {
        params: { theme_id: resolvedThemeId, section_id: resolvedSectionId },
      })

      logger.log('✅ Комментарий к задаче создан:', res.data)
      return { id: res.data.id, post_id }
    } catch (err) {
      logger.error('🔥 Ошибка добавления комментария к задаче:', err?.response?.data || err.message)
      const errorMsg = err.response?.data?.detail || 'Ошибка добавления комментария к задаче'
      return rejectWithValue(typeof errorMsg === 'string' ? errorMsg : 'Ошибка добавления комментария к задаче')
    }
  }
)

// ============================================================================
// OPENAI / ПРЕВЬЮ
// ============================================================================

// Улучшение текста через AI
export const createPostPreview = createAsyncThunk(
  'post/createPreview',
  async ({ section_code, section_id, theme_id, text }, { rejectWithValue, getState }) => {
    try {
      const { resolvedSectionId, resolvedThemeId } = resolveIds(getState(), section_code, section_id, theme_id)
      logger.log('📤 Запрос AI улучшения текста')

      const res = await axios.post(
        '/api/v1/messages/ai/improve_text',
        { text },
        { params: { theme_id: resolvedThemeId, section_id: resolvedSectionId } }
      )

      logger.log('✅ AI ответ получен:', res.data)

      // API возвращает { input_text, output_text }
      return {
        original_text: res.data.input_text,
        openai_text: res.data.output_text,
      }
    } catch (err) {
      logger.error('🔥 Ошибка AI улучшения текста:', err?.response?.data || err.message)

      // No response (CORS/network error) or known unavailability statuses → treat as unavailable
      if (!err?.response || err?.response?.status === 400 || err?.response?.status === 403 || err?.response?.status === 500 || err?.response?.status === 503) {
        return rejectWithValue('OpenAI временно недоступен')
      }

      const detail = err.response?.data?.detail
      const errorMsg = Array.isArray(detail)
        ? detail.map(e => `${e.loc?.join('.')}: ${e.msg}`).join('; ')
        : (detail || 'OpenAI временно недоступен')
      return rejectWithValue(errorMsg)
    }
  }
)

// ============================================================================
// РЕАКЦИИ
// ============================================================================

// Получение статистики реакций на сообщение
export const fetchMessageReactions = createAsyncThunk(
  'post/fetchMessageReactions',
  async ({ message_id }, { rejectWithValue }) => {
    try {
      // GET /api/v1/messages/{id}/reactions?message_id=...
      // Возвращает { reactions: {like: N, dislike: N}, total: N }
      const res = await axios.get(`/api/v1/messages/${message_id}/reactions`, {
        params: { message_id },
      })

      return {
        message_id,
        reactions: res.data?.reactions || {},
        total: res.data?.total || 0,
      }
    } catch (err) {
      logger.error('🔥 Ошибка загрузки реакций:', err?.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки реакций')
    }
  }
)

// Реакция на пост/комментарий
export const reactToPost = createAsyncThunk(
  'post/reactToPost',
  async ({ post_id, reaction }, { rejectWithValue, dispatch }) => {
    try {
      // PATCH /api/v1/messages/{id}/reaction?message_id=...
      // reaction = "like" | "dislike" | null (null = удалить реакцию)
      const res = await axios.patch(
        `/api/v1/messages/${post_id}/reaction`,
        { reaction },
        { params: { message_id: post_id } }
      )

      logger.log('📥 Реакция установлена:', res.data)
      // Обновляем счётчики реакций после отправки
      dispatch(fetchMessageReactions({ message_id: post_id }))
      return { post_id, reaction }
    } catch (err) {
      logger.error('🔥 Ошибка реакции:', err?.response?.data || err.message)
      return rejectWithValue(err.response?.data?.detail || 'Ошибка при отправке реакции')
    }
  }
)

// ============================================================================
// ФАЙЛЫ / ССЫЛКИ
// ============================================================================

// Получение вложений сообщения
// Примечание: медиафайлы теперь приходят в составе поста в поле media_files
// Этот метод оставлен для совместимости
export const fetchMessageAttachments = createAsyncThunk(
  'post/fetchMessageAttachments',
  async ({ message_id }, { rejectWithValue }) => {
    try {
      // Медиафайлы теперь включены в ответ поста (media_files: [{media_file_id, sort_order}])
      // Возвращаем пустой массив, чтобы не ломать существующий код
      return { message_id, attachments: [] }
    } catch (err) {
      return rejectWithValue('Ошибка загрузки вложений')
    }
  }
)

// ✅ Получение ссылки на файл
export const fetchDownloadUrl = createAsyncThunk(
  'post/fetchDownloadUrl',
  async ({ attachmentUrl }, { rejectWithValue }) => {
    try {
      const downloadUrl = `${axios.defaults.baseURL}/static/${attachmentUrl}`

      logger.log(`✅ Сформирован URL для файла:`, {
        original: attachmentUrl,
        downloadUrl: downloadUrl,
      })

      return { attachmentUrl, url: downloadUrl }
    } catch (err) {
      logger.error('🔥 Ошибка формирования URL файла:', err?.response?.data || err.message)
      return rejectWithValue(err?.response?.data?.detail || 'Ошибка загрузки ссылки')
    }
  }
)

// ============================================================================
// SLICE
// ============================================================================

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ МАППИНГА (новый плоский формат ответа API)
// ============================================================================

// Маппинг поста из нового API формата
const mapPost = (item, section_code = null) => ({
  id: item.id,
  author_id: item.author_id,
  theme_id: item.theme_id,
  section_id: item.section_id,
  section_code: section_code || null,
  text: item.text,
  type: 'post',
  created_at: item.created_at,
  updated_at: item.updated_at,
  media_files: item.media_files || [],
  is_openai_generated: item.is_openai_generated || false,
})

// Маппинг задачи из нового API формата с assignments
const mapTask = (item, assignments = [], section_code = null, existingTask = null) => {
  // assignments — плоский формат: { id, text, author_id, status, is_partially, expires_at, content_id }
  const sortedAssignments = [...assignments].sort((a, b) =>
    new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )
  const activeAssignment = sortedAssignments[0] || null

  const hasCompleted = assignments.some(a => a.status === 'completed' || a.is_partially === false)
  const wasCompleted = existingTask?.status === 'completed'

  let taskStatus = 'idle'
  if (hasCompleted || wasCompleted) {
    taskStatus = 'completed'
  } else if (assignments.length > 0) {
    taskStatus = activeAssignment?.status || 'in_progress'
  }

  // Формируем executions в виде совместимом со старым кодом страниц
  const executions = assignments.map(a => ({
    message: {
      id: a.id,
      author_id: a.author_id,
      text: a.text || '',
      created_at: a.created_at,
    },
    message_task: {
      status: a.status || 'in_progress',
      is_partially: a.is_partially,
      expires_at: a.expires_at,
    },
  }))

  return {
    id: item.id,
    author_id: item.author_id,
    theme_id: item.theme_id,
    section_id: item.section_id,
    section_code: section_code || null,
    text: item.text,
    type: 'task',
    created_at: item.created_at,
    updated_at: item.updated_at,
    media_files: item.media_files || [],
    ratio: item.ratio || 1,
    is_openai_generated: item.is_openai_generated || false,
    status: taskStatus,
    is_partially: activeAssignment?.is_partially || false,
    expires_at: activeAssignment?.expires_at || null,
    executions,
    comments_count: assignments.length,
    executor: activeAssignment ? { id: activeAssignment.author_id } : null,
    executor_description: activeAssignment?.text || '',
    completion_description: existingTask?.completion_description || '',
    completion_files: existingTask?.completion_files || [],
  }
}

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
        const { post, section_code } = action.payload
        if (post) {
          const newPost = mapPost(post, section_code)
          state.posts.unshift(newPost)
        }
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
        const section_code = action.meta.arg.section_code
        state.posts = (action.payload || []).map(item => mapPost(item, section_code))
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
        state.selectedPost = action.payload ? mapPost(action.payload) : null
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

        // Новый плоский формат комментариев
        state.comments[postId] = (comments || []).map(item => ({
          id: item.id,
          author_id: item.author_id,
          theme_id: item.theme_id,
          section_id: item.section_id,
          text: item.text,
          type: 'comment',
          created_at: item.created_at,
          updated_at: item.updated_at,
          media_files: item.media_files || [],
          content_id: item.content_id || null,
          reply_to_message_id: item.reply_to_message_id || null,
        }))

        const postIndex = state.posts.findIndex(post => post.id === postId)
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            comments_count: state.comments[postId].length,
          }
        }
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
        const { post_id } = action.payload

        if (!state.comments[post_id]) {
          state.comments[post_id] = []
        }

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
        const { task, section_code } = action.payload
        if (task) {
          const newTask = mapTask(task, [], section_code)
          state.posts.unshift(newTask)
        }
        state.preview = null
        state.uploadedFiles = []
      })
      .addCase(createTask.rejected, (state, action) => {
        state.tasksLoading = false
        state.taskError = action.payload
        logger.error('❌ Ошибка при создании задачи:', action.payload)
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
        const { tasks, section_code } = action.payload

        const mappedTasks = tasks.map(item => {
          const assignments = item.assignments || []
          const existingTask = state.posts.find(p => p.id === item.id)
          return mapTask(item, assignments, section_code, existingTask)
        })

        logger.log('✅ Загружено задач:', mappedTasks.length)
        // Заменяем только задачи, оставляя другие типы постов
        state.posts = state.posts.filter(p => p.type !== 'task').concat(mappedTasks)
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
        const { task_message_id } = action.payload
        const taskIndex = state.posts.findIndex(post => post.id === task_message_id)
        if (taskIndex !== -1) {
          state.posts[taskIndex] = {
            ...state.posts[taskIndex],
            status: 'in_progress',
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

        const { task_message_id, completion_description, completion_files } = action.payload

        // Обновляем статус на completed и сохраняем данные о выполнении
        const taskIndex = state.posts.findIndex(post => post.id === task_message_id)
        if (taskIndex !== -1) {
          state.posts[taskIndex] = {
            ...state.posts[taskIndex],
            status: 'completed',
            completion_description: completion_description || '',
            completion_files: completion_files || [],
          }
        }
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.tasksLoading = false
        state.taskError = action.payload
      })

      // ========================================================================
      // КОММЕНТАРИЙ К ЗАДАЧЕ (через /tasks endpoint)
      // ========================================================================
      .addCase(createTaskComment.pending, state => {
        state.commentsLoading = true
        state.commentError = null
      })
      .addCase(createTaskComment.fulfilled, (state, action) => {
        state.commentsLoading = false
        const { post_id } = action.payload
        const taskIndex = state.posts.findIndex(post => post.id === post_id)
        if (taskIndex !== -1) {
          state.posts[taskIndex] = {
            ...state.posts[taskIndex],
            comments_count: (state.posts[taskIndex].comments_count || 0) + 1,
          }
        }
      })
      .addCase(createTaskComment.rejected, (state, action) => {
        state.commentsLoading = false
        state.commentError = action.payload
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
      .addCase(fetchMessageReactions.fulfilled, (state, action) => {
        const { message_id, reactions, total } = action.payload
        // reactions = { like: N, dislike: N }, total = N
        const count_likes = reactions?.like || 0
        const count_dislikes = reactions?.dislike || 0

        const postIndex = state.posts.findIndex(post => post.id === message_id)
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            likes: count_likes,
            dislikes: count_dislikes,
          }
        }

        // Обновляем счётчики реакций в комментариях
        Object.keys(state.comments).forEach(parentId => {
          const commentIndex = state.comments[parentId].findIndex(c => c.id === message_id)
          if (commentIndex !== -1) {
            state.comments[parentId][commentIndex] = {
              ...state.comments[parentId][commentIndex],
              likes: count_likes,
              dislikes: count_dislikes,
            }
          }
        })
      })
      .addCase(fetchMessageReactions.rejected, (state, action) => {
        // Помечаем как загруженные чтобы не повторять запрос
        const messageId = action.meta?.arg?.message_id
        if (messageId) {
          const postIndex = state.posts.findIndex(post => post.id === messageId)
          if (postIndex !== -1) {
            state.posts[postIndex] = { ...state.posts[postIndex], likes: 0, dislikes: 0 }
          }
        }
      })
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { post_id, reaction } = action.payload
        const postIndex = state.posts.findIndex(post => post.id === post_id)
        if (postIndex !== -1) {
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            user_reaction: reaction,
          }
        }
        // Обновляем реакцию в комментариях
        Object.keys(state.comments).forEach(parentId => {
          const commentIndex = state.comments[parentId].findIndex(c => c.id === post_id)
          if (commentIndex !== -1) {
            state.comments[parentId][commentIndex] = {
              ...state.comments[parentId][commentIndex],
              user_reaction: reaction,
            }
          }
        })
      })
      .addCase(reactToPost.rejected, (state, action) => {
        state.error = action.payload
      })

      // Вложения теперь включены в media_files поста — reducer ничего не делает
      .addCase(fetchMessageAttachments.fulfilled, () => {})
      .addCase(fetchMessageAttachments.rejected, () => {})

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
        logger.warn('Ошибка загрузки файла:', action.payload)
      })
  },
})

// ============================================================================
// EXPORTS
// ============================================================================

export const { clearError, clearPosts, clearComments, clearPreview, clearUploadedFiles, setCommentsLoadingFlag } = postSlice.actions

// Базовые селекторы
export const selectPosts = state => state.post.posts
export const selectSelectedPost = state => state.post.selectedPost
export const selectCommentsMap = state => state.post.comments
export const selectPostsLoading = state => state.post.loading
export const selectPostsError = state => state.post.error
export const selectPreview = state => state.post.preview
export const selectTasksLoading = state => state.post.tasksLoading
export const selectTaskError = state => state.post.taskError
export const selectCommentsLoading = state => state.post.commentsLoading
export const selectCommentError = state => state.post.commentError

// Мемоизированные селекторы
export const selectTasks = createSelector(
  [selectPosts],
  (posts) => posts.filter(p => p.type === 'task')
)

export const selectIdleTasks = createSelector(
  [selectTasks],
  (tasks) => tasks.filter(t => t.status === 'idle')
)

export const selectInProgressTasks = createSelector(
  [selectTasks],
  (tasks) => tasks.filter(t => t.status === 'in_progress')
)

export const selectCompletedTasks = createSelector(
  [selectTasks],
  (tasks) => tasks.filter(t => t.status === 'completed')
)

export const selectComments = (postId) => createSelector(
  [selectCommentsMap],
  (comments) => comments[postId] || []
)

export default postSlice.reducer