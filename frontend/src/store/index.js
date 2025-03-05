import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import bookReducer from './bookSlice';
import transactionReducer from './transactionSlice';
import categoryReducer from './categorySlice';
import tagReducer from './tagSlice';
import personReducer from './personSlice';
import accountReducer from './accountSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    transactions: transactionReducer,
    categories: categoryReducer,
    tags: tagReducer,
    persons: personReducer,
    accounts: accountReducer,
  },
});

export default store; 