import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ConfigProvider, Layout, theme, App as AntdApp } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { IntlProvider } from 'react-intl';
import messages from './locales';
import { loadUser } from './store/authSlice';
import './App.css';
import dayjs from 'dayjs';

// 布局组件
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import PrivateRoute from './components/PrivateRoute';

// 页面组件
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TransactionManagement from './pages/transactions/TransactionManagement';
import Reports from './pages/reports/Reports';
import BackupRestorePage from './pages/BackupRestorePage';
import Settings from './pages/Settings';
import AccountManagement from './pages/accounts/AccountManagement';
import BookSettings from './pages/BookSettings';
import BookCurrencySettings from './pages/BookCurrencySettings';
import CategoryManagement from './pages/CategoryManagement';
import TagManagement from './pages/TagManagement';
import PersonManagement from './pages/PersonManagement';

// 管理系统
import AdminApp from './admin/AdminApp';

const { Content } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;

// 检查本地存储中的token
if (localStorage.token) {
  // 设置token到请求头
  // 这里可以调用setAuthToken函数
}

// 重定向组件，确保根路径显示首页
const RootRedirect = () => {
  // 直接重定向到首页
  return <Navigate to="/home" replace />;
};

// 创建一个包装组件来处理布局
const AppLayout = () => {
  const location = useLocation();
  const { currentBook } = useSelector((state) => state.books);
  
  // 判断当前是否在首页
  const isHomePage = location.pathname === '/home';
  
  return (
    <Layout className="main-layout">
      <Header />
      <Layout>
        {/* 只在非首页且已选择账本时显示侧边栏 */}
        {!isHomePage && currentBook && <Sidebar />}
        <Layout className="site-layout">
          <Content className="main-content">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/backup" element={<BackupRestorePage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/accounts" element={<AccountManagement />} />
              <Route path="/book-settings" element={<BookSettings />} />
              <Route path="/book-currency-settings" element={<BookCurrencySettings />} />
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/tags" element={<TagManagement />} />
              <Route path="/persons" element={<PersonManagement />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { language, locale, theme: appTheme } = useSelector((state) => state.settings || { language: 'zh-CN', locale: 'zh-CN', theme: 'light' });
  const [appLoading, setAppLoading] = useState(false);

  // 应用主题到body元素
  useEffect(() => {
    if (appTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [appTheme]);

  useEffect(() => {
    // 只在localStorage中有token时才尝试加载用户信息
    if (localStorage.getItem('token')) {
      setAppLoading(true);
      dispatch(loadUser())
        .unwrap()
        .catch((error) => {
          // 如果加载用户信息失败，可能是token失效，确保重定向到登录页面
          console.error('加载用户信息失败:', error);
          // 清除token
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        })
        .finally(() => {
          setAppLoading(false);
        });
    }
  }, [dispatch]);

  const themeConfig = {
    algorithm: appTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
    },
  };

  // 根据语言选择对应的Ant Design语言包
  const getAntdLocale = () => {
    // 优先使用locale，如果没有则使用language
    const currentLocale = locale || language;
    switch (currentLocale) {
      case 'en-US':
        return enUS;
      case 'zh-CN':
      default:
        return zhCN;
    }
  };

  // 获取当前使用的语言
  const getCurrentLocale = () => {
    return locale || language || 'zh-CN';
  };

  return (
    <IntlProvider locale={getCurrentLocale()} messages={messages[getCurrentLocale()]}>
      <ConfigProvider locale={getAntdLocale()} theme={themeConfig}>
        <AntdApp>
          <Router>
            <div className={`app-container ${appTheme}-theme`}>
              <Routes>
                <Route path="/login" element={
                  isAuthenticated ? <Navigate to="/home" /> : (
                    <div className="auth-container">
                      <Login />
                    </div>
                  )
                } />
                <Route path="/register" element={
                  isAuthenticated ? <Navigate to="/home" /> : (
                    <div className="auth-container">
                      <Register />
                    </div>
                  )
                } />
                <Route path="/admin/*" element={<AdminApp />} />
                <Route path="/*" element={
                  <PrivateRoute isAuthenticated={isAuthenticated} loading={appLoading}>
                    <AppLayout />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </Router>
        </AntdApp>
      </ConfigProvider>
    </IntlProvider>
  );
};

export default App; 