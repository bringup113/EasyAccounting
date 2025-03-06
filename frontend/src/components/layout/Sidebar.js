import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu } from 'antd';
import { FormattedMessage } from 'react-intl';
import dayjs from 'dayjs';
import {
  HomeOutlined,
  BankOutlined,
  BarChartOutlined,
  SettingOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { clearCurrentBook } from '../../store/bookSlice';

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBook } = useSelector((state) => state.books);

  // 处理退出账本
  const handleExitBook = () => {
    // 先清除当前账本
    dispatch(clearCurrentBook());
    
    // 直接使用window.location.href导航到根路径，确保完全刷新页面
    window.location.href = '/';
  };

  // 处理导航到概览页面
  const handleDashboardClick = (e) => {
    e.preventDefault();
    const today = dayjs().format('YYYY-MM');
    navigate(`/dashboard?date=${today}`);
  };

  // 获取当前路径的第一级路径
  const getSelectedKey = () => {
    const path = location.pathname.split('/')[1];
    return path || 'dashboard';
  };

  // 创建菜单项
  const getMenuItems = () => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: <a onClick={handleDashboardClick}><FormattedMessage id="nav.dashboard" defaultMessage="概览" /></a>
      }
    ];
    
    const bookItems = currentBook ? [
      {
        key: 'accounts',
        icon: <BankOutlined />,
        label: <Link to="/accounts"><FormattedMessage id="nav.accounts" defaultMessage="账户管理" /></Link>
      },
      {
        key: 'reports',
        icon: <BarChartOutlined />,
        label: <Link to="/reports"><FormattedMessage id="nav.reports" defaultMessage="统计报表" /></Link>
      },
      {
        key: 'exit-book',
        icon: <RollbackOutlined />,
        label: <span onClick={handleExitBook}><FormattedMessage id="nav.exit-book" defaultMessage="返回账本列表" /></span>
      }
    ] : [];

    const settingsItems = currentBook ? [] : [
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link to="/settings"><FormattedMessage id="nav.settings" defaultMessage="设置" /></Link>
      }
    ];

    return [...baseItems, ...bookItems, ...settingsItems];
  };

  return (
    <Sider
      width={200}
      className="app-sidebar site-layout-background"
      breakpoint="lg"
      collapsible
      theme="light"
    >
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ height: '100%', borderRight: 0 }}
        items={getMenuItems()}
      />
    </Sider>
  );
};

export default Sidebar; 