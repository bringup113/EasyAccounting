import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  List, Card, Typography, Space, Tag, Button, 
  Tooltip, Divider, DatePicker, Select, Input, 
  Row, Col, Pagination, Empty 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, FilterOutlined, 
  SearchOutlined, CalendarOutlined, UserOutlined,
  TagOutlined, BankOutlined
} from '@ant-design/icons';
import { fetchTransactions } from '../store/transactionSlice';
import { TransactionListSkeleton } from './SkeletonLoaders';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const TransactionList = ({ 
  onEditTransaction, 
  onDeleteTransaction, 
  onViewTransaction 
}) => {
  const dispatch = useDispatch();
  const { transactions, loading, pagination, total } = useSelector((state) => state.transactions);
  const { currentBook } = useSelector((state) => state.books);
  const { accounts } = useSelector((state) => state.accounts);
  const { categories } = useSelector((state) => state.categories);
  const { persons } = useSelector((state) => state.persons);
  const { tags } = useSelector((state) => state.tags);
  
  // 筛选条件
  const [filters, setFilters] = useState({
    bookId: currentBook?._id,
    page: 1,
    limit: 10,
    type: undefined,
    categoryId: undefined,
    personId: undefined,
    tagId: undefined,
    accountId: undefined,
    dateRange: undefined,
    search: '',
  });

  // 是否显示筛选面板
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (currentBook) {
      setFilters(prev => ({
        ...prev,
        bookId: currentBook._id
      }));
    }
  }, [currentBook]);

  useEffect(() => {
    if (filters.bookId) {
      dispatch(fetchTransactions(filters));
    }
  }, [dispatch, filters]);

  // 处理筛选条件变化
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // 重置页码
    }));
  };

  // 处理分页变化
  const handlePageChange = (page, pageSize) => {
    setFilters(prev => ({
      ...prev,
      page,
      limit: pageSize
    }));
  };

  // 重置筛选条件
  const resetFilters = () => {
    setFilters({
      bookId: currentBook?._id,
      page: 1,
      limit: 10,
      type: undefined,
      categoryId: undefined,
      personId: undefined,
      tagId: undefined,
      accountId: undefined,
      dateRange: undefined,
      search: '',
    });
  };

  // 获取账户的货币信息
  const getAccountCurrency = (accountId) => {
    if (!accountId || !currentBook || !currentBook.currencies) return null;
    
    const account = accounts.find(acc => acc._id === accountId);
    if (!account) return null;
    
    return currentBook.currencies.find(c => c.code === account.currency);
  };

  // 格式化金额显示
  const formatAmount = (amount, currency) => {
    if (!currency) return amount.toFixed(2);
    return `${currency.symbol} ${amount.toFixed(2)}`;
  };

  // 获取交易类型标签
  const getTypeTag = (type) => {
    switch (type) {
      case 'income':
        return <Tag color="success">收入</Tag>;
      case 'expense':
        return <Tag color="error">支出</Tag>;
      case 'transfer':
        return <Tag color="processing">借支</Tag>;
      default:
        return null;
    }
  };

  // 获取类别名称
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : '';
  };

  // 获取账户名称
  const getAccountName = (accountId) => {
    const account = accounts.find(a => a._id === accountId);
    return account ? account.name : '';
  };

  // 获取人员名称列表
  const getPersonNames = (personIds) => {
    if (!personIds || !personIds.length) return [];
    
    return personIds.map(id => {
      const person = persons.find(p => p._id === id);
      return person ? person.name : '';
    }).filter(Boolean);
  };

  // 获取标签列表
  const getTagList = (tagIds) => {
    if (!tagIds || !tagIds.length) return [];
    
    return tagIds.map(id => {
      const tag = tags.find(t => t._id === id);
      return tag ? { name: tag.name, color: tag.color } : null;
    }).filter(Boolean);
  };

  // 按日期分组交易记录
  const groupTransactionsByDate = () => {
    const groups = {};
    
    transactions.forEach(transaction => {
      const date = dayjs(transaction.date).format('YYYY-MM-DD');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items
    }));
  };

  const groupedTransactions = groupTransactionsByDate();

  return (
    <div>
      <Card 
        title="交易记录" 
        extra={
          <Button 
            icon={<FilterOutlined />} 
            onClick={() => setShowFilters(!showFilters)}
            type={showFilters ? 'primary' : 'default'}
          >
            筛选
          </Button>
        }
      >
        {showFilters && (
          <div style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="交易类型"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.type}
                  onChange={(value) => handleFilterChange('type', value)}
                >
                  <Option value="income">收入</Option>
                  <Option value="expense">支出</Option>
                  <Option value="transfer">借支</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="类别"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.categoryId}
                  onChange={(value) => handleFilterChange('categoryId', value)}
                >
                  {categories.map(category => (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="账户"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.accountId}
                  onChange={(value) => handleFilterChange('accountId', value)}
                >
                  {accounts.map(account => {
                    const currency = currentBook?.currencies?.find(
                      c => c.code === account.currency
                    );
                    return (
                      <Option key={account._id} value={account._id}>
                        {account.name} ({currency?.code || ''})
                      </Option>
                    );
                  })}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="相关人员"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.personId}
                  onChange={(value) => handleFilterChange('personId', value)}
                >
                  {persons.map(person => (
                    <Option key={person._id} value={person._id}>
                      {person.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="标签"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.tagId}
                  onChange={(value) => handleFilterChange('tagId', value)}
                >
                  {tags.map(tag => (
                    <Option key={tag._id} value={tag._id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <RangePicker 
                  style={{ width: '100%' }}
                  placeholder={['开始日期', '结束日期']}
                  value={filters.dateRange}
                  onChange={(dates) => handleFilterChange('dateRange', dates)}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="搜索描述"
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button onClick={resetFilters}>重置筛选</Button>
              </Col>
            </Row>
          </div>
        )}
        
        {loading ? (
          <TransactionListSkeleton count={5} />
        ) : groupedTransactions.length > 0 ? (
          groupedTransactions.map(group => (
            <div key={group.date} style={{ marginBottom: 24 }}>
              <Divider orientation="left">
                <Space>
                  <CalendarOutlined />
                  <span>{group.date}</span>
                </Space>
              </Divider>
              
              <List
                dataSource={group.items}
                renderItem={(transaction) => {
                  const currency = getAccountCurrency(transaction.accountId);
                  const personNames = getPersonNames(transaction.personIds);
                  const tagList = getTagList(transaction.tagIds);
                  
                  return (
                    <List.Item
                      key={transaction._id}
                      actions={[
                        <Tooltip title="编辑">
                          <Button 
                            icon={<EditOutlined />} 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTransaction(transaction);
                            }}
                          />
                        </Tooltip>,
                        <Tooltip title="删除">
                          <Button 
                            icon={<DeleteOutlined />} 
                            size="small" 
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTransaction(transaction);
                            }}
                          />
                        </Tooltip>
                      ]}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onViewTransaction && onViewTransaction(transaction)}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            {getTypeTag(transaction.type)}
                            <span>{getCategoryName(transaction.categoryId)}</span>
                            <Text type="secondary">
                              {dayjs(transaction.date).format('HH:mm')}
                            </Text>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            {transaction.description && (
                              <Text>{transaction.description}</Text>
                            )}
                            <Space wrap>
                              <Space size={4}>
                                <BankOutlined />
                                <Text type="secondary">{getAccountName(transaction.accountId)}</Text>
                              </Space>
                              
                              {personNames.length > 0 && (
                                <Space size={4}>
                                  <UserOutlined />
                                  <Text type="secondary">{personNames.join(', ')}</Text>
                                </Space>
                              )}
                            </Space>
                            
                            {tagList.length > 0 && (
                              <div style={{ marginTop: 4 }}>
                                <Space size={4}>
                                  <TagOutlined />
                                  <Space size={4}>
                                    {tagList.map((tag, index) => (
                                      <Tag key={index} color={tag.color}>
                                        {tag.name}
                                      </Tag>
                                    ))}
                                  </Space>
                                </Space>
                              </div>
                            )}
                          </Space>
                        }
                      />
                      <div style={{ textAlign: 'right' }}>
                        <Title 
                          level={4} 
                          style={{ 
                            margin: 0,
                            color: transaction.type === 'income' 
                              ? '#52c41a' 
                              : transaction.type === 'expense' 
                                ? '#f5222d' 
                                : '#1890ff'
                          }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatAmount(transaction.amount, currency)}
                        </Title>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          ))
        ) : (
          <Empty description="暂无交易记录" />
        )}
        
        {!loading && pagination && (
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Pagination
              current={pagination.page}
              pageSize={pagination.limit}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条记录`}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default TransactionList; 