const Tag = require('../models/Tag');
const Book = require('../models/Book');

// @desc    创建新标签
// @route   POST /api/tags
// @access  Private
exports.createTag = async (req, res) => {
  try {
    const { name, color, bookId } = req.body;

    // 检查账本是否存在
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否有权限访问该账本
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该账本',
      });
    }

    // 创建标签
    const tag = await Tag.create({
      name,
      color: color || '#1890ff',
      bookId,
    });

    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取账本的所有标签
// @route   GET /api/tags
// @access  Private
exports.getTags = async (req, res) => {
  try {
    const { bookId } = req.query;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: '请提供账本ID',
      });
    }

    // 检查账本是否存在
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否有权限访问该账本
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该账本',
      });
    }

    // 获取标签
    const tags = await Tag.find({ bookId }).sort('name');

    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取单个标签
// @route   GET /api/tags/:id
// @access  Private
exports.getTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '找不到该标签',
      });
    }

    // 检查用户是否有权限访问该标签所属的账本
    const book = await Book.findById(tag.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该标签',
      });
    }

    res.status(200).json({
      success: true,
      data: tag,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    更新标签
// @route   PUT /api/tags/:id
// @access  Private
exports.updateTag = async (req, res) => {
  try {
    let tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '找不到该标签',
      });
    }

    // 检查用户是否有权限访问该标签所属的账本
    const book = await Book.findById(tag.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该标签',
      });
    }

    // 更新标签
    tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: tag,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    删除标签
// @route   DELETE /api/tags/:id
// @access  Private
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '找不到该标签',
      });
    }

    // 检查用户是否有权限访问该标签所属的账本
    const book = await Book.findById(tag.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该标签',
      });
    }

    // 软删除标签
    tag.isDeleted = true;
    await tag.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}; 