import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 添加本地通知（前端生成的通知，不需要发送到后端）
export const addLocalNotification = createAsyncThunk(
  'notifications/addLocalNotification',
  async (notification, { dispatch }) => {
    // 生成唯一ID
    const id = `local-${Date.now()}`;
    const newNotification = {
      ...notification,
      _id: id,
      isRead: false,
      createdAt: new Date().toISOString(),
      isLocal: true
    };
    
    // 移除自动清除通知的逻辑，让通知保持直到用户手动标记为已读或删除
    
    return newNotification;
  }
);

// 获取通知 - 现在只返回本地存储的通知
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    // 从本地状态获取通知
    return getState().notifications.notifications;
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
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
          }
        }
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        if (action.payload) {
          state.notifications = action.payload;
          state.unreadCount = 0;
        }
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      })
      .addCase(addLocalNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      });
  }
});

export const { clearError } = notificationSlice.actions;

export default notificationSlice.reducer; 