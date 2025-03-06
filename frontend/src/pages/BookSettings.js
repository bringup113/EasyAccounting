import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Card, Tabs, Typography, Divider, message, Modal, Button, Row, Col 
} from 'antd';
import {
  SettingOutlined, DollarOutlined, UserOutlined,
  TagOutlined, AppstoreOutlined, BankOutlined, PlusOutlined
} from '@ant-design/icons';
import CurrencyManager from '../components/CurrencyManager';
import BookForm from '../components/BookForm';

const { Title, Text } = Typography;

const BookSettings = () => {
  const { currentBook } = useSelector((state) => state.books);
  const [activeTab, setActiveTab] = useState('currencies');
  const [isEditBookModalVisible, setIsEditBookModalVisible] = useState(false);
  const [isAddBookModalVisible, setIsAddBookModalVisible] = useState(false);

  // 处理编辑账本成功
  const handleEditBookSuccess = () => {
    setIsEditBookModalVisible(false);
    message.success('账本更新成功');
  };

  // 处理添加账本成功
  const handleAddBookSuccess = () => {
    setIsAddBookModalVisible(false);
    message.success('账本创建成功');
  };

  if (!currentBook) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text style={{ display: 'block', marginBottom: '20px' }}>请先选择或创建一个账本</Text>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsAddBookModalVisible(true)}
          >
            创建新账本
          </Button>
          
          <Modal
            title="创建新账本"
            open={isAddBookModalVisible}
            onCancel={() => setIsAddBookModalVisible(false)}
            footer={null}
            destroyOnClose
          >
            <BookForm 
              onSuccess={handleAddBookSuccess}
              onCancel={() => setIsAddBookModalVisible(false)}
            />
          </Modal>
        </div>
      </Card>
    );
  }

  const tabItems = [
    {
      key: 'book',
      label: (
        <span>
          <SettingOutlined />
          账本设置
        </span>
      ),
      children: (
        <Card title="账本信息" extra={<Button type="primary" onClick={() => setIsEditBookModalVisible(true)}>编辑账本</Button>}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={4}>{currentBook.name}</Title>
              <Text type="secondary">{currentBook.description || '无描述'}</Text>
            </Col>
            <Col span={12}>
              <Text strong>默认货币: </Text>
              <Text>{currentBook.defaultCurrency}</Text>
            </Col>
            <Col span={12}>
              <Text strong>创建时间: </Text>
              <Text>{new Date(currentBook.createdAt).toLocaleString()}</Text>
            </Col>
          </Row>
          
          <Modal
            title="编辑账本"
            open={isEditBookModalVisible}
            onCancel={() => setIsEditBookModalVisible(false)}
            footer={null}
            destroyOnClose
          >
            <BookForm 
              book={currentBook}
              onSuccess={handleEditBookSuccess}
              onCancel={() => setIsEditBookModalVisible(false)}
            />
          </Modal>
        </Card>
      )
    },
    {
      key: 'currencies',
      label: (
        <span>
          <DollarOutlined />
          货币管理
        </span>
      ),
      children: <CurrencyManager bookId={currentBook._id} />
    },
    {
      key: 'categories',
      label: (
        <span>
          <AppstoreOutlined />
          类别管理
        </span>
      ),
      children: <div>类别管理内容</div>
    },
    {
      key: 'tags',
      label: (
        <span>
          <TagOutlined />
          标签管理
        </span>
      ),
      children: <div>标签管理内容</div>
    },
    {
      key: 'persons',
      label: (
        <span>
          <UserOutlined />
          人员管理
        </span>
      ),
      children: <div>人员管理内容</div>
    },
    {
      key: 'accounts',
      label: (
        <span>
          <BankOutlined />
          账户管理
        </span>
      ),
      children: <div>账户管理内容</div>
    }
  ];

  return (
    <Card className="book-settings-container">
      <Title level={3}>账本设置</Title>
      <Divider />
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabPosition="left"
        items={tabItems}
        className="book-settings-tabs"
      />
    </Card>
  );
};

export default BookSettings; 