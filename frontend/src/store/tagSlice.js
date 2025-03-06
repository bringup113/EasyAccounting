import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 获取标签列表
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (bookId, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/tags', { params: { bookId } });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 获取单个标签
export const fetchTag = createAsyncThunk(
  'tags/fetchTag',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/tags/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 创建标签
export const createTag = createAsyncThunk(
  'tags/createTag',
  async (tagData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/tags', tagData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 更新标签
export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ id, tagData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/tags/${id}`, tagData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// 删除标签
export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/tags/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const initialState = {
  tags: [],
  tag: null,
  loading: false,
  error: null,
};

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTags: (state) => {
      state.tags = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTag.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tag = action.payload;
      })
      .addCase(fetchTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTag.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags.push(action.payload);
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTag.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = state.tags.map((tag) =>
          tag._id === action.payload._id ? action.payload : tag
        );
        state.tag = action.payload;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = state.tags.filter(
          (tag) => tag._id !== action.payload
        );
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearTags } = tagSlice.actions;

export default tagSlice.reducer;