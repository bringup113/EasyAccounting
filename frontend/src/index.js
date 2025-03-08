import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import axios from 'axios';
import App from './App';
import 'antd/dist/reset.css';

// 配置axios默认值
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000; // 10秒超时

// 添加请求拦截器
axios.interceptors.request.use(
  (config) => {
    // 如果是管理员相关的请求，添加管理员令牌
    if (config.url && (config.url.includes('/api/admins') || config.url.includes('/api/admin-users'))) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 使用React 18的createRoot API
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
); 