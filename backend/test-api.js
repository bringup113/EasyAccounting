const axios = require('axios');

// 测试管理员登录
async function testAdminLogin() {
  try {
    console.log('测试管理员登录...');
    const response = await axios.post('http://localhost:5001/api/admins/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('登录成功:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('登录失败:', error.response ? error.response.data : error.message);
    return null;
  }
}

// 测试获取用户列表
async function testGetUsers(token) {
  try {
    console.log('测试获取用户列表...');
    const response = await axios.get('http://localhost:5001/api/admin-users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('获取用户列表成功:', response.data);
  } catch (error) {
    console.error('获取用户列表失败:', error.response ? error.response.data : error.message);
  }
}

// 运行测试
async function runTests() {
  const token = await testAdminLogin();
  
  if (token) {
    await testGetUsers(token);
  }
}

runTests(); 