import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Spin } from 'antd';
import { loadUser } from './store/authSlice';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import BookList from './pages/books/BookList';
import BookDetail from './pages/books/BookDetail';
import TransactionForm from './pages/transactions/TransactionForm';
import TransactionList from './pages/transactions/TransactionList';
import Settings from './pages/settings/Settings';
import Reports from './pages/reports/Reports';
import './App.css';

const { Content } = Layout;

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="app-loader">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <Layout className="app-container">
      {isAuthenticated && <Header />}
      <Layout>
        {isAuthenticated && <Sidebar />}
        <Content className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/books"
              element={
                <PrivateRoute>
                  <BookList />
                </PrivateRoute>
              }
            />
            <Route
              path="/books/:id"
              element={
                <PrivateRoute>
                  <BookDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions/new"
              element={
                <PrivateRoute>
                  <TransactionForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions/edit/:id"
              element={
                <PrivateRoute>
                  <TransactionForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <TransactionList />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App; 