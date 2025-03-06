import { formatBackupData, parseBackupData } from '../backupService';
import { saveAs } from 'file-saver';
import api from '../api';
import { createBookBackup, restoreFromBackup } from '../backupService';
import { sendSuccessNotification, sendErrorNotification } from '../notificationService';

// 模拟依赖
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

jest.mock('../api', () => ({
  get: jest.fn()
}));

jest.mock('../notificationService', () => ({
  sendSuccessNotification: jest.fn(),
  sendErrorNotification: jest.fn()
}));

describe('backupService', () => {
  const mockDispatch = jest.fn();
  const mockIntl = {
    formatMessage: jest.fn(({ id, defaultMessage }) => defaultMessage)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatBackupData', () => {
    it('应该正确格式化备份数据', () => {
      const data = {
        books: [{ id: '1', name: '个人账本' }],
        accounts: [{ id: '1', name: '现金', bookId: '1' }],
        categories: [{ id: '1', name: '餐饮', type: 'expense', bookId: '1' }],
        transactions: [{ id: '1', amount: 100, bookId: '1' }]
      };
      
      const result = formatBackupData(data);
      
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(data);
    });
  });
  
  describe('parseBackupData', () => {
    it('应该正确解析备份数据', () => {
      const backupData = {
        version: '1.0',
        timestamp: Date.now(),
        data: {
          books: [{ id: '1', name: '个人账本' }],
          accounts: [{ id: '1', name: '现金', bookId: '1' }],
          categories: [{ id: '1', name: '餐饮', type: 'expense', bookId: '1' }],
          transactions: [{ id: '1', amount: 100, bookId: '1' }]
        }
      };
      
      const result = parseBackupData(JSON.stringify(backupData));
      
      expect(result).toEqual(backupData.data);
    });
    
    it('应该处理无效的备份数据', () => {
      expect(() => {
        parseBackupData('invalid json');
      }).toThrow();
      
      expect(() => {
        parseBackupData(JSON.stringify({ invalid: 'data' }));
      }).toThrow();
    });
  });

  describe('createBookBackup', () => {
    it('应该成功创建备份', async () => {
      // 模拟 API 响应
      api.get.mockImplementation((url) => {
        if (url.includes('/books/')) {
          return Promise.resolve({ data: { book: { id: '1', name: '个人账本' } } });
        } else if (url.includes('/accounts')) {
          return Promise.resolve({ data: { accounts: [{ id: '1', name: '现金' }] } });
        } else if (url.includes('/transactions')) {
          return Promise.resolve({ data: { transactions: [{ id: '1', amount: 100 }] } });
        } else if (url.includes('/categories')) {
          return Promise.resolve({ data: { categories: [{ id: '1', name: '餐饮' }] } });
        } else if (url.includes('/tags')) {
          return Promise.resolve({ data: { tags: [{ id: '1', name: '必要' }] } });
        } else if (url.includes('/persons')) {
          return Promise.resolve({ data: { persons: [{ id: '1', name: '张三' }] } });
        }
        return Promise.reject(new Error('未知 URL'));
      });

      // 调用函数
      const result = await createBookBackup('1', mockDispatch, mockIntl);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.fileName).toBeDefined();
      expect(saveAs).toHaveBeenCalled();
      expect(sendSuccessNotification).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledTimes(6);
    });

    it('应该处理备份失败', async () => {
      // 模拟 API 错误
      api.get.mockRejectedValue(new Error('API 错误'));

      // 调用函数
      const result = await createBookBackup('1', mockDispatch, mockIntl);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(sendErrorNotification).toHaveBeenCalled();
    });
  });

  describe('restoreFromBackup', () => {
    it('应该成功恢复备份', async () => {
      // 模拟文件内容
      const mockFile = new File(
        [JSON.stringify({ version: '1.0', book: { id: '1', name: '个人账本' } })],
        'backup.json',
        { type: 'application/json' }
      );

      // 模拟 FileReader
      global.FileReader = class {
        constructor() {
          this.onload = null;
          this.onerror = null;
        }
        readAsText() {
          setTimeout(() => {
            this.onload({ target: { result: JSON.stringify({ version: '1.0', book: { id: '1', name: '个人账本' } }) } });
          }, 0);
        }
      };

      // 调用函数
      const result = await restoreFromBackup(mockFile, mockDispatch, mockIntl);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(sendSuccessNotification).toHaveBeenCalled();
    });

    it('应该处理无效的备份文件', async () => {
      // 模拟无效文件内容
      const mockFile = new File(
        [JSON.stringify({ invalid: 'data' })],
        'invalid.json',
        { type: 'application/json' }
      );

      // 模拟 FileReader
      global.FileReader = class {
        constructor() {
          this.onload = null;
          this.onerror = null;
        }
        readAsText() {
          setTimeout(() => {
            this.onload({ target: { result: JSON.stringify({ invalid: 'data' }) } });
          }, 0);
        }
      };

      // 调用函数
      const result = await restoreFromBackup(mockFile, mockDispatch, mockIntl);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(sendErrorNotification).toHaveBeenCalled();
    });

    it('应该处理文件读取错误', async () => {
      // 模拟文件
      const mockFile = new File([''], 'error.json', { type: 'application/json' });

      // 模拟 FileReader 错误
      global.FileReader = class {
        constructor() {
          this.onload = null;
          this.onerror = null;
        }
        readAsText() {
          setTimeout(() => {
            this.onerror(new Error('文件读取错误'));
          }, 0);
        }
      };

      // 调用函数
      const result = await restoreFromBackup(mockFile, mockDispatch, mockIntl);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(sendErrorNotification).toHaveBeenCalled();
    });
  });
}); 