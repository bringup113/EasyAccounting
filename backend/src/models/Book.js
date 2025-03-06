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
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 查询中间件，过滤已删除的账本
BookSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Book', BookSchema); 