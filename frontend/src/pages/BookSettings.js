import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Card, Typography, Divider, Modal, Button, Row, Col, Form, Input, Select, Space, Table, Tag, Progress, Alert, App
} from 'antd';
import {
  SettingOutlined, UserOutlined,
  PlusOutlined,
  SwapOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useIntl } from 'react-intl';
import BookForm from '../components/BookForm';
import api from '../services/api';
import { fetchBooks } from '../store/bookSlice';
import { updateUserPermission } from '../services/bookService';
import './BookSettings.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const BookSettingsContent = () => {
  const { currentBook } = useSelector((state) => state.books);
  const { user } = useSelector((state) => state.auth);
  const [isEditBookModalVisible, setIsEditBookModalVisible] = useState(false);
  const [isAddBookModalVisible, setIsAddBookModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [deleteConfirmDisabled, setDeleteConfirmDisabled] = useState(true);
  const countdownTimerRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [bookMembers, setBookMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPermission, setUserPermission] = useState('viewer');
  const [transferForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intl = useIntl();
  const { message } = App.useApp();

  // 判断当前用户是否是账本所有者
  const isOwner = useMemo(() => {
    if (!currentBook || !user) return false;
    
    // 确保两个ID都转换为字符串进行比较
    // 用户ID可能存在于user.id或user._id中
    const ownerId = currentBook.ownerId?.toString();
    const userId = (user.id || user._id)?.toString();
    
    return ownerId === userId;
  }, [currentBook, user]);

  // 添加更详细的调试信息
  useEffect(() => {
    if (currentBook && user) {
      // 移除控制台日志
    }
  }, [currentBook, user]);

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // 由于后端没有提供 /users 端点，我们暂时只获取当前用户信息
      const response = await api.get('/users/me');
      
      if (response.data.success && response.data.data) {
        // 由于我们只能获取当前用户，所以我们需要从账本成员中获取其他用户
        // 先获取账本成员
        if (currentBook && currentBook._id) {
          const membersResponse = await api.get(`/books/${currentBook._id}/members`);
          
          if (membersResponse.data.success && membersResponse.data.data) {
            // 过滤掉当前用户，因为不能将账本转让给自己
            const otherMembers = membersResponse.data.data.filter(
              m => m._id !== user?.id && m._id !== user?._id
            );
            setUsers(otherMembers);
          } else {
            setUsers([]);
          }
        } else {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?._id, currentBook, message]);

  // 获取类别和标签数据
  const fetchBookMembers = useCallback(async () => {
    if (!currentBook) return;
    
    try {
      setLoading(true);
      
      // 从API获取账本成员
      const response = await api.get(`/books/${currentBook._id}/members`);
      
      let members = response.data.data || [];
      
      // 确保所有者在成员列表中
      const ownerInMembers = members.find(m => m._id === currentBook.ownerId);
      if (!ownerInMembers && currentBook.ownerId) {
        try {
          // 尝试获取当前用户信息
          const meResponse = await api.get('/users/me');
          
          if (meResponse.data.success && meResponse.data.data) {
            const currentUserInfo = meResponse.data.data;
            
            // 如果当前用户是所有者，添加到成员列表
            if (currentUserInfo._id === currentBook.ownerId) {
              members.push(currentUserInfo);
            }
          }
        } catch (err) {
          console.error('获取所有者信息失败:', err);
        }
      }
      
      // 如果所有者仍然不在成员列表中，添加一个占位符
      if (!members.find(m => m._id === currentBook.ownerId) && currentBook.ownerId) {
        members.push({
          _id: currentBook.ownerId,
          username: user.username || '未知用户',
          email: user.email || '未知邮箱',
          isPlaceholder: true
        });
      }
      
      setBookMembers(members);
      
      // 设置当前用户的权限
      if (user) {
        // 查找当前用户在成员列表中的记录
        const currentUserInMembers = members.find(m => m._id === user.id || m._id === user._id);
        if (currentUserInMembers) {
          // 更新用户权限状态
          setUserPermission(currentUserInMembers.permission);
        } else if (isOwner) {
          // 如果当前用户是所有者但不在成员列表中
          setUserPermission('owner');
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('获取账本成员失败:', error);
      setLoading(false);
    }
  }, [currentBook, user, isOwner]);

  // 获取所有者信息
  const getOwnerInfo = useCallback(() => {
    // 如果当前用户是所有者，直接返回当前用户名
    if (isOwner && user) {
      return user.username || user.name || user.email || '未知用户';
    }
    
    // 在成员列表中查找所有者
    const owner = bookMembers.find(member => member._id === currentBook?.ownerId);
    
    // 如果在成员列表中找到所有者
    if (owner) {
      return owner.username || owner.name || owner.email || '未知用户';
    }
    
    // 如果找不到所有者信息，返回未知用户
    return '未知用户';
  }, [currentBook, bookMembers, user, isOwner]);

  // 获取用户列表和账本成员
  useEffect(() => {
    if (currentBook) {
      fetchUsers();
      fetchBookMembers();
      
      // 获取当前用户的详细信息
      const fetchCurrentUser = async () => {
        try {
          // 由于API路径问题，我们暂时不发送请求
        } catch (error) {
          console.error('获取当前用户详细信息失败:', error);
        }
      };
      
      fetchCurrentUser();
    }
  }, [currentBook, fetchUsers, fetchBookMembers]);

  // 处理转让账本
  const handleTransferBook = async (values) => {
    try {
      setLoading(true);
      
      // 确保有新所有者ID
      if (!values.newOwnerId) {
        message.error('请选择新所有者');
        setLoading(false);
        return;
      }
      
      const response = await api.post(`/books/${currentBook._id}/transfer`, { 
        newOwnerId: values.newOwnerId 
      });
      
      if (response.data.success) {
        message.success(intl.formatMessage({ id: 'book.transferSuccess', defaultMessage: '账本转让成功' }));
        setIsTransferModalVisible(false);
        // 重新获取账本列表
        dispatch(fetchBooks());
      } else {
        message.error(response.data.message || '账本转让失败');
      }
      setLoading(false);
    } catch (error) {
      console.error('转让账本失败:', error);
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'book.transferError', defaultMessage: '账本转让失败' }));
      setLoading(false);
    }
  };

  // 处理邀请用户
  const handleInviteUser = async (values) => {
    try {
      setLoading(true);
      await api.post(`/books/${currentBook._id}/invite`, { 
        email: values.email,
        permission: values.permission
      });
      message.success(intl.formatMessage({ id: 'book.inviteSuccess', defaultMessage: '邀请用户成功' }));
      setIsInviteModalVisible(false);
      fetchBookMembers();
      setLoading(false);
      inviteForm.resetFields();
    } catch (error) {
      console.error('邀请用户失败:', error);
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'book.inviteError', defaultMessage: '邀请用户失败' }));
      setLoading(false);
    }
  };

  // 处理删除账本
  const handleDeleteBook = async () => {
    try {
      setLoading(true);
      
      // 直接使用API调用而不是dispatch
      const response = await api.delete(`/books/${currentBook._id}`);
      
      if (response.data.success) {
        message.success(intl.formatMessage({ id: 'book.deleteSuccess', defaultMessage: '账本删除成功' }));
        setIsDeleteModalVisible(false);
        // 重新获取账本列表并导航到首页
        dispatch(fetchBooks());
        navigate('/');
      } else {
        message.error(response.data.message || '删除账本失败');
        setLoading(false);
      }
    } catch (error) {
      console.error('删除账本失败:', error);
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'book.deleteError', defaultMessage: '删除账本失败' }));
      setLoading(false);
    }
  };

  // 处理删除模态框打开
  useEffect(() => {
    if (isDeleteModalVisible) {
      setDeleteCountdown(5);
      setDeleteConfirmDisabled(true);
      
      countdownTimerRef.current = setInterval(() => {
        setDeleteCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            setDeleteConfirmDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(countdownTimerRef.current);
    };
  }, [isDeleteModalVisible]);

  // 处理修改成员权限
  const handleUpdateMemberPermission = async (memberId, permission) => {
    try {
      setLoading(true);
      
      // 使用 bookService 中的函数
      await updateUserPermission(currentBook._id, memberId, permission);
      message.success('成员权限更新成功');
      await fetchBookMembers(); // 使用 await 确保成员列表获取完成
      setLoading(false); // 无论成功与否都需要设置 loading 为 false
    } catch (error) {
      console.error('更新成员权限失败:', error);
      message.error(error.response?.data?.message || '更新成员权限失败');
      setLoading(false);
    }
  };

  // 处理移除成员
  const handleRemoveMember = async (memberId) => {
    try {
      setLoading(true);
      await api.delete(`/books/${currentBook._id}/members/${memberId}`);
      message.success('成员移除成功');
      await fetchBookMembers(); // 使用 await 确保成员列表获取完成
      setLoading(false); // 无论成功与否都需要设置 loading 为 false
    } catch (error) {
      console.error('移除成员失败:', error);
      message.error(error.response?.data?.message || '移除成员失败');
      setLoading(false);
    }
  };

  // 获取权限标签颜色
  const getPermissionTagColor = (permission) => {
    switch (permission) {
      case 'owner':
        return 'gold';
      case 'admin':
        return 'purple';
      case 'editor':
        return 'blue';
      case 'viewer':
        return 'green';
      default:
        return 'default';
    }
  };

  // 获取权限显示文本
  const getPermissionText = (permission) => {
    switch (permission) {
      case 'owner':
        return '创建者';
      case 'admin':
        return '管理者';
      case 'editor':
        return '协助者';
      case 'viewer':
        return '观察者';
      default:
        return '未知';
    }
  };

  // 处理编辑账本成功
  const handleEditBookSuccess = () => {
    setIsEditBookModalVisible(false);
    message.success(intl.formatMessage({ id: 'book.updateSuccess', defaultMessage: '账本更新成功' }));
  };

  // 处理添加账本成功
  const handleAddBookSuccess = () => {
    setIsAddBookModalVisible(false);
    message.success(intl.formatMessage({ id: 'book.createSuccess', defaultMessage: '账本创建成功' }));
  };

  // 添加一些自定义样式
  const styles = {
    container: {
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: 'none',
      margin: 0,
      padding: 0,
    },
    tabContent: {
      padding: '0',
    },
    card: {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
      borderRadius: '8px',
      marginBottom: '16px',
      background: '#ffffff',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      margin: 0,
      color: '#1890ff',
    },
    divider: {
      margin: '16px 0',
      borderColor: '#f0f0f0',
    },
    tabLabel: {
      padding: '0 8px', 
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
    },
    tabIcon: {
      marginRight: 8,
      fontSize: '16px',
    },
  };

  if (!currentBook) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text style={{ display: 'block', marginBottom: '20px' }}>请先选择或创建一个账本</Text>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsAddBookModalVisible(true)}
          >
            创建新账本
          </Button>
          
          <Modal
            title="创建新账本"
            open={isAddBookModalVisible}
            onCancel={() => setIsAddBookModalVisible(false)}
            footer={null}
            destroyOnClose
          >
            <BookForm 
              onSuccess={handleAddBookSuccess}
              onCancel={() => setIsAddBookModalVisible(false)}
            />
          </Modal>
        </div>
      </Card>
    );
  }

  const tabItems = [
    {
      key: 'book',
      label: (
        <div style={styles.tabLabel}>
          <SettingOutlined style={styles.tabIcon} />
          基本设置
        </div>
      ),
      children: (
        <div className="tab-content">
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SettingOutlined style={{ marginRight: 12, fontSize: 20 }} />
                账本信息
              </div>
            }
            extra={
              <Space>
                {isOwner || userPermission === 'admin' ? (
                  <Button 
                    type="primary" 
                    icon={<SettingOutlined />} 
                    onClick={() => setIsEditBookModalVisible(true)}
                  >
                    编辑账本
                  </Button>
                ) : (
                  <Text type="secondary">只有账本创建者和管理者可以编辑账本</Text>
                )}
              </Space>
            }
            style={{ ...styles.card, marginBottom: '16px' }}
            variant="borderless"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>{currentBook.name}</Title>
                <Text type="secondary">{currentBook.description || '无描述'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>默认货币: </Text>
                <Text>{currentBook.defaultCurrency}</Text>
              </Col>
              <Col span={12}>
                <Text strong>创建时间: </Text>
                <Text>{new Date(currentBook.createdAt).toLocaleString()}</Text>
              </Col>
              <Col span={12}>
                <Text strong>创建者: </Text>
                <Text type="success" style={{ fontWeight: 'bold' }}>{getOwnerInfo()}</Text>
              </Col>
              <Col span={12}>
                <Text strong>成员数量: </Text>
                <Text>{currentBook.members?.length || 1}</Text>
              </Col>
            </Row>
            
            <Modal
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <SettingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span>编辑账本</span>
                </div>
              }
              open={isEditBookModalVisible}
              onCancel={() => setIsEditBookModalVisible(false)}
              footer={null}
              destroyOnClose
              width={520}
              styles={{ body: { padding: '24px 24px 12px' } }}
            >
              <BookForm 
                book={currentBook}
                onSuccess={handleEditBookSuccess}
                onCancel={() => setIsEditBookModalVisible(false)}
                renderExtraFooter={
                  isOwner ? (
                    <span 
                      onClick={() => {
                        setIsEditBookModalVisible(false);
                        setIsDeleteModalVisible(true);
                      }}
                      style={{ 
                        color: '#ff4d4f',
                        cursor: 'pointer',
                        marginLeft: '16px'
                      }}
                    >
                      删除账本
                    </span>
                  ) : null
                }
              />
            </Modal>
            
            <Modal
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <SwapOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span>转让账本</span>
                </div>
              }
              open={isTransferModalVisible}
              onCancel={() => setIsTransferModalVisible(false)}
              footer={null}
              destroyOnClose
              width={480}
              styles={{ body: { padding: '24px 24px 12px' } }}
            >
              <div style={{ marginBottom: 20 }}>
                <Alert
                  message="转让账本后，您将不再是账本的所有者，但仍会保留账本成员身份。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </div>
              <Form
                form={transferForm}
                layout="vertical"
                onFinish={handleTransferBook}
                requiredMark="optional"
              >
                <Form.Item
                  name="newOwnerId"
                  label="选择新所有者"
                  rules={[{ required: true, message: '请选择新所有者' }]}
                >
                  <Select 
                    placeholder="请选择新所有者" 
                    loading={loading}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {users.map(user => (
                      <Option key={user._id} value={user._id}>
                        {user.username || user.name || user.email || user._id}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Divider style={{ margin: '12px 0 24px' }} />
                <Form.Item style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setIsTransferModalVisible(false)} style={{ marginRight: 8 }}>
                      取消
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<SwapOutlined />}>
                      确认转让
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </Modal>
          </Card>
          
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined style={{ marginRight: 12, fontSize: 20 }} />
                成员管理
              </div>
            }
            extra={
              // 只有创建者和管理者可以邀请用户
              (isOwner || userPermission === 'admin') ? (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsInviteModalVisible(true)}
                >
                  邀请用户
                </Button>
              ) : null
            }
            style={styles.card}
            variant="borderless"
          >
            <p>管理账本成员，设置成员权限，邀请新成员加入账本。</p>
            
            <Table
              dataSource={bookMembers}
              rowKey="_id"
              loading={loading}
              pagination={false}
              columns={[
                {
                  title: '用户名',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => record.username || text || record.email || '未知用户'
                },
                {
                  title: '邮箱',
                  dataIndex: 'email',
                  key: 'email'
                },
                {
                  title: '角色',
                  key: 'role',
                  render: (_, record) => {
                    // 使用后端返回的权限信息
                    const permission = record.permission || 'viewer';
                    return (
                      <Tag color={getPermissionTagColor(permission)}>
                        {getPermissionText(permission)}
                      </Tag>
                    );
                  }
                },
                {
                  title: '权限说明',
                  key: 'permissionDesc',
                  render: (_, record) => {
                    // 使用后端返回的权限信息
                    const permission = record.permission || 'viewer';
                    switch (permission) {
                      case 'owner':
                        return '可以管理整个账本，包括删除和转让账本';
                      case 'admin':
                        return '可以管理整个账本，但不能删除和转让账本';
                      case 'editor':
                        return '可以管理自己的数据，不能邀请用户';
                      case 'viewer':
                        return '只能查看数据，不能进行任何操作';
                      default:
                        return '';
                    }
                  }
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => {
                    // 创建者不能被修改或移除
                    if (record._id === currentBook.ownerId) {
                      // 如果当前用户是创建者，显示转让账本按钮
                      if (isOwner) {
                        return (
                          <Button 
                            type="default" 
                            icon={<SwapOutlined />} 
                            size="small"
                            onClick={() => setIsTransferModalVisible(true)}
                          >
                            转让账本
                          </Button>
                        );
                      }
                      return null;
                    }
                    
                    // 权限控制逻辑
                    // 1. 创建者可以管理所有成员（修改权限、移除成员）
                    // 2. 管理者可以管理除创建者外的所有成员（修改权限、移除成员）
                    // 3. 协助者和观察者不能管理成员
                    
                    // 获取当前用户的权限
                    const currentUserPermission = userPermission;
                    
                    // 只有创建者和管理者可以管理成员
                    if (currentUserPermission !== 'owner' && currentUserPermission !== 'admin') {
                      return null;
                    }
                    
                    return (
                      <Space>
                        <Select
                          value={record.permission || 'viewer'}
                          style={{ width: 100 }}
                          onChange={(value) => handleUpdateMemberPermission(record._id, value)}
                          disabled={loading}
                        >
                          <Option value="admin">管理者</Option>
                          <Option value="editor">协助者</Option>
                          <Option value="viewer">观察者</Option>
                        </Select>
                        <Button 
                          size="small" 
                          type="link" 
                          danger
                          onClick={() => handleRemoveMember(record._id)}
                          disabled={loading}
                        >
                          移除
                        </Button>
                      </Space>
                    );
                  }
                }
              ]}
            />
            
            <Modal
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span>邀请用户</span>
                </div>
              }
              open={isInviteModalVisible}
              onCancel={() => setIsInviteModalVisible(false)}
              footer={null}
              destroyOnClose
              width={480}
              styles={{ body: { padding: '24px 24px 12px' } }}
            >
              <Alert
                message="邀请用户加入账本"
                description="被邀请的用户将收到邀请通知，接受邀请后即可访问此账本。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Form
                form={inviteForm}
                layout="vertical"
                onFinish={handleInviteUser}
                requiredMark="optional"
              >
                <Form.Item
                  name="email"
                  label="用户邮箱"
                  rules={[
                    { required: true, message: '请输入用户邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input 
                    placeholder="请输入用户邮箱" 
                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    autoFocus
                  />
                </Form.Item>
                <Form.Item
                  name="permission"
                  label="权限设置"
                  initialValue="viewer"
                  tooltip="设置该用户在账本中的权限级别"
                  rules={[{ required: true, message: '请选择用户权限' }]}
                >
                  <Select placeholder="请选择用户权限">
                    <Option value="admin">管理者 - 可以管理账本内容，但不能转让或删除账本</Option>
                    <Option value="editor">协助者 - 可以添加、编辑和删除自己的数据</Option>
                    <Option value="viewer">观察者 - 只能查看数据，不能修改</Option>
                  </Select>
                </Form.Item>
                <Divider style={{ margin: '12px 0 24px' }} />
                <Form.Item style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setIsInviteModalVisible(false)} style={{ marginRight: 8 }}>
                      取消
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<UserOutlined />}>
                      发送邀请
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </Modal>
          </Card>
        </div>
      ),
    }
  ];

  return (
    <Card className="book-settings-container" variant="borderless" style={styles.container}>
      <div className="tab-content" style={styles.tabContent}>
        {tabItems[0].children}
      </div>
      
      {/* 删除账本确认模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f' }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            <span>确认删除账本</span>
          </div>
        }
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="delete" 
            type="primary" 
            danger 
            onClick={handleDeleteBook} 
            disabled={deleteConfirmDisabled}
            loading={loading}
            icon={deleteConfirmDisabled ? null : <ExclamationCircleOutlined />}
          >
            {deleteConfirmDisabled ? `确认删除 (${deleteCountdown}s)` : '确认删除'}
          </Button>
        ]}
        destroyOnClose
        width={480}
        styles={{ body: { padding: '24px' } }}
      >
        <Alert
          message="警告：此操作不可逆！"
          description="删除后，所有与此账本相关的数据将被永久删除，且无法恢复。"
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ marginBottom: 16 }}>
          <Progress 
            percent={100 - (deleteCountdown / 5 * 100)} 
            showInfo={false} 
            status="active" 
            strokeColor="#ff4d4f" 
          />
        </div>
        
        <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 4, marginBottom: 16 }}>
          <Paragraph>
            您正在删除账本 <Text strong>"{currentBook?.name}"</Text>。删除后，将永久删除：
          </Paragraph>
          <ul style={{ marginBottom: 0 }}>
            <li>所有交易记录</li>
            <li>所有账户信息</li>
            <li>所有类别和标签</li>
            <li>所有成员关联</li>
          </ul>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            {deleteConfirmDisabled 
              ? `请等待 ${deleteCountdown} 秒后确认删除` 
              : '现在可以点击"确认删除"按钮删除账本'}
          </Text>
        </div>
      </Modal>
    </Card>
  );
};

const BookSettings = () => (
  <App>
    <BookSettingsContent />
  </App>
);

export default BookSettings; 