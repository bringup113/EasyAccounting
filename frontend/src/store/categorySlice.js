import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// 获取分类列表
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (bookId, { rejectWithValue }) => {
    try {
      const res = await api.get('/categories', { params: { bookId } });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '获取分类失败');
    }
  }
);

// 获取单个分类
export const fetchCategory = createAsyncThunk(
  'categories/fetchCategory',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/categories/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '获取分类失败');
    }
  }
);

// 创建分类
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const res = await api.post('/categories', categoryData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '创建分类失败');
    }
  }
);

// 更新分类
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/categories/${id}`, categoryData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '更新分类失败');
    }
  }
);

// 删除分类
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '删除分类失败');
    }
  }
);

const initialState = {
  categories: [],
  category: null,
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCategories: (state) => {
      state.categories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload;
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category
        );
        state.category = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCategories } = categorySlice.actions;

export default categorySlice.reducer; 