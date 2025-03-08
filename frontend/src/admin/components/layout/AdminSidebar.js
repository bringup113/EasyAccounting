import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  DashboardOutlined,
  UserOutlined,
  MonitorOutlined,
  SafetyOutlined,
  SettingOutlined,
  BellOutlined,
  DatabaseOutlined,
  FileProtectOutlined,
  AuditOutlined,
  BookOutlined
} from '@ant-design/icons';
import './AdminSidebar.css'; // 确保引入CSS文件

const { Sider } = Layout;

const AdminSidebar = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 获取当前路径的第一级路径
  const getSelectedKey = () => {
    const path = location.pathname.split('/')[2] || '';
    if (path === 'notifications' || path === 'security') {
      return 'settings';
    }
    return path || 'dashboard';
  };
  
  // 自定义子菜单项渲染
  const renderSubMenuItem = (path, messageId, defaultMessage) => (
    <div className="submenu-item-wrapper">
      <Link to={path} className="submenu-item">
        <FormattedMessage id={messageId} defaultMessage={defaultMessage} />
      </Link>
    </div>
  );
  
  // 处理菜单项点击事件
  const handleMenuClick = (item) => {
    // 根据菜单项的key导航到对应的路径
    switch(item.key) {
      case 'dashboard':
        navigate('/admin');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'books':
        navigate('/admin/books');
        break;
      case 'monitor':
        navigate('/admin/monitor');
        break;
      case 'system':
        navigate('/admin/settings');
        break;
      case 'notifications':
        navigate('/admin/notifications');
        break;
      case 'security':
        navigate('/admin/security');
        break;
      default:
        // 如果是settings，不做导航，因为它是一个有子菜单的项
        if (item.key !== 'settings') {
          navigate('/admin');
        }
    }
  };
  
  // 菜单项配置
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin"><FormattedMessage id="admin.menu.dashboard" defaultMessage="控制台" /></Link>
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users"><FormattedMessage id="admin.menu.users" defaultMessage="用户管理" /></Link>
    },
    {
      key: 'books',
      icon: <BookOutlined />,
      label: <Link to="/admin/books"><FormattedMessage id="admin.menu.books" defaultMessage="账本管理" /></Link>
    },
    {
      key: 'monitor',
      icon: <MonitorOutlined />,
      label: <Link to="/admin/monitor"><FormattedMessage id="admin.menu.monitor" defaultMessage="系统监控" /></Link>
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <FormattedMessage id="admin.menu.settings" defaultMessage="系统设置" />,
      children: [
        {
          key: 'system',
          label: renderSubMenuItem("/admin/settings", "admin.menu.system", "基本设置")
        },
        {
          key: 'notifications',
          label: renderSubMenuItem("/admin/notifications", "admin.menu.notifications", "通知设置")
        },
        {
          key: 'security',
          label: renderSubMenuItem("/admin/security", "admin.menu.security", "安全设置")
        }
      ]
    }
  ];
  
  return (
    <Sider
      width={200}
      className="admin-sidebar"
      collapsible
      collapsed={collapsed}
      theme="light"
    >
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        defaultOpenKeys={collapsed ? [] : ['settings']}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default AdminSidebar; 