import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, List, Typography, Space, Statistic, Button, Tooltip, Tag, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { fetchAccounts } from '../store/accountSlice';
import { FormattedMessage, useIntl } from 'react-intl';

const { Text, Title } = Typography;

const AccountList = ({ onAddAccount, onEditAccount, onDeleteAccount, onSelectAccount }) => {
  const dispatch = useDispatch();
  const { accounts, loading } = useSelector((state) => state.accounts);
  const { currentBook } = useSelector((state) => state.books);
  const intl = useIntl();

  useEffect(() => {
    if (currentBook && currentBook._id) {
      dispatch(fetchAccounts(currentBook._id));
    }
  }, [dispatch, currentBook]);

  // 获取账户的货币信息
  const getAccountCurrency = (account) => {
    if (!account || !currentBook || !currentBook.currencies) return null;
    
    return currentBook.currencies.find(c => c.code === account.currency);
  };

  // 计算账户总余额（按本位币）
  const calculateTotalBalance = () => {
    if (!accounts.length || !currentBook || !currentBook.currencies) return 0;
    
    return accounts.reduce((total, account) => {
      const currency = getAccountCurrency(account);
      if (!currency) return total;
      
      // 计算当前余额（初始余额 + 收入 - 支出）
      const currentBalance = account.initialBalance + 
        (account.totalIncome || 0) - (account.totalExpense || 0);
      
      // 转换为本位币
      const balanceInDefaultCurrency = currentBalance / (currency.exchangeRate || 1);
      
      return total + balanceInDefaultCurrency;
    }, 0);
  };

  // 计算总收入（按本位币）
  const calculateTotalIncome = () => {
    if (!accounts.length || !currentBook || !currentBook.currencies) return 0;
    
    return accounts.reduce((total, account) => {
      const currency = getAccountCurrency(account);
      if (!currency || !account.totalIncome) return total;
      
      // 转换为本位币
      const incomeInDefaultCurrency = account.totalIncome / (currency.exchangeRate || 1);
      
      return total + incomeInDefaultCurrency;
    }, 0);
  };

  // 计算总支出（按本位币）
  const calculateTotalExpense = () => {
    if (!accounts.length || !currentBook || !currentBook.currencies) return 0;
    
    return accounts.reduce((total, account) => {
      const currency = getAccountCurrency(account);
      if (!currency || !account.totalExpense) return total;
      
      // 转换为本位币
      const expenseInDefaultCurrency = account.totalExpense / (currency.exchangeRate || 1);
      
      return total + expenseInDefaultCurrency;
    }, 0);
  };

  // 格式化金额显示
  const formatAmount = (amount, currency) => {
    if (!amount && amount !== 0) return '0.00';
    if (!currency) return amount.toFixed(2);
    return `${currency.symbol} ${amount.toFixed(2)}`;
  };

  // 获取本位币信息
  const getDefaultCurrency = () => {
    if (!currentBook || !currentBook.currencies) return null;
    
    return currentBook.currencies.find(c => c.code === currentBook.defaultCurrency);
  };

  const defaultCurrency = getDefaultCurrency();
  const totalBalance = calculateTotalBalance();
  const totalIncome = calculateTotalIncome();
  const totalExpense = calculateTotalExpense();

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {accounts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic 
                title={intl.formatMessage({ id: 'account.totalAssets', defaultMessage: `总资产 (${defaultCurrency?.code || ''})` })}
                value={totalBalance || 0}
                precision={2}
                prefix={defaultCurrency?.symbol || ''}
                suffix={!defaultCurrency?.symbol ? ` ${defaultCurrency?.code || ''}` : ''}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title={intl.formatMessage({ id: 'account.totalIncome', defaultMessage: `总收入 (${defaultCurrency?.code || ''})` })}
                value={totalIncome || 0}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<><ArrowUpOutlined /> {defaultCurrency?.symbol || ''}</>}
                suffix={!defaultCurrency?.symbol ? ` ${defaultCurrency?.code || ''}` : ''}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title={intl.formatMessage({ id: 'account.totalExpense', defaultMessage: `总支出 (${defaultCurrency?.code || ''})` })}
                value={totalExpense || 0}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix={<><ArrowDownOutlined /> {defaultCurrency?.symbol || ''}</>}
                suffix={!defaultCurrency?.symbol ? ` ${defaultCurrency?.code || ''}` : ''}
              />
            </Col>
          </Row>
          <Text type="secondary">
            <FormattedMessage id="account.totalAssetsDescription" defaultMessage="按本位币计算的总资产" />
          </Text>
        </div>
      )}
      
      <Card 
        title={<FormattedMessage id="account.list" defaultMessage="账户列表" />}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onAddAccount}
          >
            <FormattedMessage id="account.add" defaultMessage="添加账户" />
          </Button>
        }
        variant="borderless"
        style={{ margin: 0, padding: 0 }}
      >
        <List
          loading={loading}
          dataSource={accounts}
          renderItem={(account) => {
            const currency = getAccountCurrency(account);
            const currentBalance = account.initialBalance + 
              (account.totalIncome || 0) - (account.totalExpense || 0);
            
            return (
              <List.Item
                key={account._id}
                actions={[
                  <Tooltip title={intl.formatMessage({ id: 'account.edit', defaultMessage: "编辑账户" })}>
                    <Button 
                      icon={<EditOutlined />} 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAccount(account);
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title={account.hasTransactions ? 
                    intl.formatMessage({ id: 'account.cannotDelete', defaultMessage: "该账户已有交易记录，无法删除" }) : 
                    intl.formatMessage({ id: 'account.delete', defaultMessage: "删除账户" })}>
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                      disabled={account.hasTransactions}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAccount(account);
                      }}
                    />
                  </Tooltip>
                ]}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectAccount && onSelectAccount(account)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{account.name}</span>
                      <Text type="secondary">({currency?.code || ''})</Text>
                      {account.hasTransactions && (
                        <Tag color="blue">
                          <FormattedMessage id="account.inUse" defaultMessage="已使用" />
                        </Tag>
                      )}
                    </Space>
                  }
                />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {formatAmount(currentBalance, currency)}
                  </Title>
                  {currency && defaultCurrency && currency.code !== currentBook.defaultCurrency && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ≈ {formatAmount(currentBalance / (currency.exchangeRate || 1), defaultCurrency)}
                    </Text>
                  )}
                </div>
              </List.Item>
            );
          }}
          locale={{ emptyText: intl.formatMessage({ id: 'account.empty', defaultMessage: '暂无账户，请添加账户' }) }}
        />
      </Card>
    </div>
  );
};

export default AccountList; 