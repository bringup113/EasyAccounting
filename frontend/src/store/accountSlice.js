import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// 获取账户列表
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (bookId, { rejectWithValue }) => {
    try {
      // 检查bookId是否有效
      if (!bookId) {
        return rejectWithValue('无效的账本ID');
      }
      
      // 确保bookId是字符串而不是对象
      const bookIdStr = typeof bookId === 'object' ? bookId._id : bookId;
      
      // 再次检查提取后的ID是否有效
      if (!bookIdStr) {
        return rejectWithValue('无效的账本ID');
      }
      
      const res = await api.get(`/accounts?bookId=${bookIdStr}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '获取账户列表失败');
    }
  }
);

// 获取单个账户
export const fetchAccount = createAsyncThunk(
  'accounts/fetchAccount',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/accounts/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '获取账户详情失败');
    }
  }
);

// 创建账户
export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      // 确保账户数据包含货币信息
      if (!accountData.currency) {
        return rejectWithValue('账户必须指定货币');
      }
      const res = await api.post('/accounts', accountData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '创建账户失败');
    }
  }
);

// 更新账户
export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, accountData }, { rejectWithValue }) => {
    try {
      // 确保账户数据包含货币信息
      if (!accountData.currency) {
        return rejectWithValue('账户必须指定货币');
      }
      const res = await api.put(`/accounts/${id}`, accountData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '更新账户失败');
    }
  }
);

// 删除账户
export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/accounts/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '删除账户失败');
    }
  }
);

const initialState = {
  accounts: [],
  account: null,
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAccounts: (state) => {
      state.accounts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.push(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.map((account) =>
          account._id === action.payload._id ? action.payload : account
        );
        state.account = action.payload;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter(
          (account) => account._id !== action.payload
        );
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAccounts } = accountSlice.actions;

export default accountSlice.reducer; 