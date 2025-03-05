const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '请提供标签名称'],
      trim: true,
      maxlength: [50, '标签名称不能超过50个字符'],
    },
    color: {
      type: String,
      default: '#1890ff',
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, '请提供账本ID'],
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

// 查询中间件，过滤已删除的标签
TagSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Tag', TagSchema); 