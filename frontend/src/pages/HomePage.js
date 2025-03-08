import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Typography, Empty, Modal } from 'antd';
import { PlusOutlined, BookOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchBooks } from '../store/bookSlice';
import BookForm from '../components/BookForm';
import './HomePage.css';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intl = useIntl();
  const { user } = useSelector((state) => state.auth);
  const { books } = useSelector((state) => state.books);
  const [isCreateBookModalVisible, setIsCreateBookModalVisible] = useState(false);

  // 加载用户的账本
  useEffect(() => {
    if (user) {
      dispatch(fetchBooks());
    }
  }, [dispatch, user]);

  // 处理创建账本成功
  const handleCreateBookSuccess = () => {
    setIsCreateBookModalVisible(false);
    dispatch(fetchBooks());
  };

  // 选择账本并跳转到概览页面
  const handleSelectBook = (book) => {
    // 设置当前账本
    dispatch({ type: 'books/setCurrentBook', payload: book });
    
    // 获取当前日期，格式为YYYY-MM
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${year}-${month}`;
    
    // 跳转到概览页面，带上日期参数
    navigate(`/dashboard?date=${formattedDate}`);
  };

  return (
    <div className="home-container">
      <div className="welcome-section">
        <Title level={1} className="welcome-title">
          <FormattedMessage id="home.welcome" defaultMessage="欢迎使用记账软件" />
        </Title>
        <Paragraph className="welcome-description">
          <FormattedMessage 
            id="home.description" 
            defaultMessage="这是一个帮助您管理个人或家庭财务的工具，让记账变得简单高效。选择一个账本开始使用，或创建一个新的账本。" 
          />
        </Paragraph>
      </div>

      <div className="books-section">
        <Title level={2} className="section-title">
          <FormattedMessage id="home.yourBooks" defaultMessage="您的账本" />
        </Title>
        
        {books && books.length > 0 ? (
          <Row gutter={[24, 24]} className="books-grid">
            {books.map(book => (
              <Col xs={24} sm={12} md={8} lg={6} key={book._id}>
                <Card
                  hoverable
                  className="book-card"
                  onClick={() => handleSelectBook(book)}
                >
                  <div className="book-card-content">
                    <BookOutlined className="book-icon" />
                    <Title level={4} className="book-name">{book.name}</Title>
                    <Text type="secondary" className="book-currency">
                      {book.defaultCurrency}
                    </Text>
                    {book.description && (
                      <Paragraph ellipsis={{ rows: 2 }} className="book-description">
                        {book.description}
                      </Paragraph>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                className="create-book-card"
                onClick={() => setIsCreateBookModalVisible(true)}
              >
                <div className="create-book-content">
                  <PlusOutlined className="plus-icon" />
                  <Title level={4} className="create-book-text">
                    <FormattedMessage id="home.createBook" defaultMessage="创建新账本" />
                  </Title>
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          <Empty
            description={<FormattedMessage id="home.noBooks" defaultMessage="您还没有创建账本" />}
            className="no-books-empty"
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsCreateBookModalVisible(true)}
              size="large"
            >
              <FormattedMessage id="home.createBookButton" defaultMessage="创建账本" />
            </Button>
          </Empty>
        )}
      </div>

      {/* 创建账本模态框 */}
      <Modal
        title={intl.formatMessage({ id: 'home.createBook', defaultMessage: '创建新账本' })}
        open={isCreateBookModalVisible}
        onCancel={() => setIsCreateBookModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <BookForm 
          onSuccess={handleCreateBookSuccess}
          onCancel={() => setIsCreateBookModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default HomePage; 