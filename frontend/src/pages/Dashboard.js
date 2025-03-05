import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Calendar, Badge, Button, Statistic, Card, Select, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { fetchTransactions } from '../store/transactionSlice';
import { fetchBooks } from '../store/bookSlice';
import { fetchAccounts } from '../store/accountSlice';

const { Option } = Select;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { books, currentBook } = useSelector((state) => state.books);
  const { transactions, loading } = useSelector((state) => state.transactions);
  const { accounts } = useSelector((state) => state.accounts);
  
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  useEffect(() => {
    if (user) {
      dispatch(fetchBooks());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (currentBook) {
      dispatch(fetchTransactions({ bookId: currentBook._id }));
      dispatch(fetchAccounts({ bookId: currentBook._id }));
    }
  }, [dispatch, currentBook]);

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
          <div style={{ color: '#52c41a' }}>收入: {income.toFixed(2)}</div>
        )}
        {expense > 0 && (
          <div style={{ color: '#f5222d' }}>支出: {expense.toFixed(2)}</div>
        )}
      </div>
    );
  };

  // 选择日期
  const onSelect = (date) => {
    setSelectedDate(date);
  };

  // 选择月份
  const onPanelChange = (date) => {
    setSelectedMonth(date);
  };

  // 收支趋势图表配置
  const getChartOption = () => {
    if (!transactions || transactions.length === 0) return {};

    // 获取当月的每一天
    const daysInMonth = selectedMonth.daysInMonth();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // 按日期分组计算收入和支出
    const incomeData = Array(daysInMonth).fill(0);
    const expenseData = Array(daysInMonth).fill(0);
    
    transactions.forEach((t) => {
      const transactionDate = dayjs(t.date);
      if (
        transactionDate.month() === selectedMonth.month() &&
        transactionDate.year() === selectedMonth.year()
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
      },
      legend: {
        data: ['收入', '支出'],
      },
      xAxis: {
        type: 'category',
        data: days,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: incomeData,
          color: '#52c41a',
        },
        {
          name: '支出',
          type: 'line',
          data: expenseData,
          color: '#f5222d',
        },
      ],
    };
  };

  // 计算当日收支统计
  const getDailyStats = () => {
    if (!transactions) return { income: 0, expense: 0, balance: 0 };

    const date = selectedDate.format('YYYY-MM-DD');
    const dayTransactions = transactions.filter(
      (t) => dayjs(t.date).format('YYYY-MM-DD') === date
    );

    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  };

  const stats = getDailyStats();

  return (
    <div>
      {!currentBook ? (
        <Empty
          description="您还没有创建账本"
          style={{ marginTop: 100 }}
        >
          <Link to="/books">
            <Button type="primary">创建账本</Button>
          </Link>
        </Empty>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={16} lg={18} xl={18}>
              <div className="calendar-container">
                <div className="calendar-header">
                  <h2>{selectedMonth.format('YYYY年MM月')}</h2>
                  <Select
                    value={currentBook._id}
                    style={{ width: 200 }}
                    onChange={(value) => {
                      const book = books.find((b) => b._id === value);
                      dispatch({ type: 'books/setCurrentBook', payload: book });
                    }}
                  >
                    {books.map((book) => (
                      <Option key={book._id} value={book._id}>
                        {book.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <Calendar
                  value={selectedDate}
                  onSelect={onSelect}
                  onPanelChange={onPanelChange}
                  dateCellRender={dateCellRender}
                  fullscreen={true}
                />
              </div>
            </Col>
            <Col xs={24} sm={24} md={8} lg={6} xl={6}>
              <Card title={`${selectedDate.format('YYYY年MM月DD日')} 统计`} className="stat-card">
                <Statistic
                  title="收入"
                  value={stats.income}
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                  suffix="元"
                  style={{ marginBottom: 16 }}
                />
                <Statistic
                  title="支出"
                  value={stats.expense}
                  precision={2}
                  valueStyle={{ color: '#f5222d' }}
                  suffix="元"
                  style={{ marginBottom: 16 }}
                />
                <Statistic
                  title="结余"
                  value={stats.balance}
                  precision={2}
                  valueStyle={{ color: stats.balance >= 0 ? '#1890ff' : '#f5222d' }}
                  suffix="元"
                />
              </Card>

              <Card title="账户余额" className="stat-card">
                {accounts.map((account) => (
                  <Statistic
                    key={account._id}
                    title={account.name}
                    value={account.initialBalance}
                    precision={2}
                    suffix={account.currency}
                    style={{ marginBottom: 16 }}
                  />
                ))}
              </Card>
            </Col>
          </Row>

          <div className="chart-container" style={{ marginTop: 16 }}>
            <h3 className="chart-title">月度收支趋势</h3>
            <ReactECharts option={getChartOption()} style={{ height: 300 }} />
          </div>

          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            className="float-button"
            onClick={() => {
              // 跳转到记账页面
            }}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard; 