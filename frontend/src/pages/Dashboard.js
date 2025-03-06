import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Calendar, Badge, Button, Statistic, Card, Select, Empty, Typography, Modal, Avatar, Tooltip, Divider, Radio, Space, DatePicker } from 'antd';
import { PlusOutlined, BookOutlined, ArrowUpOutlined, ArrowDownOutlined, BarChartOutlined, CalendarOutlined, WalletOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchTransactions } from '../store/transactionSlice';
import { fetchBooks } from '../store/bookSlice';
import { fetchAccounts } from '../store/accountSlice';
import BookForm from '../components/BookForm';
import './Dashboard.css';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { books, currentBook } = useSelector((state) => state.books);
  const { transactions, loading } = useSelector((state) => state.transactions);
  const { accounts } = useSelector((state) => state.accounts);
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();
  
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [isCreateBookModalVisible, setIsCreateBookModalVisible] = useState(false);
  const [calendarMode, setCalendarMode] = useState('month');

  useEffect(() => {
    if (user) {
      dispatch(fetchBooks());
    }
  }, [dispatch, user]);

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
      
      dispatch(fetchTransactions({ 
        bookId: currentBook._id, 
        startDate, 
        endDate 
      }));
      
      dispatch(fetchAccounts(currentBook._id));
    } else {
      console.log('未选择账本，不加载数据');
    }
  }, [dispatch, currentBook, selectedDate]);

  // 从URL参数中获取日期
  useEffect(() => {
    // 如果没有选择账本，则不处理日期参数
    if (!currentBook) {
      console.log('未选择账本，不处理日期参数');
      return;
    }
    
    try {
      const params = new URLSearchParams(location.search);
      const dateParam = params.get('date');
      
      console.log('解析URL日期参数:', { 
        dateParam,
        pathname: location.pathname,
        search: location.search,
        hasCurrentBook: !!currentBook
      });
      
      if (dateParam) {
        // 解析YYYY-MM格式
        if (dateParam.length === 7 && dateParam.includes('-')) {
          const [yearStr, monthStr] = dateParam.split('-');
          const year = parseInt(yearStr, 10);
          const month = parseInt(monthStr, 10) - 1; // 月份从0开始
          
          // 创建新的日期对象
          const newDate = dayjs().year(year).month(month).date(1);
          
          console.log('解析YYYY-MM格式:', { 
            原始参数: dateParam, 
            年: year,
            月: month + 1,
            新日期: newDate.format('YYYY-MM-DD')
          });
          
          // 验证日期是否有效
          if (newDate.isValid()) {
            setSelectedDate(newDate);
          } else {
            console.error('解析出的日期无效:', dateParam);
            resetToCurrentMonth();
          }
        } else {
          console.error('日期参数格式不正确:', dateParam);
          resetToCurrentMonth();
        }
      } else {
        // 如果没有日期参数，默认使用当月第一天
        console.log('没有日期参数，使用当前月份');
        resetToCurrentMonth();
      }
    } catch (error) {
      console.error('处理日期参数出错:', error);
      resetToCurrentMonth();
    }
  }, [location.search, navigate, currentBook]);
  
  // 重置为当前月份
  const resetToCurrentMonth = () => {
    const today = dayjs().date(1); // 当月第一天
    console.log('重置为当前月份:', today.format('YYYY-MM-DD'));
    setSelectedDate(today);
    
    // 更新URL，但不触发导航
    const newUrl = `/dashboard?date=${today.format('YYYY-MM')}`;
    window.history.replaceState(null, '', newUrl);
  };

  // 处理创建账本成功
  const handleCreateBookSuccess = () => {
    setIsCreateBookModalVisible(false);
    dispatch(fetchBooks());
  };

  // 欢迎页面
  const renderWelcomePage = () => {
    return (
      <div className="welcome-container">
        <Title level={2} className="welcome-title">
          <FormattedMessage id="app.welcome.title" defaultMessage="欢迎使用记账软件" />
        </Title>
        <Paragraph className="welcome-description">
          <FormattedMessage id="app.welcome.description" defaultMessage="这是一个帮助您管理个人或家庭财务的工具，让记账变得简单高效。" />
        </Paragraph>
        
        {books && books.length > 0 ? (
          <div>
            <Title level={4} className="welcome-subtitle">
              <FormattedMessage id="app.welcome.select" defaultMessage="请选择一个账本开始使用" />
            </Title>
            <Row justify="center" gutter={[24, 24]} style={{ maxWidth: '900px', margin: '0 auto' }}>
              {books.map(book => (
                <Col xs={24} sm={12} md={8} key={book._id}>
                  <Card
                    hoverable
                    className="book-card"
                    onClick={() => dispatch({ type: 'books/setCurrentBook', payload: book })}
                  >
                    <BookOutlined className="book-card-icon" />
                    <Title level={4}>{book.name}</Title>
                    <Paragraph ellipsis={{ rows: 2 }}>{book.description || '无描述'}</Paragraph>
                    <Text type="secondary">{book.defaultCurrency}</Text>
                  </Card>
                </Col>
              ))}
              <Col xs={24} sm={12} md={8}>
                <div 
                  className="create-book-card"
                  onClick={() => setIsCreateBookModalVisible(true)}
                >
                  <PlusOutlined className="book-card-icon" />
                  <div><FormattedMessage id="book.create" defaultMessage="创建新账本" /></div>
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <Empty
            description={<FormattedMessage id="book.noBooks" defaultMessage="您还没有创建账本" />}
            style={{ marginTop: 50 }}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsCreateBookModalVisible(true)}
              size="large"
            >
              <FormattedMessage id="book.create.button" defaultMessage="创建账本" />
            </Button>
          </Empty>
        )}
      </div>
    );
  };

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
      
      // 如果有交易记录，跳转到交易记录页面
      const dateStr = date.format('YYYY-MM-DD');
      const hasTransactions = transactions.some(
        (t) => dayjs(t.date).format('YYYY-MM-DD') === dateStr
      );
      
      if (hasTransactions) {
        navigate(`/transactions?date=${dateStr}`);
      }
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

  // 收支趋势图表配置
  const getChartOption = () => {
    if (!transactions || transactions.length === 0) return {};

    // 获取当月的每一天
    const daysInMonth = selectedDate.daysInMonth();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // 按日期分组计算收入和支出
    const incomeData = Array(daysInMonth).fill(0);
    const expenseData = Array(daysInMonth).fill(0);
    
    transactions.forEach((t) => {
      const transactionDate = dayjs(t.date);
      if (
        transactionDate.month() === selectedDate.month() &&
        transactionDate.year() === selectedDate.year()
      ) {
        const day = transactionDate.date() - 1;
        if (t.type === 'income') {
          incomeData[day] += t.amount;
        } else if (t.type === 'expense') {
          expenseData[day] += t.amount;
        }
      }
    });

    return {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          let result = `${selectedDate.format('YYYY-MM')}-${params[0].axisValue}`;
          params.forEach(param => {
            const color = param.seriesName === '收入' ? '#52c41a' : '#f5222d';
            result += `<br/><span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>${param.seriesName}: ${param.value.toFixed(2)}`;
          });
          return result;
        }
      },
      legend: {
        data: ['收入', '支出'],
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: days,
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#666',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: incomeData,
          color: '#52c41a',
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(82, 196, 26, 0.2)'
              }, {
                offset: 1, color: 'rgba(82, 196, 26, 0.01)'
              }]
            }
          }
        },
        {
          name: '支出',
          type: 'line',
          data: expenseData,
          color: '#f5222d',
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(245, 34, 45, 0.2)'
              }, {
                offset: 1, color: 'rgba(245, 34, 45, 0.01)'
              }]
            }
          }
        }
      ]
    };
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

  // 添加调试代码，检查国际化是否正常工作
  useEffect(() => {
    console.log('当前语言环境:', intl.locale);
    console.log('上个月翻译:', intl.formatMessage({ id: 'transaction.previousMonth', defaultMessage: '上个月' }));
    console.log('下个月翻译:', intl.formatMessage({ id: 'transaction.nextMonth', defaultMessage: '下个月' }));
  }, [intl]);

  return (
    <div className="dashboard-container">
      {!currentBook ? (
        renderWelcomePage()
      ) : (
        <>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={16} lg={17} xl={17}>
              <div className="calendar-container">
                <Calendar
                  value={selectedDate}
                  onSelect={onSelect}
                  onPanelChange={onPanelChange}
                  cellRender={cellRender}
                  fullscreen={true}
                  mode={calendarMode}
                  headerRender={({ value, type, onChange, onTypeChange }) => {
                    const current = value.clone();
                    const year = value.year();
                    const month = value.month();
                    
                    return (
                      <div className="calendar-header">
                        <div className="calendar-header-left">
                          <Space>
                            <Button 
                              type="text" 
                              icon={<LeftOutlined />} 
                              onClick={goToPreviousMonth}
                              title={intl.formatMessage({ id: 'transaction.previousMonth', defaultMessage: '上个月' })}
                            />
                            <DatePicker 
                              value={selectedDate} 
                              onChange={handleMonthChange}
                              allowClear={false}
                              picker="month"
                              format="YYYY-MM"
                            />
                            <Button 
                              type="text" 
                              icon={<RightOutlined />} 
                              onClick={goToNextMonth}
                              title={intl.formatMessage({ id: 'transaction.nextMonth', defaultMessage: '下个月' })}
                            />
                          </Space>
                        </div>
                        <div className="calendar-header-right">
                          <Radio.Group 
                            value={calendarMode} 
                            onChange={(e) => {
                              setCalendarMode(e.target.value);
                              onTypeChange(e.target.value);
                            }}
                            buttonStyle="solid"
                            size="small"
                          >
                            <Radio.Button value="month">
                              <FormattedMessage id="dashboard.month" defaultMessage="Month" />
                            </Radio.Button>
                            <Radio.Button value="year">
                              <FormattedMessage id="dashboard.year" defaultMessage="Year" />
                            </Radio.Button>
                          </Radio.Group>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            </Col>
            <Col xs={24} sm={24} md={8} lg={7} xl={7}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
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
                <Row gutter={24}>
                  <Col span={8}>
                    <Statistic
                      title={<FormattedMessage id="dashboard.income" defaultMessage="Income" />}
                      value={stats.income}
                      precision={2}
                      valueStyle={{ color: '#52c41a' }}
                      prefix={<ArrowUpOutlined />}
                      suffix={currencySymbol}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<FormattedMessage id="dashboard.expense" defaultMessage="Expense" />}
                      value={stats.expense}
                      precision={2}
                      valueStyle={{ color: '#f5222d' }}
                      prefix={<ArrowDownOutlined />}
                      suffix={currencySymbol}
                    />
                  </Col>
                  <Col span={8}>
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
                        <div key={account._id} className="account-item" onClick={() => navigate('/accounts')}>
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
                                ≈ {defaultCurrency?.symbol || ''} {(currentBalance / (currency.exchangeRate || 1)).toFixed(2)}
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

          <div className="chart-container">
            <h3 className="chart-title">
              <BarChartOutlined style={{ marginRight: 8 }} />
              <FormattedMessage 
                id="dashboard.monthlyTrend" 
                defaultMessage="Monthly Income/Expense Trend" 
              />
              {` (${selectedDate.format('YYYY-MM')})`}
            </h3>
            <ReactECharts option={getChartOption()} style={{ height: 300 }} />
          </div>
        </>
      )}

      {/* 创建账本模态框 */}
      <Modal
        title="创建新账本"
        open={isCreateBookModalVisible}
        onCancel={() => setIsCreateBookModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <BookForm 
          onSuccess={handleCreateBookSuccess}
          onCancel={() => setIsCreateBookModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard; 