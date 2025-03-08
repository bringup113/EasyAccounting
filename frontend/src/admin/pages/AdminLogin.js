import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import axios from 'axios';

const { Title, Text } = Typography;

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      // 使用管理员登录API
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/admins/login`, {
        username: values.username,
        password: values.password
      });
      
      if (response.data.success) {
        // 保存管理员令牌到localStorage
        localStorage.setItem('adminToken', response.data.token);
        
        // 保存管理员信息到localStorage
        localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
        
        // 导航到管理后台
        navigate('/admin');
      } else {
        setError(response.data.message || intl.formatMessage({ id: 'admin.login.failed', defaultMessage: '登录失败' }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || intl.formatMessage({ id: 'admin.login.failed', defaultMessage: '登录失败，请检查用户名和密码' }));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-login-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Space direction="vertical" size={12}>
            <Title level={2} style={{ margin: 0 }}>
              <FormattedMessage id="admin.login.title" defaultMessage="管理后台" />
            </Title>
            <Text type="secondary">
              <FormattedMessage id="admin.login.subtitle" defaultMessage="请输入管理员账号和密码" />
            </Text>
          </Space>
        </div>
        
        {error && (
          <Alert 
            message={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: 24 }} 
          />
        )}
        
        <Form
          name="admin_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { 
                required: true, 
                message: intl.formatMessage({ id: 'admin.login.usernameRequired', defaultMessage: '请输入用户名' }) 
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder={intl.formatMessage({ id: 'admin.login.username', defaultMessage: '用户名' })} 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { 
                required: true, 
                message: intl.formatMessage({ id: 'admin.login.passwordRequired', defaultMessage: '请输入密码' }) 
              }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder={intl.formatMessage({ id: 'admin.login.password', defaultMessage: '密码' })} 
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<LoginOutlined />}
              block
            >
              <FormattedMessage id="admin.login.submit" defaultMessage="登录" />
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="link" 
              onClick={() => navigate('/')}
            >
              <FormattedMessage id="admin.login.backToHome" defaultMessage="返回首页" />
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLogin; 