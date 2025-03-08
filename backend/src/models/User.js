const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 用户模式定义
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, '请提供用户名'],
      unique: true, // 恢复唯一性约束
      trim: true,
      maxlength: [50, '用户名不能超过50个字符'],
    },
    email: {
      type: String,
      required: [true, '请提供邮箱'],
      unique: true, // 保持邮箱唯一性
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        '请提供有效的邮箱',
      ],
      lowercase: true, // 自动转换为小写
    },
    password: {
      type: String,
      required: [true, '请提供密码'],
      minlength: [6, '密码至少6个字符'],
      select: false,
    },
    avatar: {
      type: String,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 加密密码
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 签署JWT
UserSchema.methods.getSignedJwtToken = function () {
  try {
    // 使用固定的过期时间，避免使用环境变量
    return jwt.sign(
      { id: this._id },
      process.env.JWT_SECRET || 'secret_fallback_key',
      { expiresIn: '30d' }
    );
  } catch (error) {
    console.error('JWT签名错误:', error);
    throw new Error('JWT签名失败');
  }
};

// 匹配用户输入的密码
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 删除现有的模型（如果存在）
try {
  mongoose.deleteModel('User');
} catch (e) {
  // 模型可能不存在，忽略错误
}

// 创建新的模型
module.exports = mongoose.model('User', UserSchema); 