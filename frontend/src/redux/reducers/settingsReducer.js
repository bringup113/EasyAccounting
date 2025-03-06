import { 
  SET_LANGUAGE, 
  SET_THEME, 
  SET_CURRENCY,
  SETTINGS_ERROR 
} from '../actions/types';

const initialState = {
  language: localStorage.getItem('language') || 'zh-CN', // 默认中文
  theme: localStorage.getItem('theme') || 'light',
  currency: localStorage.getItem('currency') || 'CNY',
  loading: false,
  error: null
};

const settingsReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_LANGUAGE:
      localStorage.setItem('language', payload);
      return {
        ...state,
        language: payload,
        loading: false
      };
    case SET_THEME:
      localStorage.setItem('theme', payload);
      return {
        ...state,
        theme: payload,
        loading: false
      };
    case SET_CURRENCY:
      localStorage.setItem('currency', payload);
      return {
        ...state,
        currency: payload,
        loading: false
      };
    case SETTINGS_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
};

export default settingsReducer; 