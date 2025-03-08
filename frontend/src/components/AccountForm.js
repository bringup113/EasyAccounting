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
  const { user } = useSelector((state) => state.auth);
  const [hasCurrencyChanged, setHasCurrencyChanged] = useState(false);
  const [initialCurrency, setInitialCurrency] = useState(null);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);

  // 从localStorage获取可用货币列表，使用用户ID作为键
  useEffect(() => {
    try {
      // 确保用户已登录
      if (user && user._id) {
        const userSpecificKey = `availableCurrencies_${user._id}`;
        const savedCurrencies = localStorage.getItem(userSpecificKey);
        console.log('从localStorage获取的货币设置:', savedCurrencies);
        if (savedCurrencies) {
          const parsedCurrencies = JSON.parse(savedCurrencies);
          console.log('解析后的货币设置:', parsedCurrencies);
          setAvailableCurrencies(parsedCurrencies);
        } else {
          // 检查是否有全局设置可以迁移
          const globalCurrencies = localStorage.getItem('availableCurrencies');
          if (globalCurrencies) {
            try {
              const parsedGlobalCurrencies = JSON.parse(globalCurrencies);
              if (parsedGlobalCurrencies && parsedGlobalCurrencies.length > 0) {
                // 迁移全局设置到用户特定设置
                setAvailableCurrencies(parsedGlobalCurrencies);
                localStorage.setItem(userSpecificKey, globalCurrencies);
                console.log('已将全局货币设置迁移到用户特定设置');
              } else {
                // 如果全局设置为空，使用默认设置
                const defaultCurrencies = [
                  { code: 'CNY', name: '人民币', symbol: '¥', rate: 1, isSystemDefault: true },
                  { code: 'USD', name: '美元', symbol: '$', rate: 0.14, isSystemDefault: true },
                  { code: 'THB', name: '泰铢', symbol: '฿', rate: 4.5, isSystemDefault: true }
                ];
                setAvailableCurrencies(defaultCurrencies);
                // 保存默认设置到用户特定的存储中
                localStorage.setItem(userSpecificKey, JSON.stringify(defaultCurrencies));
              }
            } catch (e) {
              console.error('解析全局货币设置失败:', e);
              // 使用默认设置
              const defaultCurrencies = [
                { code: 'CNY', name: '人民币', symbol: '¥', rate: 1, isSystemDefault: true },
                { code: 'USD', name: '美元', symbol: '$', rate: 0.14, isSystemDefault: true },
                { code: 'THB', name: '泰铢', symbol: '฿', rate: 4.5, isSystemDefault: true }
              ];
              setAvailableCurrencies(defaultCurrencies);
              // 保存默认设置到用户特定的存储中
              localStorage.setItem(userSpecificKey, JSON.stringify(defaultCurrencies));
            }
          } else {
            // 如果没有全局设置，使用默认设置
            const defaultCurrencies = [
              { code: 'CNY', name: '人民币', symbol: '¥', rate: 1, isSystemDefault: true },
              { code: 'USD', name: '美元', symbol: '$', rate: 0.14, isSystemDefault: true },
              { code: 'THB', name: '泰铢', symbol: '฿', rate: 4.5, isSystemDefault: true }
            ];
            setAvailableCurrencies(defaultCurrencies);
            // 保存默认设置到用户特定的存储中
            localStorage.setItem(userSpecificKey, JSON.stringify(defaultCurrencies));
          }
        }
      }
    } catch (error) {
      console.error('加载货币数据失败:', error);
    }
  }, [user]);

  // 使用useMemo获取当前账本的货币列表和设置中的货币列表
  const currencies = useMemo(() => {
    let result = [];
    
    // 首先添加账本中的货币列表
    if (currentBook?.currencies && currentBook.currencies.length > 0) {
      result = [...currentBook.currencies];
    }
    
    // 然后添加设置中的货币列表（去重）
    if (availableCurrencies && availableCurrencies.length > 0) {
      availableCurrencies.forEach(currency => {
        // 检查是否已经存在相同code的货币
        if (!result.some(c => c.code === currency.code)) {
          result.push(currency);
        }
      });
    }
    
    // 如果结果为空，返回默认货币列表
    if (result.length === 0) {
      return [
        { code: 'CNY', name: '人民币', symbol: '¥', rate: 1 },
        { code: 'USD', name: '美元', symbol: '$', rate: 7.2 },
        { code: 'EUR', name: '欧元', symbol: '€', rate: 7.8 }
      ];
    }
    
    return result;
  }, [currentBook, availableCurrencies]);

  useEffect(() => {
    // 调试输出
    console.log('当前账本:', currentBook);
    console.log('可用货币:', currencies);
    console.log('设置中的可用货币:', availableCurrencies);
    
    // 添加更详细的调试信息
    console.log('当前账本完整信息:', JSON.stringify(currentBook, null, 2));
    console.log('货币列表详细信息:', JSON.stringify(currencies, null, 2));
    
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
  }, [account, form, currentBook, currencies, availableCurrencies]);

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

    // 确保货币在账本的货币列表或可用货币列表中
    const selectedCurrency = currencies.find(c => c.code === values.currency);
    if (!selectedCurrency) {
      sendErrorNotification(dispatch, {
        title: intl.formatMessage({ id: 'account.invalidCurrency', defaultMessage: '无效的货币' }),
        message: intl.formatMessage({ id: 'account.currencyNotInList', defaultMessage: '所选货币不在当前账本的货币列表中' })
      });
      return;
    }

    // 准备账户数据，确保使用正确的货币属性名称
    const accountData = {
      ...values,
      bookId: currentBook._id
    };

    if (account) {
      // 更新账户
      dispatch(updateAccount({ 
        id: account._id, 
        accountData
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
      dispatch(createAccount(accountData))
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
          {/* 
            修复货币列表显示问题：
            1. 添加条件渲染，确保currencies存在且有元素时才渲染货币选项
            2. 如果currencies不存在或为空，提供默认选项
            3. 从设置中获取货币列表，确保使用正确的属性名称（rate而不是exchangeRate）
            这样可以防止在currencies未加载完成时出现空白下拉列表
          */}
          {currencies && currencies.length > 0 ? (
            currencies.map(currency => (
              <Option key={currency.code} value={currency.code}>
                {currency.name} ({currency.code} - {currency.symbol}) 
                {currency.rate && currency.rate !== 1 ? ` - 汇率: ${currency.rate}` : ''}
              </Option>
            ))
          ) : (
            <Option value="CNY">人民币 (CNY - ¥)</Option>
          )}
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