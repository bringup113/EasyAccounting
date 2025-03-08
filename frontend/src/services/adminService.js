import api from './api';
import { sendSuccessNotification, sendErrorNotification } from './notificationService';

// 用户管理API
export const fetchUsers = async () => {
  try {
    const response = await api.get('/admin-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchDeletedUsers = async () => {
  try {
    const response = await api.get('/admin-users/deleted');
    return response.data;
  } catch (error) {
    console.error('Error fetching deleted users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin-users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    console.log(`准备更新用户 ${userId}，数据:`, userData);
    
    // 确保数据格式正确
    const formattedData = {
      ...userData,
      email: userData.email ? userData.email.toLowerCase() : undefined
    };
    
    console.log('格式化后的数据:', formattedData);
    
    const response = await api.put(`/admin-users/${userId}`, formattedData);
    console.log('更新用户响应:', response);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('更新用户错误:', error);
    console.error('错误详情:', error.response?.data || error.message);
    
    return {
      success: false,
      data: {
        success: false,
        message: error.response?.data?.message || '更新用户失败'
      }
    };
  }
};

export const deleteUser = async (userId, transferToUserId = null) => {
  try {
    const response = await api.delete(`/admin-users/${userId}`, {
      data: { transferToUserId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const restoreUser = async (userId) => {
  try {
    const response = await api.put(`/admin-users/${userId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring user:', error);
    throw error;
  }
};

export const resetUserPassword = async (userId, newPassword) => {
  try {
    const response = await api.put(`/admin-users/${userId}/resetpassword`, { password: newPassword });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// 账本管理API
export const fetchBooks = async () => {
  try {
    const response = await api.get('/admin-books');
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const fetchArchivedBooks = async () => {
  try {
    const response = await api.get('/admin-books/archived');
    return response.data;
  } catch (error) {
    console.error('Error fetching archived books:', error);
    throw error;
  }
};

export const fetchDeletedBooks = async () => {
  try {
    const response = await api.get('/admin-books/deleted');
    return response.data;
  } catch (error) {
    console.error('Error fetching deleted books:', error);
    throw error;
  }
};

export const archiveBook = async (bookId) => {
  try {
    const response = await api.put(`/admin-books/${bookId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving book:', error);
    throw error;
  }
};

export const restoreBook = async (bookId) => {
  try {
    const response = await api.put(`/admin-books/${bookId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring book:', error);
    throw error;
  }
};

export const undeleteBook = async (bookId) => {
  try {
    const response = await api.put(`/admin-books/${bookId}/undelete`);
    return response.data;
  } catch (error) {
    console.error('Error undeleting book:', error);
    throw error;
  }
};

export const transferBookOwnership = async (bookId, newOwnerId) => {
  try {
    const response = await api.put(`/admin-books/${bookId}/transfer`, { newOwnerId });
    return response.data;
  } catch (error) {
    console.error('Error transferring book ownership:', error);
    throw error;
  }
};

// 辅助函数
export const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// 处理API请求的辅助函数
export const handleApiRequest = async (requestFn, successMessage, errorMessage, dispatch) => {
  try {
    const result = await requestFn();
    if (dispatch && successMessage) {
      sendSuccessNotification(dispatch, { 
        title: '操作成功', 
        message: successMessage 
      });
    }
    return { success: true, data: result };
  } catch (error) {
    if (dispatch && errorMessage) {
      sendErrorNotification(dispatch, { 
        title: '操作失败', 
        message: errorMessage + (error.response?.data?.message ? `: ${error.response.data.message}` : '')
      });
    }
    return { success: false, error };
  }
}; 