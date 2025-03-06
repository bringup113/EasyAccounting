import { 
  SET_LANGUAGE, 
  SET_THEME, 
  SET_CURRENCY,
  SETTINGS_ERROR 
} from './types';

// 设置语言
export const setLanguage = (language) => {
  try {
    return {
      type: SET_LANGUAGE,
      payload: language
    };
  } catch (err) {
    return {
      type: SETTINGS_ERROR,
      payload: '设置语言失败'
    };
  }
};

// 设置主题
export const setTheme = (theme) => {
  try {
    return {
      type: SET_THEME,
      payload: theme
    };
  } catch (err) {
    return {
      type: SETTINGS_ERROR,
      payload: '设置主题失败'
    };
  }
};

// 设置货币
export const setCurrency = (currency) => {
  try {
    return {
      type: SET_CURRENCY,
      payload: currency
    };
  } catch (err) {
    return {
      type: SETTINGS_ERROR,
      payload: '设置货币失败'
    };
  }
}; 