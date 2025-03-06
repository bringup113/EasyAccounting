import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, InputNumber, DatePicker, Space, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createTransaction, updateTransaction } from '../store/transactionSlice';
import { sendTransactionNotification, sendErrorNotification } from '../services/notificationService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useIntl } from 'react-intl';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const TransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const intl = useIntl();
  const { loading, error } = useSelector((state) => state.transactions);
  const { currentBook } = useSelector((state) => state.books);
  const { accounts } = useSelector((state) => state.accounts);
  const { categories } = useSelector((state) => state.categories);
  const { persons } = useSelector((state) => state.persons);
  const { tags } = useSelector((state) => state.tags);
  
  // 当前选择的账户
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // 获取当前账本的时区
  const bookTimezone = currentBook?.timezone || 'UTC';

  // 根据交易类型筛选类别
  const [transactionType, setTransactionType] = useState(transaction?.type || 'expense');
  const filteredCategories = categories.filter(
    (category) => category.type === transactionType
  );

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      // 设置表单初始值
      form.setFieldsValue({
        type: transaction.type,
        amount: transaction.amount,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        date: dayjs(transaction.date).tz(bookTimezone),
        description: transaction.description,
        personIds: transaction.personIds,
        tagIds: transaction.tagIds,
      });
      setTransactionType(transaction.type);
      
      // 设置选中的账户
      const account = accounts.find(acc => acc._id === transaction.accountId);
      setSelectedAccount(account);
    } else {
      // 设置默认值
      form.setFieldsValue({
        type: 'expense',
        date: dayjs().tz(bookTimezone),
      });
    }
  }, [transaction, form, accounts, bookTimezone]);

  useEffect(() => {
    if (error) {
      sendErrorNotification(dispatch, {
        title: intl.formatMessage({ id: 'transaction.error', defaultMessage: '交易记录操作失败' }),
        message: error
      });
    }
  }, [error, dispatch, intl]);

  // 处理交易类型变化
  const handleTypeChange = (value) => {
    setTransactionType(value);
  };

  // 处理账户选择变化
  const handleAccountChange = (accountId) => {
    const account = accounts.find(acc => acc._id === accountId);
    setSelectedAccount(account);
  };

  const onFinish = (values) => {
    // 设置提交状态
    setSubmitting(true);
    
    // 转换日期为ISO格式
    const formattedValues = {
      ...values,
      date: values.date.toISOString(),
      bookId: currentBook._id,
    };

    if (transaction) {
      // 更新交易记录
      dispatch(updateTransaction({ 
        id: transaction._id, 
        transactionData: formattedValues
      }))
        .unwrap()
        .then(() => {
          sendTransactionNotification(dispatch, {
            title: intl.formatMessage({ id: 'transaction.editSuccess', defaultMessage: '编辑交易记录成功' }),
            message: intl.formatMessage(
              { id: 'transaction.editSuccessMessage', defaultMessage: '成功更新金额为 {amount} 的{type}记录' },
              { 
                amount: values.amount, 
                type: values.type === 'income' 
                  ? intl.formatMessage({ id: 'app.income', defaultMessage: '收入' })
                  : values.type === 'expense'
                  ? intl.formatMessage({ id: 'app.expense', defaultMessage: '支出' })
                  : intl.formatMessage({ id: 'app.transfer', defaultMessage: '转账' })
              }
            )
          });
          onSuccess && onSuccess();
        })
        .catch((err) => {
          sendErrorNotification(dispatch, {
            title: intl.formatMessage({ id: 'transaction.editError', defaultMessage: '编辑交易记录失败' }),
            message: err.toString()
          });
        })
        .finally(() => {
          setSubmitting(false);
        });
    } else {
      // 创建交易记录
      dispatch(createTransaction(formattedValues))
        .unwrap()
        .then(() => {
          sendTransactionNotification(dispatch, {
            title: intl.formatMessage({ id: 'transaction.createSuccess', defaultMessage: '创建交易记录成功' }),
            message: intl.formatMessage(
              { id: 'transaction.createSuccessMessage', defaultMessage: '成功创建金额为 {amount} 的{type}记录' },
              { 
                amount: values.amount, 
                type: values.type === 'income' 
                  ? intl.formatMessage({ id: 'app.income', defaultMessage: '收入' })
                  : values.type === 'expense'
                  ? intl.formatMessage({ id: 'app.expense', defaultMessage: '支出' })
                  : intl.formatMessage({ id: 'app.transfer', defaultMessage: '转账' })
              }
            )
          });
          // 重置表单
          form.resetFields();
          // 设置默认值
          form.setFieldsValue({
            type: 'expense',
            date: dayjs().tz(bookTimezone),
          });
          onSuccess && onSuccess();
        })
        .catch((err) => {
          sendErrorNotification(dispatch, {
            title: intl.formatMessage({ id: 'transaction.createError', defaultMessage: '创建交易记录失败' }),
            message: err.toString()
          });
        })
        .finally(() => {
          setSubmitting(false);
        });
    }
  };

  // 获取选中账户的货币信息
  const getCurrencyInfo = () => {
    if (!selectedAccount) return null;
    
    const currency = currentBook?.currencies?.find(
      c => c.code === selectedAccount.currency
    );
    
    return currency;
  };

  const currencyInfo = getCurrencyInfo();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="type"
        label="交易类型"
        rules={[{ required: true, message: '请选择交易类型' }]}
      >
        <Select onChange={handleTypeChange}>
          <Option value="income">收入</Option>
          <Option value="expense">支出</Option>
          <Option value="transfer">借支</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="accountId"
        label="账户"
        rules={[{ required: true, message: '请选择账户' }]}
      >
        <Select 
          placeholder="请选择账户" 
          onChange={handleAccountChange}
          optionLabelProp="label"
        >
          {accounts.map(account => {
            const accountCurrency = currentBook?.currencies?.find(
              c => c.code === account.currency
            );
            return (
              <Option 
                key={account._id} 
                value={account._id}
                label={account.name}
              >
                <Space>
                  <span>{account.name}</span>
                  <Text type="secondary">
                    ({accountCurrency?.symbol || ''} {accountCurrency?.code || ''})
                  </Text>
                </Space>
              </Option>
            );
          })}
        </Select>
      </Form.Item>

      <Form.Item
        name="amount"
        label={
          <span>
            金额
            {currencyInfo && (
              <Text type="secondary" style={{ marginLeft: 8 }}>
                ({currencyInfo.symbol} {currencyInfo.code})
              </Text>
            )}
          </span>
        }
        rules={[
          { required: true, message: '请输入金额' },
          { type: 'number', min: 0.01, message: '金额必须大于0' },
          { type: 'number', max: 9999999.99, message: '金额不能超过9,999,999.99' }
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          precision={2}
          min={0.01}
          max={9999999.99}
          step={10}
          placeholder="请输入金额"
          addonAfter={currencyInfo?.symbol}
        />
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="类别"
        rules={[{ required: true, message: '请选择类别' }]}
      >
        <Select placeholder="请选择类别">
          {filteredCategories.map(category => (
            <Option key={category._id} value={category._id}>
              {category.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="date"
        label="日期"
        rules={[{ required: true, message: '请选择日期' }]}
      >
        <DatePicker 
          style={{ width: '100%' }} 
          showTime 
          format="YYYY-MM-DD HH:mm:ss"
        />
      </Form.Item>

      <Form.Item
        name="description"
        label="描述"
      >
        <TextArea
          placeholder="请输入描述"
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
      </Form.Item>

      <Form.Item
        name="personIds"
        label="相关人员"
      >
        <Select 
          mode="multiple" 
          placeholder="请选择相关人员"
          allowClear
        >
          {persons.map(person => (
            <Option key={person._id} value={person._id}>
              {person.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="tagIds"
        label="标签"
      >
        <Select 
          mode="multiple" 
          placeholder="请选择标签"
          allowClear
        >
          {tags.map(tag => (
            <Option key={tag._id} value={tag._id}>
              {tag.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={submitting} 
          style={{ marginRight: 8 }}
        >
          {transaction ? '更新交易记录' : '创建交易记录'}
        </Button>
        {onCancel && (
          <Button onClick={onCancel} disabled={submitting}>
            取消
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};

export default TransactionForm; 