import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Calendar, Button, Statistic, Card, Empty, Radio, Space, DatePicker } from 'antd';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, BarChartOutlined, WalletOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchTransactions } from '../store/transactionSlice';
import { fetchAccounts } from '../store/accountSlice';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { currentBook } = useSelector((state) => state.books);
  const { transactions } = useSelector((state) => state.transactions);
  const { accounts } = useSelector((state) => state.accounts);
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();
  
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendarMode, setCalendarMode] = useState('month');

  // 从URL中获取日期参数
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const parsedDate = dayjs(dateParam);
      if (parsedDate.isValid()) {
        setSelectedDate(parsedDate);
      }
    }
  }, [location.search]);

  // 加载交易数据和账户数据
  useEffect(() => {
    if (currentBook && currentBook._id) {
      // 创建新的dayjs对象，避免引用问题
      const currentDate = dayjs(selectedDate);
      
      // 加载当月的交易数据
      const startDate = currentDate.startOf('month').format('YYYY-MM-DD');
      const endDate = currentDate.endOf('month').format('YYYY-MM-DD');
      
      console.log('加载交易数据:', {
        currentBook: currentBook.name,
        selectedDate: currentDate.format('YYYY-MM-DD'),
        startDate,
        endDate
      });
      
      // 只在Dashboard页面加载交易数据，避免与TransactionManagement页面冲突
      if (location.pathname === '/dashboard') {
        dispatch(fetchTransactions({ 
          bookId: currentBook._id, 
          startDate, 
          endDate 
        }));
      }
      
      dispatch(fetchAccounts(currentBook._id));
    } else {
      console.log('未选择账本，不加载数据');
    }
  }, [dispatch, currentBook, selectedDate, location.pathname]);

  // 监听路由变化，更新选中日期
  useEffect(() => {
    // 如果没有选择账本，重定向到首页
    if (!currentBook) {
      navigate('/home');
      return;
    }
    
    const params = new URLSearchParams(location.search);
    const dateParam = params.get('date');
    
    if (dateParam) {
      setSelectedDate(dayjs(dateParam));
    } else {
      // 如果URL中没有日期参数，则添加当前月份作为参数
      const today = dayjs().format('YYYY-MM');
      navigate(`${location.pathname}?date=${today}`, { replace: true });
    }
  }, [navigate, location.search, location.pathname, currentBook]);

  // 日历单元格渲染
  const dateCellRender = (value) => {
    if (!transactions) return null;

    const date = value.format('YYYY-MM-DD');
    const dayTransactions = transactions.filter(
      (t) => dayjs(t.date).format('YYYY-MM-DD') === date
    );

    if (dayTransactions.length === 0) return null;

    // 计算当日收入和支出总额
    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return (
      <div className="calendar-day-content">
        {income > 0 && (
          <div className="calendar-day-income">
            <ArrowUpOutlined style={{ marginRight: 4 }} /> {income.toFixed(2)}
          </div>
        )}
        {expense > 0 && (
          <div className="calendar-day-expense">
            <ArrowDownOutlined style={{ marginRight: 4 }} /> {expense.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  // 新的cellRender函数，兼容Ant Design 5.x
  const cellRender = (current, info) => {
    if (info.type === 'date') {
      return dateCellRender(current);
    }
    return info.originNode;
  };

  // 修改为根据视图模式显示月度或年度统计
  const getStats = () => {
    if (!transactions || transactions.length === 0) {
      return { income: 0, expense: 0, balance: 0 };
    }

    let filteredTransactions = [];
    
    if (calendarMode === 'month') {
      // 月视图：显示选定月份的统计
      filteredTransactions = transactions.filter(t => {
        const transactionDate = dayjs(t.date);
        return (
          transactionDate.month() === selectedDate.month() &&
          transactionDate.year() === selectedDate.year()
        );
      });
    } else {
      // 年视图：显示选定年份的统计
      filteredTransactions = transactions.filter(t => {
        const transactionDate = dayjs(t.date);
        return transactionDate.year() === selectedDate.year();
      });
    }

    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  };

  const stats = getStats();

  // 获取当前账本的默认货币符号
  const getCurrencySymbol = () => {
    if (!currentBook || !currentBook.currencies) return '¥';
    const defaultCurrency = currentBook.currencies.find(c => c.code === currentBook.defaultCurrency);
    return defaultCurrency?.symbol || '¥';
  };

  const currencySymbol = getCurrencySymbol();

  // 修改onSelect函数，处理年视图点击月份的情况
  const onSelect = (date, { source }) => {
    const newDate = dayjs(date).startOf('month');
    setSelectedDate(newDate);
    
    // 如果是从月视图中选择日期
    if (source === 'date' && calendarMode === 'month') {
      // 更新URL
      navigate(`/dashboard?date=${newDate.format('YYYY-MM')}`);
      
      // 无论是否有交易记录，都跳转到交易记录页面
      const dateStr = date.format('YYYY-MM-DD');
      console.log('从Dashboard跳转到交易记录页面，日期：', dateStr);
      
      // 使用单个日期参数跳转，确保交易记录页面只显示该日的交易
      navigate(`/transactions?date=${dateStr}`);
    } 
    // 如果是从年视图点击月份，切换到月视图
    else if (source === 'month' && calendarMode === 'year') {
      setCalendarMode('month');
      navigate(`/dashboard?date=${newDate.format('YYYY-MM')}`);
    }
  };

  // 处理面板变化（月份/年份切换）
  const onPanelChange = (date, mode) => {
    console.log('Panel changed:', date.format('YYYY-MM-DD'), mode);
    const newDate = dayjs(date).startOf('month');
    setSelectedDate(newDate);
    setCalendarMode(mode);
    
    // 更新URL
    navigate(`/dashboard?date=${newDate.format('YYYY-MM')}`);
  };

  // 前进一个月
  const goToNextMonth = () => {
    try {
      // 获取当前年月
      const currentYear = selectedDate.year();
      const currentMonth = selectedDate.month();
      
      // 计算下一个月
      let nextYear = currentYear;
      let nextMonth = currentMonth + 1;
      
      // 处理年份进位
      if (nextMonth > 11) {
        nextYear += 1;
        nextMonth = 0;
      }
      
      // 创建新的日期对象
      const nextDate = dayjs().year(nextYear).month(nextMonth).date(1);
      
      console.log('前进到下个月:', {
        当前年月: `${currentYear}-${currentMonth + 1}`,
        下个年月: `${nextYear}-${nextMonth + 1}`,
        新日期: nextDate.format('YYYY-MM-DD')
      });
      
      // 更新状态
      setSelectedDate(nextDate);
      
      // 更新URL
      navigate(`/dashboard?date=${nextDate.format('YYYY-MM')}`);
    } catch (error) {
      console.error('前进月份出错:', error);
    }
  };

  // 后退一个月
  const goToPreviousMonth = () => {
    try {
      // 获取当前年月
      const currentYear = selectedDate.year();
      const currentMonth = selectedDate.month();
      
      // 计算上一个月
      let prevYear = currentYear;
      let prevMonth = currentMonth - 1;
      
      // 处理年份借位
      if (prevMonth < 0) {
        prevYear -= 1;
        prevMonth = 11;
      }
      
      // 创建新的日期对象
      const prevDate = dayjs().year(prevYear).month(prevMonth).date(1);
      
      console.log('后退到上个月:', {
        当前年月: `${currentYear}-${currentMonth + 1}`,
        上个年月: `${prevYear}-${prevMonth + 1}`,
        新日期: prevDate.format('YYYY-MM-DD')
      });
      
      // 更新状态
      setSelectedDate(prevDate);
      
      // 更新URL
      navigate(`/dashboard?date=${prevDate.format('YYYY-MM')}`);
    } catch (error) {
      console.error('后退月份出错:', error);
    }
  };

  // 处理月份变更
  const handleMonthChange = (date) => {
    if (date) {
      try {
        // 确保日期有效
        if (!date || !date.isValid()) {
          console.error('选择的月份无效');
          return;
        }
        
        // 获取选择的年月
        const year = date.year();
        const month = date.month();
        
        // 创建新的日期对象，设置为月份第一天
        const newDate = dayjs().year(year).month(month).date(1);
        
        console.log('选择月份:', {
          选择的年月: `${year}-${month + 1}`,
          新日期: newDate.format('YYYY-MM-DD')
        });
        
        // 更新状态
        setSelectedDate(newDate);
        
        // 更新URL
        navigate(`/dashboard?date=${newDate.format('YYYY-MM')}`);
      } catch (error) {
        console.error('处理月份选择出错:', error);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={16} xl={17}>
          <div className="calendar-container">
            <Calendar
              value={selectedDate}
              onSelect={onSelect}
              onPanelChange={onPanelChange}
              cellRender={cellRender}
              fullscreen={true}
              mode={calendarMode}
              headerRender={({ value, type, onChange, onTypeChange }) => {
                return (
                  <div className="calendar-header">
                    <div className="calendar-header-left">
                      {/* 左侧区域保留为空 */}
                    </div>
                    <div className="calendar-header-right">
                      <Space size="middle" align="center" wrap>
                        <Button 
                          type="primary"
                          shape="circle"
                          icon={<LeftOutlined />} 
                          onClick={goToPreviousMonth}
                          title={intl.formatMessage({ id: 'transaction.previousMonth', defaultMessage: '上个月' })}
                          size="small"
                          style={{ background: '#f0f5ff', color: '#1890ff', border: 'none' }}
                        />
                        <DatePicker 
                          value={selectedDate} 
                          onChange={handleMonthChange}
                          allowClear={false}
                          picker="month"
                          format="YYYY年MM月"
                          style={{ 
                            width: '120px', 
                            borderRadius: '6px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                          }}
                          popupStyle={{ 
                            borderRadius: '8px',
                            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Button 
                          type="primary"
                          shape="circle"
                          icon={<RightOutlined />} 
                          onClick={goToNextMonth}
                          title={intl.formatMessage({ id: 'transaction.nextMonth', defaultMessage: '下个月' })}
                          size="small"
                          style={{ background: '#f0f5ff', color: '#1890ff', border: 'none' }}
                        />
                        <Radio.Group 
                          value={calendarMode} 
                          onChange={(e) => {
                            setCalendarMode(e.target.value);
                            onTypeChange(e.target.value);
                          }}
                          buttonStyle="solid"
                          size="small"
                          style={{ marginLeft: '8px' }}
                        >
                          <Radio.Button value="month">
                            <FormattedMessage id="dashboard.month" defaultMessage="Month" />
                          </Radio.Button>
                          <Radio.Button value="year">
                            <FormattedMessage id="dashboard.year" defaultMessage="Year" />
                          </Radio.Button>
                        </Radio.Group>
                      </Space>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={7}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <BarChartOutlined style={{ marginRight: 8 }} />
                {calendarMode === 'year' 
                  ? `${selectedDate.format('YYYY年')}`
                  : `${selectedDate.format('YYYY年MM月')}`}
                <FormattedMessage 
                  id="dashboard.statistics" 
                  defaultMessage="Statistics" 
                />
              </div>
            } 
            className="stat-card"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={8} lg={24} xl={8}>
                <Statistic
                  title={<FormattedMessage id="dashboard.income" defaultMessage="Income" />}
                  value={stats.income}
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<ArrowUpOutlined />}
                  suffix={currencySymbol}
                />
              </Col>
              <Col xs={24} sm={8} md={8} lg={24} xl={8}>
                <Statistic
                  title={<FormattedMessage id="dashboard.expense" defaultMessage="Expense" />}
                  value={stats.expense}
                  precision={2}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<ArrowDownOutlined />}
                  suffix={currencySymbol}
                />
              </Col>
              <Col xs={24} sm={8} md={8} lg={24} xl={8}>
                <Statistic
                  title={<FormattedMessage id="dashboard.balance" defaultMessage="Balance" />}
                  value={stats.balance}
                  precision={2}
                  valueStyle={{ color: stats.balance >= 0 ? '#1890ff' : '#f5222d' }}
                  suffix={currencySymbol}
                />
              </Col>
            </Row>
          </Card>

          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <WalletOutlined style={{ marginRight: 8 }} />
                <FormattedMessage id="account.totalAssets" defaultMessage="Account Balance" />
              </div>
            } 
            className="account-balance-card"
            extra={
              <Button 
                type="link" 
                size="small"
                icon={<PlusOutlined />}
                onClick={() => navigate('/accounts')}
              >
                <FormattedMessage id="account.management" defaultMessage="Manage Accounts" />
              </Button>
            }
          >
            <div className="account-list-wrapper">
              {accounts.length > 0 ? (
                accounts.map((account) => {
                  const currency = currentBook.currencies.find(c => c.code === account.currency);
                  const currentBalance = account.initialBalance + 
                    (account.totalIncome || 0) - (account.totalExpense || 0);
                  
                  // 获取本位币信息
                  const defaultCurrency = currentBook.currencies.find(c => c.code === currentBook.defaultCurrency);
                  
                  return (
                    <div key={account._id} className="account-item">
                      <div className="account-info">
                        <div className="account-icon">
                          <WalletOutlined />
                        </div>
                        <div>
                          <div className="account-name">{account.name}</div>
                          <span className="account-currency">{currency?.code || ''}</span>
                        </div>
                      </div>
                      <div>
                        <div className="account-balance">
                          {currency?.symbol || ''} {currentBalance.toFixed(2)}
                        </div>
                        {currency && defaultCurrency && currency.code !== currentBook.defaultCurrency && (
                          <div className="account-balance-secondary">
                            ≈ {defaultCurrency?.symbol || ''} {(currentBalance / (currency.rate || 1)).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <Empty 
                  description={<FormattedMessage id="account.empty" defaultMessage="No accounts yet" />} 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '24px 0' }}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 