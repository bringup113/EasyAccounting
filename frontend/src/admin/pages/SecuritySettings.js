import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Tabs, Alert } from 'antd';
import { LockOutlined, SaveOutlined, SecurityScanOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import axios from 'axios';

const { TabPane } = Tabs;

const SecuritySettings = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // 处理修改密码
  const handleUpdatePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error(intl.formatMessage({ id: 'admin.security.passwordMismatch', defaultMessage: '两次输入的密码不一致' }));
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/admins/updatepassword`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      
      if (response.data.success) {
        message.success(intl.formatMessage({ id: 'admin.security.passwordUpdateSuccess', defaultMessage: '密码更新成功' }));
        form.resetFields();
      } else {
        message.error(response.data.message || intl.formatMessage({ id: 'admin.security.passwordUpdateFailed', defaultMessage: '密码更新失败' }));
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message || intl.formatMessage({ id: 'admin.security.passwordUpdateFailed', defaultMessage: '密码更新失败' }));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-security-settings">
      <Card className="admin-card">
        <div className="admin-page-header">
          <h2><FormattedMessage id="admin.security.title" defaultMessage="安全设置" /></h2>
        </div>
        
        <Tabs defaultActiveKey="password">
          <TabPane 
            tab={
              <span>
                <LockOutlined />
                <FormattedMessage id="admin.security.password" defaultMessage="密码设置" />
              </span>
            } 
            key="password"
          >
            <Alert
              message={intl.formatMessage({ id: 'admin.security.passwordInfo', defaultMessage: '密码安全' })}
              description={intl.formatMessage({ id: 'admin.security.passwordDesc', defaultMessage: '定期修改密码可以提高账户安全性。建议使用包含字母、数字和特殊字符的强密码。' })}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdatePassword}
            >
              <Form.Item
                name="currentPassword"
                label={intl.formatMessage({ id: 'admin.security.currentPassword', defaultMessage: '当前密码' })}
                rules={[
                  { 
                    required: true, 
                    message: intl.formatMessage({ id: 'admin.security.currentPasswordRequired', defaultMessage: '请输入当前密码' }) 
                  }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder={intl.formatMessage({ id: 'admin.security.currentPasswordPlaceholder', defaultMessage: '请输入当前密码' })} 
                />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label={intl.formatMessage({ id: 'admin.security.newPassword', defaultMessage: '新密码' })}
                rules={[
                  { 
                    required: true, 
                    message: intl.formatMessage({ id: 'admin.security.newPasswordRequired', defaultMessage: '请输入新密码' }) 
                  },
                  { 
                    min: 6, 
                    message: intl.formatMessage({ id: 'admin.security.passwordMinLength', defaultMessage: '密码长度不能少于6个字符' }) 
                  }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder={intl.formatMessage({ id: 'admin.security.newPasswordPlaceholder', defaultMessage: '请输入新密码' })} 
                />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label={intl.formatMessage({ id: 'admin.security.confirmPassword', defaultMessage: '确认新密码' })}
                rules={[
                  { 
                    required: true, 
                    message: intl.formatMessage({ id: 'admin.security.confirmPasswordRequired', defaultMessage: '请确认新密码' }) 
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(intl.formatMessage({ id: 'admin.security.passwordMismatch', defaultMessage: '两次输入的密码不一致' })));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder={intl.formatMessage({ id: 'admin.security.confirmPasswordPlaceholder', defaultMessage: '请确认新密码' })} 
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={loading}
                >
                  <FormattedMessage id="admin.security.updatePassword" defaultMessage="更新密码" />
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SecurityScanOutlined />
                <FormattedMessage id="admin.security.other" defaultMessage="其他安全设置" />
              </span>
            } 
            key="other"
          >
            <Alert
              message={intl.formatMessage({ id: 'admin.security.comingSoon', defaultMessage: '功能开发中' })}
              description={intl.formatMessage({ id: 'admin.security.comingSoonDesc', defaultMessage: '更多安全设置功能正在开发中，敬请期待...' })}
              type="info"
              showIcon
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SecuritySettings; 