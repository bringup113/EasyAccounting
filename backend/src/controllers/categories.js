const Category = require('../models/Category');
const Book = require('../models/Book');

// @desc    创建新类别
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res) => {
  try {
    const { name, type, bookId } = req.body;

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

    // 创建类别
    const category = await Category.create({
      name,
      type,
      bookId,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取账本的所有类别
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const { bookId, type } = req.query;

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

    // 构建查询条件
    const query = { bookId };
    if (type) {
      query.type = type;
    }

    // 获取类别
    const categories = await Category.find(query).sort('name');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取单个类别
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '找不到该类别',
      });
    }

    // 检查用户是否有权限访问该类别所属的账本
    const book = await Book.findById(category.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该类别',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    更新类别
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '找不到该类别',
      });
    }

    // 检查用户是否有权限访问该类别所属的账本
    const book = await Book.findById(category.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该类别',
      });
    }

    // 更新类别
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    删除类别
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '找不到该类别',
      });
    }

    // 检查用户是否有权限访问该类别所属的账本
    const book = await Book.findById(category.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该类别',
      });
    }

    // 软删除类别
    category.isDeleted = true;
    await category.save();

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