import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  InputNumber, 
  Switch, 
  Button, 
  message, 
  Divider, 
  Space, 
  Select, 
  Row, 
  Col,
  Alert,
  Tabs,
  Table,
  Tag,
  Radio,
  Tooltip
} from 'antd';
import { 
  SaveOutlined, 
  BellOutlined, 
  ClockCircleOutlined, 
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const { Option } = Select;
const { TabPane } = Tabs;

const NotificationSettings = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    autoDeleteEnabled: true,
    autoDeleteDays: 7,
    autoDeleteConditions: ['read'],
    notificationTypes: ['system', 'transaction', 'account', 'book', 'error', 'warning', 'info', 'success'],
    maxNotifications: 100,
    emailNotifications: false,
    pushNotifications: false,
    notifyAdminsOnly: false
  });
  
  // 模拟获取通知设置
  const fetchSettings = () => {
    setLoading(true);
    // 这里应该是实际的API调用
    setTimeout(() => {
      // 模拟从服务器获取设置
      setSettings({
        autoDeleteEnabled: true,
        autoDeleteDays: 7,
        autoDeleteConditions: ['read'],
        notificationTypes: ['system', 'transaction', 'account', 'book', 'error', 'warning', 'info', 'success'],
        maxNotifications: 100,
        emailNotifications: false,
        pushNotifications: false,
        notifyAdminsOnly: false
      });
      setLoading(false);
      
      // 设置表单初始值
      form.setFieldsValue({
        autoDeleteEnabled: true,
        autoDeleteDays: 7,
        autoDeleteConditions: ['read'],
        notificationTypes: ['system', 'transaction', 'account', 'book', 'error', 'warning', 'info', 'success'],
        maxNotifications: 100,
        emailNotifications: false,
        pushNotifications: false,
        notifyAdminsOnly: false
      });
    }, 1000);
  };
  
  useEffect(() => {
    fetchSettings();
  }, [form]);
  
  // 处理表单提交
  const handleSubmit = (values) => {
    setLoading(true);
    // 这里应该是实际的API调用
    setTimeout(() => {
      setSettings(values);
      setLoading(false);
      message.success(intl.formatMessage({ id: 'admin.notifications.saveSuccess', defaultMessage: '通知设置保存成功' }));
    }, 1000);
  };
  
  // 通知类型数据
  const notificationTypeData = [
    {
      key: 'system',
      type: intl.formatMessage({ id: 'admin.notifications.typeSystem', defaultMessage: '系统通知' }),
      icon: <InfoCircleOutlined style={{ color: '#faad14' }} />,
      description: intl.formatMessage({ id: 'admin.notifications.typeSystemDesc', defaultMessage: '系统相关的通知，如系统更新、维护等' }),
      count: 45,
    },
    {
      key: 'transaction',
      type: intl.formatMessage({ id: 'admin.notifications.typeTransaction', defaultMessage: '交易通知' }),
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      description: intl.formatMessage({ id: 'admin.notifications.typeTransactionDesc', defaultMessage: '交易相关的通知，如交易创建、更新等' }),
      count: 156,
    },
    {
      key: 'account',
      type: intl.formatMessage({ id: 'admin.notifications.typeAccount', defaultMessage: '账户通知' }),
      icon: <InfoCircleOutlined style={{ color: '#52c41a' }} />,
      description: intl.formatMessage({ id: 'admin.notifications.typeAccountDesc', defaultMessage: '账户相关的通知，如账户创建、更新等' }),
      count: 78,
    },
    {
      key: 'book',
      type: intl.formatMessage({ id: 'admin.notifications.typeBook', defaultMessage: '账本通知' }),
      icon: <InfoCircleOutlined style={{ color: '#722ed1' }} />,
      description: intl.formatMessage({ id: 'admin.notifications.typeBookDesc', defaultMessage: '账本相关的通知，如账本创建、更新等' }),
      count: 92,
    },
    {
      key: 'error',
      type: intl.formatMessage({ id: 'admin.notifications.typeError', defaultMessage: '错误通知' }),
      icon: <ExclamationCircleOutlined style={{ color: '#f5222d' }} />,
      description: intl.formatMessage({ id: 'admin.notifications.typeErrorDesc', defaultMessage: '错误相关的通知，如操作失败等' }),
      count: 23,
    },
    {
      key: 'warning',
      type: intl.formatMessage({ id: 'admin.notifications.typeWarning', defaultMessage: '警告通知' }),
      icon: <WarningOutlined style={{ color: '#fa8c16' }} />,
      description: intl.formatMessage({ id: 'admin.notifications.typeWarningDesc', defaultMessage: '警告相关的通知，如余额不足等' }),
      count: 34,
    },
    {
      key: 'info',
      type: intl.formatMessage({ id: 'admin.notifications.typeInfo', defaultMessage: '信息通知' }),
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      description: intl.formatMessage({ id: 'admin.notifications.typeInfoDesc', defaultMessage: '一般信息通知' }),
      count: 67,
    },
    {
      key: 'success',
      type: intl.formatMessage({ id: 'admin.notifications.typeSuccess', defaultMessage: '成功通知' }),
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      description: intl.formatMessage({ id: 'admin.notifications.typeSuccessDesc', defaultMessage: '操作成功的通知' }),
      count: 89,
    },
  ];
  
  // 通知类型列定义
  const notificationTypeColumns = [
    {
      title: intl.formatMessage({ id: 'admin.notifications.type', defaultMessage: '通知类型' }),
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => (
        <Space>
          {record.icon}
          {text}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.notifications.description', defaultMessage: '描述' }),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: intl.formatMessage({ id: 'admin.notifications.count', defaultMessage: '数量' }),
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: intl.formatMessage({ id: 'admin.notifications.enabled', defaultMessage: '启用' }),
      key: 'enabled',
      render: (_, record) => (
        <Switch 
          defaultChecked={settings.notificationTypes.includes(record.key)} 
          onChange={(checked) => {
            const newTypes = checked 
              ? [...settings.notificationTypes, record.key]
              : settings.notificationTypes.filter(type => type !== record.key);
            
            setSettings({ ...settings, notificationTypes: newTypes });
            form.setFieldsValue({ notificationTypes: newTypes });
          }}
        />
      ),
    },
  ];
  
  return (
    <div className="admin-notification-settings">
      <Card className="admin-card">
        <div className="admin-page-header">
          <h2><FormattedMessage id="admin.notifications.title" defaultMessage="通知设置" /></h2>
        </div>
        
        <Alert
          message={intl.formatMessage({ id: 'admin.notifications.infoTitle', defaultMessage: '关于通知设置' })}
          description={intl.formatMessage({ id: 'admin.notifications.infoDesc', defaultMessage: '在这里，您可以配置系统通知的行为，包括自动删除规则、通知类型等。这些设置将影响所有用户的通知体验。' })}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <Tabs defaultActiveKey="general">
          <TabPane 
            tab={
              <span>
                <BellOutlined />
                <FormattedMessage id="admin.notifications.tabGeneral" defaultMessage="基本设置" />
              </span>
            } 
            key="general"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={settings}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="maxNotifications"
                    label={
                      <Space>
                        <FormattedMessage id="admin.notifications.maxNotifications" defaultMessage="最大通知数量" />
                        <Tooltip title={intl.formatMessage({ id: 'admin.notifications.maxNotificationsDesc', defaultMessage: '每个用户最多可以保存的通知数量，超过此数量的旧通知将被自动删除' })}>
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { 
                        required: true, 
                        message: intl.formatMessage({ id: 'admin.notifications.maxNotificationsRequired', defaultMessage: '请输入最大通知数量' }) 
                      }
                    ]}
                  >
                    <InputNumber min={10} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="notifyAdminsOnly"
                    label={
                      <Space>
                        <FormattedMessage id="admin.notifications.notifyAdminsOnly" defaultMessage="仅通知管理员" />
                        <Tooltip title={intl.formatMessage({ id: 'admin.notifications.notifyAdminsOnlyDesc', defaultMessage: '启用后，系统通知将只发送给管理员用户' })}>
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="emailNotifications"
                    label={
                      <Space>
                        <FormattedMessage id="admin.notifications.emailNotifications" defaultMessage="邮件通知" />
                        <Tooltip title={intl.formatMessage({ id: 'admin.notifications.emailNotificationsDesc', defaultMessage: '启用后，系统将通过邮件发送通知' })}>
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="pushNotifications"
                    label={
                      <Space>
                        <FormattedMessage id="admin.notifications.pushNotifications" defaultMessage="推送通知" />
                        <Tooltip title={intl.formatMessage({ id: 'admin.notifications.pushNotificationsDesc', defaultMessage: '启用后，系统将通过浏览器推送通知' })}>
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>
                <ClockCircleOutlined />
                <FormattedMessage id="admin.notifications.autoDeleteSettings" defaultMessage="自动删除设置" />
              </Divider>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="autoDeleteEnabled"
                    label={
                      <Space>
                        <FormattedMessage id="admin.notifications.autoDeleteEnabled" defaultMessage="启用自动删除" />
                        <Tooltip title={intl.formatMessage({ id: 'admin.notifications.autoDeleteEnabledDesc', defaultMessage: '启用后，系统将根据设定的条件自动删除通知' })}>
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="autoDeleteDays"
                    label={
                      <Space>
                        <FormattedMessage id="admin.notifications.autoDeleteDays" defaultMessage="自动删除天数" />
                        <Tooltip title={intl.formatMessage({ id: 'admin.notifications.autoDeleteDaysDesc', defaultMessage: '通知创建后多少天会被自动删除（如果满足删除条件）' })}>
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { 
                        required: true, 
                        message: intl.formatMessage({ id: 'admin.notifications.autoDeleteDaysRequired', defaultMessage: '请输入自动删除天数' }) 
                      }
                    ]}
                  >
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="autoDeleteConditions"
                label={
                  <Space>
                    <FormattedMessage id="admin.notifications.autoDeleteConditions" defaultMessage="自动删除条件" />
                    <Tooltip title={intl.formatMessage({ id: 'admin.notifications.autoDeleteConditionsDesc', defaultMessage: '满足这些条件的通知将被自动删除' })}>
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { 
                    required: true, 
                    message: intl.formatMessage({ id: 'admin.notifications.autoDeleteConditionsRequired', defaultMessage: '请选择自动删除条件' }) 
                  }
                ]}
              >
                <Select mode="multiple">
                  <Option value="read">
                    <FormattedMessage id="admin.notifications.conditionRead" defaultMessage="已读通知" />
                  </Option>
                  <Option value="all">
                    <FormattedMessage id="admin.notifications.conditionAll" defaultMessage="所有通知（包括未读）" />
                  </Option>
                  <Option value="system">
                    <FormattedMessage id="admin.notifications.conditionSystem" defaultMessage="系统通知" />
                  </Option>
                  <Option value="error">
                    <FormattedMessage id="admin.notifications.conditionError" defaultMessage="错误通知" />
                  </Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={loading}
                >
                  <FormattedMessage id="admin.notifications.saveSettings" defaultMessage="保存设置" />
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <BellOutlined />
                <FormattedMessage id="admin.notifications.tabTypes" defaultMessage="通知类型" />
              </span>
            } 
            key="types"
          >
            <Alert
              message={intl.formatMessage({ id: 'admin.notifications.typesInfoTitle', defaultMessage: '通知类型管理' })}
              description={intl.formatMessage({ id: 'admin.notifications.typesInfoDesc', defaultMessage: '在这里，您可以管理系统中的通知类型，启用或禁用特定类型的通知。' })}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Form.Item
              name="notificationTypes"
              hidden
            >
              <Select mode="multiple" />
            </Form.Item>
            
            <Table 
              columns={notificationTypeColumns} 
              dataSource={notificationTypeData} 
              rowKey="key"
              pagination={false}
              className="admin-table"
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <DeleteOutlined />
                <FormattedMessage id="admin.notifications.tabCleanup" defaultMessage="清理通知" />
              </span>
            } 
            key="cleanup"
          >
            <Alert
              message={intl.formatMessage({ id: 'admin.notifications.cleanupInfoTitle', defaultMessage: '通知清理' })}
              description={intl.formatMessage({ id: 'admin.notifications.cleanupInfoDesc', defaultMessage: '在这里，您可以手动清理系统中的通知。请谨慎操作，删除的通知无法恢复。' })}
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Card title={intl.formatMessage({ id: 'admin.notifications.manualCleanup', defaultMessage: '手动清理' })}>
              <Form layout="vertical">
                <Form.Item
                  name="cleanupType"
                  label={intl.formatMessage({ id: 'admin.notifications.cleanupType', defaultMessage: '清理类型' })}
                >
                  <Radio.Group defaultValue="read">
                    <Radio value="read">
                      <FormattedMessage id="admin.notifications.cleanupRead" defaultMessage="清理已读通知" />
                    </Radio>
                    <Radio value="all">
                      <FormattedMessage id="admin.notifications.cleanupAll" defaultMessage="清理所有通知" />
                    </Radio>
                    <Radio value="old">
                      <FormattedMessage id="admin.notifications.cleanupOld" defaultMessage="清理旧通知" />
                    </Radio>
                  </Radio.Group>
                </Form.Item>
                
                <Form.Item
                  name="cleanupDays"
                  label={intl.formatMessage({ id: 'admin.notifications.cleanupDays', defaultMessage: '清理多少天前的通知' })}
                >
                  <InputNumber min={1} max={365} defaultValue={30} style={{ width: 200 }} />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      message.success(intl.formatMessage({ id: 'admin.notifications.cleanupSuccess', defaultMessage: '通知清理成功' }));
                    }}
                  >
                    <FormattedMessage id="admin.notifications.startCleanup" defaultMessage="开始清理" />
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default NotificationSettings; 