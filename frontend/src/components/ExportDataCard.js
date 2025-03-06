import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Card, Button, Select, Form, Radio, DatePicker, Spin, message, Typography, Space, Divider } from 'antd';
import { FileExcelOutlined, FileTextOutlined, FileOutlined } from '@ant-design/icons';
import api from '../services/api';
import { formatTransactionsForExport, formatAccountsForExport } from '../services/exportService';
import { sendErrorNotification } from '../services/notificationService';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * 数据导出卡片组件
 */
const ExportDataCard = ({ exportToJson, exportToCsv, exportToExcel }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // 从Redux获取当前账本ID
  const currentBookId = useSelector(state => state.book.currentBook?.id);
  const currentBookName = useSelector(state => state.book.currentBook?.name);
  
  // 导出数据类型选项
  const dataTypeOptions = [
    { label: intl.formatMessage({ id: 'export.transactions', defaultMessage: '交易记录' }), value: 'transactions' },
    { label: intl.formatMessage({ id: 'export.accounts', defaultMessage: '账户' }), value: 'accounts' },
    { label: intl.formatMessage({ id: 'export.categories', defaultMessage: '类别' }), value: 'categories' },
    { label: intl.formatMessage({ id: 'export.tags', defaultMessage: '标签' }), value: 'tags' },
    { label: intl.formatMessage({ id: 'export.persons', defaultMessage: '人员' }), value: 'persons' },
  ];
  
  // 导出格式选项
  const formatOptions = [
    { label: 'Excel', value: 'excel', icon: <FileExcelOutlined /> },
    { label: 'CSV', value: 'csv', icon: <FileTextOutlined /> },
    { label: 'JSON', value: 'json', icon: <FileOutlined /> },
  ];
  
  // 处理导出
  const handleExport = async (values) => {
    if (!currentBookId) {
      message.error(intl.formatMessage({ 
        id: 'export.noBookSelected', 
        defaultMessage: '请先选择一个账本' 
      }));
      return;
    }
    
    setLoading(true);
    
    try {
      const { dataType, format, dateRange, includeIds } = values;
      let data = [];
      let fileName = `${currentBookName}_${dataType}_${new Date().toISOString().split('T')[0]}`;
      
      // 根据数据类型获取数据
      switch (dataType) {
        case 'transactions':
          let params = { bookId: currentBookId, limit: 1000 };
          
          // 如果有日期范围，添加到参数中
          if (dateRange && dateRange.length === 2) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
          }
          
          const transactionsResponse = await api.get('/transactions', { params });
          data = formatTransactionsForExport(transactionsResponse.data.transactions, { includeIds });
          break;
          
        case 'accounts':
          const accountsResponse = await api.get(`/accounts?bookId=${currentBookId}`);
          data = formatAccountsForExport(accountsResponse.data.accounts, { includeIds });
          break;
          
        case 'categories':
          const categoriesResponse = await api.get(`/categories?bookId=${currentBookId}`);
          data = categoriesResponse.data.categories;
          if (!includeIds) {
            data = data.map(({ id, ...rest }) => rest);
          }
          break;
          
        case 'tags':
          const tagsResponse = await api.get(`/tags?bookId=${currentBookId}`);
          data = tagsResponse.data.tags;
          if (!includeIds) {
            data = data.map(({ id, ...rest }) => rest);
          }
          break;
          
        case 'persons':
          const personsResponse = await api.get(`/persons?bookId=${currentBookId}`);
          data = personsResponse.data.persons;
          if (!includeIds) {
            data = data.map(({ id, ...rest }) => rest);
          }
          break;
          
        default:
          throw new Error(intl.formatMessage({ 
            id: 'export.invalidDataType', 
            defaultMessage: '无效的数据类型' 
          }));
      }
      
      // 根据格式导出数据
      switch (format) {
        case 'excel':
          exportToExcel(data, fileName);
          break;
          
        case 'csv':
          exportToCsv(data, fileName);
          break;
          
        case 'json':
          exportToJson(data, fileName);
          break;
          
        default:
          throw new Error(intl.formatMessage({ 
            id: 'export.invalidFormat', 
            defaultMessage: '无效的导出格式' 
          }));
      }
      
      message.success(intl.formatMessage({ 
        id: 'export.success', 
        defaultMessage: '数据导出成功' 
      }));
    } catch (error) {
      console.error('导出数据时出错:', error);
      
      sendErrorNotification(dispatch, {
        title: intl.formatMessage({ id: 'export.error', defaultMessage: '导出失败' }),
        message: error.message || intl.formatMessage({ 
          id: 'export.errorMessage', 
          defaultMessage: '导出数据时发生错误' 
        })
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card title={intl.formatMessage({ id: 'export.title', defaultMessage: '数据导出' })}>
      <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={4}>
            {intl.formatMessage({ id: 'export.exportData', defaultMessage: '导出数据' })}
          </Title>
          <Paragraph>
            {intl.formatMessage({ 
              id: 'export.description', 
              defaultMessage: '将您的数据导出为多种格式，用于分析或备份。' 
            })}
          </Paragraph>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleExport}
            initialValues={{
              dataType: 'transactions',
              format: 'excel',
              includeIds: false
            }}
          >
            {/* 数据类型选择 */}
            <Form.Item
              name="dataType"
              label={intl.formatMessage({ id: 'export.dataTypeLabel', defaultMessage: '数据类型' })}
              rules={[{ required: true, message: intl.formatMessage({ id: 'export.dataTypeRequired', defaultMessage: '请选择要导出的数据类型' }) }]}
            >
              <Select>
                {dataTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            {/* 日期范围选择（仅交易记录） */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.dataType !== currentValues.dataType}
            >
              {({ getFieldValue }) => 
                getFieldValue('dataType') === 'transactions' ? (
                  <Form.Item
                    name="dateRange"
                    label={intl.formatMessage({ id: 'export.dateRangeLabel', defaultMessage: '日期范围' })}
                  >
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
            
            {/* 导出格式选择 */}
            <Form.Item
              name="format"
              label={intl.formatMessage({ id: 'export.formatLabel', defaultMessage: '导出格式' })}
              rules={[{ required: true, message: intl.formatMessage({ id: 'export.formatRequired', defaultMessage: '请选择导出格式' }) }]}
            >
              <Radio.Group>
                {formatOptions.map(option => (
                  <Radio.Button key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
            
            {/* 包含ID选项 */}
            <Form.Item
              name="includeIds"
              valuePropName="checked"
            >
              <Radio.Group>
                <Radio value={false}>
                  {intl.formatMessage({ id: 'export.excludeIds', defaultMessage: '仅导出基本数据' })}
                </Radio>
                <Radio value={true}>
                  {intl.formatMessage({ id: 'export.includeIds', defaultMessage: '包含ID和系统字段' })}
                </Radio>
              </Radio.Group>
            </Form.Item>
            
            {/* 导出按钮 */}
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={!currentBookId}
              >
                {intl.formatMessage({ id: 'export.exportButton', defaultMessage: '导出数据' })}
              </Button>
            </Form.Item>
          </Form>
          
          <Divider />
          
          {/* 帮助信息 */}
          <div>
            <Title level={5}>
              {intl.formatMessage({ id: 'export.helpTitle', defaultMessage: '导出格式说明' })}
            </Title>
            <Paragraph>
              <ul>
                <li>
                  <strong>Excel:</strong> {intl.formatMessage({ 
                    id: 'export.helpExcel', 
                    defaultMessage: '适合用于电子表格软件中进行分析和处理。' 
                  })}
                </li>
                <li>
                  <strong>CSV:</strong> {intl.formatMessage({ 
                    id: 'export.helpCsv', 
                    defaultMessage: '逗号分隔值格式，可在大多数电子表格和数据分析软件中打开。' 
                  })}
                </li>
                <li>
                  <strong>JSON:</strong> {intl.formatMessage({ 
                    id: 'export.helpJson', 
                    defaultMessage: '适合开发人员或需要进行数据处理的用户。' 
                  })}
                </li>
              </ul>
            </Paragraph>
          </div>
        </Space>
      </Spin>
    </Card>
  );
};

export default ExportDataCard; 