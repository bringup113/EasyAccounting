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
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TransactionManagement from './pages/transactions/TransactionManagement';
import Reports from './pages/reports/Reports';
import BackupRestorePage from './pages/BackupRestorePage';
import Settings from './pages/Settings';
import AccountManagement from './pages/accounts/AccountManagement';

const { Content } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;

// 检查本地存储中的token
if (localStorage.token) {
  // 设置token到请求头
  // 这里可以调用setAuthToken函数
}

// 重定向组件，确保根路径重定向到带有日期参数的dashboard路径
const RootRedirect = () => {
  const { currentBook } = useSelector((state) => state.books);
  const today = dayjs().format('YYYY-MM');
  
  // 如果有选择的账本，重定向到dashboard
  if (currentBook) {
    return <Navigate to={`/dashboard?date=${today}`} replace />;
  }
  
  // 如果没有选择的账本，显示Dashboard组件（它会显示欢迎页面）
  return <Dashboard />;
};

// 创建一个包装组件来处理布局
const AppLayout = () => {
  const location = useLocation();
  const { currentBook } = useSelector((state) => state.books);
  
  return (
    <Layout className="main-layout">
      <Header />
      <Layout>
        {/* 只在已选择账本时显示侧边栏 */}
        {currentBook && <Sidebar />}
        <Layout className="site-layout">
          <Content className="main-content">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/backup" element={<BackupRestorePage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/accounts" element={<AccountManagement />} />
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
  const { language, theme: appTheme } = useSelector((state) => state.settings || { language: 'zh-CN', theme: 'light' });
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
        .finally(() => {
          setAppLoading(false);
        });
    }
  }, [dispatch]);

  // 根据语言选择对应的Ant Design语言包
  const getAntdLocale = () => {
    switch (language) {
      case 'en-US':
        return enUS;
      case 'zh-CN':
      default:
        return zhCN;
    }
  };

  const themeConfig = {
    algorithm: appTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
    },
  };

  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <ConfigProvider locale={getAntdLocale()} theme={themeConfig}>
        <AntdApp>
          <Router>
            <div className={`app-container ${appTheme}-theme`}>
              <Routes>
                <Route path="/login" element={
                  isAuthenticated ? <Navigate to="/" /> : (
                    <div className="auth-container">
                      <Login />
                    </div>
                  )
                } />
                <Route path="/register" element={
                  isAuthenticated ? <Navigate to="/" /> : (
                    <div className="auth-container">
                      <Register />
                    </div>
                  )
                } />
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