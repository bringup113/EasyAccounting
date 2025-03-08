import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, Button, Table, Tag, Space, Modal, Form, Input, Select, App, ColorPicker
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined
} from '@ant-design/icons';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/categorySlice';
import { FormattedMessage, useIntl } from 'react-intl';
import './CategoryManagement.css';

const { Option } = Select;

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.categories);
  const { currentBook } = useSelector((state) => state.books);
  const { message } = App.useApp();
  const intl = useIntl();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [modalTitle, setModalTitle] = useState('创建收支项目');
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (currentBook) {
      dispatch(fetchCategories(currentBook._id));
    }
  }, [dispatch, currentBook]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error, message]);

  // 打开创建模态框
  const showAddModal = () => {
    setCurrentCategory(null);
    setModalTitle(intl.formatMessage({ id: 'category.create', defaultMessage: '创建收支项目' }));
    form.resetFields();
    form.setFieldsValue({ type: 'expense' });
    setIsModalVisible(true);
  };

  // 打开编辑模态框
  const showEditModal = (category) => {
    setCurrentCategory(category);
    setModalTitle(intl.formatMessage({ id: 'category.edit', defaultMessage: '编辑收支项目' }));
    form.setFieldsValue({
      name: category.name,
      type: category.type,
      icon: category.icon || '',
    });
    setIsModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      const categoryData = {
        ...values,
        bookId: currentBook._id
      };
      
      if (currentCategory) {
        await dispatch(updateCategory({ id: currentCategory._id, categoryData })).unwrap();
        message.success(intl.formatMessage({ id: 'category.updateSuccess', defaultMessage: '收支项目更新成功' }));
      } else {
        await dispatch(createCategory(categoryData)).unwrap();
        message.success(intl.formatMessage({ id: 'category.createSuccess', defaultMessage: '收支项目创建成功' }));
      }
      
      setIsModalVisible(false);
    } catch (err) {
      message.error(err || intl.formatMessage({ id: 'category.saveFailed', defaultMessage: '保存失败' }));
    }
  };

  // 处理删除
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      message.success(intl.formatMessage({ id: 'category.deleteSuccess', defaultMessage: '收支项目删除成功' }));
    } catch (err) {
      message.error(err || intl.formatMessage({ id: 'category.deleteFailed', defaultMessage: '删除失败' }));
    }
  };

  // 获取类型标签
  const getTypeTag = (type) => {
    switch (type) {
      case 'expense':
        return <Tag color="red">支出</Tag>;
      case 'income':
        return <Tag color="green">收入</Tag>;
      case 'transfer':
        return <Tag color="blue">转账</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  // 过滤数据
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (!currentBook) {
    return (
      <Card variant="borderless" style={{ margin: 0, height: '100%' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>请先选择或创建一个账本</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="category-management" style={{ margin: 0, padding: 0 }}>
      <Card 
        variant="borderless" 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AppstoreOutlined style={{ marginRight: 12, fontSize: 20 }} />
            <FormattedMessage id="category.management" defaultMessage="收支项目管理" />
          </div>
        }
      >
        <p><FormattedMessage id="category.managementDescription" defaultMessage="管理您的收支项目，包括支出、收入和转账类别。" /></p>
        
        <div className="category-list-header">
          <h3 className="category-list-title">
            <FormattedMessage id="category.list" defaultMessage="收支项目列表" />
          </h3>
          <Space>
            <Input 
              placeholder="搜索收支项目" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
            >
              <FormattedMessage id="category.add" defaultMessage="添加收支项目" />
            </Button>
          </Space>
        </div>

        <Table
          loading={loading}
          dataSource={filteredCategories}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: '名称',
              dataIndex: 'name',
              key: 'name',
              render: (text, record) => (
                <Space>
                  <span>{text}</span>
                </Space>
              )
            },
            {
              title: '类型',
              dataIndex: 'type',
              key: 'type',
              render: getTypeTag
            },
            {
              title: '操作',
              key: 'action',
              width: 120,
              render: (_, record) => (
                <Space size="small">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => showEditModal(record)}
                  />
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />} 
                    onClick={() => Modal.confirm({
                      title: '确认删除',
                      content: '删除后将无法恢复，且相关交易将失去类别关联，确定要删除吗？',
                      onOk: () => handleDelete(record._id)
                    })}
                  />
                </Space>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入收支项目名称' }]}
          >
            <Input placeholder="请输入收支项目名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Option value="expense">支出</Option>
              <Option value="income">收入</Option>
              <Option value="transfer">转账</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="icon"
            label="图标名称 (可选)"
          >
            <Input placeholder="请输入图标名称" />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement; 