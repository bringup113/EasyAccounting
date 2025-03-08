import axios from 'axios';
import { API_BASE_URL } from '../config';

// 获取所有账本
export const fetchBooks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取单个账本详情
export const fetchBookById = async (bookId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books/${bookId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 创建新账本
export const createBook = async (bookData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/books`, bookData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 更新账本信息
export const updateBook = async (bookId, bookData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/books/${bookId}`, bookData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 删除账本
export const deleteBook = async (bookId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/books/${bookId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 转让账本所有权
export const transferBook = async (bookId, newOwnerId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/books/${bookId}/transfer`, { newOwnerId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 邀请用户加入账本
export const inviteUserToBook = async (bookId, email, permission) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/books/${bookId}/invite`, { email, permission });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 从账本中移除用户
export const removeUserFromBook = async (bookId, userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/books/${bookId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 更新用户在账本中的权限
export const updateUserPermission = async (bookId, userId, permission) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/books/${bookId}/members/${userId}`, { permission });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取账本成员列表
export const fetchBookMembers = async (bookId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/books/${bookId}/members`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 接受账本邀请
export const acceptBookInvitation = async (invitationId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/invitations/${invitationId}/accept`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 拒绝账本邀请
export const rejectBookInvitation = async (invitationId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/invitations/${invitationId}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取当前用户的账本邀请列表
export const fetchUserInvitations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/invitations`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 