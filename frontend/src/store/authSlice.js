import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setAuthToken } from '../utils/auth';
import api from '../services/api';
import { setUserId } from './settingsSlice';

// 加载用户
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue, dispatch }) => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }

  try {
    const res = await api.get('/users/me');
    // 设置用户ID用于关联设置
    if (res.data.data && res.data.data._id) {
      dispatch(setUserId(res.data.data._id));
    }
    return res.data.data;
  } catch (err) {
    localStorage.removeItem('token');
    return rejectWithValue(err.response?.data?.message || '加载用户信息失败');
  }
});

// 注册用户
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      // 确保邮箱地址转换为小写
      const processedData = {
        ...userData,
        email: userData.email.toLowerCase()
      };
      
      const res = await api.post('/users/register', processedData);
      localStorage.setItem('token', res.data.token);
      
      // 如果响应中包含用户ID，设置用户ID用于关联设置
      if (res.data.user && res.data.user._id) {
        dispatch(setUserId(res.data.user._id));
      }
      
      return res.data;
    } catch (err) {
      console.error('注册错误:', err);
      return rejectWithValue(err.response?.data?.message || '注册失败，请稍后再试');
    }
  }
);

// 登录用户
export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      // 确保邮箱地址转换为小写
      const processedData = {
        ...userData,
        email: userData.email.toLowerCase()
      };
      
      const res = await api.post('/users/login', processedData);
      localStorage.setItem('token', res.data.token);
      
      // 如果响应中包含用户ID，设置用户ID用于关联设置
      if (res.data.user && res.data.user._id) {
        dispatch(setUserId(res.data.user._id));
      }
      
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '登录失败，请检查您的凭据');
    }
  }
);

// 更新用户信息
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData, { rejectWithValue, getState }) => {
    try {
      // 确保avatar字段正确处理
      let updatedUserData = { ...userData };
      if (userData.avatar) {
        // 如果avatar是完整URL，提取路径部分
        if (userData.avatar.includes('http://localhost:5001') || 
            userData.avatar.includes(process.env.REACT_APP_API_URL)) {
          const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
          updatedUserData.avatar = userData.avatar.replace(baseUrl, '');
        }
      }
      
      const res = await api.put('/users/me', updatedUserData);
      
      // 确保返回的用户对象包含正确的avatar字段
      if (res.data.data) {
        // 如果响应中没有avatar但请求中有，手动添加
        if (!res.data.data.avatar && userData.avatar) {
          return {
            ...res.data.data,
            avatar: userData.avatar
          };
        }
      }
      
      return res.data.data;
    } catch (err) {
      console.error('更新用户信息失败:', err);
      return rejectWithValue(err.response?.data?.message || '更新用户信息失败');
    }
  }
);

// 更新密码
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const res = await api.put('/users/updatepassword', passwordData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '更新密码失败');
    }
  }
);

// 登出用户
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    // 清除本地存储中的token
    localStorage.removeItem('token');
    // 清除用户ID
    localStorage.removeItem('userId');
    // 调用logout action
    dispatch(logout());
    // 返回成功
    return { success: true };
  }
);

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer; 