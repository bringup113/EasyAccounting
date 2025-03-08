import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, Button, Table, Tag as AntTag, Space, Modal, Form, Input, App, ColorPicker
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined
} from '@ant-design/icons';
import { fetchTags, createTag, updateTag, deleteTag } from '../store/tagSlice';
import { FormattedMessage, useIntl } from 'react-intl';
import './TagManagement.css';

const TagManagement = () => {
  const dispatch = useDispatch();
  const { tags, loading, error } = useSelector((state) => state.tags);
  const { currentBook } = useSelector((state) => state.books);
  const { message } = App.useApp();
  const intl = useIntl();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTag, setCurrentTag] = useState(null);
  const [modalTitle, setModalTitle] = useState('创建标签');
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (currentBook) {
      dispatch(fetchTags(currentBook._id));
    }
  }, [dispatch, currentBook]);

  // 处理标签数据中的颜色值
  const processTagColor = (tag) => {
    if (tag && tag.color) {
      // 如果颜色是对象，尝试转换为字符串
      if (typeof tag.color === 'object') {
        try {
          tag.color = tag.color.toHexString?.() || 
                     tag.color.toString?.() || 
                     JSON.stringify(tag.color) === '{}' ? '#1890ff' : '#1890ff';
        } catch (e) {
          tag.color = '#1890ff'; // 默认蓝色
        }
      }
    } else {
      tag.color = '#1890ff'; // 默认蓝色
    }
    return tag;
  };

  // 处理所有标签的颜色
  const processedTags = tags.map(processTagColor);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error, message]);

  // 打开创建模态框
  const showAddModal = () => {
    setCurrentTag(null);
    setModalTitle(intl.formatMessage({ id: 'tag.create', defaultMessage: '创建标签' }));
    form.resetFields();
    form.setFieldsValue({ color: '#1890ff' });
    setIsModalVisible(true);
  };

  // 打开编辑模态框
  const showEditModal = (tag) => {
    const processedTag = processTagColor({...tag});
    setCurrentTag(processedTag);
    setModalTitle(intl.formatMessage({ id: 'tag.edit', defaultMessage: '编辑标签' }));
    form.setFieldsValue({
      name: processedTag.name,
      color: processedTag.color,
    });
    setIsModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      // 将颜色对象转换为十六进制字符串
      const colorValue = values.color && typeof values.color === 'object' ? 
        values.color.toHexString?.() || values.color.toString?.() || '#1890ff' : 
        values.color || '#1890ff';
      
      const tagData = {
        ...values,
        color: colorValue,
        bookId: currentBook._id
      };
      
      if (currentTag) {
        await dispatch(updateTag({ id: currentTag._id, tagData })).unwrap();
        message.success(intl.formatMessage({ id: 'tag.updateSuccess', defaultMessage: '标签更新成功' }));
      } else {
        await dispatch(createTag(tagData)).unwrap();
        message.success(intl.formatMessage({ id: 'tag.createSuccess', defaultMessage: '标签创建成功' }));
      }
      
      setIsModalVisible(false);
    } catch (err) {
      message.error(err || intl.formatMessage({ id: 'tag.saveFailed', defaultMessage: '保存失败' }));
    }
  };

  // 处理删除
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteTag(id)).unwrap();
      message.success(intl.formatMessage({ id: 'tag.deleteSuccess', defaultMessage: '标签删除成功' }));
    } catch (err) {
      message.error(err || intl.formatMessage({ id: 'tag.deleteFailed', defaultMessage: '删除失败' }));
    }
  };

  // 过滤数据
  const filteredTags = processedTags.filter(tag => 
    tag.name.toLowerCase().includes(searchText.toLowerCase())
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
    <div className="tag-management" style={{ margin: 0, padding: 0 }}>
      <Card 
        variant="borderless" 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TagOutlined style={{ marginRight: 12, fontSize: 20 }} />
            <FormattedMessage id="tag.management" defaultMessage="标签管理" />
          </div>
        }
      >
        <p><FormattedMessage id="tag.managementDescription" defaultMessage="管理您的标签，用于对交易进行分类和筛选。" /></p>
        
        <div className="tag-list-header">
          <h3 className="tag-list-title">
            <FormattedMessage id="tag.list" defaultMessage="标签列表" />
          </h3>
          <Space>
            <Input 
              placeholder="搜索标签" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
            >
              <FormattedMessage id="tag.add" defaultMessage="添加标签" />
            </Button>
          </Space>
        </div>

        <Table
          loading={loading}
          dataSource={filteredTags}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: '名称',
              dataIndex: 'name',
              key: 'name',
              render: (text, record) => (
                <AntTag 
                  color={record.color || '#1890ff'} 
                  style={{ 
                    fontSize: '14px', 
                    padding: '4px 8px',
                    margin: '4px 0'
                  }}
                >
                  {text}
                </AntTag>
              )
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
                      content: '删除后将无法恢复，且相关交易将失去标签关联，确定要删除吗？',
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
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          
          <Form.Item
            name="color"
            label="颜色"
          >
            <ColorPicker />
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

export default TagManagement; 