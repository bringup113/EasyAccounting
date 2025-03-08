import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, Button, Table, Space, Modal, Form, Input, App, Select
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined
} from '@ant-design/icons';
import { fetchPersons, createPerson, updatePerson, deletePerson } from '../store/personSlice';
import { FormattedMessage, useIntl } from 'react-intl';
import './PersonManagement.css';

const { Option } = Select;

const PersonManagement = () => {
  const dispatch = useDispatch();
  const { persons, loading, error } = useSelector((state) => state.persons);
  const { currentBook } = useSelector((state) => state.books);
  const { message } = App.useApp();
  const intl = useIntl();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPerson, setCurrentPerson] = useState(null);
  const [modalTitle, setModalTitle] = useState('创建人员/机构');
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (currentBook) {
      dispatch(fetchPersons(currentBook._id));
    }
  }, [dispatch, currentBook]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error, message]);

  // 打开创建模态框
  const showAddModal = () => {
    setCurrentPerson(null);
    setModalTitle(intl.formatMessage({ id: 'person.create', defaultMessage: '创建人员/机构' }));
    form.resetFields();
    form.setFieldsValue({ type: 'person' });
    setIsModalVisible(true);
  };

  // 打开编辑模态框
  const showEditModal = (person) => {
    setCurrentPerson(person);
    setModalTitle(intl.formatMessage({ id: 'person.edit', defaultMessage: '编辑人员/机构' }));
    form.setFieldsValue({
      name: person.name,
      type: person.type || 'person',
      contact: person.contact || '',
      notes: person.notes || '',
    });
    setIsModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      const personData = {
        ...values,
        bookId: currentBook._id
      };
      
      if (currentPerson) {
        await dispatch(updatePerson({ id: currentPerson._id, personData })).unwrap();
        message.success(intl.formatMessage({ id: 'person.updateSuccess', defaultMessage: '人员/机构更新成功' }));
      } else {
        await dispatch(createPerson(personData)).unwrap();
        message.success(intl.formatMessage({ id: 'person.createSuccess', defaultMessage: '人员/机构创建成功' }));
      }
      
      setIsModalVisible(false);
    } catch (err) {
      message.error(err || intl.formatMessage({ id: 'person.saveFailed', defaultMessage: '保存失败' }));
    }
  };

  // 处理删除
  const handleDelete = async (id) => {
    try {
      await dispatch(deletePerson(id)).unwrap();
      message.success(intl.formatMessage({ id: 'person.deleteSuccess', defaultMessage: '人员/机构删除成功' }));
    } catch (err) {
      message.error(err || intl.formatMessage({ id: 'person.deleteFailed', defaultMessage: '删除失败' }));
    }
  };

  // 获取类型文本
  const getTypeText = (type) => {
    switch (type) {
      case 'person':
        return '个人';
      case 'organization':
        return '机构';
      default:
        return '个人';
    }
  };

  // 过滤数据
  const filteredPersons = persons.filter(person => 
    person.name.toLowerCase().includes(searchText.toLowerCase())
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
    <div className="person-management" style={{ margin: 0, padding: 0 }}>
      <Card 
        variant="borderless" 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: 12, fontSize: 20 }} />
            <FormattedMessage id="person.management" defaultMessage="人员机构管理" />
          </div>
        }
      >
        <p><FormattedMessage id="person.managementDescription" defaultMessage="管理与交易相关的人员和机构，如客户、供应商、员工等。" /></p>
        
        <div className="person-list-header">
          <h3 className="person-list-title">
            <FormattedMessage id="person.list" defaultMessage="人员机构列表" />
          </h3>
          <Space>
            <Input 
              placeholder="搜索人员/机构" 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
            >
              <FormattedMessage id="person.add" defaultMessage="添加人员/机构" />
            </Button>
          </Space>
        </div>

        <Table
          loading={loading}
          dataSource={filteredPersons}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: '名称',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: '类型',
              dataIndex: 'type',
              key: 'type',
              render: getTypeText
            },
            {
              title: '联系方式',
              dataIndex: 'contact',
              key: 'contact',
            },
            {
              title: '备注',
              dataIndex: 'notes',
              key: 'notes',
              ellipsis: true,
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
                      content: '删除后将无法恢复，且相关交易将失去人员/机构关联，确定要删除吗？',
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
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Option value="person">个人</Option>
              <Option value="organization">机构</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="contact"
            label="联系方式"
          >
            <Input placeholder="请输入联系方式" />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
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

export default PersonManagement; 