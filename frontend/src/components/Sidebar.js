import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { FormattedMessage } from 'react-intl';
import {
  DashboardOutlined,
  TransactionOutlined,
  BankOutlined,
  SettingOutlined,
  TagOutlined,
  UserOutlined,
  BookOutlined,
  BarChartOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { clearCurrentBook } from '../store/bookSlice';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentBook } = useSelector((state) => state.books);

  // 处理退出账本
  const handleExitBook = () => {
    dispatch(clearCurrentBook());
  };

  // 根据当前路径获取选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/') return ['dashboard'];
    if (path.startsWith('/transactions')) return ['transactions'];
    if (path.startsWith('/accounts')) return ['accounts'];
    if (path.startsWith('/categories')) return ['categories'];
    if (path.startsWith('/tags')) return ['tags'];
    if (path.startsWith('/persons')) return ['persons'];
    if (path.startsWith('/reports')) return ['reports'];
    if (path.startsWith('/settings')) return ['settings'];
    if (path.startsWith('/books')) return ['books'];
    return [];
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse} style={{ minHeight: '100vh' }}>
      <div className="logo" style={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: 'white', margin: 0 }}>
          {collapsed ? '记' : <FormattedMessage id="app.title" defaultMessage="记账软件" />}
        </h2>
      </div>
      <Menu theme="dark" selectedKeys={getSelectedKeys()} mode="inline">
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <Link to="/">
            <FormattedMessage id="nav.dashboard" defaultMessage="首页" />
          </Link>
        </Menu.Item>
        
        {!currentBook ? (
          <Menu.Item key="books" icon={<BookOutlined />}>
            <Link to="/books">
              <FormattedMessage id="nav.books" defaultMessage="账本管理" />
            </Link>
          </Menu.Item>
        ) : (
          <>
            <Menu.Item key="transactions" icon={<TransactionOutlined />}>
              <Link to="/transactions">
                <FormattedMessage id="nav.transactions" defaultMessage="交易记录" />
              </Link>
            </Menu.Item>
            <Menu.Item key="accounts" icon={<BankOutlined />}>
              <Link to="/accounts">
                <FormattedMessage id="nav.accounts" defaultMessage="账户管理" />
              </Link>
            </Menu.Item>
            <Menu.Item key="categories" icon={<TagOutlined />}>
              <Link to="/categories">
                <FormattedMessage id="nav.categories" defaultMessage="分类管理" />
              </Link>
            </Menu.Item>
            <Menu.Item key="tags" icon={<TagOutlined />}>
              <Link to="/tags">
                <FormattedMessage id="nav.tags" defaultMessage="标签管理" />
              </Link>
            </Menu.Item>
            <Menu.Item key="persons" icon={<UserOutlined />}>
              <Link to="/persons">
                <FormattedMessage id="nav.persons" defaultMessage="相关人员" />
              </Link>
            </Menu.Item>
            <Menu.Item key="reports" icon={<BarChartOutlined />}>
              <Link to="/reports">
                <FormattedMessage id="nav.reports" defaultMessage="统计报表" />
              </Link>
            </Menu.Item>
            <Menu.Item key="exit-book" icon={<RollbackOutlined />} onClick={handleExitBook}>
              <FormattedMessage id="nav.exit-book" defaultMessage="返回账本列表" />
            </Menu.Item>
          </>
        )}
        
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          <Link to="/settings">
            <FormattedMessage id="nav.settings" defaultMessage="系统设置" />
          </Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar; 