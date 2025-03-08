import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Switch, Select } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { setLocale } from '../../../store/settingsSlice';

const { Header } = Layout;
const { Option } = Select;

const AdminHeader = ({ collapsed, toggleCollapsed, adminInfo }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.settings);
  const { locale } = useSelector((state) => state.settings);
  
  // 处理退出登录
  const handleLogout = () => {
    // 清除管理员令牌和信息
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    
    // 导航到登录页面
    navigate('/admin/login');
  };
  
  // 处理语言切换
  const handleLocaleChange = (value) => {
    dispatch(setLocale(value));
    // 强制刷新页面以应用新语言
    window.location.reload();
  };
  
  // 用户下拉菜单项
  const userMenuItems = [
    {
      key: 'profile',
      label: <FormattedMessage id="admin.header.profile" defaultMessage="个人资料" />,
      icon: <UserOutlined />,
      onClick: () => navigate('/admin/profile')
    },
    {
      key: 'settings',
      label: <FormattedMessage id="admin.header.settings" defaultMessage="系统设置" />,
      icon: <SettingOutlined />,
      onClick: () => navigate('/admin/settings')
    },
    {
      key: 'password',
      label: <FormattedMessage id="admin.header.password" defaultMessage="修改密码" />,
      icon: <SettingOutlined />,
      onClick: () => navigate('/admin/security')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: <FormattedMessage id="admin.header.logout" defaultMessage="退出登录" />,
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];
  
  return (
    <Header className="admin-header">
      <div className="admin-header-left">
        <div className="admin-logo">
          <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <h1><FormattedMessage id="admin.title" defaultMessage="记账软件管理系统" /></h1>
        </div>
        <Button 
          type="text" 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          style={{ fontSize: '16px', width: 64, height: 64 }}
        />
      </div>
      
      <div className="admin-header-right">
        <Space>
          <GlobalOutlined style={{ color: '#1890ff' }} />
          <Select
            value={locale || 'zh-CN'}
            onChange={handleLocaleChange}
            style={{ width: 100 }}
            popupMatchSelectWidth={false}
          >
            <Option value="zh-CN">中文</Option>
            <Option value="en-US">English</Option>
          </Select>
        </Space>
        
        <Switch 
          checkedChildren="🌙" 
          unCheckedChildren="☀️" 
          checked={theme === 'dark'} 
          onChange={(checked) => dispatch({ type: 'settings/setTheme', payload: checked ? 'dark' : 'light' })}
          style={{ marginLeft: 16 }}
        />
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" style={{ marginLeft: 16 }}>
            <Space>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <span>{adminInfo?.username || 'Admin'}</span>
              {adminInfo?.isSystemAdmin && (
                <span style={{ color: '#ff4d4f', fontSize: '12px', marginLeft: '4px' }}>
                  (系统管理员)
                </span>
              )}
            </Space>
          </Button>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AdminHeader; 