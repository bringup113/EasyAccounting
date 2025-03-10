import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// 获取人员/机构列表
export const fetchPersons = createAsyncThunk(
  'persons/fetchPersons',
  async (bookId, { rejectWithValue }) => {
    try {
      const res = await api.get('/persons', { params: { bookId } });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '获取人员/机构失败');
    }
  }
);

// 获取单个人员/机构
export const fetchPerson = createAsyncThunk(
  'persons/fetchPerson',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/persons/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '获取人员/机构失败');
    }
  }
);

// 创建人员/机构
export const createPerson = createAsyncThunk(
  'persons/createPerson',
  async (personData, { rejectWithValue }) => {
    try {
      const res = await api.post('/persons', personData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '创建人员/机构失败');
    }
  }
);

// 更新人员/机构
export const updatePerson = createAsyncThunk(
  'persons/updatePerson',
  async ({ id, personData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/persons/${id}`, personData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '更新人员/机构失败');
    }
  }
);

// 删除人员/机构
export const deletePerson = createAsyncThunk(
  'persons/deletePerson',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/persons/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || '删除人员/机构失败');
    }
  }
);

const initialState = {
  persons: [],
  person: null,
  loading: false,
  error: null,
};

const personSlice = createSlice({
  name: 'persons',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPersons: (state) => {
      state.persons = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPersons.fulfilled, (state, action) => {
        state.loading = false;
        state.persons = action.payload;
      })
      .addCase(fetchPersons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPerson.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.person = action.payload;
      })
      .addCase(fetchPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPerson.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.persons.push(action.payload);
      })
      .addCase(createPerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePerson.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePerson.fulfilled, (state, action) => {
        state.loading = false;
        state.persons = state.persons.map((person) =>
          person._id === action.payload._id ? action.payload : person
        );
        state.person = action.payload;
      })
      .addCase(updatePerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deletePerson.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePerson.fulfilled, (state, action) => {
        state.loading = false;
        state.persons = state.persons.filter(
          (person) => person._id !== action.payload
        );
      })
      .addCase(deletePerson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearPersons } = personSlice.actions;

export default personSlice.reducer; 