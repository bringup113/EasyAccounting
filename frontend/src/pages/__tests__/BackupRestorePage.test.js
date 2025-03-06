import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import BackupRestorePage from '../BackupRestorePage';

// 模拟组件
jest.mock('../../components/BackupRestore', () => {
  return function MockBackupRestore() {
    return <div data-testid="backup-restore">备份与恢复组件</div>;
  };
});

jest.mock('../../components/ExportDataCard', () => {
  return function MockExportDataCard() {
    return <div data-testid="export-data-card">数据导出组件</div>;
  };
});

// 创建模拟 store
const mockStore = configureStore([thunk]);

describe('BackupRestorePage 页面测试', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      book: {
        currentBook: {
          id: 'book-1',
          name: '测试账本'
        }
      }
    });
  });
  
  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <IntlProvider locale="zh-CN" messages={{}}>
          <BackupRestorePage />
        </IntlProvider>
      </Provider>
    );
  };
  
  it('应该正确渲染页面', () => {
    renderComponent();
    
    expect(screen.getByText('备份与数据导出')).toBeInTheDocument();
    expect(screen.getByText('管理您的数据备份和导出')).toBeInTheDocument();
  });
  
  it('应该包含备份与恢复组件', () => {
    renderComponent();
    
    expect(screen.getByTestId('backup-restore')).toBeInTheDocument();
    expect(screen.getByText('备份与恢复组件')).toBeInTheDocument();
  });
  
  it('应该包含数据导出组件', () => {
    renderComponent();
    
    expect(screen.getByTestId('export-data-card')).toBeInTheDocument();
    expect(screen.getByText('数据导出组件')).toBeInTheDocument();
  });
  
  it('应该使用响应式布局', () => {
    const { container } = renderComponent();
    
    // 检查是否使用了 Row 和 Col 组件
    const rowElement = container.querySelector('.ant-row');
    const colElements = container.querySelectorAll('.ant-col');
    
    expect(rowElement).toBeInTheDocument();
    expect(colElements.length).toBe(2);
  });
}); 