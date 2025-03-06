import React, { createContext, useState, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import zhCN from '../locales/zh-CN';
import enUS from '../locales/en-US';

// 创建语言上下文
export const LanguageContext = createContext();

// 支持的语言
export const languages = [
  { code: 'zh-CN', name: '中文' },
  { code: 'en-US', name: 'English' },
];

// 语言消息
const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 获取浏览器语言
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  return languages.find(lang => browserLang.startsWith(lang.code)) ? browserLang : 'zh-CN';
};

// 获取本地存储的语言
const getStoredLanguage = () => {
  return localStorage.getItem('language') || getBrowserLanguage();
};

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(getStoredLanguage());

  // 切换语言
  const changeLanguage = (code) => {
    setLocale(code);
    localStorage.setItem('language', code);
  };

  useEffect(() => {
    // 设置 HTML 的 lang 属性
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage }}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

// 语言消费者组件
export const LanguageConsumer = LanguageContext.Consumer; 