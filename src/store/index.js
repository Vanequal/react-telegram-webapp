import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import meReducer from './slices/meSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    me: meReducer
  }
});

export default store;
