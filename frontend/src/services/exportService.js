import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

/**
 * 导出数据为 JSON 文件
 * @param {Object} data - 要导出的数据
 * @param {string} fileName - 文件名（不含扩展名）
 */
export const exportToJson = (data, fileName) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${fileName}_${dayjs().format('YYYY-MM-DD')}.json`);
};

/**
 * 导出数据为 CSV 文件
 * @param {Array} data - 要导出的数据数组
 * @param {string} fileName - 文件名（不含扩展名）
 */
export const exportToCsv = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // 生成 CSV 文件
  const csvOutput = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}_${dayjs().format('YYYY-MM-DD')}.csv`);
};

/**
 * 导出数据为 Excel 文件
 * @param {Array} data - 要导出的数据数组
 * @param {string} fileName - 文件名（不含扩展名）
 * @param {Array} sheetNames - 工作表名称数组
 */
export const exportToExcel = (data, fileName, sheetNames = ['Sheet1']) => {
  const workbook = XLSX.utils.book_new();
  
  if (Array.isArray(data[0])) {
    // 多个工作表
    data.forEach((sheetData, index) => {
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(
        workbook, 
        worksheet, 
        sheetNames[index] || `Sheet${index + 1}`
      );
    });
  } else {
    // 单个工作表
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetNames[0]);
  }
  
  // 生成 Excel 文件
  const excelOutput = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelOutput], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
};

/**
 * 格式化交易记录数据用于导出
 * @param {Array} transactions - 交易记录数组
 * @param {Object} options - 格式化选项
 * @returns {Array} 格式化后的数据
 */
export const formatTransactionsForExport = (transactions, options = {}) => {
  const { 
    accounts = [], 
    categories = [], 
    persons = [], 
    tags = [],
    includeIds = false,
    dateFormat = 'YYYY-MM-DD HH:mm'
  } = options;
  
  return transactions.map(transaction => {
    // 查找关联数据
    const account = accounts.find(a => a._id === transaction.accountId) || {};
    const category = categories.find(c => c._id === transaction.categoryId) || {};
    const relatedPersons = transaction.personIds
      ? transaction.personIds.map(id => {
          const person = persons.find(p => p._id === id);
          return person ? person.name : '';
        }).filter(Boolean).join(', ')
      : '';
    const relatedTags = transaction.tagIds
      ? transaction.tagIds.map(id => {
          const tag = tags.find(t => t._id === id);
          return tag ? tag.name : '';
        }).filter(Boolean).join(', ')
      : '';
    
    // 构建导出数据
    const exportData = {
      日期: dayjs(transaction.date).format(dateFormat),
      类型: transaction.type === 'income' ? '收入' : 
            transaction.type === 'expense' ? '支出' : '借支',
      金额: transaction.amount,
      账户: account.name || '',
      货币: account.currency || '',
      类别: category.name || '',
      描述: transaction.description || '',
      人员机构: relatedPersons,
      标签: relatedTags,
      创建时间: dayjs(transaction.createdAt).format(dateFormat)
    };
    
    // 可选包含 ID
    if (includeIds) {
      exportData.ID = transaction._id;
      exportData.账户ID = transaction.accountId;
      exportData.类别ID = transaction.categoryId;
    }
    
    return exportData;
  });
};

/**
 * 格式化账户数据用于导出
 * @param {Array} accounts - 账户数组
 * @param {Object} options - 格式化选项
 * @returns {Array} 格式化后的数据
 */
export const formatAccountsForExport = (accounts, options = {}) => {
  const { 
    includeIds = false,
    dateFormat = 'YYYY-MM-DD HH:mm'
  } = options;
  
  return accounts.map(account => {
    // 构建导出数据
    const exportData = {
      账户名称: account.name,
      初始余额: account.initialBalance,
      货币: account.currency,
      创建时间: dayjs(account.createdAt).format(dateFormat)
    };
    
    // 可选包含 ID
    if (includeIds) {
      exportData.ID = account._id;
      exportData.账本ID = account.bookId;
    }
    
    return exportData;
  });
}; 