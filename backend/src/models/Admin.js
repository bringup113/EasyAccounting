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

// 初始化系统管理员
const initSystemAdmin = async () => {
  try {
    // 检查是否已存在系统管理员
    const adminExists = await Admin.findOne({ username: 'admin' });
    
    if (!adminExists) {
      console.log('创建系统管理员账户...');
      await Admin.create({
        username: 'admin',
        password: 'admin123',  // 修改为符合最小长度要求的密码
        isSystemAdmin: true
      });
      console.log('系统管理员账户创建成功');
    }
  } catch (error) {
    console.error('初始化系统管理员失败:', error);
  }
};

// 导出模型和初始化函数
module.exports = {
  Admin,
  initSystemAdmin
}; 