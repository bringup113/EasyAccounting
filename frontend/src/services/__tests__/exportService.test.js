import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { 
  exportToJson, 
  exportToCsv, 
  exportToExcel, 
  formatTransactionsForExport, 
  formatAccountsForExport 
} from '../exportService';
import { mockTransactions, mockAccounts } from '../../__mocks__/mockData';

// 模拟依赖
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

// 模拟 xlsx
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(() => ({})),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn()
  },
  write: jest.fn(() => new Uint8Array())
}));

describe('导出服务测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToJson', () => {
    it('应该将数据导出为JSON文件', () => {
      const data = { test: 'data' };
      const fileName = 'test-export';
      
      exportToJson(data, fileName);
      
      expect(saveAs).toHaveBeenCalledTimes(1);
      // 验证Blob参数
      const blobArg = saveAs.mock.calls[0][0];
      expect(blobArg instanceof Blob).toBe(true);
      expect(blobArg.type).toBe('application/json');
      
      // 验证文件名参数
      const fileNameArg = saveAs.mock.calls[0][1];
      expect(fileNameArg).toContain(fileName);
      expect(fileNameArg).toContain(dayjs().format('YYYY-MM-DD'));
      expect(fileNameArg).toContain('.json');
    });
  });

  describe('exportToCsv', () => {
    it('应该将数据导出为CSV文件', () => {
      const data = [{ id: 1, name: 'Test' }];
      const fileName = 'test-export';
      
      exportToCsv(data, fileName);
      
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(data);
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.write).toHaveBeenCalledWith(expect.anything(), { 
        bookType: 'csv', 
        type: 'array' 
      });
      expect(saveAs).toHaveBeenCalledTimes(1);
      
      // 验证Blob参数
      const blobArg = saveAs.mock.calls[0][0];
      expect(blobArg instanceof Blob).toBe(true);
      expect(blobArg.type).toBe('text/csv;charset=utf-8;');
      
      // 验证文件名参数
      const fileNameArg = saveAs.mock.calls[0][1];
      expect(fileNameArg).toContain(fileName);
      expect(fileNameArg).toContain('.csv');
    });
  });

  describe('exportToExcel', () => {
    it('应该将单个工作表数据导出为Excel文件', () => {
      const data = [{ id: 1, name: 'Test' }];
      const fileName = 'test-export';
      
      exportToExcel(data, fileName);
      
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(data);
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.write).toHaveBeenCalledWith(expect.anything(), { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      expect(saveAs).toHaveBeenCalledTimes(1);
      
      // 验证文件名参数
      const fileNameArg = saveAs.mock.calls[0][1];
      expect(fileNameArg).toContain(fileName);
      expect(fileNameArg).toContain('.xlsx');
    });

    it('应该将多个工作表数据导出为Excel文件', () => {
      const data = [
        [{ id: 1, name: 'Sheet1 Data' }],
        [{ id: 2, name: 'Sheet2 Data' }]
      ];
      const fileName = 'test-export';
      const sheetNames = ['Sheet1', 'Sheet2'];
      
      exportToExcel(data, fileName, sheetNames);
      
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledTimes(2);
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(2);
      expect(saveAs).toHaveBeenCalledTimes(1);
    });
  });

  describe('formatTransactionsForExport', () => {
    it('应该正确格式化交易记录数据', () => {
      const transactions = [
        {
          _id: 'tx1',
          type: 'expense',
          amount: 100,
          accountId: 'acc1',
          categoryId: 'cat1',
          description: '午餐',
          date: '2023-01-01T12:00:00Z',
          personIds: ['p1', 'p2'],
          tagIds: ['t1'],
          createdAt: '2023-01-01T12:30:00Z'
        }
      ];
      
      const accounts = [
        { _id: 'acc1', name: '现金', currency: 'CNY' }
      ];
      
      const categories = [
        { _id: 'cat1', name: '餐饮' }
      ];
      
      const persons = [
        { _id: 'p1', name: '张三' },
        { _id: 'p2', name: '李四' }
      ];
      
      const tags = [
        { _id: 't1', name: '必要' }
      ];
      
      const options = {
        accounts,
        categories,
        persons,
        tags,
        includeIds: true,
        dateFormat: 'YYYY-MM-DD'
      };
      
      const result = formatTransactionsForExport(transactions, options);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        日期: '2023-01-01',
        类型: '支出',
        金额: 100,
        账户: '现金',
        货币: 'CNY',
        类别: '餐饮',
        描述: '午餐',
        相关人员: '张三, 李四',
        标签: '必要',
        创建时间: '2023-01-01',
        ID: 'tx1',
        账户ID: 'acc1',
        类别ID: 'cat1'
      });
    });

    it('应该处理缺失的关联数据', () => {
      const transactions = [
        {
          _id: 'tx1',
          type: 'expense',
          amount: 100,
          accountId: 'acc1',
          categoryId: 'cat1',
          date: '2023-01-01T12:00:00Z',
          createdAt: '2023-01-01T12:30:00Z'
        }
      ];
      
      const result = formatTransactionsForExport(transactions);
      
      expect(result).toHaveLength(1);
      expect(result[0].账户).toBe('');
      expect(result[0].类别).toBe('');
      expect(result[0].相关人员).toBe('');
      expect(result[0].标签).toBe('');
    });
  });

  describe('formatAccountsForExport', () => {
    it('应该正确格式化账户数据', () => {
      const accounts = [
        {
          _id: 'acc1',
          name: '现金',
          initialBalance: 1000,
          currency: 'CNY',
          bookId: 'book1',
          createdAt: '2023-01-01T10:00:00Z'
        }
      ];
      
      const options = {
        includeIds: true,
        dateFormat: 'YYYY-MM-DD'
      };
      
      const result = formatAccountsForExport(accounts, options);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        账户名称: '现金',
        初始余额: 1000,
        货币: 'CNY',
        创建时间: '2023-01-01',
        ID: 'acc1',
        账本ID: 'book1'
      });
    });

    it('应该不包含ID字段当includeIds为false', () => {
      const accounts = [
        {
          _id: 'acc1',
          name: '现金',
          initialBalance: 1000,
          currency: 'CNY',
          bookId: 'book1',
          createdAt: '2023-01-01T10:00:00Z'
        }
      ];
      
      const result = formatAccountsForExport(accounts);
      
      expect(result).toHaveLength(1);
      expect(result[0].ID).toBeUndefined();
      expect(result[0].账本ID).toBeUndefined();
    });
  });
}); 