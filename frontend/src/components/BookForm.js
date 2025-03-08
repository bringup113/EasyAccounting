import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Row, Col, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { createBook, updateBook } from '../store/bookSlice';
import { sendBookNotification, sendErrorNotification } from '../services/notificationService';
import { useIntl, FormattedMessage } from 'react-intl';
import { SettingOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

// 系统默认货币列表
const DEFAULT_SYSTEM_CURRENCIES = [
  { code: 'CNY', name: '人民币', symbol: '¥' },
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'THB', name: '泰铢', symbol: '฿' }
];

const BookForm = ({ book, initialValues, onSuccess, onCancel, isEdit, renderExtraFooter }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const intl = useIntl();
  const { loading, error } = useSelector((state) => state.books);
  
  // 从设置中获取货币列表，如果没有则使用默认货币
  const [availableCurrencies, setAvailableCurrencies] = useState(DEFAULT_SYSTEM_CURRENCIES);

  // 使用 book 或 initialValues 作为表单的初始值
  const bookData = book || initialValues;
  const isEditMode = isEdit || !!book;

  // 时区选项
  const timezoneOptions = [
    { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
    { value: 'Asia/Bangkok', label: '泰国时间 (UTC+7)' },
    { value: 'America/New_York', label: '美国东部时间 (UTC-5/UTC-4)' },
    { value: 'Europe/London', label: '英国时间 (UTC+0/UTC+1)' },
    { value: 'UTC', label: '协调世界时 (UTC)' },
  ];

  // 从本地存储获取货币列表
  useEffect(() => {
    try {
      const storedCurrencies = localStorage.getItem('availableCurrencies');
      if (storedCurrencies) {
        const parsedCurrencies = JSON.parse(storedCurrencies);
        if (Array.isArray(parsedCurrencies) && parsedCurrencies.length > 0) {
          setAvailableCurrencies(parsedCurrencies);
        }
      }
    } catch (error) {
      console.error('获取货币列表失败:', error);
    }
  }, []);

  useEffect(() => {
    if (bookData) {
      form.setFieldsValue({
        name: bookData.name,
        description: bookData.description,
        timezone: bookData.timezone || 'Asia/Shanghai',
        defaultCurrency: bookData.defaultCurrency || 'CNY',
      });
    } else {
      form.setFieldsValue({
        timezone: 'Asia/Shanghai',
        defaultCurrency: 'CNY',
      });
    }
  }, [bookData, form]);

  useEffect(() => {
    if (error) {
      sendErrorNotification(dispatch, {
        title: intl.formatMessage({ id: 'book.error', defaultMessage: '账本操作失败' }),
        message: error
      });
    }
  }, [error, dispatch, intl]);

  const onFinish = (values) => {
    if (isEditMode) {
      // 更新账本
      dispatch(updateBook({ id: bookData._id, bookData: values }))
        .unwrap()
        .then(() => {
          sendBookNotification(dispatch, {
            title: intl.formatMessage({ id: 'book.updateSuccess', defaultMessage: '账本更新成功' }),
            message: intl.formatMessage(
              { id: 'book.updateSuccessMessage', defaultMessage: '账本 {name} 已成功更新' },
              { name: values.name }
            )
          });
          onSuccess && onSuccess();
        })
        .catch((err) => {
          sendErrorNotification(dispatch, {
            title: intl.formatMessage({ id: 'book.updateError', defaultMessage: '账本更新失败' }),
            message: err.toString()
          });
        });
    } else {
      // 创建账本
      dispatch(createBook(values))
        .unwrap()
        .then(() => {
          sendBookNotification(dispatch, {
            title: intl.formatMessage({ id: 'book.createSuccess', defaultMessage: '账本创建成功' }),
            message: intl.formatMessage(
              { id: 'book.createSuccessMessage', defaultMessage: '账本 {name} 已成功创建' },
              { name: values.name }
            )
          });
          onSuccess && onSuccess();
        })
        .catch((err) => {
          sendErrorNotification(dispatch, {
            title: intl.formatMessage({ id: 'book.createError', defaultMessage: '账本创建失败' }),
            message: err.toString()
          });
        });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      requiredMark="optional"
      initialValues={{
        timezone: 'Asia/Shanghai',
        defaultCurrency: 'CNY',
      }}
    >
      <Form.Item
        name="name"
        label={<FormattedMessage id="book.name" defaultMessage="账本名称" />}
        rules={[{ required: true, message: intl.formatMessage({ id: "book.name.required", defaultMessage: "请输入账本名称" }) }]}
      >
        <Input 
          placeholder={intl.formatMessage({ id: "book.name.placeholder", defaultMessage: "请输入账本名称" })} 
          autoFocus
          maxLength={100}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="description"
        label={<FormattedMessage id="book.description" defaultMessage="账本描述" />}
      >
        <TextArea
          placeholder={intl.formatMessage({ id: "book.description.placeholder", defaultMessage: "请输入账本描述" })}
          autoSize={{ minRows: 3, maxRows: 6 }}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="timezone"
            label={<FormattedMessage id="book.timezone" defaultMessage="时区" />}
            rules={[{ required: true, message: intl.formatMessage({ id: "book.timezone.required", defaultMessage: "请选择时区" }) }]}
          >
            <Select placeholder={intl.formatMessage({ id: "book.timezone.placeholder", defaultMessage: "请选择时区" })}>
              {timezoneOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="defaultCurrency"
            label={<FormattedMessage id="book.defaultCurrency" defaultMessage="本位币" />}
            rules={[{ required: true, message: intl.formatMessage({ id: "book.defaultCurrency.required", defaultMessage: "请选择本位币" }) }]}
            tooltip={intl.formatMessage({ id: "book.defaultCurrency.tooltip", defaultMessage: "本位币一旦设置后不可更改，所有汇率将基于本位币计算" })}
          >
            <Select 
              placeholder={intl.formatMessage({ id: "book.defaultCurrency.placeholder", defaultMessage: "请选择本位币" })}
              disabled={isEditMode} // 编辑模式下不允许修改本位币
            >
              {availableCurrencies.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code} - {currency.symbol})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider style={{ margin: '12px 0 24px' }} />

      <Form.Item style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              style={{ marginRight: 8 }}
              icon={isEditMode ? <SettingOutlined /> : <PlusOutlined />}
            >
              <FormattedMessage 
                id={isEditMode ? "book.update" : "book.create.button"} 
                defaultMessage={isEditMode ? "更新账本" : "创建账本"} 
              />
            </Button>
            {onCancel && (
              <Button onClick={onCancel} style={{ marginRight: 8 }}>
                <FormattedMessage id="common.cancel" defaultMessage="取消" />
              </Button>
            )}
          </div>
          {renderExtraFooter}
        </div>
      </Form.Item>
    </Form>
  );
};

export default BookForm; 