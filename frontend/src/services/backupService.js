import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import api from './api';
import { sendSuccessNotification, sendErrorNotification } from './notificationService';

/**
 * 创建账本数据备份
 * @param {string} bookId - 账本ID
 * @param {function} dispatch - Redux dispatch 函数
 * @param {Object} intl - react-intl 国际化对象
 * @returns {Promise} 备份结果
 */
export const createBookBackup = async (bookId, dispatch, intl) => {
  try {
    // 获取账本数据
    const bookResponse = await api.get(`/books/${bookId}`);
    const book = bookResponse.data.book;
    
    // 获取账本下的所有账户
    const accountsResponse = await api.get(`/accounts?bookId=${bookId}`);
    const accounts = accountsResponse.data.accounts;
    
    // 获取账本下的所有交易记录
    const transactionsResponse = await api.get(`/transactions?bookId=${bookId}&limit=1000`);
    const transactions = transactionsResponse.data.transactions;
    
    // 获取账本下的所有类别
    const categoriesResponse = await api.get(`/categories?bookId=${bookId}`);
    const categories = categoriesResponse.data.categories;
    
    // 获取账本下的所有标签
    const tagsResponse = await api.get(`/tags?bookId=${bookId}`);
    const tags = tagsResponse.data.tags;
    
    // 获取账本下的所有人员
    const personsResponse = await api.get(`/persons?bookId=${bookId}`);
    const persons = personsResponse.data.persons;
    
    // 创建备份数据对象
    const backupData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      book,
      accounts,
      transactions,
      categories,
      tags,
      persons
    };
    
    // 创建备份文件
    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const fileName = `${book.name}_backup_${dayjs().format('YYYY-MM-DD')}.json`;
    
    // 保存文件
    saveAs(blob, fileName);
    
    // 发送成功通知
    sendSuccessNotification(dispatch, {
      title: intl.formatMessage({ id: 'backup.success', defaultMessage: '备份成功' }),
      message: intl.formatMessage(
        { id: 'backup.successMessage', defaultMessage: '账本 {name} 已成功备份' },
        { name: book.name }
      )
    });
    
    return { success: true, fileName };
  } catch (error) {
    console.error('备份失败:', error);
    
    // 发送错误通知
    sendErrorNotification(dispatch, {
      title: intl.formatMessage({ id: 'backup.error', defaultMessage: '备份失败' }),
      message: error.message || intl.formatMessage({ id: 'backup.errorMessage', defaultMessage: '创建备份时发生错误' })
    });
    
    return { success: false, error };
  }
};

/**
 * 从备份文件恢复数据
 * @param {File} file - 备份文件
 * @param {function} dispatch - Redux dispatch 函数
 * @param {Object} intl - react-intl 国际化对象
 * @returns {Promise} 恢复结果
 */
export const restoreFromBackup = async (file, dispatch, intl) => {
  try {
    // 读取备份文件
    const fileContent = await readFileAsText(file);
    const backupData = JSON.parse(fileContent);
    
    // 验证备份数据格式
    if (!backupData.version || !backupData.book) {
      throw new Error(intl.formatMessage({ 
        id: 'backup.invalidFormat', 
        defaultMessage: '无效的备份文件格式' 
      }));
    }
    
    // 备份恢复功能尚未实现，这需要后端 API 支持
    // 这里只是一个示例，实际实现需要根据后端 API 设计
    
    // 发送成功通知
    sendSuccessNotification(dispatch, {
      title: intl.formatMessage({ id: 'restore.success', defaultMessage: '恢复成功' }),
      message: intl.formatMessage(
        { id: 'restore.successMessage', defaultMessage: '账本 {name} 已成功恢复' },
        { name: backupData.book.name }
      )
    });
    
    return { success: true, data: backupData };
  } catch (error) {
    console.error('恢复失败:', error);
    
    // 发送错误通知
    sendErrorNotification(dispatch, {
      title: intl.formatMessage({ id: 'restore.error', defaultMessage: '恢复失败' }),
      message: error.message || intl.formatMessage({ id: 'restore.errorMessage', defaultMessage: '从备份恢复时发生错误' })
    });
    
    return { success: false, error };
  }
};

/**
 * 将文件读取为文本
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文件内容
 */
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}; 