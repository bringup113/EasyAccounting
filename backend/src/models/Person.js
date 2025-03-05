const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '请提供人员名称'],
      trim: true,
      maxlength: [50, '人员名称不能超过50个字符'],
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, '请提供账本ID'],
    },
    description: {
      type: String,
      maxlength: [200, '描述不能超过200个字符'],
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

// 查询中间件，过滤已删除的人员
PersonSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Person', PersonSchema); 