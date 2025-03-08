import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  Card, 
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
  Modal,
  Popconfirm,
  InputNumber,
  Tooltip,
  Avatar,
  Upload,
  Typography
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  DollarOutlined, 
  BellOutlined, 
  CloudUploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { setLanguage, setTheme } from '../store/settingsSlice';
import { updateUser, updatePassword, loadUser } from '../store/authSlice';
import ImgCrop from 'antd-img-crop';

const { Option } = Select;
const { Text } = Typography;

// 系统默认货币列表
const DEFAULT_SYSTEM_CURRENCIES = ['CNY', 'USD', 'THB'];

const Settings = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const location = useLocation();
  const { language, theme } = useSelector(state => state.settings || { 
    language: 'zh-CN', 
    theme: 'light'
  });
  const { books } = useSelector(state => state.books || { books: [] });
  const { user } = useSelector(state => state.auth || { user: null });
  const [passwordForm] = Form.useForm();
  const [currencyForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [imageUrl, setImageUrl] = useState(user?.avatar || '');
  const [uploading, setUploading] = useState(false);

  // 获取URL中的tab参数
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');

  // 获取用户特定的localStorage键
  const getUserCurrencyKey = () => {
    return user && user._id ? `availableCurrencies_${user._id}` : 'availableCurrencies';
  };

  // 模拟货币数据
  const [currencies, setCurrencies] = useState([
    { code: 'CNY', name: '人民币', symbol: '¥', rate: 1, isSystemDefault: true },
    { code: 'USD', name: '美元', symbol: '$', rate: 0.14, isSystemDefault: true },
    { code: 'THB', name: '泰铢', symbol: '฿', rate: 4.5, isSystemDefault: true },
    { code: 'EUR', name: '欧元', symbol: '€', rate: 0.13, isSystemDefault: false },
    { code: 'GBP', name: '英镑', symbol: '£', rate: 0.11, isSystemDefault: false },
    { code: 'JPY', name: '日元', symbol: '¥', rate: 15.32, isSystemDefault: false }
  ]);

  // 初始化时标记系统默认货币
  useEffect(() => {
    // 尝试从用户特定的localStorage获取货币数据
    try {
      if (user && user._id) {
        const userCurrencyKey = getUserCurrencyKey();
        const savedCurrencies = localStorage.getItem(userCurrencyKey);
        
        if (savedCurrencies) {
          // 如果有保存的数据，使用它
          const parsedCurrencies = JSON.parse(savedCurrencies);
          setCurrencies(parsedCurrencies);
        } else {
          // 如果没有保存的数据，检查是否有全局设置可以迁移
          const globalCurrencies = localStorage.getItem('availableCurrencies');
          if (globalCurrencies) {
            try {
              const parsedGlobalCurrencies = JSON.parse(globalCurrencies);
              if (parsedGlobalCurrencies && parsedGlobalCurrencies.length > 0) {
                // 迁移全局设置到用户特定设置
                setCurrencies(parsedGlobalCurrencies);
                localStorage.setItem(userCurrencyKey, globalCurrencies);
              } else {
                // 如果全局设置为空，使用默认值并标记系统默认货币
                setCurrencies(prev => 
                  prev.map(c => ({
                    ...c,
                    isSystemDefault: DEFAULT_SYSTEM_CURRENCIES.includes(c.code)
                  }))
                );
                
                // 保存到用户特定的localStorage
                localStorage.setItem(userCurrencyKey, JSON.stringify(currencies));
              }
            } catch (e) {
              console.error('解析全局货币设置失败:', e);
              // 使用默认值
              setCurrencies(prev => 
                prev.map(c => ({
                  ...c,
                  isSystemDefault: DEFAULT_SYSTEM_CURRENCIES.includes(c.code)
                }))
              );
              localStorage.setItem(userCurrencyKey, JSON.stringify(currencies));
            }
          } else {
            // 如果没有全局设置，使用默认值并标记系统默认货币
            setCurrencies(prev => 
              prev.map(c => ({
                ...c,
                isSystemDefault: DEFAULT_SYSTEM_CURRENCIES.includes(c.code)
              }))
            );
            
            // 保存到用户特定的localStorage
            localStorage.setItem(userCurrencyKey, JSON.stringify(currencies));
          }
        }
      }
    } catch (error) {
      console.error('加载/保存货币列表失败:', error);
      // 标记系统默认货币
      setCurrencies(prev => 
        prev.map(c => ({
          ...c,
          isSystemDefault: DEFAULT_SYSTEM_CURRENCIES.includes(c.code)
        }))
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  // 当货币列表变化时，更新本地存储
  useEffect(() => {
    try {
      if (user && user._id) {
        const userCurrencyKey = getUserCurrencyKey();
        localStorage.setItem(userCurrencyKey, JSON.stringify(currencies));
      }
    } catch (error) {
      console.error('保存货币列表失败:', error);
    }
  }, [currencies, user]);

  // 设置个人资料表单的初始值
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.username || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
      setImageUrl(user.avatar || '');
    }
  }, [user, profileForm]);

  // 处理语言变更
  const handleLanguageChange = value => {
    dispatch(setLanguage(value));
    message.success(intl.formatMessage({ id: 'common.success' }));
  };

  // 处理主题变更
  const handleThemeChange = value => {
    dispatch(setTheme(value));
    message.success(intl.formatMessage({ id: 'common.success' }));
  };

  // 处理表单提交
  const handleProfileSubmit = (values) => {
    dispatch(updateUser({
      username: values.name,
      email: values.email,
      avatar: values.avatar
    }))
      .unwrap()
      .then(() => {
        message.success(intl.formatMessage({
          id: 'settings.profile.success',
          defaultMessage: '个人资料更新成功'
        }));
      })
      .catch((error) => {
        message.error(intl.formatMessage({
          id: 'settings.profile.error',
          defaultMessage: '个人资料更新失败'
        }) + ': ' + error);
      });
  };

  // 检查货币是否被账本使用
  const isCurrencyUsedByBooks = (currencyCode) => {
    if (!books || books.length === 0) return false;
    
    return books.some(book => {
      // 检查是否为本位币
      if (book.defaultCurrency === currencyCode) return true;
      
      // 检查是否在账本的货币列表中
      if (book.currencies && book.currencies.some(c => c.code === currencyCode)) return true;
      
      return false;
    });
  };

  // 打开添加/编辑货币模态框
  const showModal = (currency = null) => {
    setEditingCurrency(currency);
    if (currency) {
      currencyForm.setFieldsValue({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        rate: currency.rate
      });
    } else {
      currencyForm.resetFields();
    }
    setIsModalVisible(true);
  };

  // 处理模态框确认
  const handleOk = () => {
    currencyForm.validateFields().then(values => {
      if (editingCurrency) {
        // 编辑现有货币
        const updatedCurrencies = currencies.map(c => 
          c.code === editingCurrency.code ? { 
            ...values, 
            isSystemDefault: editingCurrency.isSystemDefault 
          } : c
        );
        setCurrencies(updatedCurrencies);
        
        // 保存到用户特定的localStorage
        if (user && user._id) {
          const userCurrencyKey = getUserCurrencyKey();
          localStorage.setItem(userCurrencyKey, JSON.stringify(updatedCurrencies));
        }
        
        message.success('货币更新成功');
      } else {
        // 添加新货币
        const newCurrency = { 
          ...values, 
          isSystemDefault: DEFAULT_SYSTEM_CURRENCIES.includes(values.code) 
        };
        const newCurrencies = [...currencies, newCurrency];
        setCurrencies(newCurrencies);
        
        // 保存到用户特定的localStorage
        if (user && user._id) {
          const userCurrencyKey = getUserCurrencyKey();
          localStorage.setItem(userCurrencyKey, JSON.stringify(newCurrencies));
        }
        
        message.success('货币添加成功');
      }
      setIsModalVisible(false);
    });
  };

  // 处理删除货币
  const handleDelete = (code) => {
    const updatedCurrencies = currencies.filter(c => c.code !== code);
    setCurrencies(updatedCurrencies);
    
    // 保存到用户特定的localStorage
    if (user && user._id) {
      const userCurrencyKey = getUserCurrencyKey();
      localStorage.setItem(userCurrencyKey, JSON.stringify(updatedCurrencies));
    }
    
    message.success('货币删除成功');
  };

  // 货币表格列定义
  const columns = [
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '符号',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '汇率',
      dataIndex: 'rate',
      key: 'rate',
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        if (record.isSystemDefault) {
          return (
            <span style={{ color: '#1890ff' }}>
              系统默认
              <Tooltip title="系统默认货币不可删除">
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          );
        }
        if (isCurrencyUsedByBooks(record.code)) {
          return (
            <span style={{ color: '#52c41a' }}>
              使用中
              <Tooltip title="该货币正在被账本使用，不可删除">
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          );
        }
        return <span>可用</span>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            type="primary"
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          {!record.isSystemDefault && !isCurrencyUsedByBooks(record.code) && (
            <Popconfirm
              title="确定要删除这个货币吗？"
              onConfirm={() => handleDelete(record.code)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="settings-container">
      <Card 
        title={<FormattedMessage id="nav.settings" defaultMessage="设置" />}
        className="settings-card"
      >
        <Tabs 
          defaultActiveKey={tabFromUrl || "general"}
          items={[
            {
              key: "general",
              label: (
                <span>
                  <UserOutlined />
                  <FormattedMessage id="settings.general" defaultMessage="通用设置" />
                </span>
              ),
              children: (
                <Form layout="vertical" initialValues={{ language, theme }}>
                  <Form.Item 
                    label={<FormattedMessage id="settings.language" defaultMessage="语言设置" />}
                    name="language"
                  >
                    <Select 
                      onChange={handleLanguageChange}
                      style={{ width: 200 }}
                    >
                      <Option value="zh-CN">中文</Option>
                      <Option value="en-US">English</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item 
                    label={<FormattedMessage id="settings.theme" defaultMessage="主题设置" />}
                    name="theme"
                  >
                    <Radio.Group 
                      onChange={e => handleThemeChange(e.target.value)}
                    >
                      <Radio.Button value="light">
                        <FormattedMessage id="settings.theme.light" defaultMessage="浅色" />
                      </Radio.Button>
                      <Radio.Button value="dark">
                        <FormattedMessage id="settings.theme.dark" defaultMessage="深色" />
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: "currency",
              label: (
                <span>
                  <DollarOutlined />
                  <FormattedMessage id="settings.currency" defaultMessage="货币设置" />
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={() => showModal()}
                    >
                      添加货币
                    </Button>
                  </div>
                  <Table 
                    columns={columns} 
                    dataSource={currencies} 
                    rowKey="code" 
                    pagination={false}
                  />
                  <div style={{ marginTop: 16 }}>
                    <p style={{ color: '#999' }}>
                      <QuestionCircleOutlined style={{ marginRight: 4 }} />
                      说明：
                    </p>
                    <ul style={{ color: '#999', paddingLeft: 24 }}>
                      <li>系统默认货币（人民币、美元、泰铢）不可删除</li>
                      <li>正在被账本使用的货币不可删除</li>
                      <li>新建账本时，本位币可从此处添加的货币中选择</li>
                    </ul>
                  </div>
                </>
              )
            },
            {
              key: "account",
              label: (
                <span>
                  <LockOutlined />
                  <FormattedMessage id="settings.account" defaultMessage="账号设置" />
                </span>
              ),
              children: (
                <>
                  {/* 用户基本信息表单 */}
                  <div style={{ marginBottom: 24 }}>
                    <h3><FormattedMessage id="settings.profile" defaultMessage="个人资料" /></h3>
                    <Form 
                      form={profileForm}
                      layout="vertical" 
                      initialValues={{ 
                        name: user?.username || '',
                        email: user?.email || '',
                        avatar: user?.avatar || ''
                      }}
                      onFinish={handleProfileSubmit}
                    >
                      <Form.Item
                        name="avatar"
                        label={<FormattedMessage id="settings.avatar" defaultMessage="头像" />}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            size={100} 
                            icon={<UserOutlined />} 
                            src={imageUrl || (user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${user.avatar}`) : null)}
                            style={{ marginBottom: 16 }}
                          />
                          <ImgCrop rotate shape="round" grid>
                            <Upload
                              name="avatar"
                              className="avatar-uploader"
                              showUploadList={false}
                              action={`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/upload`}
                              headers={{
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                              }}
                              beforeUpload={(file) => {
                                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                                if (!isJpgOrPng) {
                                  message.error('只能上传JPG/PNG格式的图片!');
                                }
                                const isLt2M = file.size / 1024 / 1024 < 2;
                                if (!isLt2M) {
                                  message.error('图片必须小于2MB!');
                                }
                                setUploading(true);
                                return isJpgOrPng && isLt2M;
                              }}
                              onChange={(info) => {
                                if (info.file.status === 'uploading') {
                                  setUploading(true);
                                  return;
                                }
                                if (info.file.status === 'done') {
                                  setUploading(false);
                                  message.success('头像上传成功!');
                                  // 获取服务器返回的图片URL
                                  const avatarUrl = info.file.response.url;
                                  // 修复URL路径，移除多余的/api前缀
                                  const fullAvatarUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${avatarUrl}`.replace('/api/uploads', '/uploads');
                                  console.log('上传成功，返回数据:', info.file.response);
                                  console.log('完整头像URL:', fullAvatarUrl);
                                  // 更新表单值和预览图
                                  setImageUrl(fullAvatarUrl);
                                  profileForm.setFieldsValue({ avatar: fullAvatarUrl });
                                  
                                  // 立即更新用户头像
                                  dispatch(updateUser({
                                    username: user.username,
                                    email: user.email,
                                    avatar: fullAvatarUrl
                                  })).then(() => {
                                    // 重新加载用户信息以更新头像
                                    dispatch(loadUser());
                                  });
                                } else if (info.file.status === 'error') {
                                  setUploading(false);
                                  console.error('上传失败:', info.file.error, info.file.response);
                                  message.error(`头像上传失败: ${info.file.response?.message || '服务器错误'}`);
                                }
                              }}
                              customRequest={({ file, onSuccess, onError, onProgress }) => {
                                // 创建FormData对象
                                const formData = new FormData();
                                formData.append('avatar', file);
                                
                                // 使用axios直接上传
                                const xhr = new XMLHttpRequest();
                                xhr.open('POST', `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/upload`, true);
                                xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                                
                                // 进度事件
                                xhr.upload.onprogress = (e) => {
                                  if (e.lengthComputable) {
                                    const percent = Math.round((e.loaded / e.total) * 100);
                                    onProgress({ percent });
                                  }
                                };
                                
                                // 完成事件
                                xhr.onload = () => {
                                  if (xhr.status === 200) {
                                    const response = JSON.parse(xhr.responseText);
                                    onSuccess(response, xhr);
                                  } else {
                                    onError({ status: xhr.status });
                                  }
                                };
                                
                                // 错误事件
                                xhr.onerror = () => {
                                  onError({ status: xhr.status });
                                };
                                
                                // 发送请求
                                xhr.send(formData);
                                
                                // 返回上传取消函数
                                return {
                                  abort() {
                                    xhr.abort();
                                  }
                                };
                              }}
                            >
                              <Button 
                                icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
                                style={{ marginTop: 8 }}
                                disabled={uploading}
                              >
                                {uploading ? 
                                  <FormattedMessage id="common.uploading" defaultMessage="上传中..." /> : 
                                  <FormattedMessage id="settings.uploadAvatar" defaultMessage="上传头像" />
                                }
                              </Button>
                            </Upload>
                          </ImgCrop>
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block' }}>
                              <FormattedMessage id="settings.avatarHint" defaultMessage="支持JPG、PNG格式，文件小于2MB" />
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                              <FormattedMessage id="settings.avatarCropHint" defaultMessage="可拖动调整裁剪区域" />
                            </Text>
                          </div>
                        </div>
                      </Form.Item>

                      <Form.Item
                        name="name"
                        label={<FormattedMessage id="settings.username" defaultMessage="用户名" />}
                        rules={[{ required: true, message: '请输入用户名' }]}
                      >
                        <Input placeholder="请输入用户名" />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label={<FormattedMessage id="settings.email" defaultMessage="邮箱" />}
                        rules={[
                          { required: true, message: '请输入邮箱' },
                          { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                      >
                        <Input placeholder="请输入邮箱" disabled />
                      </Form.Item>

                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          <FormattedMessage id="common.save" defaultMessage="保存" />
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>

                  <Divider />

                  {/* 密码修改表单 */}
                  <h3><FormattedMessage id="settings.changePassword" defaultMessage="修改密码" /></h3>
                  <Form 
                    form={passwordForm}
                    layout="vertical" 
                    onFinish={(values) => {
                      dispatch(updatePassword({
                        currentPassword: values.oldPassword,
                        newPassword: values.newPassword
                      }))
                        .unwrap()
                        .then(() => {
                          message.success(intl.formatMessage({ 
                            id: 'settings.password.success', 
                            defaultMessage: '密码修改成功' 
                          }));
                          passwordForm.resetFields();
                        })
                        .catch((error) => {
                          message.error(error || intl.formatMessage({ 
                            id: 'settings.password.error', 
                            defaultMessage: '密码修改失败' 
                          }));
                        });
                    }}
                  >
                    <Form.Item 
                      name="oldPassword" 
                      label={<FormattedMessage id="settings.oldPassword" defaultMessage="旧密码" />}
                      rules={[{ required: true, message: '请输入旧密码' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    
                    <Form.Item 
                      name="newPassword" 
                      label={<FormattedMessage id="settings.newPassword" defaultMessage="新密码" />}
                      rules={[{ required: true, message: '请输入新密码' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    
                    <Form.Item 
                      name="confirmPassword" 
                      label={<FormattedMessage id="settings.confirmPassword" defaultMessage="确认新密码" />}
                      rules={[
                        { required: true, message: '请确认新密码' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('两次输入的密码不一致'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        <FormattedMessage id="common.save" defaultMessage="保存" />
                      </Button>
                    </Form.Item>
                  </Form>
                </>
              )
            },
            {
              key: "notification",
              label: (
                <span>
                  <BellOutlined />
                  <FormattedMessage id="settings.notification" defaultMessage="通知设置" />
                </span>
              ),
              children: (
                <Form layout="vertical">
                  <Form.Item 
                    label={<FormattedMessage id="settings.notification.email" defaultMessage="邮件通知" />}
                    name="emailNotification"
                  >
                    <Switch defaultChecked />
                  </Form.Item>
                  
                  <Form.Item 
                    label={<FormattedMessage id="settings.notification.app" defaultMessage="应用内通知" />}
                    name="appNotification"
                  >
                    <Switch defaultChecked />
                  </Form.Item>
                </Form>
              )
            },
            {
              key: "backup",
              label: (
                <span>
                  <CloudUploadOutlined />
                  <FormattedMessage id="settings.backup" defaultMessage="备份设置" />
                </span>
              ),
              children: (
                <>
                  <div className="backup-actions">
                    <Button type="primary" style={{ marginRight: 16 }}>
                      <FormattedMessage id="backup.create" defaultMessage="创建备份" />
                    </Button>
                    <Button>
                      <FormattedMessage id="backup.restore" defaultMessage="恢复备份" />
                    </Button>
                  </div>
                  <Divider />
                  <div className="export-actions">
                    <Button type="primary" style={{ marginRight: 16 }}>
                      <FormattedMessage id="backup.export" defaultMessage="导出数据" />
                    </Button>
                    <Button>
                      <FormattedMessage id="backup.import" defaultMessage="导入数据" />
                    </Button>
                  </div>
                </>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingCurrency ? "编辑货币" : "添加货币"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={currencyForm}
          layout="vertical"
        >
          <Form.Item
            name="code"
            label="货币代码"
            rules={[{ required: true, message: '请输入货币代码' }]}
            disabled={!!editingCurrency}
          >
            <Input placeholder="例如: USD" disabled={!!editingCurrency} />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="货币名称"
            rules={[{ required: true, message: '请输入货币名称' }]}
          >
            <Input placeholder="例如: 美元" />
          </Form.Item>
          
          <Form.Item
            name="symbol"
            label="货币符号"
            rules={[{ required: true, message: '请输入货币符号' }]}
          >
            <Input placeholder="例如: $" />
          </Form.Item>
          
          <Form.Item
            name="rate"
            label="汇率 (相对于基准货币)"
            rules={[{ required: true, message: '请输入汇率' }]}
          >
            <InputNumber 
              min={0.000001} 
              step={0.01} 
              precision={6} 
              style={{ width: '100%' }} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings; 