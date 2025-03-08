import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Typography, Alert, Card, message, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { register, clearError } from '../../store/authSlice';
import { FormattedMessage } from 'react-intl';

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, error } = useSelector(state => state.auth);
  const [localError, setLocalError] = useState(null);
  const [form] = Form.useForm();
  const [showError, setShowError] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // 如果已经登录，重定向到首页
    if (isAuthenticated) {
      navigate('/home');
    }

    // 显示错误信息
    if (error) {
      setShowError(true);
    }
  }, [isAuthenticated, navigate, error]);

  const onFinish = async (values) => {
    console.log('注册表单数据:', values);
    setLocalLoading(true);
    setLocalError(null);
    
    try {
      // 确保邮箱地址转换为小写
      const registerData = {
        username: values.name,
        email: values.email.toLowerCase(),
        password: values.password
      };
      
      console.log('发送到后端的数据:', registerData);
      const response = await dispatch(register(registerData)).unwrap();
      console.log('注册响应:', response);
      
      messageApi.success('注册成功！正在跳转到首页...');
      // 使用window.location.href强制重定向到新的首页
      window.location.href = '/home';
    } catch (error) {
      console.error('注册错误:', error);
      // 显示错误消息
      setLocalError(error || '注册失败，请稍后再试');
      setShowError(true);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleErrorClose = () => {
    setShowError(false);
    setLocalError(null);
    dispatch(clearError());
  };

  return (
    <App>
      {contextHolder}
      <div className="register-container">
        <Card className="register-card">
          <div className="register-header">
            <Title level={2}>注册账号</Title>
            <Text type="secondary">创建您的账号以开始使用记账软件</Text>
          </div>

          {(showError || localError) && (
            <Alert
              message="注册失败"
              description={localError || error}
              type="error"
              closable
              onClose={handleErrorClose}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="name"
              rules={[
                {
                  required: true,
                  message: "请输入您的用户名"
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="请输入您的用户名（唯一标识符）"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: '请输入您的邮箱',
                },
                {
                  type: 'email',
                  message: '请输入有效的邮箱地址',
                },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: '请输入密码',
                },
                {
                  min: 6,
                  message: '密码长度不能少于6个字符',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: '请确认您的密码',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={localLoading}
              >
                注册
              </Button>
            </Form.Item>

            <div className="register-footer">
              <Text>已有账号？</Text>
              <Link to="/login">立即登录</Link>
            </div>
          </Form>
        </Card>
      </div>
    </App>
  );
};

export default Register; 