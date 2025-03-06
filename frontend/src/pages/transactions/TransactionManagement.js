import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Card, Button, Modal, message, Empty, 
  Typography, Space, Tabs, Statistic, Row, Col, Tag, DatePicker 
} from 'antd';
import { 
  PlusOutlined, BarChartOutlined, 
  UnorderedListOutlined, LeftOutlined, RightOutlined, CalendarOutlined
} from '@ant-design/icons';
import { fetchTransactions, deleteTransaction, fetchBookStats } from '../../store/transactionSlice';
import { fetchAccounts } from '../../store/accountSlice';
import { fetchCategories } from '../../store/categorySlice';
import { fetchPersons } from '../../store/personSlice';
import { fetchTags } from '../../store/tagSlice';
import TransactionList from '../../components/TransactionList';
import TransactionForm from '../../components/TransactionForm';
import dayjs from 'dayjs';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TransactionManagement = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();
  const { transactions, loading, error, stats } = useSelector((state) => state.transactions);
  const { currentBook } = useSelector((state) => state.books);
  const { accounts } = useSelector((state) => state.accounts);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [modalTitle, setModalTitle] = useState(intl.formatMessage({ id: 'transaction.addTransaction', defaultMessage: '添加交易' }));
  const [activeTab, setActiveTab] = useState('list');
  const [filterDate, setFilterDate] = useState(dayjs());

  // 从URL参数中获取日期
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateParam = params.get('date');
    if (dateParam) {
      setFilterDate(dayjs(dateParam));
    } else {
      // 如果没有日期参数，默认使用今天的日期并更新URL
      const today = dayjs();
      setFilterDate(today);
      navigate(`/transactions?date=${today.format('YYYY-MM-DD')}`, { replace: true });
    }
  }, [location.search, navigate]);

  // 处理日期变更
  const handleDateChange = (date) => {
    if (date) {
      setFilterDate(date);
      navigate(`/transactions?date=${date.format('YYYY-MM-DD')}`);
    }
  };

  // 前进一天
  const goToNextDay = () => {
    const nextDay = filterDate.add(1, 'day');
    handleDateChange(nextDay);
  };

  // 后退一天
  const goToPreviousDay = () => {
    const previousDay = filterDate.subtract(1, 'day');
    handleDateChange(previousDay);
  };

  useEffect(() => {
    if (currentBook) {
      // 构建查询参数
      const queryParams = { bookId: currentBook._id };
      
      // 如果有日期过滤，添加日期条件
      if (filterDate) {
        queryParams.startDate = filterDate.format('YYYY-MM-DD');
        queryParams.endDate = filterDate.format('YYYY-MM-DD');
      }
      
      // 加载交易记录
      dispatch(fetchTransactions(queryParams));
      
      // 加载账户
      dispatch(fetchAccounts(currentBook._id));
      
      // 加载类别
      dispatch(fetchCategories(currentBook._id));
      
      // 加载人员
      dispatch(fetchPersons(currentBook._id));
      
      // 加载标签
      dispatch(fetchTags(currentBook._id));
      
      // 加载统计数据
      dispatch(fetchBookStats({ bookId: currentBook._id }));
    }
  }, [dispatch, currentBook, filterDate]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // 打开创建交易记录模态框
  const showAddModal = () => {
    setCurrentTransaction(null);
    setModalTitle(intl.formatMessage({ id: 'transaction.addTransaction', defaultMessage: '添加交易' }));
    setIsModalVisible(true);
  };

  // 打开编辑交易记录模态框
  const showEditModal = (transaction) => {
    setCurrentTransaction(transaction);
    setModalTitle(intl.formatMessage({ id: 'transaction.editTransaction', defaultMessage: '编辑交易' }));
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 处理表单提交成功
  const handleSuccess = () => {
    setIsModalVisible(false);
    dispatch(fetchTransactions({ bookId: currentBook._id }));
    dispatch(fetchBookStats({ bookId: currentBook._id }));
    dispatch(fetchAccounts(currentBook._id)); // 刷新账户余额
  };

  // 处理删除交易记录
  const handleDelete = (transaction) => {
    dispatch(deleteTransaction(transaction._id))
      .unwrap()
      .then(() => {
        message.success(intl.formatMessage({ id: 'transaction.deleteSuccess', defaultMessage: '交易记录删除成功' }));
        dispatch(fetchTransactions({ bookId: currentBook._id }));
        dispatch(fetchBookStats({ bookId: currentBook._id }));
        dispatch(fetchAccounts(currentBook._id)); // 刷新账户余额
      })
      .catch((err) => {
        message.error(intl.formatMessage({ id: 'transaction.deleteError', defaultMessage: '删除失败' }) + `: ${err}`);
      });
  };

  // 处理查看交易记录详情
  const handleViewTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setModalTitle(intl.formatMessage({ id: 'transaction.viewTransaction', defaultMessage: '交易记录详情' }));
    setIsModalVisible(true);
  };

  // 获取本位币信息
  const getDefaultCurrency = () => {
    if (!currentBook || !currentBook.currencies) return null;
    
    return currentBook.currencies.find(c => c.code === currentBook.defaultCurrency);
  };

  const defaultCurrency = getDefaultCurrency();

  if (!currentBook) {
    return (
      <Card>
        <Empty description={intl.formatMessage({ id: 'transaction.selectBook', defaultMessage: '请先选择或创建一个账本' })} />
      </Card>
    );
  }

  return (
    <div className="transaction-management">
      <Card
        title={
          <Space>
            <span><FormattedMessage id="transaction.title" defaultMessage="交易记录" /></span>
            <Space>
              <Button 
                icon={<LeftOutlined />} 
                onClick={goToPreviousDay}
                size="small"
                title={intl.formatMessage({ id: 'transaction.previousDay', defaultMessage: '前一天' })}
              />
              <DatePicker 
                value={filterDate} 
                onChange={handleDateChange}
                allowClear={false}
                format="YYYY-MM-DD"
                suffixIcon={<CalendarOutlined />}
              />
              <Button 
                icon={<RightOutlined />} 
                onClick={goToNextDay}
                size="small"
                title={intl.formatMessage({ id: 'transaction.nextDay', defaultMessage: '后一天' })}
              />
            </Space>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            <FormattedMessage id="transaction.addTransaction" defaultMessage="添加交易" />
          </Button>
        }
      >
        <Tabs defaultActiveKey="list">
          <TabPane 
            tab={
              <span>
                <UnorderedListOutlined />
                <FormattedMessage id="transaction.listView" defaultMessage="列表视图" />
              </span>
            } 
            key="list"
          >
            <TransactionList 
              onEditTransaction={showEditModal}
              onDeleteTransaction={(transaction) => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'transaction.confirmDelete', defaultMessage: '确认删除' }),
                  content: intl.formatMessage({ id: 'transaction.confirmDeleteMessage', defaultMessage: '确定要删除这条交易记录吗？此操作不可恢复。' }),
                  okText: intl.formatMessage({ id: 'common.yes', defaultMessage: '确认' }),
                  cancelText: intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' }),
                  onOk: () => handleDelete(transaction)
                });
              }}
              onViewTransaction={handleViewTransaction}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                <FormattedMessage id="transaction.statsView" defaultMessage="统计视图" />
              </span>
            } 
            key="stats"
          >
            <div style={{ padding: '20px 0' }}>
              <Text>{intl.formatMessage({ id: 'transaction.statsViewMessage', defaultMessage: '统计视图功能正在开发中...' })}</Text>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={modalTitle}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={700}
      >
        <TransactionForm 
          transaction={currentTransaction} 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  );
};

export default TransactionManagement; 