const Person = require('../models/Person');
const Book = require('../models/Book');

// @desc    创建新人员
// @route   POST /api/persons
// @access  Private
exports.createPerson = async (req, res) => {
  try {
    const { name, description, bookId } = req.body;

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

    // 创建人员
    const person = await Person.create({
      name,
      description,
      bookId,
    });

    res.status(201).json({
      success: true,
      data: person,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取账本的所有人员
// @route   GET /api/persons
// @access  Private
exports.getPersons = async (req, res) => {
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

    // 获取人员
    const persons = await Person.find({ bookId }).sort('name');

    res.status(200).json({
      success: true,
      count: persons.length,
      data: persons,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取单个人员
// @route   GET /api/persons/:id
// @access  Private
exports.getPerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: '找不到该人员',
      });
    }

    // 检查用户是否有权限访问该人员所属的账本
    const book = await Book.findById(person.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该人员',
      });
    }

    res.status(200).json({
      success: true,
      data: person,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    更新人员
// @route   PUT /api/persons/:id
// @access  Private
exports.updatePerson = async (req, res) => {
  try {
    let person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: '找不到该人员',
      });
    }

    // 检查用户是否有权限访问该人员所属的账本
    const book = await Book.findById(person.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该人员',
      });
    }

    // 更新人员
    person = await Person.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: person,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    删除人员
// @route   DELETE /api/persons/:id
// @access  Private
exports.deletePerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: '找不到该人员',
      });
    }

    // 检查用户是否有权限访问该人员所属的账本
    const book = await Book.findById(person.bookId);
    if (
      book.ownerId.toString() !== req.user.id &&
      !book.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '无权访问该人员',
      });
    }

    // 软删除人员
    person.isDeleted = true;
    await person.save();

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