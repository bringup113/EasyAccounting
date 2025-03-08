const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '请输入用户名'],
    unique: true,
    trim: true,
    lowercase: true, // 存储时转为小写，不区分大小写
    match: [/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'],
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [20, '用户名不能超过20个字符']
  },
  password: {
    type: String,
    required: [true, '请输入密码'],
    minlength: [6, '密码至少需要6个字符']
  },
  isSystemAdmin: {
    type: Boolean,
    default: false // 标记是否为系统管理员（admin用户）
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
AdminSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 密码加密中间件
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
AdminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 创建管理员模型
const Admin = mongoose.model('Admin', AdminSchema);

/**
 * 初始化系统管理员账户
 * 如果系统中没有管理员账户，则创建一个默认的管理员账户
 */
const initSystemAdmin = async () => {
  try {
    // 检查是否已存在系统管理员
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      // 使用环境变量中的默认密码，如果不存在则使用安全的默认密码
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';
      
      await Admin.create({
        username: 'admin',
        password: defaultPassword,
        isSystemAdmin: true
      });
      
      // 记录创建成功信息到日志（可以使用专门的日志系统替代）
      console.info('系统管理员账户创建成功');
    }
  } catch (error) {
    // 使用更详细的错误处理
    console.error('初始化系统管理员失败:', error.message);
    // 在生产环境中，这里应该通知管理员或记录到错误监控系统
  }
};

// 导出模型和初始化函数
module.exports = {
  Admin,
  initSystemAdmin
}; 