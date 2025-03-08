import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Modal, 
  Form, 
  Select, 
  Switch, 
  App,
  message,
  Tooltip, 
  Tag, 
  Popconfirm,
  Avatar,
  Row,
  Col,
  Divider,
  Tabs,
  Transfer
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { 
  fetchUsers, 
  fetchDeletedUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  restoreUser, 
  resetUserPassword,
  generateRandomPassword
} from '../../services/adminService';

const { Option } = Select;

const UserManagement = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [restoringUser, setRestoringUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedTransferUser, setSelectedTransferUser] = useState(null);
  
  // 获取用户数据
  const fetchAllUsers = async () => {
    console.log('开始获取活跃用户数据...');
    setLoading(true);
    try {
      const data = await fetchUsers();
      console.log('获取到活跃用户数据:', data);
      
      if (data.success) {
        const formattedUsers = data.data.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone || '-',
          role: 'user',
          status: user.isDeleted ? 'inactive' : 'active',
          createdAt: new Date(user.createdAt).toISOString().split('T')[0],
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'
        }));
        
        console.log('格式化后的活跃用户数据:', formattedUsers);
        setUsers(formattedUsers);
        console.log('活跃用户数据已更新到状态');
      } else {
        console.error('获取活跃用户数据失败:', data);
        message.error(intl.formatMessage({ id: 'admin.users.fetchError', defaultMessage: '获取用户数据失败' }));
      }
    } catch (error) {
      console.error('获取用户数据错误:', error);
      message.error(intl.formatMessage({ id: 'admin.users.fetchError', defaultMessage: '获取用户数据失败' }));
    } finally {
      setLoading(false);
      console.log('活跃用户数据获取完成');
    }
  };
  
  // 获取已删除用户数据
  const fetchAllDeletedUsers = async () => {
    console.log('开始获取已删除用户数据...');
    setDeletedLoading(true);
    try {
      const data = await fetchDeletedUsers();
      console.log('获取到已删除用户数据:', data);
      
      if (data.success) {
        const formattedData = data.data.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone || '-',
          role: 'user',
          deletedAt: user.deletedAt ? new Date(user.deletedAt).toLocaleString() : '-',
          createdAt: new Date(user.createdAt).toISOString().split('T')[0]
        }));
        
        console.log('格式化后的已删除用户数据:', formattedData);
        setDeletedUsers(formattedData);
        console.log('已删除用户数据已更新到状态');
      } else {
        console.error('获取已删除用户数据失败:', data);
        message.error(intl.formatMessage({ id: 'admin.users.fetchDeletedError', defaultMessage: '获取已删除用户数据失败' }));
      }
    } catch (error) {
      console.error('获取已删除用户数据错误:', error);
      message.error(intl.formatMessage({ id: 'admin.users.fetchDeletedError', defaultMessage: '获取已删除用户数据失败' }));
    } finally {
      setDeletedLoading(false);
      console.log('已删除用户数据获取完成');
    }
  };
  
  // 获取可用于转移账本的用户
  const fetchAvailableUsers = async (excludeUserId) => {
    try {
      const response = await fetchUsers();
      
      const { data } = response;
      
      if (data.success) {
        // 过滤掉当前要删除的用户
        const availableUsersList = data.data
          .filter(user => user._id !== excludeUserId && !user.isDeleted)
          .map(user => ({
            key: user._id,
            title: `${user.username} (${user.email})`,
            description: user.email
          }));
        
        setAvailableUsers(availableUsersList);
      }
    } catch (error) {
      console.error('获取可用用户错误:', error);
    }
  };
  
  useEffect(() => {
    fetchAllUsers();
    fetchAllDeletedUsers();
  }, []);
  
  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
    // 每次切换标签页时都刷新相应的数据
    if (key === 'active') {
      fetchAllUsers();
    } else if (key === 'deleted') {
      fetchAllDeletedUsers();
    }
  };
  
  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
  };
  
  // 过滤用户数据
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    (user.phone && user.phone.includes(searchText))
  );
  
  // 过滤已删除用户数据
  const filteredDeletedUsers = deletedUsers.filter(user => 
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    (user.phone && user.phone.includes(searchText))
  );
  
  // 打开创建用户模态框
  const showCreateModal = () => {
    setModalTitle(intl.formatMessage({ id: 'admin.users.createUser', defaultMessage: '创建用户' }));
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // 打开编辑用户模态框
  const showEditModal = (user) => {
    setModalTitle(intl.formatMessage({ id: 'admin.users.editUser', defaultMessage: '编辑用户' }));
    setEditingUser(user);
    // 延迟设置表单值，确保模态框已经打开
    setTimeout(() => {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        status: user.status === 'active',
      });
    }, 100);
    setModalVisible(true);
  };
  
  // 生成随机密码
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  // 生成新密码
  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    form.setFieldsValue({ password: newPassword });
  };
  
  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单验证通过，提交的值:', values);
      
      if (editingUser) {
        // 更新用户
        const updateData = {
          username: values.username,
          email: values.email,
          status: values.status ? 'active' : 'inactive' // 添加状态字段
        };
        
        // 如果提供了新密码，则更新密码
        if (values.password) {
          updateData.password = values.password;
        }
        
        console.log('准备更新用户，用户ID:', editingUser.id, '更新数据:', updateData);
        
        try {
          const result = await updateUser(editingUser.id, updateData);
          console.log('更新用户结果:', result);
          
          if (result.success) {
            const { data } = result;
            
            if (data.success) {
              message.success(intl.formatMessage({ id: 'admin.users.updateSuccess', defaultMessage: '用户更新成功' }));
              setModalVisible(false); // 关闭模态框
              fetchAllUsers(); // 重新获取用户列表
            } else {
              console.error('更新用户失败:', data);
              message.error(data.message || intl.formatMessage({ id: 'admin.users.updateError', defaultMessage: '用户更新失败' }));
            }
          } else {
            console.error('更新用户请求失败:', result);
            message.error(result.data?.message || intl.formatMessage({ id: 'admin.users.updateError', defaultMessage: '用户更新失败' }));
          }
        } catch (updateError) {
          console.error('更新用户时发生错误:', updateError);
          console.error('错误详情:', updateError.response?.data || updateError.message);
          message.error(updateError.response?.data?.message || intl.formatMessage({ id: 'admin.users.updateError', defaultMessage: '用户更新失败' }));
        }
      } else {
        // 创建用户
        const userData = {
          username: values.username,
          email: values.email,
          password: values.password,
          status: values.status ? 'active' : 'inactive' // 添加状态字段
        };
        
        console.log('准备创建用户，用户数据:', userData);
        
        try {
          const response = await createUser(userData);
          console.log('创建用户响应:', response);
          
          if (response && response.data) {
            const { data } = response;
            
            if (data.success) {
              message.success(intl.formatMessage({ id: 'admin.users.createSuccess', defaultMessage: '用户创建成功' }));
              setModalVisible(false); // 关闭模态框
              fetchAllUsers(); // 重新获取用户列表
            } else {
              console.error('创建用户失败:', data);
              message.error(data.message || intl.formatMessage({ id: 'admin.users.createError', defaultMessage: '用户创建失败' }));
            }
          } else {
            console.error('创建用户响应无效:', response);
            message.error(intl.formatMessage({ id: 'admin.users.createError', defaultMessage: '用户创建失败' }));
          }
        } catch (createError) {
          console.error('创建用户时发生错误:', createError);
          console.error('错误详情:', createError.response?.data || createError.message);
          message.error(createError.response?.data?.message || intl.formatMessage({ id: 'admin.users.createError', defaultMessage: '用户创建失败' }));
        }
      }
      
      setModalVisible(false);
    } catch (validationError) {
      console.error('表单验证失败:', validationError);
    }
  };
  
  // 打开删除用户确认框
  const showDeleteConfirm = async (user) => {
    setDeletingUser(user);
    await fetchAvailableUsers(user.id);
    setTransferModalVisible(true);
  };
  
  // 打开恢复用户确认框
  const showRestoreConfirm = (user) => {
    setRestoringUser(user);
    setRestoreModalVisible(true);
  };
  
  // 处理删除用户
  const handleDeleteUser = async () => {
    try {
      const userId = deletingUser.id;
      const transferData = selectedTransferUser ? { transferToUserId: selectedTransferUser } : {};
      
      // 先关闭模态框，确保UI响应
      setTransferModalVisible(false);
      setSelectedTransferUser(null);
      
      // 然后执行删除操作
      const response = await deleteUser(userId, transferData);
      
      const { data } = response;
      
      if (data.success) {
        // 显示成功消息
        message.success(intl.formatMessage({ id: 'admin.users.deleteSuccess', defaultMessage: '用户软删除成功' }));
      } else {
        message.error(data.message || intl.formatMessage({ id: 'admin.users.deleteError', defaultMessage: '用户删除失败' }));
      }
    } catch (error) {
      console.error('删除用户错误:', error);
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'admin.users.deleteError', defaultMessage: '用户删除失败' }));
    } finally {
      // 无论成功与否，都刷新数据并切换标签页
      refreshData();
    }
  };
  
  // 刷新数据并切换标签页的辅助函数
  const refreshData = async () => {
    try {
      console.log('开始刷新数据...');
      // 设置加载状态
      setLoading(true);
      setDeletedLoading(true);
      
      // 分别获取数据，不使用Promise.all，确保每个请求都能完成
      const usersData = await fetchUsers();
      if (usersData.success) {
        setUsers(usersData.data.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone || '-',
          role: 'user',
          status: user.isDeleted ? 'inactive' : 'active',
          createdAt: new Date(user.createdAt).toISOString().split('T')[0],
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'
        })));
        console.log('活跃用户数据已更新');
      }
      
      const deletedUsersData = await fetchDeletedUsers();
      if (deletedUsersData.success) {
        const formattedData = deletedUsersData.data.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone || '-',
          role: 'user',
          deletedAt: user.deletedAt ? new Date(user.deletedAt).toLocaleString() : '-',
          createdAt: new Date(user.createdAt).toISOString().split('T')[0]
        }));
        
        setDeletedUsers(formattedData);
        console.log('已删除用户数据已更新');
      }
      
      console.log('数据刷新完成');
    } catch (error) {
      console.error('刷新数据错误:', error);
    } finally {
      // 无论成功与否，都重置加载状态
      setLoading(false);
      setDeletedLoading(false);
    }
  };
  
  // 处理恢复用户
  const handleRestoreUser = async () => {
    try {
      if (!restoringUser) {
        message.error(intl.formatMessage({ id: 'admin.users.userNotFound', defaultMessage: '找不到要恢复的用户' }));
        return;
      }
      
      const userId = restoringUser.id;
      
      // 先关闭模态框，确保UI响应
      setRestoreModalVisible(false);
      
      // 显示加载中消息
      message.loading({
        content: intl.formatMessage({ 
          id: 'admin.users.restoringUser', 
          defaultMessage: '正在恢复用户 {username}...',
        }, { username: restoringUser.username || '' }),
        key: 'restoreUser',
        duration: 0
      });
      
      // 执行恢复操作
      const response = await restoreUser(userId);
      const { data } = response;
      
      if (data.success) {
        // 显示成功消息
        message.success({
          content: intl.formatMessage({ 
            id: 'admin.users.restoreSuccess', 
            defaultMessage: '用户 {username} 恢复成功',
          }, { username: restoringUser.username || '' }),
          key: 'restoreUser',
          duration: 2
        });
        
        // 如果当前在已删除用户标签页，切换到活跃用户标签页
        if (activeTab === 'deleted') {
          setActiveTab('active');
        }
      } else {
        message.error({
          content: data.message || intl.formatMessage({ 
            id: 'admin.users.restoreError', 
            defaultMessage: '恢复用户失败' 
          }),
          key: 'restoreUser',
          duration: 3
        });
      }
    } catch (error) {
      console.error('恢复用户错误:', error);
      message.error({
        content: intl.formatMessage({ 
          id: 'admin.users.restoreError', 
          defaultMessage: '恢复用户失败: {error}' 
        }, { error: error.message || '未知错误' }),
        key: 'restoreUser',
        duration: 3
      });
    } finally {
      // 重置恢复用户状态
      setRestoringUser(null);
      
      // 无论成功与否，都刷新数据
      refreshData();
    }
  };
  
  // 处理转移目标用户选择
  const handleTransferUserChange = (targetKeys) => {
    setSelectedTransferUser(targetKeys.length > 0 ? targetKeys[0] : null);
  };
  
  // 活跃用户表格列定义
  const activeColumns = [
    {
      title: intl.formatMessage({ id: 'admin.users.username', defaultMessage: '用户名' }),
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.users.email', defaultMessage: '邮箱' }),
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <Space>
          <MailOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.users.status', defaultMessage: '状态' }),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = intl.formatMessage({ id: 'admin.users.active', defaultMessage: '活跃' });
        
        if (status === 'inactive') {
          color = 'orange';
          text = intl.formatMessage({ id: 'admin.users.inactive', defaultMessage: '未激活' });
        } else if (status === 'locked') {
          color = 'red';
          text = intl.formatMessage({ id: 'admin.users.locked', defaultMessage: '已锁定' });
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: 'admin.users.createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: intl.formatMessage({ id: 'admin.users.lastLogin', defaultMessage: '最后登录' }),
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: intl.formatMessage({ id: 'admin.users.actions', defaultMessage: '操作' }),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={intl.formatMessage({ id: 'admin.users.edit', defaultMessage: '编辑' })}>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showEditModal(record)} 
            />
          </Tooltip>
          
          <Tooltip title={intl.formatMessage({ id: 'admin.users.delete', defaultMessage: '删除' })}>
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // 已删除用户表格列定义
  const deletedColumns = [
    {
      title: intl.formatMessage({ id: 'admin.users.username', defaultMessage: '用户名' }),
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.users.email', defaultMessage: '邮箱' }),
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <Space>
          <MailOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.users.createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: intl.formatMessage({ id: 'admin.users.deletedAt', defaultMessage: '删除时间' }),
      dataIndex: 'deletedAt',
      key: 'deletedAt',
    },
    {
      title: intl.formatMessage({ id: 'admin.users.actions', defaultMessage: '操作' }),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={intl.formatMessage({ id: 'admin.users.restore', defaultMessage: '恢复' })}>
            <Button 
              type="text" 
              icon={<UndoOutlined />} 
              onClick={() => showRestoreConfirm(record)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  return (
    <div className="admin-user-management">
      <Card className="admin-card">
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          destroyInactiveTabPane={false}
          items={[
            {
              key: 'active',
              label: intl.formatMessage({ id: 'admin.users.activeUsers', defaultMessage: '活跃用户' }),
              children: (
                <>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                      <h2><FormattedMessage id="admin.users.title" defaultMessage="用户管理" /></h2>
                    </Col>
                    <Col>
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />} 
                          onClick={() => showCreateModal()}
                        >
                          <FormattedMessage id="admin.users.create" defaultMessage="创建用户" />
                        </Button>
                        <Input.Search
                          placeholder={intl.formatMessage({ id: 'admin.users.search', defaultMessage: '搜索用户' })}
                          allowClear
                          onSearch={handleSearch}
                          style={{ width: 250 }}
                        />
                        <Button 
                          icon={<ReloadOutlined />} 
                          onClick={fetchAllUsers}
                          loading={loading}
                        >
                          <FormattedMessage id="admin.users.refresh" defaultMessage="刷新" />
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Table 
                    columns={activeColumns} 
                    dataSource={filteredUsers} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ 
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => intl.formatMessage(
                        { id: 'admin.users.total', defaultMessage: '共 {total} 条记录' },
                        { total }
                      )
                    }}
                    className="admin-table"
                    locale={{
                      emptyText: intl.formatMessage({ id: 'admin.users.noUsers', defaultMessage: '暂无用户' })
                    }}
                  />
                </>
              )
            },
            {
              key: 'deleted',
              label: intl.formatMessage({ id: 'admin.users.deletedUsers', defaultMessage: '已删除用户' }),
              children: (
                <>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                      <h2><FormattedMessage id="admin.users.deletedUsersTitle" defaultMessage="已删除用户" /></h2>
                    </Col>
                    <Col>
                      <Space>
                        <Input.Search
                          placeholder={intl.formatMessage({ id: 'admin.users.search', defaultMessage: '搜索用户' })}
                          allowClear
                          onSearch={handleSearch}
                          style={{ width: 250 }}
                        />
                        <Button 
                          icon={<ReloadOutlined />} 
                          onClick={fetchAllDeletedUsers}
                          loading={deletedLoading}
                        >
                          <FormattedMessage id="admin.users.refresh" defaultMessage="刷新" />
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Table 
                    columns={deletedColumns} 
                    dataSource={filteredDeletedUsers} 
                    rowKey="id"
                    loading={deletedLoading}
                    pagination={{ 
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => intl.formatMessage(
                        { id: 'admin.users.total', defaultMessage: '共 {total} 条记录' },
                        { total }
                      )
                    }}
                    className="admin-table"
                    locale={{
                      emptyText: intl.formatMessage({ id: 'admin.users.noDeletedUsers', defaultMessage: '暂无已删除用户' })
                    }}
                  />
                </>
              )
            }
          ]}
        />
      </Card>
      
      {/* 创建/编辑用户模态框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
        >
          <Form.Item
            name="username"
            label={intl.formatMessage({ id: 'admin.users.username', defaultMessage: '用户名' })}
            rules={[
              { 
                required: true, 
                message: intl.formatMessage({ id: 'admin.users.usernameRequired', defaultMessage: '请输入用户名' }) 
              }
            ]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="password"
            label={intl.formatMessage({ 
              id: editingUser ? 'admin.users.newPassword' : 'admin.users.password', 
              defaultMessage: editingUser ? '密码' : '密码' 
            })}
            rules={[
              { 
                required: !editingUser, 
                message: intl.formatMessage({ id: 'admin.users.passwordRequired', defaultMessage: '请输入密码' }) 
              }
            ]}
            extra={editingUser ? intl.formatMessage({ id: 'admin.users.passwordHint', defaultMessage: '留空表示不修改密码' }) : ''}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              addonAfter={
                <Button 
                  type="link" 
                  size="small" 
                  onClick={handleGeneratePassword}
                  style={{ marginRight: -7, marginLeft: -7 }}
                >
                  {intl.formatMessage({ id: 'admin.users.generatePassword', defaultMessage: '生成' })}
                </Button>
              }
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            label={intl.formatMessage({ id: 'admin.users.email', defaultMessage: '邮箱' })}
            rules={[
              { 
                required: true, 
                message: intl.formatMessage({ id: 'admin.users.emailRequired', defaultMessage: '请输入邮箱' }) 
              },
              {
                type: 'email',
                message: intl.formatMessage({ id: 'admin.users.emailInvalid', defaultMessage: '请输入有效的邮箱地址' })
              }
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="status"
            label={intl.formatMessage({ id: 'admin.users.status', defaultMessage: '状态' })}
            valuePropName="checked"
            initialValue={true}
          >
            <Switch 
              checkedChildren={intl.formatMessage({ id: 'admin.users.active', defaultMessage: '活跃' })}
              unCheckedChildren={intl.formatMessage({ id: 'admin.users.inactive', defaultMessage: '未激活' })}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 删除用户确认模态框 */}
      <Modal
        title={intl.formatMessage({ id: 'admin.users.deleteConfirmTitle', defaultMessage: '删除用户' })}
        open={transferModalVisible}
        onOk={handleDeleteUser}
        onCancel={() => {
          setTransferModalVisible(false);
          setSelectedTransferUser(null);
        }}
        destroyOnClose
      >
        <p>{intl.formatMessage({ id: 'admin.users.deleteConfirmMessage', defaultMessage: '确定要删除此用户吗？此操作不可撤销。' })}</p>
        
        {availableUsers.length > 0 && (
          <>
            <Divider />
            <p>{intl.formatMessage({ id: 'admin.users.transferBooksMessage', defaultMessage: '如果该用户拥有账本，请选择要将账本转移给的用户：' })}</p>
            <Transfer
              dataSource={availableUsers}
              showSearch
              targetKeys={selectedTransferUser ? [selectedTransferUser] : []}
              onChange={handleTransferUserChange}
              render={item => item.title}
              oneWay
              pagination
              listStyle={{
                width: '100%',
                height: 300,
              }}
            />
          </>
        )}
      </Modal>
      
      {/* 恢复用户确认模态框 */}
      <Modal
        title={intl.formatMessage({ id: 'admin.users.restoreConfirmTitle', defaultMessage: '恢复用户' })}
        open={restoreModalVisible}
        onOk={handleRestoreUser}
        onCancel={() => setRestoreModalVisible(false)}
        destroyOnClose
      >
        <p>{intl.formatMessage({ id: 'admin.users.restoreConfirmMessage', defaultMessage: '确定要恢复此用户吗？此操作不可撤销。' })}</p>
      </Modal>
    </div>
  );
};

export default UserManagement; 