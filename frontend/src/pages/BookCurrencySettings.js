import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  message, 
  Popconfirm, 
  Typography,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  QuestionCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { updateBook } from '../store/bookSlice';
import './BookCurrencySettings.css';

const { Title, Text } = Typography;

// 系统默认货币列表
const DEFAULT_SYSTEM_CURRENCIES = ['CNY', 'USD', 'THB'];

const BookCurrencySettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBook } = useSelector((state) => state.books);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);

  // 如果没有选择账本，重定向到首页
  useEffect(() => {
    if (!currentBook) {
      navigate('/home');
    } else {
      // 初始化货币列表
      setCurrencies(currentBook.currencies || []);
    }
  }, [currentBook, navigate]);

  // 打开添加/编辑货币模态框
  const showModal = (currency = null) => {
    setEditingCurrency(currency);
    if (currency) {
      form.setFieldsValue({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        rate: currency.rate
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 处理模态框确认
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        
        // 确保汇率是数字类型
        const rateValue = typeof values.rate === 'string' ? parseFloat(values.rate) : values.rate;
        
        // 检查汇率是否为有效数字且大于0
        if (isNaN(rateValue) || rateValue <= 0) {
          message.error('汇率必须是大于0的有效数字');
          setLoading(false);
          return;
        }
        
        // 更新values对象中的rate值
        const updatedValues = {
          ...values,
          rate: rateValue
        };
        
        let updatedCurrencies = [...currencies];
        
        if (editingCurrency) {
          // 编辑现有货币
          updatedCurrencies = updatedCurrencies.map(c => 
            c.code === editingCurrency.code ? { 
              ...updatedValues, 
              rate: rateValue
            } : c
          );
        } else {
          // 添加新货币
          // 检查货币代码是否已存在
          if (updatedCurrencies.some(c => c.code === updatedValues.code)) {
            message.error('货币代码已存在');
            setLoading(false);
            return;
          }
          
          updatedCurrencies.push({ 
            ...updatedValues, 
            rate: rateValue
          });
        }
        
        // 更新账本
        dispatch(updateBook({
          id: currentBook._id,
          bookData: {
            currencies: updatedCurrencies
          }
        }))
          .unwrap()
          .then(() => {
            setCurrencies(updatedCurrencies);
            message.success(editingCurrency ? '货币更新成功' : '货币添加成功');
            setIsModalVisible(false);
            setEditingCurrency(null);
          })
          .catch(error => {
            message.error(`操作失败: ${error}`);
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch(info => {
        console.error('表单验证失败:', info);
        // 不要设置loading为false，因为表单验证失败时不会进入loading状态
      });
  };

  // 处理删除货币
  const handleDelete = (code) => {
    // 检查是否是系统默认货币
    const isSystemDefault = DEFAULT_SYSTEM_CURRENCIES.includes(code);
    if (isSystemDefault) {
      message.error('系统默认货币不能删除');
      return;
    }
    
    // 检查是否是本位币
    if (currentBook.defaultCurrency === code) {
      message.error('本位币不能删除');
      return;
    }
    
    setLoading(true);
    
    // 过滤掉要删除的货币
    const updatedCurrencies = currencies.filter(c => c.code !== code);
    
    // 更新账本
    dispatch(updateBook({
      id: currentBook._id,
      bookData: {
        currencies: updatedCurrencies
      }
    }))
      .unwrap()
      .then(() => {
        setCurrencies(updatedCurrencies);
        message.success('货币删除成功');
      })
      .catch(error => {
        message.error(`删除失败: ${error}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 设置为本位币
  const setAsDefaultCurrency = (code) => {
    setLoading(true);
    
    // 更新账本
    dispatch(updateBook({
      id: currentBook._id,
      bookData: {
        defaultCurrency: code
      }
    }))
      .unwrap()
      .then(() => {
        message.success(`已将 ${code} 设置为本位币`);
      })
      .catch(error => {
        message.error(`设置失败: ${error}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 对货币列表进行排序，本位币在第一位，其他按原顺序（创建时间顺序）
  const sortedCurrencies = useMemo(() => {
    if (!currencies.length || !currentBook?.defaultCurrency) return currencies;
    
    // 复制一个新数组，避免修改原数组
    const result = [...currencies];
    
    // 找到本位币的索引
    const defaultCurrencyIndex = result.findIndex(c => c.code === currentBook.defaultCurrency);
    
    // 如果找到本位币，将其移到第一位
    if (defaultCurrencyIndex > -1) {
      const defaultCurrency = result.splice(defaultCurrencyIndex, 1)[0];
      result.unshift(defaultCurrency);
    }
    
    return result;
  }, [currencies, currentBook?.defaultCurrency]);

  // 表格列定义
  const columns = [
    {
      title: '货币代码',
      dataIndex: 'code',
      key: 'code',
      width: '20%',
      align: 'center',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      align: 'center',
    },
    {
      title: '符号',
      dataIndex: 'symbol',
      key: 'symbol',
      width: '20%',
      align: 'center',
    },
    {
      title: '汇率',
      dataIndex: 'rate',
      key: 'rate',
      width: '20%',
      align: 'center',
      render: (rate) => rate.toFixed(4),
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      align: 'center',
      render: (_, record) => (
        <div className="currency-action-cell">
          {currentBook.defaultCurrency === record.code ? (
            <div className="set-default-button" style={{ color: '#52c41a', fontWeight: 'bold' }}>
              本位币
            </div>
          ) : (
            <Button 
              type="link" 
              onClick={() => setAsDefaultCurrency(record.code)}
              className="set-default-button"
            >
              设为本位币
            </Button>
          )}
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          {!DEFAULT_SYSTEM_CURRENCIES.includes(record.code) && 
           currentBook.defaultCurrency !== record.code && (
            <Popconfirm
              title="确定要删除这个货币吗？"
              onConfirm={() => handleDelete(record.code)}
              okText="是"
              cancelText="否"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="book-currency-settings-container">
      <Card
        title={
          <div className="page-title">
            <DollarOutlined />
            <span>账本货币设置</span>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            添加货币
          </Button>
        }
      >
        <div className="description-section">
          <Title level={5}>本位币: {currentBook?.defaultCurrency}</Title>
          <Text>
            本位币是账本的基础货币，所有其他货币的汇率都是相对于本位币计算的。
            您可以添加新的货币，编辑现有货币的汇率，或者将某个货币设置为本位币。
          </Text>
        </div>

        <Table 
          columns={columns} 
          dataSource={sortedCurrencies} 
          rowKey="code" 
          loading={loading}
          pagination={false}
          bordered
          size="middle"
          style={{ marginTop: 16 }}
          className="currency-table"
        />

        <div className="tips-section">
          <Title level={5}>
            <QuestionCircleOutlined /> 提示
          </Title>
          <ul>
            <li>系统默认货币（CNY、USD、THB）不可删除</li>
            <li>本位币不可删除</li>
            <li>汇率表示1单位本位币等于多少单位该货币</li>
            <li>例如：如果本位币是CNY，USD的汇率是0.14，表示1元人民币=0.14美元</li>
          </ul>
        </div>
      </Card>

      <Modal
        title={editingCurrency ? "编辑货币" : "添加货币"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="code"
            label="货币代码"
            rules={[
              { required: true, message: '请输入货币代码' },
              { max: 10, message: '货币代码不能超过10个字符' }
            ]}
            tooltip="例如：CNY, USD, EUR"
            disabled={!!editingCurrency}
          >
            <Input disabled={!!editingCurrency} />
          </Form.Item>
          <Form.Item
            name="name"
            label="货币名称"
            rules={[
              { required: true, message: '请输入货币名称' },
              { max: 50, message: '货币名称不能超过50个字符' }
            ]}
            tooltip="例如：人民币, 美元, 欧元"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="symbol"
            label="货币符号"
            rules={[
              { required: true, message: '请输入货币符号' },
              { max: 10, message: '货币符号不能超过10个字符' }
            ]}
            tooltip="例如：¥, $, €"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="rate"
            label={
              <span>
                汇率
                <Tooltip title="相对于本位币的汇率，表示1单位本位币等于多少单位该货币">
                  <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                </Tooltip>
              </span>
            }
            rules={[
              { required: true, message: '请输入汇率' },
              { 
                validator: (_, value) => {
                  const numValue = typeof value === 'string' ? parseFloat(value) : value;
                  if (isNaN(numValue)) {
                    return Promise.reject('请输入有效的数字');
                  }
                  if (numValue <= 0) {
                    return Promise.reject('汇率必须大于0');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              precision={4} 
              min={0.0001} 
              step={0.1}
              stringMode={false}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookCurrencySettings; 