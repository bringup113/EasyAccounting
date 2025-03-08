import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout, ConfigProvider, App as AntdApp, theme, message } from 'antd';
import { useSelector } from 'react-redux';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { IntlProvider } from 'react-intl';
import messages from '../locales';
import axios from 'axios';

// 布局组件
import AdminHeader from './components/layout/AdminHeader';
import AdminSidebar from './components/layout/AdminSidebar';

// 页面组件
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import BookManagement from './pages/BookManagement';
import SystemMonitor from './pages/SystemMonitor';
import BackupManagement from './pages/BackupManagement';
import SystemSettings from './pages/SystemSettings';
import NotificationSettings from './pages/NotificationSettings';
import SecuritySettings from './pages/SecuritySettings';
import LogManagement from './pages/LogManagement';
import AdminLogin from './pages/AdminLogin';
import TestApi from './pages/TestApi';

// 样式
import './AdminApp.css';

const { Content } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;

// 设置 axios 拦截器，为管理员请求添加令牌
axios.interceptors.request.use(
  (config) => {
    // 如果请求URL包含 /api/admins 或 /api/admin-，添加管理员令牌
    if (config.url && (config.url.includes('/api/admins') || config.url.includes('/api/admin-'))) {
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

// 管理系统布局组件
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 切换侧边栏折叠状态
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  // 获取管理员信息
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const storedAdminInfo = localStorage.getItem('adminInfo');
        if (storedAdminInfo) {
          setAdminInfo(JSON.parse(storedAdminInfo));
        } else {
          // 如果本地没有管理员信息，尝试从API获取
          const adminToken = localStorage.getItem('adminToken');
          if (adminToken) {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/admins/me`,
              {
                headers: {
                  Authorization: `Bearer ${adminToken}`
                }
              }
            );
            
            if (response.data.success) {
              setAdminInfo(response.data.data);
              localStorage.setItem('adminInfo', JSON.stringify(response.data.data));
            } else {
              // 如果获取失败，清除令牌
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminInfo');
            }
          }
        }
      } catch (error) {
        console.error('获取管理员信息失败:', error);
        message.error('获取管理员信息失败，请重新登录');
        // 清除令牌
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminInfo();
  }, []);
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return <div className="admin-loading">加载中...</div>;
  }
  
  // 如果没有管理员令牌或信息，重定向到登录页面
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken || !adminInfo) {
    return <Navigate to="/admin/login" />;
  }
  
  return (
    <Layout className="admin-layout">
      <AdminHeader 
        collapsed={collapsed} 
        toggleCollapsed={toggleCollapsed} 
        adminInfo={adminInfo}
      />
      <Layout>
        <AdminSidebar collapsed={collapsed} />
        <Layout className="admin-site-layout">
          <Content className="admin-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/books" element={<BookManagement />} />
              <Route path="/monitor" element={<SystemMonitor />} />
              <Route path="/backups" element={<BackupManagement />} />
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/notifications" element={<NotificationSettings />} />
              <Route path="/security" element={<SecuritySettings />} />
              <Route path="/logs" element={<LogManagement />} />
              <Route path="/test" element={<TestApi />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

const AdminApp = () => {
  const { language, theme: appTheme } = useSelector((state) => state.settings || { language: 'zh-CN', theme: 'light' });
  
  // 应用主题到body元素
  React.useEffect(() => {
    if (appTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [appTheme]);
  
  return (
    <ConfigProvider
      locale={language === 'en-US' ? enUS : zhCN}
      theme={{
        algorithm: appTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <IntlProvider locale={language} messages={messages[language]}>
        <AntdApp notification={{ maxCount: 5 }} message={{ maxCount: 3 }}>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/*" element={<AdminLayout />} />
          </Routes>
        </AntdApp>
      </IntlProvider>
    </ConfigProvider>
  );
};

export default AdminApp; 