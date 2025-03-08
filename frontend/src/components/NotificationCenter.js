import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Dropdown, List, Button, Tabs, Empty, Spin, message } from 'antd';
import { BellOutlined, DollarOutlined, BankOutlined, BookOutlined, TeamOutlined, SettingOutlined, ExclamationCircleOutlined, WarningOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  deleteAllNotifications 
} from '../store/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useIntl } from 'react-intl';
import './NotificationCenter.css';

// 将getNotificationIcon函数移到全局作用域
const getNotificationIcon = (type) => {
  switch (type) {
    case 'transaction':
      return <DollarOutlined style={{ color: '#1890ff' }} />;
    case 'account':
      return <BankOutlined style={{ color: '#52c41a' }} />;
    case 'book':
      return <BookOutlined style={{ color: '#722ed1' }} />;
    case 'member':
      return <TeamOutlined style={{ color: '#fa8c16' }} />;
    case 'system':
      return <SettingOutlined style={{ color: '#faad14' }} />;
    case 'error':
      return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
    case 'warning':
      return <WarningOutlined style={{ color: '#fa8c16' }} />;
    case 'success':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'info':
    default:
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
  }
};

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const [localLoading, setLocalLoading] = useState(false);
  const intl = useIntl();

  // 初始加载通知
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // 定期检查并删除过期通知（每天检查一次）
  useEffect(() => {
    // 设置每天检查一次
    const checkInterval = 24 * 60 * 60 * 1000; // 24小时
    
    const intervalId = setInterval(() => {
      dispatch(fetchNotifications());
    }, checkInterval);
    
    // 清理函数
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);

  const handleVisibleChange = (newVisible) => {
    setVisible(newVisible);
  };

  const handleMarkAsRead = async (id) => {
    try {
      setLocalLoading(true);
      await dispatch(markAsRead(id)).unwrap();
      message.success(intl.formatMessage({ id: 'notification.markedAsRead', defaultMessage: '通知已标记为已读' }));
    } catch (error) {
      message.error(intl.formatMessage(
        { id: 'notification.markAsReadError', defaultMessage: '标记通知失败: {error}' },
        { error: error || intl.formatMessage({ id: 'common.unknownError', defaultMessage: '未知错误' }) }
      ));
      console.error('标记通知失败:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLocalLoading(true);
      await dispatch(markAllAsRead()).unwrap();
      message.success(intl.formatMessage({ id: 'notification.allMarkedAsRead', defaultMessage: '所有通知已标记为已读' }));
    } catch (error) {
      message.error(intl.formatMessage(
        { id: 'notification.markAllAsReadError', defaultMessage: '标记所有通知失败: {error}' },
        { error: error || intl.formatMessage({ id: 'common.unknownError', defaultMessage: '未知错误' }) }
      ));
      console.error('标记所有通知失败:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLocalLoading(true);
      await dispatch(deleteNotification(id)).unwrap();
      message.success(intl.formatMessage({ id: 'notification.deleted', defaultMessage: '通知已删除' }));
    } catch (error) {
      message.error(intl.formatMessage(
        { id: 'notification.deleteError', defaultMessage: '删除通知失败: {error}' },
        { error: error || intl.formatMessage({ id: 'common.unknownError', defaultMessage: '未知错误' }) }
      ));
      console.error('删除通知失败:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setLocalLoading(true);
      await dispatch(deleteAllNotifications()).unwrap();
      message.success(intl.formatMessage({ id: 'notification.allDeleted', defaultMessage: '所有通知已删除' }));
    } catch (error) {
      message.error(intl.formatMessage(
        { id: 'notification.deleteAllError', defaultMessage: '删除所有通知失败: {error}' },
        { error: error || intl.formatMessage({ id: 'common.unknownError', defaultMessage: '未知错误' }) }
      ));
      console.error('删除所有通知失败:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead);
    } else if (filter === 'read') {
      return notifications.filter(n => n.isRead);
    }
    return notifications;
  };

  const notificationMenu = (
    <div className="notification-menu">
      <div className="notification-header">
        <h3><FormattedMessage id="notification.center" defaultMessage="通知中心" /></h3>
        <div className="notification-actions">
          <Button 
            type="link" 
            size="small" 
            onClick={handleMarkAllAsRead}
            disabled={loading || localLoading || !notifications.filter(n => !n.isRead).length}
            loading={localLoading}
          >
            <FormattedMessage id="notification.markAllAsRead" defaultMessage="全部已读" />
          </Button>
          <Button 
            type="link" 
            size="small" 
            onClick={handleDeleteAll}
            disabled={loading || localLoading || !notifications.length}
            loading={localLoading}
          >
            <FormattedMessage id="notification.clearAll" defaultMessage="清空" />
          </Button>
        </div>
      </div>
      <Tabs 
        defaultActiveKey="all" 
        onChange={setFilter}
        size="small"
        items={[
          {
            key: 'all',
            label: <FormattedMessage id="notification.all" defaultMessage="全部" />,
            children: (
              <NotificationList 
                notifications={getFilteredNotifications()} 
                loading={loading || localLoading}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            )
          },
          {
            key: 'unread',
            label: <FormattedMessage id="notification.unread" defaultMessage="未读" />,
            children: (
              <NotificationList 
                notifications={getFilteredNotifications()} 
                loading={loading || localLoading}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            )
          },
          {
            key: 'read',
            label: <FormattedMessage id="notification.read" defaultMessage="已读" />,
            children: (
              <NotificationList 
                notifications={getFilteredNotifications()} 
                loading={loading || localLoading}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            )
          }
        ]}
      />
    </div>
  );

  return (
    <Dropdown
      menu={{ content: notificationMenu }}
      trigger={['click']}
      open={visible}
      onOpenChange={handleVisibleChange}
      placement="bottomRight"
      dropdownRender={() => notificationMenu}
      overlayClassName="notification-dropdown"
      getPopupContainer={(triggerNode) => triggerNode.parentNode}
      className="notification-center"
    >
      <Badge count={unreadCount} overflowCount={99}>
        <Button type="text" icon={<BellOutlined />} className="header-icon-button" />
      </Badge>
    </Dropdown>
  );
};

const NotificationList = ({ notifications, loading, onMarkAsRead, onDelete }) => {
  if (loading) {
    return <div className="notification-loading"><Spin /></div>;
  }

  if (!notifications.length) {
    return <Empty description={<FormattedMessage id="notification.empty" defaultMessage="暂无通知" />} className="notification-empty-container" />;
  }

  return (
    <List
      className="notification-list"
      itemLayout="vertical"
      dataSource={notifications}
      size="small"
      renderItem={item => (
        <List.Item
          className={`notification-item ${!item.isRead ? 'notification-unread' : ''}`}
        >
          <div className="notification-header-row">
            <div className="notification-title" title={item.title}>{item.title}</div>
            <div className="notification-time">
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
                locale: localStorage.getItem('locale') === 'en-US' ? enUS : zhCN,
              })}
            </div>
          </div>
          <div className="notification-content-row">
            <div className="notification-message" title={item.message}>{item.message}</div>
            <div className="notification-item-actions">
              {!item.isRead && (
                <Button 
                  type="text" 
                  size="small" 
                  onClick={() => onMarkAsRead(item._id)}
                >
                  已读
                </Button>
              )}
              <Button 
                type="text" 
                size="small" 
                danger
                onClick={() => onDelete(item._id)}
              >
                删除
              </Button>
            </div>
          </div>
        </List.Item>
      )}
    />
  );
};

export default NotificationCenter; 