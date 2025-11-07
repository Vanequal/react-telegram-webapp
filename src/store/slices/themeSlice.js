import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '@/shared/api/axios'

// Получение данных темы
export const fetchTheme = createAsyncThunk('theme/fetchTheme', async (theme_id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/api/v1/themes/${theme_id}`)
    console.log('✅ Тема загружена:', response.data)
    return response.data
  } catch (err) {
    console.error('❌ Theme fetch error:', err?.response?.data || err.message)
    return rejectWithValue(err.response?.data?.detail || 'Fetch theme error')
  }
})

// ✅ НОВОЕ: Получение видимых секций темы
export const fetchThemeSections = createAsyncThunk('theme/fetchThemeSections', async (theme_id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/api/v1/themes/${theme_id}/sections`)
    console.log('✅ Секции темы загружены:', response.data)
    return response.data
  } catch (err) {
    console.error('❌ Theme sections fetch error:', err?.response?.data || err.message)
    return rejectWithValue(err.response?.data?.detail || 'Fetch theme sections error')
  }
})

// ✅ НОВОЕ: Создание новой темы
export const createTheme = createAsyncThunk('theme/createTheme', async ({ title, parent_id = null, tech_version = 'full' }, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/v1/themes', {
      title,
      parent_id,
      tech_version,
    })
    console.log('✅ Тема создана:', response.data)
    return response.data
  } catch (err) {
    console.error('❌ Create theme error:', err?.response?.data || err.message)
    return rejectWithValue(err.response?.data?.detail || 'Create theme error')
  }
})

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: null,
    sections: [], // ✅ Добавлено: массив секций темы
    loading: false,
    sectionsLoading: false, // ✅ Добавлено: отдельный loader для секций
    error: null,
  },
  reducers: {
    // ✅ Добавлено: очистка ошибки
    clearError: state => {
      state.error = null
    },
    // ✅ Добавлено: очистка темы
    clearTheme: state => {
      state.theme = null
      state.sections = []
    },
  },
  extraReducers: builder => {
    builder
      // Получение темы
      .addCase(fetchTheme.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTheme.fulfilled, (state, action) => {
        state.loading = false
        state.theme = action.payload
      })
      .addCase(fetchTheme.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ✅ Получение секций темы
      .addCase(fetchThemeSections.pending, state => {
        state.sectionsLoading = true
        state.error = null
      })
      .addCase(fetchThemeSections.fulfilled, (state, action) => {
        state.sectionsLoading = false
        // API возвращает массив строк - section_code'ов
        state.sections = action.payload
      })
      .addCase(fetchThemeSections.rejected, (state, action) => {
        state.sectionsLoading = false
        state.error = action.payload
        state.sections = []
      })

      // ✅ Создание темы
      .addCase(createTheme.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createTheme.fulfilled, (state, action) => {
        state.loading = false
        state.theme = action.payload
      })
      .addCase(createTheme.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearTheme } = themeSlice.actions

// ✅ Селекторы
export const selectTheme = state => state.theme.theme
export const selectThemeSections = state => state.theme.sections
export const selectThemeLoading = state => state.theme.loading
export const selectSectionsLoading = state => state.theme.sectionsLoading
export const selectThemeError = state => state.theme.error

export default themeSlice.reducer