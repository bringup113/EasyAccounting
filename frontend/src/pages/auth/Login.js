import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { clearError } from '../../store/authSlice';
import { loadUser } from '../../store/authSlice';
import { login } from '../../store/authSlice';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    // 如果已经登录，重定向到首页
    if (isAuthenticated) {
      navigate('/home');
    }

    // 显示错误信息
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, error, navigate, dispatch]);

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // 确保邮箱地址转换为小写
      const loginData = {
        ...values,
        email: values.email.toLowerCase()
      };
      
      const response = await dispatch(login(loginData)).unwrap();
      
      // 登录成功后立即加载用户信息
      await dispatch(loadUser()).unwrap();
      
      // 登录成功后强制重定向到新的首页
      window.location.href = '/home';
    } catch (error) {
      // 错误已经在useEffect中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}><FormattedMessage id="app.title" defaultMessage="记账软件" /></Title>
          <Title level={4} style={{ marginTop: 0 }}><FormattedMessage id="auth.login" defaultMessage="用户登录" /></Title>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: intl.formatMessage({ id: 'auth.emailRequired', defaultMessage: '请输入邮箱' }) },
              { type: 'email', message: intl.formatMessage({ id: 'auth.emailValid', defaultMessage: '请输入有效的邮箱地址' }) },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder={intl.formatMessage({ id: 'auth.email', defaultMessage: '邮箱' })} size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: intl.formatMessage({ id: 'auth.passwordRequired', defaultMessage: '请输入密码' }) }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={intl.formatMessage({ id: 'auth.password', defaultMessage: '密码' })} size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              <FormattedMessage id="auth.login" defaultMessage="登录" />
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to="/register">
              <FormattedMessage id="auth.register" defaultMessage="注册" />
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 