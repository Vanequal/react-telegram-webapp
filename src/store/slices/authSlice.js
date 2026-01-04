import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '@/shared/api/axios'
import logger from '@/shared/utils/logger'

export const authWithTelegram = createAsyncThunk('auth/telegram', async (initData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      '/api/v1/auth/telegram/login', // ✅ Исправлен путь
      { init_data: initData },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    // ✅ Согласно Swagger API возвращает token в теле ответа, а не в headers
    const { token, message, status } = response.data
    
    logger.log('✅ Авторизация успешна:', { message, status })

    if (!token) throw new Error('Токен не найден в ответе')

    sessionStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // ✅ API возвращает весь объект response.data, включая token
    return { token, message, status }
  } catch (err) {
    logger.error('❌ Auth error:', err?.response?.data || err.message)
    return rejectWithValue(err.response?.data?.detail || 'Auth error')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    message: null,
    status: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: state => {
      state.token = null
      state.message = null
      state.status = null
      sessionStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
  },
  extraReducers: builder => {
    builder
      .addCase(authWithTelegram.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(authWithTelegram.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.message = action.payload.message
        state.status = action.payload.status
        state.loading = false
      })
      .addCase(authWithTelegram.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout } = authSlice.actions
export const selectToken = state => state.auth.token
export const selectAuthMessage = state => state.auth.message
export const selectAuthStatus = state => state.auth.status
export const selectAuthLoading = state => state.auth.loading
export const selectAuthError = state => state.auth.error

export default authSlice.reducer