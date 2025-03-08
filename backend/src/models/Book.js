const mongoose = require('mongoose');

// 货币模式
const CurrencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, '请提供货币代码'],
      trim: true,
      maxlength: [10, '货币代码不能超过10个字符'],
    },
    name: {
      type: String,
      required: [true, '请提供货币名称'],
      trim: true,
      maxlength: [50, '货币名称不能超过50个字符'],
    },
    symbol: {
      type: String,
      required: [true, '请提供货币符号'],
      trim: true,
      maxlength: [10, '货币符号不能超过10个字符'],
    },
    rate: {
      type: Number,
      required: [true, '请提供货币汇率'],
      default: 1,
    },
  },
  { _id: false }
);

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '请提供账本名称'],
      trim: true,
      maxlength: [100, '账本名称不能超过100个字符'],
    },
    description: {
      type: String,
      maxlength: [500, '描述不能超过500个字符'],
    },
    timezone: {
      type: String,
      default: 'Asia/Shanghai',
    },
    // 本位币
    defaultCurrency: {
      type: String,
      default: 'CNY',
      required: [true, '请提供本位币'],
    },
    // 账本中的货币列表
    currencies: {
      type: [CurrencySchema],
      default: [
        { code: 'CNY', name: '人民币', symbol: '¥', rate: 1 },
        { code: 'USD', name: '美元', symbol: '$', rate: 7.1 },
        { code: 'THB', name: '泰铢', symbol: '฿', rate: 0.2 },
      ],
    },
    // 账本所有者ID，引用User模型
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '请提供账本所有者'],
    },
    // 账本成员列表
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // 成员权限列表
    memberPermissions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        permission: {
          type: String,
          enum: ['viewer', 'editor', 'admin'],
          default: 'viewer',
        },
        grantedAt: {
          type: Date,
          default: Date.now,
        },
        grantedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    transferHistory: [
      {
        fromUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        toUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          enum: ['User deletion', 'User request', 'Admin action'],
          default: 'User request',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 保存前验证ownerId字段
BookSchema.pre('save', function (next) {
  // 确保ownerId字段存在
  if (!this.ownerId) {
    return next(new Error('账本必须有所有者'));
  }
  
  // 确保所有者在成员列表中
  if (this.members && !this.members.includes(this.ownerId)) {
    this.members.push(this.ownerId);
  }
  
  // 迁移旧的权限值到新的权限值
  if (this.memberPermissions && this.memberPermissions.length > 0) {
    this.memberPermissions.forEach(permission => {
      // 将 'read' 转换为 'viewer'
      if (permission.permission === 'read') {
        permission.permission = 'viewer';
      }
      // 将 'write' 转换为 'editor'
      else if (permission.permission === 'write') {
        permission.permission = 'editor';
      }
    });
  }
  
  next();
});

// 查询中间件，过滤已删除的账本
BookSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Book', BookSchema); 