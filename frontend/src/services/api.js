import axios from 'axios';
import { logout } from '../store/authSlice';
import { store } from '../store';

// 发送错误通知的辅助函数
const sendErrorNotification = (dispatch, notification) => {
  // 这里可以使用您的通知系统，例如antd的notification或者redux action
  console.error(`${notification.title}: ${notification.message}`);
};

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 检查是否是管理员API请求
    const isAdminRequest = config.url.includes('/admin-');
    
    if (isAdminRequest) {
      // 从localStorage获取管理员token
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // 从localStorage获取普通用户token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 获取当前URL路径
      const currentPath = window.location.pathname;
      // 判断是否在登录或注册页面
      const isAuthPage = currentPath === '/login' || currentPath === '/register';
      
      switch (status) {
        case 401:
          // 未授权，清除用户信息并重定向到登录页
          store.dispatch(logout());
          // 只有在非登录/注册页面时才显示错误提示
          if (!isAuthPage && error.config.url !== '/users/me') {
            sendErrorNotification(store.dispatch, {
              title: '登录已过期',
              message: '请重新登录'
            });
          }
          break;
          
        case 403:
          // 禁止访问
          sendErrorNotification(store.dispatch, {
            title: '访问被拒绝',
            message: data.message || '您没有权限执行此操作'
          });
          break;
          
        case 404:
          // 资源不存在
          sendErrorNotification(store.dispatch, {
            title: '资源不存在',
            message: data.message || '请求的资源不存在'
          });
          break;
          
        case 500:
          // 服务器错误
          sendErrorNotification(store.dispatch, {
            title: '服务器错误',
            message: data.message || '服务器发生错误，请稍后再试'
          });
          break;
          
        default:
          // 其他错误
          sendErrorNotification(store.dispatch, {
            title: `错误 (${status})`,
            message: data.message || '请求处理失败'
          });
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      sendErrorNotification(store.dispatch, {
        title: '网络错误',
        message: '无法连接到服务器，请检查您的网络连接'
      });
    } else {
      // 请求配置出错
      sendErrorNotification(store.dispatch, {
        title: '请求错误',
        message: error.message || '发送请求时出错'
      });
    }
    
    return Promise.reject(error);
  }
);

export default api; 