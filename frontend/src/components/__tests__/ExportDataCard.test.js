import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { configureStore } from '@reduxjs/toolkit';
import ExportDataCard from '../ExportDataCard';
import api from '../../services/api';
import { formatTransactionsForExport, formatAccountsForExport } from '../../services/exportService';
import { sendErrorNotification } from '../../services/notificationService';

// 模拟导出服务
jest.mock('../../services/exportService', () => ({
  formatTransactionsForExport: jest.fn(data => data),
  formatAccountsForExport: jest.fn(data => data),
  exportToExcel: jest.fn(),
  exportToCsv: jest.fn(),
  exportToJson: jest.fn()
}));

jest.mock('../../services/notificationService', () => ({
  sendErrorNotification: jest.fn()
}));

// 模拟API服务
jest.mock('../../services/api', () => ({
  get: jest.fn()
}));

describe('ExportDataCard 组件测试', () => {
  // 模拟数据
  const mockTransactions = { transactions: [{ id: 1, amount: 100 }] };
  const mockAccounts = { accounts: [{ id: 1, name: '现金' }] };
  const mockCategories = { categories: [{ id: 1, name: '餐饮' }] };
  const mockTags = { tags: [{ id: 1, name: '工作' }] };
  const mockPersons = { persons: [{ id: 1, name: '张三' }] };

  // 设置API模拟实现
  beforeEach(() => {
    api.get.mockImplementation((url, config) => {
      if (url === '/transactions') return Promise.resolve({ data: mockTransactions });
      if (url.includes('/accounts')) return Promise.resolve({ data: mockAccounts });
      if (url.includes('/categories')) return Promise.resolve({ data: mockCategories });
      if (url.includes('/tags')) return Promise.resolve({ data: mockTags });
      if (url.includes('/persons')) return Promise.resolve({ data: mockPersons });
      return Promise.reject(new Error('未知URL'));
    });

    // 重置所有模拟
    jest.clearAllMocks();
  });

  // 创建一个带有当前账本的Redux store
  const createTestStore = (withCurrentBook = true) => {
    return configureStore({
      reducer: {
        book: {
          books: [
            { id: '123', name: '测试账本' }
          ],
          currentBook: withCurrentBook ? { id: '123', name: '测试账本' } : null,
          loading: false,
          error: null
        }
      }
    });
  };

  // 国际化消息
  const messages = {
    'export.title': '导出数据',
    'export.dataTypeLabel': '数据类型',
    'export.formatLabel': '导出格式',
    'export.transactions': '交易记录',
    'export.accounts': '账户',
    'export.categories': '类别',
    'export.tags': '标签',
    'export.persons': '人员',
    'export.exportButton': '导出数据',
    'export.noBookSelected': '请先选择一个账本',
    'export.success': '数据导出成功',
    'export.error': '导出失败',
    'export.helpTitle': '导出格式说明',
    'export.helpExcel': '适合用于电子表格软件中进行分析和处理。',
    'export.helpCsv': '逗号分隔值格式，可在大多数电子表格和数据分析软件中打开。',
    'export.helpJson': '适合开发人员或需要进行数据处理的用户。',
    'export.excel': 'Excel',
    'export.csv': 'CSV',
    'export.json': 'JSON'
  };

  test('应该正确渲染组件', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <IntlProvider locale="zh" messages={messages}>
          <ExportDataCard />
        </IntlProvider>
      </Provider>
    );

    // 验证组件渲染
    expect(screen.getByText('导出数据')).toBeInTheDocument();
    
    // 验证数据类型选项
    expect(screen.getByText('交易记录')).toBeInTheDocument();
    expect(screen.getByText('账户')).toBeInTheDocument();
    expect(screen.getByText('类别')).toBeInTheDocument();
    expect(screen.getByText('标签')).toBeInTheDocument();
    expect(screen.getByText('人员')).toBeInTheDocument();
    
    // 验证导出格式选项
    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    
    // 验证导出按钮
    const exportButton = screen.getByText('导出数据');
    expect(exportButton).toBeInTheDocument();
    expect(exportButton).not.toBeDisabled();
  });

  test('应该导出交易记录', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <IntlProvider locale="zh" messages={messages}>
          <ExportDataCard />
        </IntlProvider>
      </Provider>
    );

    // 选择交易记录
    fireEvent.change(screen.getByLabelText('数据类型'), { target: { value: 'transactions' } });
    
    // 选择Excel格式
    fireEvent.click(screen.getByLabelText('Excel'));
    
    // 点击导出按钮
    fireEvent.click(screen.getByText('导出数据'));
    
    // 验证API调用和导出函数调用
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/transactions', expect.any(Object));
    });
  });

  test('应该导出账户', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <IntlProvider locale="zh" messages={messages}>
          <ExportDataCard />
        </IntlProvider>
      </Provider>
    );

    // 选择账户
    fireEvent.change(screen.getByLabelText('数据类型'), { target: { value: 'accounts' } });
    
    // 选择CSV格式
    fireEvent.click(screen.getByLabelText('CSV'));
    
    // 点击导出按钮
    fireEvent.click(screen.getByText('导出数据'));
    
    // 验证API调用和导出函数调用
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/accounts?bookId=123');
    });
  });

  test('应该导出类别', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <IntlProvider locale="zh" messages={messages}>
          <ExportDataCard />
        </IntlProvider>
      </Provider>
    );

    // 选择类别
    fireEvent.change(screen.getByLabelText('数据类型'), { target: { value: 'categories' } });
    
    // 选择JSON格式
    fireEvent.click(screen.getByLabelText('JSON'));
    
    // 点击导出按钮
    fireEvent.click(screen.getByText('导出数据'));
    
    // 验证API调用和导出函数调用
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/categories?bookId=123');
    });
  });

  test('应该导出标签', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <IntlProvider locale="zh" messages={messages}>
          <ExportDataCard />
        </IntlProvider>
      </Provider>
    );

    // 选择标签
    fireEvent.change(screen.getByLabelText('数据类型'), { target: { value: 'tags' } });
    
    // 点击导出按钮
    fireEvent.click(screen.getByText('导出数据'));
    
    // 验证API调用和导出函数调用
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/tags?bookId=123');
    });
  });

  test('应该导出人员', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <IntlProvider locale="zh" messages={messages}>
          <ExportDataCard />
        </IntlProvider>
      </Provider>
    );

    // 选择人员
    fireEvent.change(screen.getByLabelText('数据类型'), { target: { value: 'persons' } });
    
    // 点击导出按钮
    fireEvent.click(screen.getByText('导出数据'));
    
    // 验证API调用和导出函数调用
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/persons?bookId=123');
    });
  });

  test('应该处理API错误', async () => {
    const store = createTestStore();
    
    // 模拟API错误
    api.get.mockRejectedValueOnce(new Error('API错误'));
    
    render(
      <Provider store={store}>
        <IntlProvider locale="zh" messages={messages}>
          <ExportDataCard />
        </IntlProvider>
      </Provider>
    );
    
    // 点击导出按钮
    fireEvent.click(screen.getByText('导出数据'));
    
    // 验证错误处理
    await waitFor(() => {
      expect(sendErrorNotification).toHaveBeenCalled();
    });
  });

  test('当没有选择账本时应该禁用导出按钮', () => {
    const storeWithoutBook = createTestStore(false);
    
    render(
      <Provider store={storeWithoutBook}>
        <IntlProvider locale="zh" messages={messages}>
          <ExportDataCard />
        </IntlProvider>
      </Provider>
    );
    
    // 验证导出按钮被禁用
    const exportButton = screen.getByText('导出数据');
    expect(exportButton).toBeDisabled();
  });
}); 