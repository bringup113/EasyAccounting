import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Tooltip, Badge, Progress } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined, 
  TransactionOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const Dashboard = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, new: 0 },
    books: { total: 0, active: 0 },
    transactions: { total: 0, income: 0, expense: 0 },
    system: { cpu: 0, memory: 0, disk: 0, uptime: 0 }
  });
  
  // 模拟获取统计数据
  const fetchStats = () => {
    setLoading(true);
    // 这里应该是实际的API调用
    setTimeout(() => {
      setStats({
        users: { total: 1250, active: 876, new: 125 },
        books: { total: 3456, active: 2345 },
        transactions: { total: 45678, income: 234567, expense: 198765 },
        system: { cpu: 35, memory: 65, disk: 48, uptime: 15 }
      });
      setLoading(false);
    }, 1000);
  };
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  // 系统状态数据
  const systemStatusData = [
    {
      key: '1',
      service: intl.formatMessage({ id: 'admin.dashboard.webServer', defaultMessage: 'Web服务器' }),
      status: 'running',
      uptime: '15天4小时',
      load: 35,
    },
    {
      key: '2',
      service: intl.formatMessage({ id: 'admin.dashboard.apiServer', defaultMessage: 'API服务器' }),
      status: 'running',
      uptime: '15天4小时',
      load: 42,
    },
    {
      key: '3',
      service: intl.formatMessage({ id: 'admin.dashboard.database', defaultMessage: '数据库' }),
      status: 'running',
      uptime: '15天3小时',
      load: 28,
    },
    {
      key: '4',
      service: intl.formatMessage({ id: 'admin.dashboard.cacheServer', defaultMessage: '缓存服务器' }),
      status: 'warning',
      uptime: '2天6小时',
      load: 78,
    },
    {
      key: '5',
      service: intl.formatMessage({ id: 'admin.dashboard.backupService', defaultMessage: '备份服务' }),
      status: 'stopped',
      uptime: '-',
      load: 0,
    },
  ];
  
  // 系统状态列定义
  const systemStatusColumns = [
    {
      title: intl.formatMessage({ id: 'admin.dashboard.service', defaultMessage: '服务' }),
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: intl.formatMessage({ id: 'admin.dashboard.status', defaultMessage: '状态' }),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'success';
        let icon = <CheckCircleOutlined />;
        let text = intl.formatMessage({ id: 'admin.dashboard.running', defaultMessage: '运行中' });
        
        if (status === 'warning') {
          color = 'warning';
          icon = <ExclamationCircleOutlined />;
          text = intl.formatMessage({ id: 'admin.dashboard.warning', defaultMessage: '警告' });
        } else if (status === 'stopped') {
          color = 'error';
          icon = <CloseCircleOutlined />;
          text = intl.formatMessage({ id: 'admin.dashboard.stopped', defaultMessage: '已停止' });
        }
        
        return <Badge status={color} text={text} icon={icon} />;
      },
    },
    {
      title: intl.formatMessage({ id: 'admin.dashboard.uptime', defaultMessage: '运行时间' }),
      dataIndex: 'uptime',
      key: 'uptime',
    },
    {
      title: intl.formatMessage({ id: 'admin.dashboard.load', defaultMessage: '负载' }),
      dataIndex: 'load',
      key: 'load',
      render: (load) => {
        let color = 'success';
        if (load > 70) {
          color = 'exception';
        } else if (load > 50) {
          color = 'warning';
        }
        
        return <Progress percent={load} size="small" status={color} />;
      },
    },
    {
      title: intl.formatMessage({ id: 'admin.dashboard.action', defaultMessage: '操作' }),
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => console.log('Restart service:', record.service)}
        >
          <FormattedMessage id="admin.dashboard.restart" defaultMessage="重启" />
        </Button>
      ),
    },
  ];
  
  return (
    <div className="admin-dashboard">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2><FormattedMessage id="admin.dashboard.title" defaultMessage="控制台" /></h2>
        <Tooltip title={intl.formatMessage({ id: 'admin.dashboard.refresh', defaultMessage: '刷新数据' })}>
          <Button 
            type="primary" 
            shape="circle" 
            icon={<ReloadOutlined />} 
            onClick={fetchStats}
            loading={loading}
          />
        </Tooltip>
      </div>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="admin-stat-card">
            <Statistic
              title={intl.formatMessage({ id: 'admin.dashboard.totalUsers', defaultMessage: '总用户数' })}
              value={stats.users.total}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> {stats.users.new}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="admin-stat-card">
            <Statistic
              title={intl.formatMessage({ id: 'admin.dashboard.activeUsers', defaultMessage: '活跃用户' })}
              value={stats.users.active}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="admin-stat-card">
            <Statistic
              title={intl.formatMessage({ id: 'admin.dashboard.totalBooks', defaultMessage: '总账本数' })}
              value={stats.books.total}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="admin-stat-card">
            <Statistic
              title={intl.formatMessage({ id: 'admin.dashboard.totalTransactions', defaultMessage: '总交易数' })}
              value={stats.transactions.total}
              prefix={<TransactionOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 系统状态 */}
      <Card 
        title={intl.formatMessage({ id: 'admin.dashboard.systemStatus', defaultMessage: '系统状态' })}
        className="admin-card"
        style={{ marginTop: 24 }}
      >
        <Table 
          columns={systemStatusColumns} 
          dataSource={systemStatusData} 
          pagination={false}
          className="admin-table"
        />
      </Card>
      
      {/* 系统资源使用情况 */}
      <Card 
        title={intl.formatMessage({ id: 'admin.dashboard.systemResources', defaultMessage: '系统资源使用情况' })}
        className="admin-card"
        style={{ marginTop: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic
              title={intl.formatMessage({ id: 'admin.dashboard.cpuUsage', defaultMessage: 'CPU使用率' })}
              value={stats.system.cpu}
              suffix="%"
              prefix={<Progress type="dashboard" percent={stats.system.cpu} width={50} />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title={intl.formatMessage({ id: 'admin.dashboard.memoryUsage', defaultMessage: '内存使用率' })}
              value={stats.system.memory}
              suffix="%"
              prefix={<Progress type="dashboard" percent={stats.system.memory} width={50} />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title={intl.formatMessage({ id: 'admin.dashboard.diskUsage', defaultMessage: '磁盘使用率' })}
              value={stats.system.disk}
              suffix="%"
              prefix={<Progress type="dashboard" percent={stats.system.disk} width={50} />}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;