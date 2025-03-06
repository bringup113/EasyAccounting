import { addLocalNotification } from '../store/notificationSlice';

// 通知类型
export const NotificationType = {
  TRANSACTION: 'transaction',
  ACCOUNT: 'account',
  BOOK: 'book',
  MEMBER: 'member',
  SYSTEM: 'system',
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  INFO: 'info'
};

// 发送通知
export const sendNotification = (dispatch, { title, message, type }) => {
  dispatch(addLocalNotification({
    title,
    message,
    type
  }));
};

// 发送交易通知
export const sendTransactionNotification = (dispatch, { title, message }) => {
  sendNotification(dispatch, {
    title,
    message,
    type: NotificationType.TRANSACTION
  });
};

// 发送账户通知
export const sendAccountNotification = (dispatch, { title, message }) => {
  sendNotification(dispatch, {
    title,
    message,
    type: NotificationType.ACCOUNT
  });
};

// 发送账本通知
export const sendBookNotification = (dispatch, { title, message }) => {
  sendNotification(dispatch, {
    title,
    message,
    type: NotificationType.BOOK
  });
};

// 发送成员通知
export const sendMemberNotification = (dispatch, { title, message }) => {
  sendNotification(dispatch, {
    title,
    message,
    type: NotificationType.MEMBER
  });
};

// 发送系统通知
export const sendSystemNotification = (dispatch, { title, message }) => {
  sendNotification(dispatch, {
    title,
    message,
    type: NotificationType.SYSTEM
  });
};

// 发送错误通知
export const sendErrorNotification = (dispatch, { title, message }) => {
  sendNotification(dispatch, {
    title,
    message,
    type: NotificationType.ERROR
  });
};

// 发送警告通知
export const sendWarningNotification = (dispatch, { title, message }) => {
  sendNotification(dispatch, {
    title,
    message,
    type: NotificationType.WARNING
  });
};

// 发送成功通知
export const sendSuccessNotification = (dispatch, { title, message }) => {
  sendNotification(dispatch, {
    title,
    message,
    type: NotificationType.SUCCESS
  });
};

// 发送信息通知
export const sendInfoNotification = (dispatch, { title, message }) => {
  sendNotification(dispatch, {
    title,
    message,
    type: NotificationType.INFO
  });
}; 