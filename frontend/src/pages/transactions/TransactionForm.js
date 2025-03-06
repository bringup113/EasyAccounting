import { sendTransactionNotification, sendErrorNotification } from '../../services/notificationService';

// 在成功创建或更新交易记录后
dispatch(createTransaction(values))
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
    onSuccess();
  })
  .catch((error) => {
    sendErrorNotification(dispatch, {
      title: intl.formatMessage({ id: 'transaction.createError', defaultMessage: '创建交易记录失败' }),
      message: error.message
    });
  });

// 在成功更新交易记录后
dispatch(updateTransaction({ id: transaction._id, transactionData: values }))
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
    onSuccess();
  })
  .catch((error) => {
    sendErrorNotification(dispatch, {
      title: intl.formatMessage({ id: 'transaction.editError', defaultMessage: '编辑交易记录失败' }),
      message: error.message
    });
  }); 