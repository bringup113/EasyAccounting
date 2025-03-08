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
  RollbackOutlined,
  AppstoreOutlined,
  TagOutlined,
  UserOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { clearCurrentBook } from '../../store/bookSlice';
import './Sidebar.css';

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
    
    // 使用React Router的navigate函数导航到根路径，避免页面刷新
    navigate('/');
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
        label: <button onClick={handleDashboardClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.dashboard" defaultMessage="概览" /></button>
      }
    ];
    
    const bookItems = currentBook ? [
      {
        key: 'accounts',
        icon: <BankOutlined />,
        label: <Link to="/accounts" style={{ width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.accounts" defaultMessage="账户管理" /></Link>
      },
      {
        key: 'reports',
        icon: <BarChartOutlined />,
        label: <Link to="/reports" style={{ width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.reports" defaultMessage="统计报表" /></Link>
      },
      {
        key: 'categories',
        icon: <AppstoreOutlined />,
        label: <Link to="/categories" style={{ width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.categories" defaultMessage="收支项目" /></Link>
      },
      {
        key: 'tags',
        icon: <TagOutlined />,
        label: <Link to="/tags" style={{ width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.tags" defaultMessage="标签管理" /></Link>
      },
      {
        key: 'persons',
        icon: <UserOutlined />,
        label: <Link to="/persons" style={{ width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.persons" defaultMessage="人员机构" /></Link>
      },
      {
        key: 'book-currencies',
        icon: <DollarOutlined />,
        label: <Link to="/book-currency-settings" style={{ width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.book-currencies" defaultMessage="货币设置" /></Link>
      },
      {
        key: 'book-settings',
        icon: <SettingOutlined />,
        label: <Link to="/book-settings" style={{ width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.book-settings" defaultMessage="账本设置" /></Link>
      },
      {
        key: 'exit-book',
        icon: <RollbackOutlined />,
        label: <button onClick={handleExitBook} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.exit-book" defaultMessage="返回账本列表" /></button>
      }
    ] : [];

    const settingsItems = currentBook ? [] : [
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link to="/settings" style={{ width: '100%', display: 'flex', alignItems: 'center' }}><FormattedMessage id="nav.settings" defaultMessage="设置" /></Link>
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
        className="sidebar-menu custom-sidebar-menu"
      />
    </Sider>
  );
};

export default Sidebar; 