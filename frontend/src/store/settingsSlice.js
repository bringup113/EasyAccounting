import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: localStorage.getItem('language') || 'zh-CN', // 默认中文
  theme: localStorage.getItem('theme') || 'light',
  currency: localStorage.getItem('currency') || 'CNY',
  loading: false,
  error: null
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      localStorage.setItem('language', action.payload);
      state.language = action.payload;
      state.loading = false;
    },
    setTheme: (state, action) => {
      localStorage.setItem('theme', action.payload);
      state.theme = action.payload;
      state.loading = false;
    },
    setCurrency: (state, action) => {
      localStorage.setItem('currency', action.payload);
      state.currency = action.payload;
      state.loading = false;
    },
    setSettingsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setLanguage, setTheme, setCurrency, setSettingsError } = settingsSlice.actions;

export default settingsSlice.reducer; 