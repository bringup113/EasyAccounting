import { createSlice } from '@reduxjs/toolkit';

// 获取用户特定的设置键
const getUserSettingKey = (key) => {
  const userId = localStorage.getItem('userId');
  return userId ? `${key}_${userId}` : key;
};

// 从localStorage获取设置，优先使用用户特定的设置
const getSettingFromStorage = (key, defaultValue) => {
  const userSpecificKey = getUserSettingKey(key);
  const userValue = localStorage.getItem(userSpecificKey);
  
  if (userValue !== null) {
    return userValue;
  }
  
  // 如果没有用户特定的设置，尝试获取全局设置
  const globalValue = localStorage.getItem(key);
  return globalValue !== null ? globalValue : defaultValue;
};

const initialState = {
  language: getSettingFromStorage('language', 'zh-CN'),
  theme: getSettingFromStorage('theme', 'light'),
  locale: getSettingFromStorage('locale', 'zh-CN'),
  currency: getSettingFromStorage('currency', 'CNY'),
  loading: false,
  error: null
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // 设置用户ID，用于关联设置
    setUserId: (state, action) => {
      localStorage.setItem('userId', action.payload);
      // 迁移现有设置到用户特定的键
      const keys = ['language', 'theme', 'locale', 'currency'];
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          localStorage.setItem(`${key}_${action.payload}`, value);
        }
      });
    },
    setLanguage: (state, action) => {
      const userLanguageKey = getUserSettingKey('language');
      localStorage.setItem(userLanguageKey, action.payload);
      state.language = action.payload;
      
      const userLocaleKey = getUserSettingKey('locale');
      localStorage.setItem(userLocaleKey, action.payload);
      state.locale = action.payload;
    },
    setTheme: (state, action) => {
      const userThemeKey = getUserSettingKey('theme');
      localStorage.setItem(userThemeKey, action.payload);
      state.theme = action.payload;
    },
    setLocale: (state, action) => {
      const userLocaleKey = getUserSettingKey('locale');
      localStorage.setItem(userLocaleKey, action.payload);
      state.locale = action.payload;
      
      const userLanguageKey = getUserSettingKey('language');
      localStorage.setItem(userLanguageKey, action.payload);
      state.language = action.payload;
    },
    setCurrency: (state, action) => {
      const userCurrencyKey = getUserSettingKey('currency');
      localStorage.setItem(userCurrencyKey, action.payload);
      state.currency = action.payload;
    },
    setSettingsLoading: (state) => {
      state.loading = true;
    },
    setSettingsSuccess: (state) => {
      state.loading = false;
    },
    setSettingsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
});

export const { 
  setUserId,
  setLanguage, 
  setTheme, 
  setCurrency, 
  setLocale, 
  setSettingsError 
} = settingsSlice.actions;

export default settingsSlice.reducer; 