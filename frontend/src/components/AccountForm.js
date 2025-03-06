import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, Button, Select, InputNumber, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createAccount, updateAccount } from '../store/accountSlice';
import { sendAccountNotification, sendErrorNotification } from '../services/notificationService';
import { useIntl } from 'react-intl';

const { Option } = Select;

const AccountForm = ({ account, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const intl = useIntl();
  const { loading, error } = useSelector((state) => state.accounts);
  const { currentBook } = useSelector((state) => state.books);
  const [hasCurrencyChanged, setHasCurrencyChanged] = useState(false);
  const [initialCurrency, setInitialCurrency] = useState(null);

  // 使用useMemo获取当前账本的货币列表
  const currencies = useMemo(() => {
    if (currentBook?.currencies && currentBook.currencies.length > 0) {
      return currentBook.currencies;
    }
    // 如果账本没有设置货币，返回默认货币列表
    return [
      { code: 'CNY', name: '人民币', symbol: '¥', exchangeRate: 1 },
      { code: 'USD', name: '美元', symbol: '$', exchangeRate: 7.2 },
      { code: 'EUR', name: '欧元', symbol: '€', exchangeRate: 7.8 }
    ];
  }, [currentBook]);

  useEffect(() => {
    // 调试输出
    console.log('当前账本:', currentBook);
    console.log('可用货币:', currencies);
    
    if (account) {
      form.setFieldsValue({
        name: account.name,
        initialBalance: account.initialBalance || 0,
        currency: account.currency,
      });
      setInitialCurrency(account.currency);
    } else {
      form.setFieldsValue({
        initialBalance: 0,
        currency: currentBook?.defaultCurrency || 'CNY',
      });
    }
  }, [account, form, currentBook, currencies]);

  useEffect(() => {
    if (error) {
      sendErrorNotification(dispatch, {
        title: intl.formatMessage({ id: 'account.error', defaultMessage: '账户操作失败' }),
        message: error
      });
    }
  }, [error, dispatch, intl]);

  // 监听货币变化
  const handleCurrencyChange = (value) => {
    if (account && initialCurrency && value !== initialCurrency) {
      setHasCurrencyChanged(true);
    } else {
      setHasCurrencyChanged(false);
    }
  };

  const onFinish = (values) => {
    // 确保选择了有效的货币
    if (!values.currency) {
      sendErrorNotification(dispatch, {
        title: intl.formatMessage({ id: 'account.currencyRequired', defaultMessage: '货币选择错误' }),
        message: intl.formatMessage({ id: 'account.selectCurrency', defaultMessage: '请选择货币' })
      });
      return;
    }

    // 确保货币在账本的货币列表中
    const selectedCurrency = currencies.find(c => c.code === values.currency);
    if (!selectedCurrency) {
      sendErrorNotification(dispatch, {
        title: intl.formatMessage({ id: 'account.invalidCurrency', defaultMessage: '无效的货币' }),
        message: intl.formatMessage({ id: 'account.currencyNotInList', defaultMessage: '所选货币不在当前账本的货币列表中' })
      });
      return;
    }

    if (account) {
      // 更新账户
      dispatch(updateAccount({ 
        id: account._id, 
        accountData: {
          ...values,
          bookId: currentBook._id
        }
      }))
        .unwrap()
        .then(() => {
          sendAccountNotification(dispatch, {
            title: intl.formatMessage({ id: 'account.updateSuccess', defaultMessage: '账户更新成功' }),
            message: intl.formatMessage(
              { id: 'account.updateSuccessMessage', defaultMessage: '账户 {name} 已成功更新' },
              { name: values.name }
            )
          });
          onSuccess && onSuccess();
        })
        .catch((err) => {
          sendErrorNotification(dispatch, {
            title: intl.formatMessage({ id: 'account.updateError', defaultMessage: '账户更新失败' }),
            message: err.toString()
          });
        });
    } else {
      // 创建账户
      dispatch(createAccount({
        ...values,
        bookId: currentBook._id
      }))
        .unwrap()
        .then(() => {
          sendAccountNotification(dispatch, {
            title: intl.formatMessage({ id: 'account.createSuccess', defaultMessage: '账户创建成功' }),
            message: intl.formatMessage(
              { id: 'account.createSuccessMessage', defaultMessage: '账户 {name} 已成功创建' },
              { name: values.name }
            )
          });
          onSuccess && onSuccess();
        })
        .catch((err) => {
          sendErrorNotification(dispatch, {
            title: intl.formatMessage({ id: 'account.createError', defaultMessage: '账户创建失败' }),
            message: err.toString()
          });
        });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        label="账户名称"
        rules={[
          { required: true, message: '请输入账户名称' },
          { min: 2, message: '账户名称至少需要2个字符' },
          { max: 20, message: '账户名称不能超过20个字符' }
        ]}
      >
        <Input placeholder="请输入账户名称" maxLength={20} />
      </Form.Item>

      <Form.Item
        name="initialBalance"
        label="初始余额"
        rules={[
          { required: true, message: '请输入初始余额' },
          { type: 'number', message: '请输入有效的数字' }
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          precision={2}
          step={100}
          placeholder="请输入初始余额"
        />
      </Form.Item>

      <Form.Item
        name="currency"
        label="货币"
        rules={[{ required: true, message: '请选择货币' }]}
        tooltip={account ? "如果账户已有交易记录，更改货币可能会导致数据不一致" : "选择账户使用的货币"}
      >
        <Select 
          placeholder="请选择货币"
          onChange={handleCurrencyChange}
          disabled={account && account.hasTransactions} // 如果账户已有交易记录，禁止修改货币
        >
          {currencies.map(currency => (
            <Option key={currency.code} value={currency.code}>
              {currency.name} ({currency.code} - {currency.symbol})
            </Option>
          ))}
        </Select>
      </Form.Item>

      {currencies.length <= 1 && (
        <Alert
          message="提示"
          description="当前账本货币选项有限，您可以在账本设置中添加更多货币。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {account && account.hasTransactions && (
        <Alert
          message="警告"
          description="此账户已有交易记录，无法更改货币。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {hasCurrencyChanged && (
        <Alert
          message="警告"
          description="更改货币将影响所有使用此账户的交易记录。如果账户已有交易记录，建议不要更改货币。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
          {account ? '更新账户' : '创建账户'}
        </Button>
        {onCancel && (
          <Button onClick={onCancel}>
            取消
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};

export default AccountForm; 