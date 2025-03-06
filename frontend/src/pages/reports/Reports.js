import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, Tabs, DatePicker, Button, Select, 
  Radio, Row, Col, Statistic, Divider, 
  Typography, Empty, Spin, Space 
} from 'antd';
import { 
  BarChartOutlined, PieChartOutlined, 
  LineChartOutlined, DownloadOutlined,
  DollarOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { fetchBookStats, fetchTransactions } from '../../store/transactionSlice';
import { fetchAccounts } from '../../store/accountSlice';
import { fetchCategories } from '../../store/categorySlice';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import ReactECharts from 'echarts-for-react';
import './Reports.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const dispatch = useDispatch();
  const { stats, transactions, loading } = useSelector((state) => state.transactions);
  const { currentBook } = useSelector((state) => state.books);
  const { accounts } = useSelector((state) => state.accounts);
  const { categories } = useSelector((state) => state.categories);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [chartType, setChartType] = useState('bar');
  const [categoryType, setCategoryType] = useState('expense');

  useEffect(() => {
    if (currentBook) {
      // 加载统计数据
      dispatch(fetchBookStats({ 
        bookId: currentBook._id,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      }));
      
      // 加载交易记录
      dispatch(fetchTransactions({ 
        bookId: currentBook._id,
        dateRange: [
          dateRange[0].format('YYYY-MM-DD'),
          dateRange[1].format('YYYY-MM-DD')
        ],
        limit: 1000 // 加载足够多的记录
      }));
      
      // 加载账户
      dispatch(fetchAccounts(currentBook._id));
      
      // 加载类别
      dispatch(fetchCategories(currentBook._id));
    }
  }, [dispatch, currentBook, dateRange]);

  // 获取本位币信息
  const getDefaultCurrency = () => {
    if (!currentBook || !currentBook.currencies) return null;
    
    return currentBook.currencies.find(c => c.code === currentBook.defaultCurrency);
  };

  const defaultCurrency = getDefaultCurrency();

  // 格式化金额显示
  const formatAmount = (amount) => {
    if (!defaultCurrency) return amount.toFixed(2);
    return `${defaultCurrency.symbol} ${amount.toFixed(2)}`;
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  // 处理导出报表
  const handleExport = () => {
    // 实现导出报表功能
    // 暂时先不实现
    console.log('导出报表');
  };

  // 获取按类别分组的交易记录
  const getTransactionsByCategory = () => {
    if (!transactions || !categories) return [];
    
    const result = {};
    
    // 筛选指定类型的交易记录
    const filteredTransactions = transactions.filter(
      transaction => transaction.type === categoryType
    );
    
    // 按类别分组
    filteredTransactions.forEach(transaction => {
      const category = categories.find(c => c._id === transaction.categoryId);
      if (!category) return;
      
      const categoryName = category.name;
      
      if (!result[categoryName]) {
        result[categoryName] = {
          name: categoryName,
          value: 0,
          count: 0
        };
      }
      
      result[categoryName].value += transaction.amount;
      result[categoryName].count += 1;
    });
    
    return Object.values(result).sort((a, b) => b.value - a.value);
  };

  // 获取按账户分组的交易记录
  const getTransactionsByAccount = () => {
    if (!transactions || !accounts) return [];
    
    const result = {};
    
    // 按账户分组
    transactions.forEach(transaction => {
      const account = accounts.find(a => a._id === transaction.accountId);
      if (!account) return;
      
      const accountName = account.name;
      
      if (!result[accountName]) {
        result[accountName] = {
          name: accountName,
          income: 0,
          expense: 0,
          transfer: 0
        };
      }
      
      if (transaction.type === 'income') {
        result[accountName].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        result[accountName].expense += transaction.amount;
      } else if (transaction.type === 'transfer') {
        result[accountName].transfer += transaction.amount;
      }
    });
    
    return Object.values(result);
  };

  // 获取按日期分组的交易记录
  const getTransactionsByDate = () => {
    if (!transactions) return [];
    
    const result = {};
    const days = dateRange[1].diff(dateRange[0], 'day') + 1;
    
    // 初始化日期范围内的所有日期
    for (let i = 0; i < days; i++) {
      const date = dateRange[0].add(i, 'day').format('YYYY-MM-DD');
      result[date] = {
        date,
        income: 0,
        expense: 0,
        transfer: 0
      };
    }
    
    // 按日期分组
    transactions.forEach(transaction => {
      const date = dayjs(transaction.date).format('YYYY-MM-DD');
      if (!result[date]) return;
      
      if (transaction.type === 'income') {
        result[date].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        result[date].expense += transaction.amount;
      } else if (transaction.type === 'transfer') {
        result[date].transfer += transaction.amount;
      }
    });
    
    return Object.values(result).sort((a, b) => a.date.localeCompare(b.date));
  };

  // 生成类别分布图表选项
  const getCategoryChartOption = () => {
    const data = getTransactionsByCategory();
    
    if (chartType === 'pie') {
      return {
        title: {
          text: `${categoryType === 'income' ? '收入' : '支出'}类别分布`,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: data.map(item => item.name)
        },
        series: [
          {
            name: categoryType === 'income' ? '收入' : '支出',
            type: 'pie',
            radius: '50%',
            data: data.map(item => ({
              name: item.name,
              value: item.value
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    } else {
      return {
        title: {
          text: `${categoryType === 'income' ? '收入' : '支出'}类别分布`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['金额']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: data.map(item => item.name)
        },
        series: [
          {
            name: '金额',
            type: 'bar',
            data: data.map(item => item.value)
          }
        ]
      };
    }
  };

  // 生成收支趋势图表选项
  const getTrendChartOption = () => {
    const data = getTransactionsByDate();
    
    return {
      title: {
        text: '收支趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['收入', '支出', '净收入'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: data.map(item => item.income),
          areaStyle: {}
        },
        {
          name: '支出',
          type: 'line',
          data: data.map(item => item.expense),
          areaStyle: {}
        },
        {
          name: '净收入',
          type: 'line',
          data: data.map(item => item.income - item.expense),
          areaStyle: {}
        }
      ]
    };
  };

  // 生成账户收支图表选项
  const getAccountChartOption = () => {
    const data = getTransactionsByAccount();
    
    return {
      title: {
        text: '账户收支情况',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['收入', '支出', '借支'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '收入',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.income)
        },
        {
          name: '支出',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.expense)
        },
        {
          name: '借支',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.transfer)
        }
      ]
    };
  };

  // 渲染概览统计
  const renderOverviewStats = () => {
    if (!stats) return null;
    
    return (
      <div className="stats-overview">
        <div className="stat-item stat-income">
          <Text type="secondary">总收入</Text>
          <Title level={3} style={{ color: '#52c41a', margin: '8px 0' }}>
            <ArrowUpOutlined /> {formatAmount(stats.totalIncome || 0)}
          </Title>
          <Text type="secondary">{dateRange[0].format('YYYY-MM-DD')} 至 {dateRange[1].format('YYYY-MM-DD')}</Text>
        </div>
        <div className="stat-item stat-expense">
          <Text type="secondary">总支出</Text>
          <Title level={3} style={{ color: '#f5222d', margin: '8px 0' }}>
            <ArrowDownOutlined /> {formatAmount(stats.totalExpense || 0)}
          </Title>
          <Text type="secondary">{dateRange[0].format('YYYY-MM-DD')} 至 {dateRange[1].format('YYYY-MM-DD')}</Text>
        </div>
        <div className="stat-item stat-balance">
          <Text type="secondary">净收入</Text>
          <Title level={3} style={{ color: (stats.totalIncome || 0) - (stats.totalExpense || 0) >= 0 ? '#1890ff' : '#f5222d', margin: '8px 0' }}>
            <DollarOutlined /> {formatAmount((stats.totalIncome || 0) - (stats.totalExpense || 0))}
          </Title>
          <Text type="secondary">{dateRange[0].format('YYYY-MM-DD')} 至 {dateRange[1].format('YYYY-MM-DD')}</Text>
        </div>
      </div>
    );
  };

  // 渲染类别分布图表
  const renderCategoryChart = () => {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <PieChartOutlined className="chart-icon" />
            类别分布
          </h3>
          <div className="chart-controls">
            <Radio.Group 
              value={categoryType} 
              onChange={e => setCategoryType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="expense">支出</Radio.Button>
              <Radio.Button value="income">收入</Radio.Button>
            </Radio.Group>
            <Radio.Group 
              value={chartType} 
              onChange={e => setChartType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="pie">饼图</Radio.Button>
              <Radio.Button value="bar">柱状图</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        <ReactECharts 
          option={getCategoryChartOption()} 
          style={{ height: 400 }} 
          notMerge={true}
        />
      </div>
    );
  };

  // 渲染趋势图表
  const renderTrendChart = () => {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <LineChartOutlined className="chart-icon" />
            收支趋势
          </h3>
        </div>
        <ReactECharts 
          option={getTrendChartOption()} 
          style={{ height: 400 }} 
        />
      </div>
    );
  };

  // 渲染账户分布图表
  const renderAccountChart = () => {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <BarChartOutlined className="chart-icon" />
            账户收支
          </h3>
        </div>
        <ReactECharts 
          option={getAccountChartOption()} 
          style={{ height: 400 }} 
        />
      </div>
    );
  };

  if (!currentBook) {
    return (
      <Card className="report-card">
        <Empty 
          description="请先选择或创建一个账本" 
          className="empty-container"
        />
      </Card>
    );
  }

  return (
    <div className="reports-container">
      {!currentBook ? (
        <Card className="report-card">
          <Empty 
            description="请先选择或创建一个账本" 
            className="empty-container"
          />
        </Card>
      ) : (
        <>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BarChartOutlined style={{ fontSize: 20, marginRight: 8 }} />
                统计报表
              </div>
            }
            className="report-card"
          >
            <div className="report-controls">
              <RangePicker 
                value={dateRange}
                onChange={handleDateRangeChange}
                format="YYYY-MM-DD"
                allowClear={false}
                className="date-range-picker"
              />
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                导出报表
              </Button>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                {renderOverviewStats()}
                
                <Tabs 
                  activeKey={activeTab} 
                  onChange={setActiveTab}
                  className="report-tabs"
                >
                  <TabPane 
                    tab={
                      <span>
                        <PieChartOutlined />
                        类别分析
                      </span>
                    } 
                    key="category"
                  >
                    {renderCategoryChart()}
                  </TabPane>
                  <TabPane 
                    tab={
                      <span>
                        <LineChartOutlined />
                        收支趋势
                      </span>
                    } 
                    key="trend"
                  >
                    {renderTrendChart()}
                  </TabPane>
                  <TabPane 
                    tab={
                      <span>
                        <BarChartOutlined />
                        账户分析
                      </span>
                    } 
                    key="account"
                  >
                    {renderAccountChart()}
                  </TabPane>
                </Tabs>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports; 