const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, '请提供账本ID'],
    },
    amount: {
      type: Number,
      required: [true, '请提供金额'],
    },
    currency: {
      type: String,
      required: [true, '请提供货币类型'],
      default: 'CNY',
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'loan'],
      required: [true, '请提供交易类型'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, '请提供类别ID'],
    },
    date: {
      type: Date,
      required: [true, '请提供交易日期'],
      default: Date.now,
    },
    description: {
      type: String,
      maxlength: [500, '描述不能超过500个字符'],
    },
    personIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
      },
    ],
    tagIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, '请提供账户ID'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '请提供创建者ID'],
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

// 查询中间件，过滤已删除的交易记录
TransactionSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema); 