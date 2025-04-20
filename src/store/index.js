import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import meReducer from './slices/meSlice';
import themeReducer from './slices/themeSlice';
import sectionReducer from './slices/sectionSlice';
import postReducer from './slices/postSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    me: meReducer,
    theme: themeReducer,
    section: sectionReducer,
    post: postReducer,
  }
});

export default store;
