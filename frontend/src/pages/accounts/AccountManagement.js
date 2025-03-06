import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, Modal, Empty, 
  Typography, Space, Alert, App, Button, Row, Col, List, Tooltip, Tag
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  WalletOutlined, ArrowUpOutlined, ArrowDownOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, BankOutlined
} from '@ant-design/icons';
import { fetchAccounts, deleteAccount } from '../../store/accountSlice';
import AccountList from '../../components/AccountList';
import AccountForm from '../../components/AccountForm';
import { FormattedMessage, useIntl } from 'react-intl';
import './AccountManagement.css';

const { Title, Text } = Typography;

const AccountManagement = () => {
  const dispatch = useDispatch();
  const { accounts, error, loading } = useSelector((state) => state.accounts);
  const { currentBook } = useSelector((state) => state.books);
  const { message } = App.useApp(); // 使用App上下文获取message实例
  const intl = useIntl();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [modalTitle, setModalTitle] = useState(intl.formatMessage({ id: 'account.create', defaultMessage: '创建账户' }));
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (currentBook) {
      dispatch(fetchAccounts(currentBook._id));
    }
  }, [dispatch, currentBook]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error, message]);

  // 打开创建账户模态框
  const showAddModal = () => {
    setCurrentAccount(null);
    setModalTitle(intl.formatMessage({ id: 'account.create', defaultMessage: '创建账户' }));
    setIsModalVisible(true);
  };

  // 打开编辑账户模态框
  const showEditModal = (account) => {
    setCurrentAccount(account);
    setModalTitle(intl.formatMessage({ id: 'account.edit', defaultMessage: '编辑账户' }));
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 处理表单提交成功
  const handleSuccess = () => {
    setIsModalVisible(false);
    dispatch(fetchAccounts(currentBook._id));
  };

  // 处理删除账户
  const handleDelete = (account) => {
    // 如果账户已有交易记录，不允许删除
    if (account.hasTransactions) {
      message.error(intl.formatMessage({ id: 'account.cannotDelete', defaultMessage: '该账户已有交易记录，无法删除' }));
      return;
    }

    setDeleteLoading(true);
    dispatch(deleteAccount(account._id))
      .unwrap()
      .then(() => {
        message.success(intl.formatMessage({ id: 'account.deleteSuccess', defaultMessage: '账户删除成功' }));
        dispatch(fetchAccounts(currentBook._id));
      })
      .catch((err) => {
        message.error(`${intl.formatMessage({ id: 'account.deleteError', defaultMessage: '删除失败' })}: ${err}`);
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  // 处理查看账户详情
  const handleViewAccount = (account) => {
    // 可以在这里实现查看账户详情的功能
    message.info(`${intl.formatMessage({ id: 'account.view', defaultMessage: '查看账户' })}: ${account.name}`);
  };

  // 获取账户的货币信息
  const getAccountCurrency = (account) => {
    if (!account || !currentBook || !currentBook.currencies) return null;
    
    return currentBook.currencies.find(c => c.code === account.currency);
  };

  // 计算总资产（按本位币）
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

  if (!currentBook) {
    return (
      <Card bordered={false} style={{ margin: 0, height: '100%' }}>
        <Empty description={<FormattedMessage id="book.selectFirst" defaultMessage="请先选择或创建一个账本" />} />
      </Card>
    );
  }

  return (
    <div className="account-management" style={{ margin: 0, padding: 0 }}>
      <Card 
        bordered={false} 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BankOutlined style={{ marginRight: 12, fontSize: 20 }} />
            <FormattedMessage id="account.management" defaultMessage="账户管理" />
          </div>
        }
      >
        <p><FormattedMessage id="account.managementDescription" defaultMessage="管理您的账户，包括现金、银行卡、信用卡等。每个账户必须关联一种货币。" /></p>
        
        <Alert
          message={<FormattedMessage id="account.rules" defaultMessage="账户使用规则" />}
          description={<FormattedMessage id="account.rulesDescription" defaultMessage="已有交易记录的账户无法删除，也无法更改其关联的货币。如需删除账户，请先删除与该账户相关的所有交易记录。" />}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {accounts.length > 0 && (
          <div className="account-stats">
            <div className="stat-item">
              <div className="stat-title">
                <FormattedMessage id="account.totalAssets" defaultMessage="总资产" />
                {` (${defaultCurrency?.code || ''})`}
              </div>
              <div className="stat-value">
                {defaultCurrency?.symbol || ''} {totalBalance.toFixed(2)}
              </div>
            </div>
            <div className="stat-item stat-income">
              <div className="stat-title">
                <FormattedMessage id="account.totalIncome" defaultMessage="总收入" />
                {` (${defaultCurrency?.code || ''})`}
              </div>
              <div className="stat-value">
                <ArrowUpOutlined /> {defaultCurrency?.symbol || ''} {totalIncome.toFixed(2)}
              </div>
            </div>
            <div className="stat-item stat-expense">
              <div className="stat-title">
                <FormattedMessage id="account.totalExpense" defaultMessage="总支出" />
                {` (${defaultCurrency?.code || ''})`}
              </div>
              <div className="stat-value">
                <ArrowDownOutlined /> {defaultCurrency?.symbol || ''} {totalExpense.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <div className="account-list-container">
          <div className="account-list-header">
            <h3 className="account-list-title">
              <FormattedMessage id="account.list" defaultMessage="账户列表" />
            </h3>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
            >
              <FormattedMessage id="account.add" defaultMessage="添加账户" />
            </Button>
          </div>

          {accounts.length > 0 ? (
            <List
              loading={loading}
              dataSource={accounts}
              renderItem={(account) => {
                const currency = getAccountCurrency(account);
                const currentBalance = account.initialBalance + 
                  (account.totalIncome || 0) - (account.totalExpense || 0);
                
                return (
                  <div className="account-item" onClick={() => handleViewAccount(account)}>
                    <div className="account-info">
                      <div className="account-icon">
                        <WalletOutlined />
                      </div>
                      <div className="account-details">
                        <div className="account-name">
                          {account.name}
                          <span className="account-currency">{currency?.code || ''}</span>
                          {account.hasTransactions && (
                            <Tag color="blue" className="account-tag">
                              <FormattedMessage id="account.inUse" defaultMessage="已使用" />
                            </Tag>
                          )}
                        </div>
                        {account.hasTransactions && (
                          <div style={{ fontSize: '13px', color: '#8c8c8c' }}>
                            <ArrowUpOutlined style={{ color: '#52c41a', marginRight: 4 }} /> 
                            {formatAmount(account.totalIncome || 0, currency)}
                            <span style={{ margin: '0 8px' }}>|</span>
                            <ArrowDownOutlined style={{ color: '#f5222d', marginRight: 4 }} /> 
                            {formatAmount(account.totalExpense || 0, currency)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="account-balance-container">
                      <div className="account-balance">
                        {formatAmount(currentBalance, currency)}
                      </div>
                      <div className="account-actions" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title={intl.formatMessage({ id: 'account.edit', defaultMessage: "编辑账户" })}>
                          <Button 
                            icon={<EditOutlined />} 
                            size="middle"
                            onClick={(e) => {
                              e.stopPropagation();
                              showEditModal(account);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title={account.hasTransactions ? 
                          intl.formatMessage({ id: 'account.cannotDelete', defaultMessage: "该账户已有交易记录，无法删除" }) : 
                          intl.formatMessage({ id: 'account.delete', defaultMessage: "删除账户" })}>
                          <Button 
                            icon={<DeleteOutlined />} 
                            size="middle" 
                            danger
                            disabled={account.hasTransactions}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (account.hasTransactions) {
                                message.warning(intl.formatMessage({ id: 'account.cannotDelete', defaultMessage: '该账户已有交易记录，无法删除' }));
                                return;
                              }
                              Modal.confirm({
                                title: intl.formatMessage({ id: 'account.confirmDelete', defaultMessage: '确认删除' }),
                                content: intl.formatMessage({ id: 'account.confirmDeleteMessage', defaultMessage: '确定要删除账户 "{name}" 吗？此操作不可恢复。' }, { name: account.name }),
                                okText: intl.formatMessage({ id: 'common.confirm', defaultMessage: '确认' }),
                                cancelText: intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' }),
                                okButtonProps: { loading: deleteLoading },
                                onOk: () => handleDelete(account)
                              });
                            }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          ) : (
            <Empty 
              description={intl.formatMessage({ id: 'account.empty', defaultMessage: '暂无账户，请添加账户' })}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showAddModal}
              >
                <FormattedMessage id="account.add" defaultMessage="添加账户" />
              </Button>
            </Empty>
          )}
        </div>
      </Card>
      
      <Modal
        title={modalTitle}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <AccountForm 
          account={currentAccount} 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  );
};

export default AccountManagement; 