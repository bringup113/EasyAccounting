import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// 获取所有账本
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/books');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 获取单个账本
export const fetchBook = createAsyncThunk(
  'books/fetchBook',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/books/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 创建账本
export const createBook = createAsyncThunk(
  'books/createBook',
  async (bookData, { rejectWithValue }) => {
    try {
      const res = await api.post('/books', bookData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 更新账本
export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, bookData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/books/${id}`, bookData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 删除账本
export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/books/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 添加成员
export const addMember = createAsyncThunk(
  'books/addMember',
  async ({ id, email }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/books/${id}/members`, { email });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 移除成员
export const removeMember = createAsyncThunk(
  'books/removeMember',
  async ({ bookId, userId }, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/books/${bookId}/members/${userId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 添加货币到账本
export const addCurrency = createAsyncThunk(
  'books/addCurrency',
  async ({ id, currencyData }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/books/${id}/currencies`, currencyData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 更新账本中的货币汇率
export const updateCurrencyRate = createAsyncThunk(
  'books/updateCurrencyRate',
  async ({ id, code, rate }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/books/${id}/currencies/${code}`, { rate });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 删除账本中的货币
export const deleteCurrency = createAsyncThunk(
  'books/deleteCurrency',
  async ({ id, code }, { rejectWithValue }) => {
    try {
      await api.delete(`/books/${id}/currencies/${code}`);
      return { bookId: id, currencyCode: code };
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const initialState = {
  books: [],
  currentBook: null,
  loading: false,
  error: null,
  // 系统默认货币
  defaultCurrencies: [
    { code: 'CNY', name: '人民币', symbol: '¥' },
    { code: 'USD', name: '美元', symbol: '$' },
    { code: 'THB', name: '泰铢', symbol: '฿' }
  ]
};

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setCurrentBook: (state, action) => {
      state.currentBook = action.payload;
      localStorage.setItem('currentBookId', action.payload._id);
    },
    clearCurrentBook: (state) => {
      state.currentBook = null;
      localStorage.removeItem('currentBookId');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
        
        // 如果有存储的当前账本ID，则设置当前账本
        const currentBookId = localStorage.getItem('currentBookId');
        if (currentBookId && !state.currentBook) {
          const book = action.payload.find((b) => b._id === currentBookId);
          if (book) {
            state.currentBook = book;
          }
        }
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBook.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.push(action.payload);
        state.currentBook = action.payload;
        localStorage.setItem('currentBookId', action.payload._id);
      })
      .addCase(createBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.map((book) =>
          book._id === action.payload._id ? action.payload : book
        );
        if (state.currentBook && state.currentBook._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter((book) => book._id !== action.payload);
        if (state.currentBook && state.currentBook._id === action.payload) {
          state.currentBook = state.books.length > 0 ? state.books[0] : null;
          if (state.currentBook) {
            localStorage.setItem('currentBookId', state.currentBook._id);
          } else {
            localStorage.removeItem('currentBookId');
          }
        }
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.books = state.books.map((book) =>
          book._id === action.payload._id ? action.payload : book
        );
        if (state.currentBook && state.currentBook._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      })
      .addCase(addMember.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.books = state.books.map((book) =>
          book._id === action.payload._id ? action.payload : book
        );
        if (state.currentBook && state.currentBook._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addCurrency.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.map((book) =>
          book._id === action.payload._id ? action.payload : book
        );
        if (state.currentBook && state.currentBook._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      })
      .addCase(addCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCurrencyRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCurrencyRate.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.map((book) =>
          book._id === action.payload._id ? action.payload : book
        );
        if (state.currentBook && state.currentBook._id === action.payload._id) {
          state.currentBook = action.payload;
        }
      })
      .addCase(updateCurrencyRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCurrency.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCurrency.fulfilled, (state, action) => {
        state.loading = false;
        const { bookId, currencyCode } = action.payload;
        // 更新账本中的货币列表
        state.books = state.books.map((book) => {
          if (book._id === bookId && book.currencies) {
            return {
              ...book,
              currencies: book.currencies.filter(c => c.code !== currencyCode)
            };
          }
          return book;
        });
        // 如果当前账本是被修改的账本，也更新当前账本
        if (state.currentBook && state.currentBook._id === bookId && state.currentBook.currencies) {
          state.currentBook = {
            ...state.currentBook,
            currencies: state.currentBook.currencies.filter(c => c.code !== currencyCode)
          };
        }
      })
      .addCase(deleteCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentBook, clearCurrentBook, clearError } = bookSlice.actions;

export default bookSlice.reducer; 