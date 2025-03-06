import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Modal, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Select, 
  Switch, 
  Radio, 
  Divider, 
  message,
  Table,
  Space,
  Popconfirm,
  App,
  Typography,
  InputNumber
} from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  CloudUploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { setLanguage, setTheme } from '../store/settingsSlice';

const { Option } = Select;
const { Text } = Typography;

// 将SettingsModal组件拆分为更小的组件，避免useForm警告
const SettingsModal = ({ visible, onCancel, defaultTab = 'general' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // 定义标签页内容
  const items = [
    {
      key: 'general',
      label: <span><UserOutlined /><FormattedMessage id="settings.general" defaultMessage="通用设置" /></span>,
      children: <GeneralSettings />
    },
    {
      key: 'currency',
      label: <span><DollarOutlined /><FormattedMessage id="settings.currency" defaultMessage="货币设置" /></span>,
      children: <CurrencySettings />
    },
    {
      key: 'backup',
      label: <span><CloudUploadOutlined /><FormattedMessage id="settings.backup" defaultMessage="备份管理" /></span>,
      children: <BackupSettings />
    }
  ];

  return (
    <App>
      <Modal
        title={<FormattedMessage id="nav.settings" defaultMessage="设置" />}
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
        className="settings-modal"
        destroyOnClose={false}
      >
        <Tabs 
          defaultActiveKey={defaultTab} 
          activeKey={activeTab}
          onChange={handleTabChange}
          items={items} 
        />
      </Modal>
    </App>
  );
};

// 通用设置组件
const GeneralSettings = () => {
  const dispatch = useDispatch();
  const { language, theme } = useSelector(state => state.settings || { 
    language: 'zh-CN', 
    theme: 'light'
  });
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();

  // 设置表单初始值
  useEffect(() => {
    form.setFieldsValue({
      language,
      theme
    });
  }, [language, theme, form]);

  // 处理语言变更
  const handleLanguageChange = (value) => {
    dispatch(setLanguage(value));
    messageApi.success(intl.formatMessage({ id: 'settings.languageChanged', defaultMessage: '语言已更改' }));
  };

  // 处理主题变更
  const handleThemeChange = (value) => {
    dispatch(setTheme(value));
    messageApi.success(intl.formatMessage({ id: 'settings.themeChanged', defaultMessage: '主题已更改' }));
  };

  return (
    <>
      {contextHolder}
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ language, theme }}
      >
        <Form.Item name="language" label={<FormattedMessage id="settings.language" defaultMessage="语言" />}>
          <Select 
            onChange={handleLanguageChange}
            style={{ width: '100%' }}
          >
            <Option value="zh-CN">简体中文</Option>
            <Option value="en-US">English</Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="theme" label={<FormattedMessage id="settings.theme" defaultMessage="主题" />}>
          <Radio.Group 
            onChange={(e) => handleThemeChange(e.target.value)}
          >
            <Radio.Button value="light"><FormattedMessage id="settings.lightTheme" defaultMessage="浅色" /></Radio.Button>
            <Radio.Button value="dark"><FormattedMessage id="settings.darkTheme" defaultMessage="深色" /></Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </>
  );
};

// 货币设置组件
const CurrencySettings = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const intl = useIntl();

  // 加载货币数据
  useEffect(() => {
    // 尝试从localStorage获取货币数据
    try {
      const savedCurrencies = localStorage.getItem('availableCurrencies');
      if (savedCurrencies) {
        setCurrencies(JSON.parse(savedCurrencies));
      } else {
        // 如果没有保存的数据，设置默认货币
        const defaultCurrencies = [
          { code: 'CNY', name: '人民币', symbol: '¥', rate: 1, isSystemDefault: true },
          { code: 'USD', name: '美元', symbol: '$', rate: 0.14, isSystemDefault: true },
          { code: 'THB', name: '泰铢', symbol: '฿', rate: 4.5, isSystemDefault: true }
        ];
        setCurrencies(defaultCurrencies);
        localStorage.setItem('availableCurrencies', JSON.stringify(defaultCurrencies));
      }
    } catch (error) {
      console.error('加载货币数据失败:', error);
      // 设置默认货币
      const defaultCurrencies = [
        { code: 'CNY', name: '人民币', symbol: '¥', rate: 1, isSystemDefault: true },
        { code: 'USD', name: '美元', symbol: '$', rate: 0.14, isSystemDefault: true },
        { code: 'THB', name: '泰铢', symbol: '฿', rate: 4.5, isSystemDefault: true }
      ];
      setCurrencies(defaultCurrencies);
    }
  }, []);

  // 处理货币添加/编辑
  const handleCurrencySubmit = (values) => {
    if (editingCurrency) {
      // 编辑现有货币
      const updatedCurrencies = currencies.map(c => 
        c.code === editingCurrency.code ? { ...values, rate: values.rate || 1 } : c
      );
      setCurrencies(updatedCurrencies);
      // 保存到localStorage
      localStorage.setItem('availableCurrencies', JSON.stringify(updatedCurrencies));
      messageApi.success(intl.formatMessage({ id: 'settings.currencyUpdated', defaultMessage: '货币已更新' }));
    } else {
      // 添加新货币
      const newCurrency = { ...values, rate: values.rate || 1, isSystemDefault: false };
      const newCurrencies = [...currencies, newCurrency];
      setCurrencies(newCurrencies);
      // 保存到localStorage
      localStorage.setItem('availableCurrencies', JSON.stringify(newCurrencies));
      messageApi.success(intl.formatMessage({ id: 'settings.currencyAdded', defaultMessage: '货币已添加' }));
    }
    setIsModalVisible(false);
    setEditingCurrency(null);
    form.resetFields();
  };

  // 处理货币删除
  const handleCurrencyDelete = (code) => {
    // 检查是否是系统默认货币
    const currency = currencies.find(c => c.code === code);
    if (currency && currency.isSystemDefault) {
      messageApi.error(intl.formatMessage({ id: 'settings.cannotDeleteSystemCurrency', defaultMessage: '系统默认货币不能删除' }));
      return;
    }
    
    const updatedCurrencies = currencies.filter(c => c.code !== code);
    setCurrencies(updatedCurrencies);
    // 保存到localStorage
    localStorage.setItem('availableCurrencies', JSON.stringify(updatedCurrencies));
    messageApi.success(intl.formatMessage({ id: 'settings.currencyDeleted', defaultMessage: '货币已删除' }));
  };

  // 货币表格列定义
  const currencyColumns = [
    {
      title: <FormattedMessage id="settings.currencyCode" defaultMessage="货币代码" />,
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: <FormattedMessage id="settings.currencyName" defaultMessage="货币名称" />,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: <FormattedMessage id="settings.currencySymbol" defaultMessage="货币符号" />,
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: <FormattedMessage id="settings.currencyRate" defaultMessage="汇率" />,
      dataIndex: 'rate',
      key: 'rate',
    },
    {
      title: <FormattedMessage id="settings.status" defaultMessage="状态" />,
      key: 'status',
      render: (_, record) => (
        record.isSystemDefault ? 
          <Text type="success"><FormattedMessage id="settings.systemDefault" defaultMessage="系统默认" /></Text> : 
          <Text><FormattedMessage id="settings.available" defaultMessage="可用" /></Text>
      )
    },
    {
      title: <FormattedMessage id="settings.actions" defaultMessage="操作" />,
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingCurrency(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title={intl.formatMessage({ id: 'settings.confirmDelete', defaultMessage: '确定要删除吗？' })}
            onConfirm={() => handleCurrencyDelete(record.code)}
            okText={intl.formatMessage({ id: 'common.yes', defaultMessage: '是' })}
            cancelText={intl.formatMessage({ id: 'common.no', defaultMessage: '否' })}
            disabled={record.isSystemDefault}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={record.isSystemDefault}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingCurrency(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          <FormattedMessage id="settings.addCurrency" defaultMessage="添加货币" />
        </Button>
      </div>
      
      <Table 
        dataSource={currencies} 
        columns={currencyColumns} 
        rowKey="code"
        pagination={false}
      />
      
      <Modal
        title={editingCurrency 
          ? <FormattedMessage id="settings.editCurrency" defaultMessage="编辑货币" />
          : <FormattedMessage id="settings.addCurrency" defaultMessage="添加货币" />
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCurrency(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCurrencySubmit}
        >
          <Form.Item
            name="code"
            label={<FormattedMessage id="settings.currencyCode" defaultMessage="货币代码" />}
            rules={[{ required: true, message: intl.formatMessage({ id: 'settings.currencyCodeRequired', defaultMessage: '请输入货币代码' }) }]}
          >
            <Input disabled={!!editingCurrency} placeholder="例如: USD" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label={<FormattedMessage id="settings.currencyName" defaultMessage="货币名称" />}
            rules={[{ required: true, message: intl.formatMessage({ id: 'settings.currencyNameRequired', defaultMessage: '请输入货币名称' }) }]}
          >
            <Input placeholder="例如: 美元" />
          </Form.Item>
          
          <Form.Item
            name="symbol"
            label={<FormattedMessage id="settings.currencySymbol" defaultMessage="货币符号" />}
            rules={[{ required: true, message: intl.formatMessage({ id: 'settings.currencySymbolRequired', defaultMessage: '请输入货币符号' }) }]}
          >
            <Input placeholder="例如: $" />
          </Form.Item>
          
          <Form.Item
            name="rate"
            label={<FormattedMessage id="settings.currencyRate" defaultMessage="汇率 (相对于基准货币)" />}
            rules={[{ required: true, message: intl.formatMessage({ id: 'settings.currencyRateRequired', defaultMessage: '请输入汇率' }) }]}
            initialValue={1}
          >
            <InputNumber 
              min={0.000001} 
              step={0.01} 
              precision={6} 
              style={{ width: '100%' }} 
              placeholder="例如: 0.14"
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              <FormattedMessage id="common.save" defaultMessage="保存" />
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// 备份管理组件
const BackupSettings = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();

  return (
    <>
      {contextHolder}
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<CloudUploadOutlined />} 
          style={{ marginRight: 8 }}
          onClick={() => messageApi.info(intl.formatMessage({ id: 'settings.backupNotImplemented', defaultMessage: '备份功能尚未实现' }))}
        >
          <FormattedMessage id="settings.backup" defaultMessage="备份数据" />
        </Button>
        <Button 
          icon={<CloudUploadOutlined />}
          onClick={() => messageApi.info(intl.formatMessage({ id: 'settings.restoreNotImplemented', defaultMessage: '恢复功能尚未实现' }))}
        >
          <FormattedMessage id="settings.restore" defaultMessage="恢复数据" />
        </Button>
      </div>
      
      <Divider />
      
      <h3><FormattedMessage id="settings.autoBackup" defaultMessage="自动备份" /></h3>
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ enableAutoBackup: true, backupFrequency: 'weekly' }}
      >
        <Form.Item name="enableAutoBackup" label={<FormattedMessage id="settings.enableAutoBackup" defaultMessage="启用自动备份" />}>
          <Switch defaultChecked />
        </Form.Item>
        
        <Form.Item name="backupFrequency" label={<FormattedMessage id="settings.backupFrequency" defaultMessage="备份频率" />}>
          <Select>
            <Option value="daily"><FormattedMessage id="settings.daily" defaultMessage="每天" /></Option>
            <Option value="weekly"><FormattedMessage id="settings.weekly" defaultMessage="每周" /></Option>
            <Option value="monthly"><FormattedMessage id="settings.monthly" defaultMessage="每月" /></Option>
          </Select>
        </Form.Item>
      </Form>
    </>
  );
};

export default SettingsModal; 