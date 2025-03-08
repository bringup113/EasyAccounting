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
  message, 
  Tooltip, 
  Tag, 
  Popconfirm,
  Row,
  Col,
  Divider,
  Tabs,
  Badge
} from 'antd';
import { 
  BookOutlined, 
  ReloadOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UndoOutlined,
  InboxOutlined,
  SwapOutlined,
  UserOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { 
  fetchBooks, 
  fetchArchivedBooks, 
  fetchDeletedBooks, 
  archiveBook, 
  restoreBook, 
  undeleteBook, 
  transferBookOwnership,
  fetchUsers
} from '../../services/adminService';

const { TabPane } = Tabs;
const { Option } = Select;

const BookManagement = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [archivedBooks, setArchivedBooks] = useState([]);
  const [deletedBooks, setDeletedBooks] = useState([]);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [searchText, setSearchText] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // 获取所有账本
  const fetchAllBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchBooks();
      
      if (data.success) {
        // 过滤出活跃账本（非归档且非删除）
        const activeBooks = data.data.filter(book => !book.isArchived && !book.isDeleted);
        
        setBooks(activeBooks.map(book => ({
          id: book._id,
          name: book.name,
          description: book.description || '-',
          owner: book.ownerId ? (book.ownerId.username || '未知用户') : '未知用户',
          ownerEmail: book.ownerId ? book.ownerId.email : '',
          ownerId: book.ownerId ? book.ownerId._id : null,
          membersCount: book.members ? book.members.length : 0,
          members: book.members || [],
          defaultCurrency: book.defaultCurrency,
          createdAt: new Date(book.createdAt).toLocaleString(),
          updatedAt: new Date(book.updatedAt).toLocaleString()
        })));
      } else {
        message.error(intl.formatMessage({ id: 'admin.books.fetchError', defaultMessage: '获取账本数据失败' }));
      }
    } catch (error) {
      console.error('获取账本数据错误:', error);
      message.error(intl.formatMessage({ id: 'admin.books.fetchError', defaultMessage: '获取账本数据失败' }));
    } finally {
      setLoading(false);
    }
  };
  
  // 获取已归档账本
  const fetchAllArchivedBooks = async () => {
    setArchivedLoading(true);
    try {
      const data = await fetchArchivedBooks();
      
      if (data.success) {
        setArchivedBooks(data.data.map(book => ({
          id: book._id,
          name: book.name,
          description: book.description || '-',
          owner: book.ownerId ? (book.ownerId.username || '未知用户') : '未知用户',
          ownerEmail: book.ownerId ? book.ownerId.email : '',
          ownerId: book.ownerId ? book.ownerId._id : null,
          membersCount: book.members ? book.members.length : 0,
          members: book.members || [],
          defaultCurrency: book.defaultCurrency,
          createdAt: new Date(book.createdAt).toLocaleString(),
          archivedAt: book.archivedAt ? new Date(book.archivedAt).toLocaleString() : '-'
        })));
      } else {
        message.error(intl.formatMessage({ id: 'admin.books.fetchArchivedError', defaultMessage: '获取已归档账本数据失败' }));
      }
    } catch (error) {
      console.error('获取已归档账本数据错误:', error);
      message.error(intl.formatMessage({ id: 'admin.books.fetchArchivedError', defaultMessage: '获取已归档账本数据失败' }));
    } finally {
      setArchivedLoading(false);
    }
  };
  
  // 获取已删除账本
  const fetchAllDeletedBooks = async () => {
    setDeletedLoading(true);
    try {
      const data = await fetchDeletedBooks();
      
      if (data.success) {
        setDeletedBooks(data.data.map(book => ({
          id: book._id,
          name: book.name,
          description: book.description || '-',
          owner: book.ownerId ? (book.ownerId.username || '未知用户') : '未知用户',
          ownerEmail: book.ownerId ? book.ownerId.email : '',
          ownerId: book.ownerId ? book.ownerId._id : null,
          membersCount: book.members ? book.members.length : 0,
          members: book.members || [],
          defaultCurrency: book.defaultCurrency,
          createdAt: new Date(book.createdAt).toLocaleString(),
          deletedAt: book.deletedAt ? new Date(book.deletedAt).toLocaleString() : '-'
        })));
      } else {
        message.error(intl.formatMessage({ id: 'admin.books.fetchDeletedError', defaultMessage: '获取已删除账本数据失败' }));
      }
    } catch (error) {
      console.error('获取已删除账本数据错误:', error);
      message.error(intl.formatMessage({ id: 'admin.books.fetchDeletedError', defaultMessage: '获取已删除账本数据失败' }));
    } finally {
      setDeletedLoading(false);
    }
  };
  
  // 获取可用用户列表
  const fetchAllUsers = async () => {
    try {
      const data = await fetchUsers();
      
      if (data.success) {
        // 过滤出活跃用户
        const activeUsers = data.data.filter(user => !user.isDeleted);
        
        setAvailableUsers(activeUsers.map(user => ({
          value: user._id,
          label: `${user.username} (${user.email})`
        })));
      }
    } catch (error) {
      console.error('获取可用用户错误:', error);
    }
  };
  
  useEffect(() => {
    fetchAllBooks();
    fetchAllArchivedBooks();
    fetchAllDeletedBooks();
    fetchAllUsers();
  }, []);
  
  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'active') {
      fetchAllBooks();
    } else if (key === 'archived') {
      fetchAllArchivedBooks();
    } else if (key === 'deleted') {
      fetchAllDeletedBooks();
    }
  };
  
  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
  };
  
  // 过滤账本数据
  const filteredBooks = books.filter(book => 
    book.name.toLowerCase().includes(searchText.toLowerCase()) ||
    book.description.toLowerCase().includes(searchText.toLowerCase()) ||
    book.owner.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // 过滤已归档账本数据
  const filteredArchivedBooks = archivedBooks.filter(book => 
    book.name.toLowerCase().includes(searchText.toLowerCase()) ||
    book.description.toLowerCase().includes(searchText.toLowerCase()) ||
    book.owner.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // 过滤已删除账本数据
  const filteredDeletedBooks = deletedBooks.filter(book => 
    book.name.toLowerCase().includes(searchText.toLowerCase()) ||
    book.description.toLowerCase().includes(searchText.toLowerCase()) ||
    book.owner.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // 归档账本
  const handleArchiveBook = async (bookId) => {
    try {
      const data = await archiveBook(bookId);
      
      if (data.success) {
        message.success(intl.formatMessage({ id: 'admin.books.archiveSuccess', defaultMessage: '账本归档成功' }));
        fetchAllBooks();
        fetchAllArchivedBooks();
      } else {
        message.error(data.message || intl.formatMessage({ id: 'admin.books.archiveError', defaultMessage: '账本归档失败' }));
      }
    } catch (error) {
      console.error('归档账本错误:', error);
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'admin.books.archiveError', defaultMessage: '账本归档失败' }));
    }
  };
  
  // 恢复归档账本
  const handleRestoreArchivedBook = async (bookId) => {
    try {
      const data = await restoreBook(bookId);
      
      if (data.success) {
        message.success(intl.formatMessage({ id: 'admin.books.restoreSuccess', defaultMessage: '账本恢复成功' }));
        fetchAllBooks();
        fetchAllArchivedBooks();
      } else {
        message.error(data.message || intl.formatMessage({ id: 'admin.books.restoreError', defaultMessage: '账本恢复失败' }));
      }
    } catch (error) {
      console.error('恢复账本错误:', error);
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'admin.books.restoreError', defaultMessage: '账本恢复失败' }));
    }
  };
  
  // 恢复已删除账本
  const handleRestoreDeletedBook = async (bookId) => {
    try {
      const data = await undeleteBook(bookId);
      
      if (data.success) {
        message.success(intl.formatMessage({ id: 'admin.books.undeleteSuccess', defaultMessage: '账本恢复成功' }));
        fetchAllBooks();
        fetchAllDeletedBooks();
      } else {
        message.error(data.message || intl.formatMessage({ id: 'admin.books.undeleteError', defaultMessage: '账本恢复失败' }));
      }
    } catch (error) {
      console.error('恢复已删除账本错误:', error);
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'admin.books.undeleteError', defaultMessage: '账本恢复失败' }));
    }
  };
  
  // 打开转移账本所有权模态框
  const showTransferModal = (book) => {
    setSelectedBook(book);
    setSelectedUser(null);
    setTransferModalVisible(true);
  };
  
  // 处理转移账本所有权
  const handleTransferBook = async () => {
    if (!selectedUser) {
      message.error(intl.formatMessage({ id: 'admin.books.selectUserRequired', defaultMessage: '请选择目标用户' }));
      return;
    }
    
    try {
      const data = await transferBookOwnership(selectedBook.id, selectedUser);
      
      if (data.success) {
        message.success(intl.formatMessage({ id: 'admin.books.transferSuccess', defaultMessage: '账本所有权转移成功' }));
        fetchAllBooks();
        fetchAllArchivedBooks();
        fetchAllDeletedBooks();
        setTransferModalVisible(false);
      } else {
        message.error(data.message || intl.formatMessage({ id: 'admin.books.transferError', defaultMessage: '账本所有权转移失败' }));
      }
    } catch (error) {
      console.error('转移账本所有权错误:', error);
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'admin.books.transferError', defaultMessage: '账本所有权转移失败' }));
    }
  };
  
  // 活跃账本表格列定义
  const activeColumns = [
    {
      title: intl.formatMessage({ id: 'admin.books.name', defaultMessage: '账本名称' }),
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <BookOutlined />
          <span style={{ fontWeight: 'bold' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.books.description', defaultMessage: '描述' }),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'admin.books.owner', defaultMessage: '所有者' }),
      dataIndex: 'owner',
      key: 'owner',
      render: (text, record) => (
        <Tooltip title={record.ownerEmail}>
          <Space>
            <UserOutlined />
            <span style={{ fontWeight: 'bold' }}>{text}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.books.members', defaultMessage: '成员数' }),
      dataIndex: 'membersCount',
      key: 'membersCount',
      render: (count, record) => {
        // 生成成员列表内容
        const membersList = record.members.map(member => (
          <div key={member._id}>
            <UserOutlined /> {member.username} ({member.email})
          </div>
        ));
        
        return (
          <Tooltip 
            title={
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {intl.formatMessage({ id: 'admin.books.membersList', defaultMessage: '成员列表' })}:
                </div>
                {membersList.length > 0 ? membersList : <div>无成员</div>}
              </div>
            } 
            placement="right"
          >
            <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
          </Tooltip>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'admin.books.defaultCurrency', defaultMessage: '本位币' }),
      dataIndex: 'defaultCurrency',
      key: 'defaultCurrency',
    },
    {
      title: intl.formatMessage({ id: 'admin.books.createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: intl.formatMessage({ id: 'admin.books.actions', defaultMessage: '操作' }),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={intl.formatMessage({ id: 'admin.books.transfer', defaultMessage: '转移所有权' })}>
            <Button 
              type="text" 
              icon={<SwapOutlined />} 
              onClick={() => showTransferModal(record)} 
            />
          </Tooltip>
          
          <Tooltip title={intl.formatMessage({ id: 'admin.books.archive', defaultMessage: '归档' })}>
            <Button 
              type="text" 
              icon={<InboxOutlined />} 
              onClick={() => handleArchiveBook(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // 已归档账本表格列定义
  const archivedColumns = [
    {
      title: intl.formatMessage({ id: 'admin.books.name', defaultMessage: '账本名称' }),
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <BookOutlined />
          <span style={{ fontWeight: 'bold' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.books.description', defaultMessage: '描述' }),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'admin.books.owner', defaultMessage: '所有者' }),
      dataIndex: 'owner',
      key: 'owner',
      render: (text, record) => (
        <Tooltip title={record.ownerEmail}>
          <Space>
            <UserOutlined />
            <span style={{ fontWeight: 'bold' }}>{text}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.books.members', defaultMessage: '成员数' }),
      dataIndex: 'membersCount',
      key: 'membersCount',
      render: (count, record) => {
        // 生成成员列表内容
        const membersList = record.members.map(member => (
          <div key={member._id}>
            <UserOutlined /> {member.username} ({member.email})
          </div>
        ));
        
        return (
          <Tooltip 
            title={
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {intl.formatMessage({ id: 'admin.books.membersList', defaultMessage: '成员列表' })}:
                </div>
                {membersList.length > 0 ? membersList : <div>无成员</div>}
              </div>
            } 
            placement="right"
          >
            <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
          </Tooltip>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'admin.books.createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: intl.formatMessage({ id: 'admin.books.archivedAt', defaultMessage: '归档时间' }),
      dataIndex: 'archivedAt',
      key: 'archivedAt',
    },
    {
      title: intl.formatMessage({ id: 'admin.books.actions', defaultMessage: '操作' }),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={intl.formatMessage({ id: 'admin.books.restore', defaultMessage: '恢复' })}>
            <Button 
              type="text" 
              icon={<UndoOutlined />} 
              onClick={() => handleRestoreArchivedBook(record.id)} 
            />
          </Tooltip>
          
          <Tooltip title={intl.formatMessage({ id: 'admin.books.transfer', defaultMessage: '转移所有权' })}>
            <Button 
              type="text" 
              icon={<SwapOutlined />} 
              onClick={() => showTransferModal(record)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // 已删除账本表格列定义
  const deletedColumns = [
    {
      title: intl.formatMessage({ id: 'admin.books.name', defaultMessage: '账本名称' }),
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <BookOutlined />
          <span style={{ fontWeight: 'bold' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.books.description', defaultMessage: '描述' }),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'admin.books.owner', defaultMessage: '所有者' }),
      dataIndex: 'owner',
      key: 'owner',
      render: (text, record) => (
        <Tooltip title={record.ownerEmail}>
          <Space>
            <UserOutlined />
            <span style={{ fontWeight: 'bold' }}>{text}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: intl.formatMessage({ id: 'admin.books.members', defaultMessage: '成员数' }),
      dataIndex: 'membersCount',
      key: 'membersCount',
      render: (count, record) => {
        // 生成成员列表内容
        const membersList = record.members.map(member => (
          <div key={member._id}>
            <UserOutlined /> {member.username} ({member.email})
          </div>
        ));
        
        return (
          <Tooltip 
            title={
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {intl.formatMessage({ id: 'admin.books.membersList', defaultMessage: '成员列表' })}:
                </div>
                {membersList.length > 0 ? membersList : <div>无成员</div>}
              </div>
            } 
            placement="right"
          >
            <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
          </Tooltip>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'admin.books.createdAt', defaultMessage: '创建时间' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: intl.formatMessage({ id: 'admin.books.deletedAt', defaultMessage: '删除时间' }),
      dataIndex: 'deletedAt',
      key: 'deletedAt',
    },
    {
      title: intl.formatMessage({ id: 'admin.books.actions', defaultMessage: '操作' }),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={intl.formatMessage({ id: 'admin.books.restore', defaultMessage: '恢复' })}>
            <Button 
              type="text" 
              icon={<UndoOutlined />} 
              onClick={() => handleRestoreDeletedBook(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  return (
    <div className="admin-book-management">
      <Card className="admin-card">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane 
            tab={intl.formatMessage({ id: 'admin.books.activeBooks', defaultMessage: '活跃账本' })} 
            key="active"
          >
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <h2><FormattedMessage id="admin.books.title" defaultMessage="账本管理" /></h2>
              </Col>
              <Col>
                <Space>
                  <Input.Search
                    placeholder={intl.formatMessage({ id: 'admin.books.search', defaultMessage: '搜索账本' })}
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 250 }}
                  />
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchAllBooks}
                    loading={loading}
                  >
                    <FormattedMessage id="admin.books.refresh" defaultMessage="刷新" />
                  </Button>
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            <Table 
              columns={activeColumns} 
              dataSource={filteredBooks} 
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => intl.formatMessage(
                  { id: 'admin.books.total', defaultMessage: '共 {total} 条记录' },
                  { total }
                )
              }}
              className="admin-table"
            />
          </TabPane>
          
          <TabPane 
            tab={intl.formatMessage({ id: 'admin.books.archivedBooks', defaultMessage: '已归档账本' })} 
            key="archived"
          >
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <h2><FormattedMessage id="admin.books.archivedBooksTitle" defaultMessage="已归档账本" /></h2>
              </Col>
              <Col>
                <Space>
                  <Input.Search
                    placeholder={intl.formatMessage({ id: 'admin.books.search', defaultMessage: '搜索账本' })}
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 250 }}
                  />
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchAllArchivedBooks}
                    loading={archivedLoading}
                  >
                    <FormattedMessage id="admin.books.refresh" defaultMessage="刷新" />
                  </Button>
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            <Table 
              columns={archivedColumns} 
              dataSource={filteredArchivedBooks} 
              rowKey="id"
              loading={archivedLoading}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => intl.formatMessage(
                  { id: 'admin.books.total', defaultMessage: '共 {total} 条记录' },
                  { total }
                )
              }}
              className="admin-table"
            />
          </TabPane>
          
          <TabPane 
            tab={intl.formatMessage({ id: 'admin.books.deletedBooks', defaultMessage: '已删除账本' })} 
            key="deleted"
          >
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <h2><FormattedMessage id="admin.books.deletedBooksTitle" defaultMessage="已删除账本" /></h2>
              </Col>
              <Col>
                <Space>
                  <Input.Search
                    placeholder={intl.formatMessage({ id: 'admin.books.search', defaultMessage: '搜索账本' })}
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 250 }}
                  />
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchAllDeletedBooks}
                    loading={deletedLoading}
                  >
                    <FormattedMessage id="admin.books.refresh" defaultMessage="刷新" />
                  </Button>
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            <Table 
              columns={deletedColumns} 
              dataSource={filteredDeletedBooks} 
              rowKey="id"
              loading={deletedLoading}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => intl.formatMessage(
                  { id: 'admin.books.total', defaultMessage: '共 {total} 条记录' },
                  { total }
                )
              }}
              className="admin-table"
            />
          </TabPane>
        </Tabs>
      </Card>
      
      {/* 转移账本所有权模态框 */}
      <Modal
        title={intl.formatMessage({ id: 'admin.books.transferTitle', defaultMessage: '转移账本所有权' })}
        open={transferModalVisible}
        onOk={handleTransferBook}
        onCancel={() => {
          setTransferModalVisible(false);
          setSelectedUser(null);
        }}
        destroyOnClose
      >
        {selectedBook && (
          <>
            <p>
              {intl.formatMessage(
                { id: 'admin.books.transferMessage', defaultMessage: '您正在转移账本 "{name}" 的所有权' },
                { name: selectedBook.name }
              )}
            </p>
            <p>
              {intl.formatMessage(
                { id: 'admin.books.currentOwner', defaultMessage: '当前所有者: {owner}' },
                { owner: selectedBook.owner }
              )}
            </p>
            <Form layout="vertical">
              <Form.Item
                label={intl.formatMessage({ id: 'admin.books.selectNewOwner', defaultMessage: '选择新所有者' })}
                required
              >
                <Select
                  placeholder={intl.formatMessage({ id: 'admin.books.selectUser', defaultMessage: '请选择用户' })}
                  style={{ width: '100%' }}
                  value={selectedUser}
                  onChange={value => setSelectedUser(value)}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={availableUsers.filter(user => user.value !== selectedBook.ownerId)}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default BookManagement; 