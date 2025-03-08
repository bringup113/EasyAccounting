import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, List, Spin, message } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

const TestApi = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/api/admin-users');
      
      setUsers(response.data.data);
      message.success('获取用户数据成功');
    } catch (error) {
      console.error('获取用户数据错误:', error);
      setError(error.message || '获取用户数据失败');
      message.error('获取用户数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>API 测试页面</Title>
        <Text>测试获取用户列表 API</Text>
        
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Button type="primary" onClick={fetchUsers} loading={loading}>
            获取用户列表
          </Button>
        </div>
        
        {error && (
          <div style={{ marginBottom: '20px', color: 'red' }}>
            <Text strong>错误: {error}</Text>
          </div>
        )}
        
        {loading ? (
          <Spin tip="加载中..." />
        ) : (
          <List
            bordered
            dataSource={users}
            renderItem={user => (
              <List.Item>
                <List.Item.Meta
                  title={user.username}
                  description={user.email}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default TestApi; 