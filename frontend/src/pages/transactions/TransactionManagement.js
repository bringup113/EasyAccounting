import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Card, Button, Modal, message, Empty, 
  Typography, Space, Row, Col, DatePicker, Calendar
} from 'antd';
import { 
  PlusOutlined, LeftOutlined, RightOutlined
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
import './TransactionManagement.css';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const TransactionManagement = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();
  const { error } = useSelector((state) => state.transactions);
  const { currentBook } = useSelector((state) => state.books);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [modalTitle, setModalTitle] = useState(intl.formatMessage({ id: 'transaction.addTransaction', defaultMessage: '添加交易' }));
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [dateSelectionStep, setDateSelectionStep] = useState(0); // 0: 未选择, 1: 已选择开始日期, 2: 已选择结束日期
  const [isDataLoaded, setIsDataLoaded] = useState(false); // 添加标志变量，防止重复加载

  // 从URL参数中获取日期
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateParam = params.get('date');
    const startDateParam = params.get('startDate');
    const endDateParam = params.get('endDate');
    
    if (startDateParam && endDateParam) {
      // 如果有开始和结束日期参数
      const newStartDate = dayjs(startDateParam).startOf('day');
      const newEndDate = dayjs(endDateParam).endOf('day');
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setDateSelectionStep(2);
    } else if (dateParam) {
      // 如果只有单个日期参数（从概览页面跳转过来）
      const date = dayjs(dateParam);
      const newStartDate = date.startOf('day');
      const newEndDate = date.endOf('day');
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setDateSelectionStep(2);
    } else {
      // 如果没有日期参数，默认使用今天的日期
      const today = dayjs();
      const newStartDate = today.startOf('day');
      const newEndDate = today.endOf('day');
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setDateSelectionStep(2);
      navigate(`/transactions?startDate=${today.format('YYYY-MM-DD')}&endDate=${today.format('YYYY-MM-DD')}`, { replace: true });
    }
  }, [location.search, navigate]);

  // 处理日期变更
  const handleDateChange = (date) => {
    if (!date) return;
    
    // 确保日期是dayjs对象
    const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date);
    
    // 重置数据加载标志
    setIsDataLoaded(false);
    
    if (dateSelectionStep === 0 || dateSelectionStep === 2) {
      // 如果是第一次选择或已完成选择，则重新开始选择
      const newStartDate = dayjsDate.startOf('day');
      setStartDate(newStartDate);
      setEndDate(null);
      setDateSelectionStep(1);
      message.info('请选择结束日期');
    } else if (dateSelectionStep === 1) {
      // 如果已选择开始日期，现在选择结束日期
      let newStartDate, newEndDate;
      
      if (dayjsDate.isBefore(startDate)) {
        // 如果结束日期在开始日期之前，交换它们
        newEndDate = startDate.endOf('day');
        newStartDate = dayjsDate.startOf('day');
      } else {
        newStartDate = startDate;
        newEndDate = dayjsDate.endOf('day');
      }
      
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setDateSelectionStep(2);
      
      // 更新URL并加载数据
      const formattedStartDate = newStartDate.format('YYYY-MM-DD');
      const formattedEndDate = newEndDate.format('YYYY-MM-DD');
      
      navigate(`/transactions?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
    }
  };

  // 处理日期范围变更
  const handleRangeChange = (dates) => {
    if (!dates || dates.length !== 2) return;
    
    const [start, end] = dates;
    const newStartDate = start.startOf('day');
    const newEndDate = end.endOf('day');
    
    // 重置数据加载标志
    setIsDataLoaded(false);
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setDateSelectionStep(2);
    
    // 更新URL
    navigate(`/transactions?startDate=${start.format('YYYY-MM-DD')}&endDate=${end.format('YYYY-MM-DD')}`);
  };

  // 重置日期范围为今天
  const resetToToday = () => {
    const today = dayjs();
    
    // 重置数据加载标志
    setIsDataLoaded(false);
    
    setStartDate(today.startOf('day'));
    setEndDate(today.endOf('day'));
    setDateSelectionStep(2);
    navigate(`/transactions?startDate=${today.format('YYYY-MM-DD')}&endDate=${today.format('YYYY-MM-DD')}`);
  };

  // 前进一天
  const goToNextDay = () => {
    // 重置数据加载标志
    setIsDataLoaded(false);
    
    if (startDate && endDate && startDate.format('YYYY-MM-DD') === endDate.format('YYYY-MM-DD')) {
      // 如果是单日查询，前进一天
      const nextDay = endDate.add(1, 'day');
      setStartDate(nextDay.startOf('day'));
      setEndDate(nextDay.endOf('day'));
      navigate(`/transactions?startDate=${nextDay.format('YYYY-MM-DD')}&endDate=${nextDay.format('YYYY-MM-DD')}`);
    } else if (startDate && endDate) {
      // 如果是日期范围，将范围向后移动一天
      const newStartDate = startDate.add(1, 'day');
      const newEndDate = endDate.add(1, 'day');
      setStartDate(newStartDate.startOf('day'));
      setEndDate(newEndDate.endOf('day'));
      navigate(`/transactions?startDate=${newStartDate.format('YYYY-MM-DD')}&endDate=${newEndDate.format('YYYY-MM-DD')}`);
    }
  };

  // 后退一天
  const goToPreviousDay = () => {
    // 重置数据加载标志
    setIsDataLoaded(false);
    
    if (startDate && endDate && startDate.format('YYYY-MM-DD') === endDate.format('YYYY-MM-DD')) {
      // 如果是单日查询，后退一天
      const previousDay = startDate.subtract(1, 'day');
      setStartDate(previousDay.startOf('day'));
      setEndDate(previousDay.endOf('day'));
      navigate(`/transactions?startDate=${previousDay.format('YYYY-MM-DD')}&endDate=${previousDay.format('YYYY-MM-DD')}`);
    } else if (startDate && endDate) {
      // 如果是日期范围，将范围向前移动一天
      const newStartDate = startDate.subtract(1, 'day');
      const newEndDate = endDate.subtract(1, 'day');
      setStartDate(newStartDate.startOf('day'));
      setEndDate(newEndDate.endOf('day'));
      navigate(`/transactions?startDate=${newStartDate.format('YYYY-MM-DD')}&endDate=${newEndDate.format('YYYY-MM-DD')}`);
    }
  };

  useEffect(() => {
    if (currentBook && startDate && endDate && dateSelectionStep === 2 && !isDataLoaded) {
      // 设置标志，防止重复加载
      setIsDataLoaded(true);
      
      // 构建查询参数
      const queryParams = { bookId: currentBook._id };
      
      // 添加日期范围条件，使用YYYY-MM-DD HH:mm:ss格式
      queryParams.startDate = startDate.format('YYYY-MM-DD HH:mm:ss');
      queryParams.endDate = endDate.format('YYYY-MM-DD HH:mm:ss');
      
      // 输出日期信息到控制台
      console.log('传递到交易记录卡片的日期范围：', {
        startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
        endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
      });
      
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
      dispatch(fetchBookStats({ 
        bookId: currentBook._id,
        startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
        endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
      }));
    } else if (!currentBook) {
      // 未选择账本，不加载交易数据
    } else if (!startDate || !endDate || dateSelectionStep !== 2) {
      // 日期范围未完成选择，不加载交易数据
    } else if (isDataLoaded) {
      // 数据已加载，跳过重复加载
    }
  }, [dispatch, currentBook, startDate, endDate, dateSelectionStep, isDataLoaded]);

  // 当日期变化时，重置数据加载标志
  useEffect(() => {
    if (startDate || endDate) {
      setIsDataLoaded(false);
    }
  }, [startDate, endDate]);

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
    
    // 重置数据加载标志，以便重新加载数据
    setIsDataLoaded(false);
    
    // 构建查询参数
    const queryParams = { bookId: currentBook._id };
    
    // 添加日期范围条件
    if (startDate && endDate) {
      queryParams.startDate = startDate.format('YYYY-MM-DD HH:mm:ss');
      queryParams.endDate = endDate.format('YYYY-MM-DD HH:mm:ss');
    }
    
    // 使用当前日期范围重新加载交易记录
    dispatch(fetchTransactions(queryParams));
    
    // 使用当前日期范围重新加载统计数据
    dispatch(fetchBookStats({ 
      bookId: currentBook._id,
      startDate: startDate ? startDate.format('YYYY-MM-DD HH:mm:ss') : undefined,
      endDate: endDate ? endDate.format('YYYY-MM-DD HH:mm:ss') : undefined
    }));
    
    // 刷新账户余额
    dispatch(fetchAccounts(currentBook._id));
  };

  // 处理删除交易记录
  const handleDelete = (transaction) => {
    dispatch(deleteTransaction(transaction._id))
      .unwrap()
      .then(() => {
        message.success(intl.formatMessage({ id: 'transaction.deleteSuccess', defaultMessage: '交易记录删除成功' }));
        
        // 重置数据加载标志，以便重新加载数据
        setIsDataLoaded(false);
        
        // 构建查询参数
        const queryParams = { bookId: currentBook._id };
        
        // 添加日期范围条件
        if (startDate && endDate) {
          queryParams.startDate = startDate.format('YYYY-MM-DD HH:mm:ss');
          queryParams.endDate = endDate.format('YYYY-MM-DD HH:mm:ss');
        }
        
        // 使用当前日期范围重新加载交易记录
        dispatch(fetchTransactions(queryParams));
        
        // 使用当前日期范围重新加载统计数据
        dispatch(fetchBookStats({ 
          bookId: currentBook._id,
          startDate: startDate ? startDate.format('YYYY-MM-DD HH:mm:ss') : undefined,
          endDate: endDate ? endDate.format('YYYY-MM-DD HH:mm:ss') : undefined
        }));
        
        // 刷新账户余额
        dispatch(fetchAccounts(currentBook._id));
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

  if (!currentBook) {
    return (
      <Card>
        <Empty description={intl.formatMessage({ id: 'transaction.selectBook', defaultMessage: '请先选择或创建一个账本' })} />
      </Card>
    );
  }

  // 日历单元格渲染
  const dateCellRender = (date) => {
    // 确保日期是dayjs对象
    const cellDate = dayjs.isDayjs(date) ? date : dayjs(date);
    
    const isInRange = startDate && endDate && (
      cellDate.isSame(startDate, 'day') || 
      cellDate.isSame(endDate, 'day') || 
      (cellDate.isAfter(startDate, 'day') && cellDate.isBefore(endDate, 'day'))
    );
    
    const isStartDate = startDate && cellDate.isSame(startDate, 'day');
    const isEndDate = endDate && cellDate.isSame(endDate, 'day');
    const isToday = cellDate.isSame(dayjs(), 'day');
    
    let className = 'date-cell';
    if (isStartDate) className += ' start-date';
    if (isEndDate) className += ' end-date';
    if (isInRange && !isStartDate && !isEndDate) className += ' in-range';
    if (isToday) className += ' today';
    
    return (
      <div className={className}>
        {cellDate.date()}
      </div>
    );
  };

  return (
    <div className="transaction-management">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={16} lg={18} xl={18}>
          <Card
            title={
              <Space>
                <span><FormattedMessage id="transaction.title" defaultMessage="交易记录" /></span>
                <Space>
                  <Button 
                    icon={<LeftOutlined />} 
                    onClick={goToPreviousDay}
                    size="small"
                    title={intl.formatMessage({ id: 'transaction.previous', defaultMessage: '前一天/前一个范围' })}
                  />
                  <RangePicker 
                    value={[startDate, endDate]} 
                    onChange={handleRangeChange}
                    allowClear={false}
                    format="YYYY-MM-DD"
                  />
                  <Button 
                    icon={<RightOutlined />} 
                    onClick={goToNextDay}
                    size="small"
                    title={intl.formatMessage({ id: 'transaction.next', defaultMessage: '后一天/后一个范围' })}
                  />
                  <Button 
                    onClick={resetToToday}
                    size="small"
                    title={intl.formatMessage({ id: 'transaction.today', defaultMessage: '今天' })}
                  >
                    <FormattedMessage id="transaction.today" defaultMessage="今天" />
                  </Button>
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
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={6} xl={6}>
          <Card 
            title={
              <div>
                <FormattedMessage id="transaction.calendar" defaultMessage="日历" />
                {dateSelectionStep === 1 && (
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                    <FormattedMessage id="transaction.selectEndDate" defaultMessage="请选择结束日期" />
                  </Text>
                )}
              </div>
            }
            className="calendar-card"
            bodyStyle={{ padding: '12px' }}
          >
            <div className="date-range-info">
              {startDate && (
                <div>
                  <Text strong><FormattedMessage id="transaction.startDate" defaultMessage="开始日期" />: </Text>
                  <Text>{startDate.format('YYYY-MM-DD HH:mm:ss')}</Text>
                </div>
              )}
              {endDate && (
                <div>
                  <Text strong><FormattedMessage id="transaction.endDate" defaultMessage="结束日期" />: </Text>
                  <Text>{endDate.format('YYYY-MM-DD HH:mm:ss')}</Text>
                </div>
              )}
            </div>
            <Calendar 
              fullscreen={false} 
              value={dateSelectionStep === 1 ? startDate : endDate}
              onChange={(date) => handleDateChange(date)}
              headerRender={() => null}
              dateFullCellRender={dateCellRender}
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button size="small" onClick={resetToToday}>
                <FormattedMessage id="transaction.backToToday" defaultMessage="回到今天" />
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

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