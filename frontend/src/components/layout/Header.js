import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Button, Avatar, Space, Drawer, Select, Modal } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DownOutlined, 
  MenuOutlined,
  SettingOutlined,
  BookOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { logout, loadUser, logoutUser } from '../../store/authSlice';
import { fetchBooks } from '../../store/bookSlice';
import NotificationCenter from '../NotificationCenter';
import SettingsModal from '../SettingsModal';
import ProfileModal from '../ProfileModal';
import BookForm from '../BookForm';

const { Header: AntHeader } = Layout;
const { Option } = Select;

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { currentBook, books } = useSelector((state) => state.books);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [isCreateBookModalVisible, setIsCreateBookModalVisible] = useState(false);
  const intl = useIntl();
  
  // 判断当前是否在首页
  const isHomePage = location.pathname === '/home';

  // 用户头像处理
  useEffect(() => {
    // 确保用户信息已加载
  }, [user]);

  // 加载用户信息和账本
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
      dispatch(fetchBooks());
    }
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      window.location.href = '/login';
    });
  };

  const showMobileMenu = () => {
    setMobileMenuVisible(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
  };

  const openSettings = (tab = 'general') => {
    setSettingsTab(tab);
    setSettingsVisible(true);
  };

  const openProfile = () => {
    setProfileVisible(true);
  };

  // 处理创建账本成功
  const handleCreateBookSuccess = () => {
    setIsCreateBookModalVisible(false);
    dispatch(fetchBooks());
  };

  // 处理账本选择
  const handleBookChange = (e) => {
    const value = e.key;
    if (value === 'create-new') {
      setIsCreateBookModalVisible(true);
    } else {
      const book = books.find((b) => b._id === value);
      dispatch({ type: 'books/setCurrentBook', payload: book });
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <FormattedMessage id="user.profile" defaultMessage="个人资料" />,
      onClick: openProfile
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <FormattedMessage id="user.settings" defaultMessage="设置" />,
      onClick: () => openSettings()
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <FormattedMessage id="user.logout" defaultMessage="退出登录" />,
      onClick: handleLogout
    }
  ];

  // 移动端菜单项
  const getMobileMenuItems = () => {
    // 如果在首页，只显示设置和首页菜单项
    if (isHomePage) {
      return [
        {
          key: 'home',
          label: <FormattedMessage id="nav.home" defaultMessage="首页" />,
          onClick: () => navigate('/home')
        },
        {
          key: 'settings',
          label: <FormattedMessage id="nav.settings" defaultMessage="设置" />,
          onClick: () => openSettings()
        }
      ];
    }
    
    // 如果不在首页，显示完整菜单
    return [
      {
        key: 'home',
        label: <FormattedMessage id="nav.home" defaultMessage="首页" />,
        onClick: () => navigate('/home')
      },
      {
        key: 'dashboard',
        label: <FormattedMessage id="nav.dashboard" defaultMessage="仪表盘" />,
        onClick: () => navigate('/dashboard')
      },
      {
        key: 'transactions',
        label: <FormattedMessage id="nav.transactions" defaultMessage="交易记录" />,
        onClick: () => navigate('/transactions')
      },
      {
        key: 'accounts',
        label: <FormattedMessage id="nav.accounts" defaultMessage="账户管理" />,
        onClick: () => navigate('/accounts')
      },
      {
        key: 'reports',
        label: <FormattedMessage id="nav.reports" defaultMessage="报表" />,
        onClick: () => navigate('/reports')
      },
      {
        key: 'settings',
        label: <FormattedMessage id="nav.settings" defaultMessage="设置" />,
        onClick: () => openSettings()
      }
    ];
  };

  // 创建账本菜单项
  const bookMenuItems = books && books.length > 0 ? [
    ...books.map(book => ({
      key: book._id,
      label: book.name
    })),
    {
      key: 'create-new',
      icon: <PlusOutlined />,
      label: '创建新账本'
    }
  ] : [];

  const bookMenu = { items: bookMenuItems, onClick: handleBookChange };
  const userMenu = { items: userMenuItems };
  const mobileMenu = <Menu mode="inline" theme="light" items={getMobileMenuItems()} />;

  return (
    <>
      <AntHeader className="app-header">
        <div className="header-left">
          <Button
            type="text"
            icon={<MenuOutlined />} 
            onClick={showMobileMenu}
            className="mobile-menu-button"
          />
          {!isHomePage && books && books.length > 0 && currentBook && (
            <Dropdown menu={bookMenu} trigger={['click']}>
              <Button type="link" className="book-dropdown-button">
                <Space>
                  <BookOutlined />
                  <span className="bookname">{currentBook?.name || <FormattedMessage id="book.select" defaultMessage="选择账本" />}</span>
                  <DownOutlined className="dropdown-icon" />
                </Space>
              </Button>
            </Dropdown>
          )}
        </div>
        
        <div className="header-right">
          <Space size="large">
            <NotificationCenter />
            <Dropdown menu={userMenu} trigger={['click']}>
              <Button type="link" className="user-dropdown-button">
                <Space>
                  {user?.avatar ? (
                    <Avatar 
                      src={user.avatar.startsWith('http') ? user.avatar : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${user.avatar}`.replace('/api/uploads', '/uploads')} 
                      icon={<UserOutlined />} 
                    />
                  ) : (
                    <Avatar icon={<UserOutlined />} />
                  )}
                  <span className="username">{user?.username || <FormattedMessage id="auth.user" defaultMessage="用户" />}</span>
                  <DownOutlined className="dropdown-icon" />
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </div>
      </AntHeader>
      
      <SettingsModal 
        visible={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        defaultTab={settingsTab}
      />
      
      <ProfileModal
        visible={profileVisible}
        onCancel={() => setProfileVisible(false)}
      />
      
      <Drawer
        title={<FormattedMessage id="app.title" defaultMessage="记账软件" />}
        placement="left"
        onClose={closeMobileMenu}
        open={mobileMenuVisible}
        className="mobile-drawer"
      >
        {mobileMenu}
      </Drawer>

      {/* 创建账本模态框 */}
      <Modal
        title={intl.formatMessage({ id: "book.create", defaultMessage: "创建新账本" })}
        open={isCreateBookModalVisible}
        onCancel={() => setIsCreateBookModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <BookForm 
          onSuccess={handleCreateBookSuccess}
          onCancel={() => setIsCreateBookModalVisible(false)}
        />
      </Modal>
    </>
  );
};

export default Header; 