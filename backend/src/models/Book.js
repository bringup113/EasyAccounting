const mongoose = require('mongoose');

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
    defaultCurrency: {
      type: String,
      default: 'CNY',
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