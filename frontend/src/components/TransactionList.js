import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { FormattedMessage, useIntl } from 'react-intl';
import { debounce } from 'lodash';

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
  
  const intl = useIntl();

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

  // 使用useMemo缓存分类和标签数据，避免重复计算
  const categoriesMap = useMemo(() => {
    const map = {};
    categories.forEach(category => {
      map[category._id] = category;
    });
    return map;
  }, [categories]);

  const tagsMap = useMemo(() => {
    const map = {};
    tags.forEach(tag => {
      map[tag._id] = tag;
    });
    return map;
  }, [tags]);

  const accountsMap = useMemo(() => {
    const map = {};
    accounts.forEach(account => {
      map[account._id] = account;
    });
    return map;
  }, [accounts]);

  const personsMap = useMemo(() => {
    const map = {};
    persons.forEach(person => {
      map[person._id] = person;
    });
    return map;
  }, [persons]);

  // 使用useCallback和debounce优化搜索函数，减少API请求
  const debouncedSearch = useCallback(
    debounce((newFilters) => {
      dispatch(fetchTransactions(newFilters));
    }, 500),
    [dispatch]
  );

  // 处理筛选条件变化
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    debouncedSearch(newFilters);
  }, [filters, debouncedSearch]);

  // 处理分页变化
  const handlePageChange = useCallback((page, pageSize) => {
    const newFilters = { ...filters, page, limit: pageSize };
    setFilters(newFilters);
    dispatch(fetchTransactions(newFilters));
  }, [filters, dispatch]);

  // 初始加载数据
  useEffect(() => {
    if (currentBook?._id) {
      const initialFilters = { ...filters, bookId: currentBook._id };
      setFilters(initialFilters);
      dispatch(fetchTransactions(initialFilters));
    }
  }, [currentBook?._id]);

  // 是否显示筛选面板
  const [showFilters, setShowFilters] = useState(false);

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
    
    // 直接返回分组对象，而不是转换为数组
    return groups;
  };

  const groupedTransactions = groupTransactionsByDate();

  // 渲染筛选面板
  const renderFilters = () => {
    if (!showFilters) return null;
    
    return (
      <div className="transaction-filters">
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder={intl.formatMessage({ id: 'transaction.searchPlaceholder', defaultMessage: '搜索交易记录' })}
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={intl.formatMessage({ id: 'transaction.typeFilter', defaultMessage: '交易类型' })}
                style={{ width: '100%' }}
                allowClear
                value={filters.type}
                onChange={(value) => handleFilterChange('type', value)}
              >
                <Option value="income"><FormattedMessage id="transaction.income" defaultMessage="收入" /></Option>
                <Option value="expense"><FormattedMessage id="transaction.expense" defaultMessage="支出" /></Option>
                <Option value="transfer"><FormattedMessage id="transaction.transfer" defaultMessage="借支" /></Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={intl.formatMessage({ id: 'transaction.categoryFilter', defaultMessage: '类别' })}
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
                placeholder={intl.formatMessage({ id: 'transaction.accountFilter', defaultMessage: '账户' })}
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
                placeholder={intl.formatMessage({ id: 'transaction.personFilter', defaultMessage: '人员机构' })}
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
                placeholder={intl.formatMessage({ id: 'transaction.tagFilter', defaultMessage: '标签' })}
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
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                allowClear
              />
            </Col>
          </Row>
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button 
              onClick={() => setShowFilters(false)}
              style={{ marginRight: 8 }}
            >
              <FormattedMessage id="common.reset" defaultMessage="重置" />
            </Button>
            <Button 
              type="primary" 
              onClick={() => {
                dispatch(fetchTransactions(filters));
                setShowFilters(false);
              }}
            >
              <FormattedMessage id="common.apply" defaultMessage="应用" />
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <Card 
        title={<FormattedMessage id="transaction.title" defaultMessage="交易记录" />}
        extra={
          <Button 
            icon={<FilterOutlined />} 
            onClick={() => setShowFilters(!showFilters)}
            type={showFilters ? 'primary' : 'default'}
          >
            <FormattedMessage id="common.filter" defaultMessage="筛选" />
          </Button>
        }
      >
        {renderFilters()}
        
        {loading ? (
          <TransactionListSkeleton />
        ) : transactions.length === 0 ? (
          <Empty description={<FormattedMessage id="transaction.noTransactions" defaultMessage="暂无交易记录" />} />
        ) : (
          <>
            {Object.keys(groupedTransactions).length > 0 ? (
              Object.keys(groupedTransactions).map(date => (
                <div key={date} className="transaction-date-group">
                  <Divider orientation="left">
                    <Space>
                      <CalendarOutlined />
                      <span>{date}</span>
                    </Space>
                  </Divider>
                  <List
                    dataSource={groupedTransactions[date]}
                    renderItem={transaction => {
                      // 获取人员名称
                      const personNames = transaction.personIds
                        ? getPersonNames(transaction.personIds)
                        : [];
                      
                      // 获取标签列表
                      const tagList = transaction.tagIds
                        ? getTagList(transaction.tagIds)
                        : [];
                      
                      return (
                        <List.Item
                          key={transaction._id}
                          actions={[
                            <Tooltip title={<FormattedMessage id="common.view" defaultMessage="查看" />}>
                              <Button 
                                type="text" 
                                icon={<SearchOutlined />} 
                                onClick={() => onViewTransaction && onViewTransaction(transaction)}
                              />
                            </Tooltip>,
                            <Tooltip title={<FormattedMessage id="common.edit" defaultMessage="编辑" />}>
                              <Button 
                                type="text" 
                                icon={<EditOutlined />} 
                                onClick={() => onEditTransaction && onEditTransaction(transaction)}
                              />
                            </Tooltip>,
                            <Tooltip title={<FormattedMessage id="common.delete" defaultMessage="删除" />}>
                              <Button 
                                type="text" 
                                danger
                                icon={<DeleteOutlined />} 
                                onClick={() => onDeleteTransaction && onDeleteTransaction(transaction)}
                              />
                            </Tooltip>
                          ]}
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
                              {formatAmount(transaction.amount, getAccountCurrency(transaction.accountId))}
                            </Title>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                </div>
              ))
            ) : (
              <Empty description={<FormattedMessage id="transaction.noTransactions" defaultMessage="暂无交易记录" />} />
            )}
          </>
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

// 使用React.memo优化组件，避免不必要的重新渲染
export default React.memo(TransactionList); 