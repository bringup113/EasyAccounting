import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// 获取交易记录
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      console.log('查询交易记录的参数:', params);
      const res = await api.get('/transactions', { params });
      
      // 精简输出，只显示关键信息
      const { success, count, data, pagination } = res.data;
      console.log('查询到的交易记录数据:', { 
        success, 
        count, 
        pagination,
        // 只显示前3条记录的关键字段
        sampleData: data.slice(0, 3).map(item => ({
          _id: item._id,
          date: item.date,
          type: item.type,
          amount: item.amount,
          description: item.description
        }))
      });
      
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '获取交易记录失败');
    }
  }
);

// 获取单个交易记录
export const fetchTransaction = createAsyncThunk(
  'transactions/fetchTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/transactions/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 创建交易记录
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      // 不需要传递货币，因为货币与账户绑定
      const { currency, ...data } = transactionData;
      const res = await api.post('/transactions', data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 更新交易记录
export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, transactionData }, { rejectWithValue }) => {
    try {
      // 不需要传递货币，因为货币与账户绑定
      const { currency, ...data } = transactionData;
      const res = await api.put(`/transactions/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 删除交易记录
export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/transactions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 获取账本统计信息
export const fetchBookStats = createAsyncThunk(
  'transactions/fetchBookStats',
  async ({ bookId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/books/${bookId}/stats`, {
        params: { startDate, endDate },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const initialState = {
  transactions: [],
  transaction: null,
  stats: null,
  loading: false,
  error: null,
  pagination: null,
  total: 0,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.pagination = null;
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data;
        state.pagination = action.payload.pagination;
        state.total = action.payload.total;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.map((transaction) =>
          transaction._id === action.payload._id ? action.payload : transaction
        );
        state.transaction = action.payload;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(
          (transaction) => transaction._id !== action.payload
        );
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBookStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchBookStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearTransactions } = transactionSlice.actions;

export default transactionSlice.reducer; 