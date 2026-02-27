import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '@/shared/api/axios'
import logger from '@/shared/utils/logger'

export const authWithTelegram = createAsyncThunk('auth/telegram', async (initData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      '/api/v1/auth/telegram',
      { init_data: initData },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    // API возвращает { access_token, refresh_token }
    const { access_token, refresh_token } = response.data

    logger.log('✅ Авторизация успешна')

    if (!access_token) throw new Error('Токен не найден в ответе')

    sessionStorage.setItem('token', access_token)
    if (refresh_token) sessionStorage.setItem('refresh_token', refresh_token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

    return { token: access_token }
  } catch (err) {
    logger.error('❌ Auth error:', err?.response?.data || err.message)
    return rejectWithValue(err.response?.data?.detail || 'Auth error')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: state => {
      state.token = null
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('refresh_token')
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
export const selectAuthLoading = state => state.auth.loading
export const selectAuthError = state => state.auth.error

export default authSlice.reducer