import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 从本地存储加载通知
const loadNotificationsFromStorage = () => {
  try {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      return JSON.parse(storedNotifications);
    }
  } catch (error) {
    console.error('加载通知失败:', error);
  }
  return [];
};

// 保存通知到本地存储
const saveNotificationsToStorage = (notifications) => {
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('保存通知失败:', error);
  }
};

// 添加本地通知（前端生成的通知，不需要发送到后端）
export const addLocalNotification = createAsyncThunk(
  'notifications/addLocalNotification',
  async (notification, { dispatch, getState }) => {
    // 生成唯一ID
    const id = `local-${Date.now()}`;
    const newNotification = {
      ...notification,
      _id: id,
      isRead: false,
      createdAt: new Date().toISOString(),
      isLocal: true
    };
    
    return newNotification;
  }
);

// 获取通知 - 现在只返回本地存储的通知
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState, dispatch }) => {
    // 从本地状态获取通知
    const notifications = getState().notifications.notifications;
    
    // 自动删除7天前的已读通知
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const outdatedNotifications = notifications.filter(notification => 
      notification.isRead && new Date(notification.createdAt) < sevenDaysAgo
    );
    
    if (outdatedNotifications.length > 0) {
      // 删除过期的已读通知
      outdatedNotifications.forEach(notification => {
        dispatch(deleteNotification(notification._id));
      });
    }
    
    return notifications;
  }
);

// 标记通知为已读 - 本地处理
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { getState }) => {
    const state = getState();
    const notification = state.notifications.notifications.find(n => n._id === id);
    if (notification) {
      return { ...notification, isRead: true };
    }
    return null;
  }
);

// 标记所有通知为已读 - 本地处理
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState }) => {
    return getState().notifications.notifications.map(n => ({ ...n, isRead: true }));
  }
);

// 删除通知 - 本地处理
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id) => {
    return id;
  }
);

// 删除所有通知 - 本地处理
export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAllNotifications',
  async () => {
    return;
  }
);

const initialState = {
  notifications: loadNotificationsFromStorage(),
  unreadCount: loadNotificationsFromStorage().filter(n => !n.isRead).length,
  loading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // 清理过期通知（已读且超过7天的通知）
    cleanupNotifications: (state) => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // 找出已读且超过7天的通知
      const outdatedNotifications = state.notifications.filter(
        notification => notification.isRead && new Date(notification.createdAt) < sevenDaysAgo
      );
      
      // 从状态中移除这些通知
      state.notifications = state.notifications.filter(
        notification => !(notification.isRead && new Date(notification.createdAt) < sevenDaysAgo)
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // 不再覆盖通知，因为我们只是从本地获取
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        // 保存通知到本地存储
        saveNotificationsToStorage(state.notifications);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.notifications.findIndex(n => n._id === action.payload._id);
          if (index !== -1) {
            state.notifications[index] = action.payload;
            state.unreadCount = state.notifications.filter(n => !n.isRead).length;
            // 保存通知到本地存储
            saveNotificationsToStorage(state.notifications);
          }
        }
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        if (action.payload) {
          state.notifications = action.payload;
          state.unreadCount = 0;
          // 保存通知到本地存储
          saveNotificationsToStorage(state.notifications);
        }
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        // 保存通知到本地存储
        saveNotificationsToStorage(state.notifications);
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
        // 保存通知到本地存储
        saveNotificationsToStorage(state.notifications);
      })
      .addCase(addLocalNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
        // 保存通知到本地存储
        saveNotificationsToStorage(state.notifications);
      });
  }
});

export const { clearError } = notificationSlice.actions;

export default notificationSlice.reducer; 