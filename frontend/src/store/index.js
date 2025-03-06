import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import bookReducer from './bookSlice';
import transactionReducer from './transactionSlice';
import categoryReducer from './categorySlice';
import accountReducer from './accountSlice';
import tagReducer from './tagSlice';
import personReducer from './personSlice';
import notificationReducer from './notificationSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    transactions: transactionReducer,
    categories: categoryReducer,
    accounts: accountReducer,
    tags: tagReducer,
    persons: personReducer,
    notifications: notificationReducer,
    settings: settingsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
}); 