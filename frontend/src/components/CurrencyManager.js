import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, Table, Button, Modal, Form, Input, 
  InputNumber, Space, Typography, Popconfirm 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { 
  addCurrency, 
  updateCurrencyRate, 
  deleteCurrency 
} from '../store/bookSlice';
import { sendBookNotification, sendErrorNotification } from '../services/notificationService';
import { useIntl } from 'react-intl';

const { Title } = Typography;

const CurrencyManager = ({ bookId }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { currentBook, defaultCurrencies, loading } = useSelector((state) => state.books);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState(null);
  const [form] = Form.useForm();

  // 获取当前账本的货币列表
  const currencies = currentBook?.currencies || [];
  
  // 获取默认货币（本位币）
  const defaultCurrency = currentBook?.defaultCurrency || 'CNY';

  // 打开添加货币的模态框
  const showAddModal = () => {
    setIsEditMode(false);
    setCurrentCurrency(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑货币的模态框
  const showEditModal = (currency) => {
    setIsEditMode(true);
    setCurrentCurrency(currency);
    form.setFieldsValue({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchangeRate: currency.exchangeRate,
    });
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 处理添加或更新货币
  const handleOk = () => {
    form.validateFields().then((values) => {
      if (isEditMode) {
        // 更新货币汇率
        dispatch(updateCurrencyRate({
          id: bookId,
          code: currentCurrency.code,
          rate: values.exchangeRate
        }))
          .unwrap()
          .then(() => {
            sendBookNotification(dispatch, {
              title: intl.formatMessage({ id: 'currency.updateSuccess', defaultMessage: '货币汇率更新成功' }),
              message: intl.formatMessage(
                { id: 'currency.updateSuccessMessage', defaultMessage: '{code} 的汇率已更新为 {rate}' },
                { code: currentCurrency.code, rate: values.exchangeRate }
              )
            });
            setIsModalVisible(false);
          })
          .catch((err) => {
            sendErrorNotification(dispatch, {
              title: intl.formatMessage({ id: 'currency.updateError', defaultMessage: '货币汇率更新失败' }),
              message: err.toString()
            });
          });
      } else {
        // 添加新货币
        dispatch(addCurrency({
          id: bookId,
          currencyData: values
        }))
          .unwrap()
          .then(() => {
            sendBookNotification(dispatch, {
              title: intl.formatMessage({ id: 'currency.addSuccess', defaultMessage: '货币添加成功' }),
              message: intl.formatMessage(
                { id: 'currency.addSuccessMessage', defaultMessage: '已成功添加 {name} ({code})' },
                { name: values.name, code: values.code }
              )
            });
            setIsModalVisible(false);
          })
          .catch((err) => {
            sendErrorNotification(dispatch, {
              title: intl.formatMessage({ id: 'currency.addError', defaultMessage: '货币添加失败' }),
              message: err.toString()
            });
          });
      }
    });
  };

  // 处理删除货币
  const handleDelete = (code) => {
    dispatch(deleteCurrency({ id: bookId, code }))
      .unwrap()
      .then(() => {
        sendBookNotification(dispatch, {
          title: intl.formatMessage({ id: 'currency.deleteSuccess', defaultMessage: '货币删除成功' }),
          message: intl.formatMessage(
            { id: 'currency.deleteSuccessMessage', defaultMessage: '已成功删除货币 {code}' },
            { code: code }
          )
        });
      })
      .catch((err) => {
        sendErrorNotification(dispatch, {
          title: intl.formatMessage({ id: 'currency.deleteError', defaultMessage: '货币删除失败' }),
          message: err.toString()
        });
      });
  };

  // 表格列定义
  const columns = [
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '符号',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '汇率',
      dataIndex: 'exchangeRate',
      key: 'exchangeRate',
      render: (text, record) => {
        // 本位币汇率固定为1，不可编辑
        if (record.code === defaultCurrency) {
          return <span>1.00 (本位币)</span>;
        }
        return text;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        // 默认货币（CNY, USD, THB）不能删除，本位币不能编辑汇率
        const isDefaultSystemCurrency = ['CNY', 'USD', 'THB'].includes(record.code);
        const isBaseCurrency = record.code === defaultCurrency;
        
        return (
          <Space size="middle">
            {!isBaseCurrency && (
              <Button
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)}
                size="small"
                type="primary"
              >
                编辑汇率
              </Button>
            )}
            {!isDefaultSystemCurrency && !isBaseCurrency && (
              <Popconfirm
                title="确定要删除这个货币吗？"
                description="删除后，使用此货币的账户将无法正常工作。"
                onConfirm={() => handleDelete(record.code)}
                okText="确定"
                cancelText="取消"
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              >
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                >
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  // 可选的货币列表（用于添加新货币时）
  const availableCurrencies = defaultCurrencies.filter(
    (currency) => !currencies.some((c) => c.code === currency.code)
  );

  return (
    <Card title="货币管理" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            disabled={availableCurrencies.length === 0}
          >
            添加货币
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={currencies}
          rowKey="code"
          loading={loading}
          pagination={false}
        />
        
        <Modal
          title={isEditMode ? "编辑货币汇率" : "添加货币"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loading}
        >
          <Form
            form={form}
            layout="vertical"
          >
            {!isEditMode && (
              <>
                <Form.Item
                  name="code"
                  label="货币代码"
                  rules={[{ required: true, message: '请选择货币代码' }]}
                >
                  <Input disabled={isEditMode} />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="货币名称"
                  rules={[{ required: true, message: '请输入货币名称' }]}
                >
                  <Input disabled={isEditMode} />
                </Form.Item>
                <Form.Item
                  name="symbol"
                  label="货币符号"
                  rules={[{ required: true, message: '请输入货币符号' }]}
                >
                  <Input disabled={isEditMode} />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="exchangeRate"
              label={`汇率 (相对于${defaultCurrency})`}
              rules={[
                { required: true, message: '请输入汇率' },
                { type: 'number', min: 0.000001, message: '汇率必须大于0' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                precision={6}
                step={0.1}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Card>
  );
};

export default CurrencyManager; 