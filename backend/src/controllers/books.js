const Book = require('../models/Book');

// @desc    创建新账本
// @route   POST /api/books
// @access  Private
exports.createBook = async (req, res) => {
  try {
    const { name, description, timezone, defaultCurrency } = req.body;

    // 创建账本
    const book = await Book.create({
      name,
      description,
      timezone: timezone || 'Asia/Shanghai',
      defaultCurrency: defaultCurrency || 'CNY',
      ownerId: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取当前用户的所有账本
// @route   GET /api/books
// @access  Private
exports.getBooks = async (req, res) => {
  try {
    // 查找用户拥有的或是成员的账本
    const books = await Book.find({
      $or: [
        { ownerId: req.user.id },
        { members: { $in: [req.user.id] } },
      ],
    });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取单个账本
// @route   GET /api/books/:id
// @access  Private
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

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

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    更新账本
// @route   PUT /api/books/:id
// @access  Private
exports.updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否是账本的所有者
    if (book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者可以更新账本信息',
      });
    }

    // 更新账本
    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    删除账本
// @route   DELETE /api/books/:id
// @access  Private
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否是账本的所有者
    if (book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者可以删除账本',
      });
    }

    // 软删除账本
    book.isDeleted = true;
    await book.save();

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

// @desc    添加成员到账本
// @route   POST /api/books/:id/members
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '请提供成员邮箱',
      });
    }

    // 查找要添加的用户
    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: '找不到该用户',
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否是账本的所有者
    if (book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者可以添加成员',
      });
    }

    // 检查用户是否已经是成员
    if (book.members.includes(userToAdd._id)) {
      return res.status(400).json({
        success: false,
        message: '该用户已经是账本成员',
      });
    }

    // 添加成员
    book.members.push(userToAdd._id);
    await book.save();

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    从账本移除成员
// @route   DELETE /api/books/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否是账本的所有者
    if (book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者可以移除成员',
      });
    }

    // 检查要移除的用户是否是账本所有者
    if (book.ownerId.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: '不能移除账本所有者',
      });
    }

    // 检查要移除的用户是否是账本成员
    if (!book.members.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: '该用户不是账本成员',
      });
    }

    // 移除成员
    book.members = book.members.filter(
      (member) => member.toString() !== req.params.userId
    );
    await book.save();

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    添加货币到账本
// @route   POST /api/books/:id/currencies
// @access  Private
exports.addCurrency = async (req, res) => {
  try {
    const { code, name, symbol, rate } = req.body;

    if (!code || !name || !symbol || !rate) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的货币信息',
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否是账本的所有者
    if (book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者可以管理货币',
      });
    }

    // 检查货币代码是否已存在
    const existingCurrency = book.currencies.find(c => c.code === code);
    if (existingCurrency) {
      return res.status(400).json({
        success: false,
        message: '该货币代码已存在',
      });
    }

    // 添加货币
    book.currencies.push({ code, name, symbol, rate });
    await book.save();

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    更新账本中的货币汇率
// @route   PUT /api/books/:id/currencies/:code
// @access  Private
exports.updateCurrencyRate = async (req, res) => {
  try {
    const { rate } = req.body;

    if (!rate) {
      return res.status(400).json({
        success: false,
        message: '请提供汇率',
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否是账本的所有者
    if (book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者可以管理货币',
      });
    }

    // 查找货币
    const currencyIndex = book.currencies.findIndex(c => c.code === req.params.code);
    if (currencyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '找不到该货币',
      });
    }

    // 检查是否是默认货币
    if (book.defaultCurrency === req.params.code) {
      return res.status(400).json({
        success: false,
        message: '不能修改本位币的汇率',
      });
    }

    // 更新汇率
    book.currencies[currencyIndex].rate = rate;
    await book.save();

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    删除账本中的货币
// @route   DELETE /api/books/:id/currencies/:code
// @access  Private
exports.deleteCurrency = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '找不到该账本',
      });
    }

    // 检查用户是否是账本的所有者
    if (book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者可以管理货币',
      });
    }

    // 检查是否是默认货币
    if (book.defaultCurrency === req.params.code) {
      return res.status(400).json({
        success: false,
        message: '不能删除本位币',
      });
    }

    // 检查是否是系统默认货币（CNY, USD, THB）
    if (['CNY', 'USD', 'THB'].includes(req.params.code)) {
      return res.status(400).json({
        success: false,
        message: '不能删除系统默认货币',
      });
    }

    // 检查是否有账户使用该货币
    const Account = require('../models/Account');
    const accountsWithCurrency = await Account.find({
      bookId: req.params.id,
      currency: req.params.code,
    });

    if (accountsWithCurrency.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该货币已被账户使用，无法删除',
      });
    }

    // 删除货币
    book.currencies = book.currencies.filter(c => c.code !== req.params.code);
    await book.save();

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}; 