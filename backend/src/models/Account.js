const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '请提供账户名称'],
      trim: true,
      maxlength: [50, '账户名称不能超过50个字符'],
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, '请提供账本ID'],
    },
    currency: {
      type: String,
      required: [true, '请提供货币类型'],
      default: 'CNY',
    },
    initialBalance: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 查询中间件，过滤已删除的账户
AccountSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Account', AccountSchema); 