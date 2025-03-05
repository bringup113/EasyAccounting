const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '请提供类别名称'],
      trim: true,
      maxlength: [50, '类别名称不能超过50个字符'],
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'loan'],
      required: [true, '请提供类别类型'],
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

// 查询中间件，过滤已删除的类别
CategorySchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Category', CategorySchema); 