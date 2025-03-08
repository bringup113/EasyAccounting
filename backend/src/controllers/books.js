const Book = require('../models/Book');

// @desc    创建新账本
// @route   POST /api/books
// @access  Private
exports.createBook = async (req, res) => {
  try {
    const { name, description, timezone, defaultCurrency } = req.body;

    // 验证用户ID
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: '未授权，无法创建账本',
      });
    }

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

    // 检查用户是否是账本的所有者或管理者
    // 首先检查用户是否是所有者
    const isOwner = book.ownerId.toString() === req.user.id;
    
    // 如果不是所有者，检查用户是否是管理者
    if (!isOwner) {
      // 查找用户的权限记录
      const userPermission = book.memberPermissions?.find(
        p => p.userId.toString() === req.user.id
      );
      
      // 如果用户不是管理者，拒绝请求
      if (!userPermission || userPermission.permission !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '只有账本所有者或管理者可以更新账本信息',
        });
      }
    }

    // 防止修改所有者
    if (req.body.ownerId && req.body.ownerId !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不允许修改账本所有者，请使用转移所有权功能',
      });
    }

    // 确保ownerId不变
    const updateData = { ...req.body };
    updateData.ownerId = req.user.id;

    // 更新账本
    book = await Book.findByIdAndUpdate(req.params.id, updateData, {
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

// @desc    转让账本所有权
// @route   POST /api/books/:id/transfer
// @access  Private
exports.transferBookOwnership = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    // 验证参数
    if (!newOwnerId) {
      return res.status(400).json({
        success: false,
        message: '请提供新所有者ID',
      });
    }

    // 查找账本
    const book = await Book.findById(id);

    // 检查账本是否存在
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '账本不存在',
      });
    }

    // 检查当前用户是否是账本所有者
    if (book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者可以转让所有权',
      });
    }

    // 记录转让历史
    book.transferHistory = book.transferHistory || [];
    book.transferHistory.push({
      fromUserId: req.user.id,
      toUserId: newOwnerId,
      transferDate: new Date(),
    });

    // 更新所有者
    book.ownerId = newOwnerId;

    // 确保新所有者在成员列表中
    if (!book.members.includes(newOwnerId)) {
      book.members.push(newOwnerId);
    }

    // 保存更改
    await book.save();

    res.status(200).json({
      success: true,
      data: book,
      message: '账本所有权已成功转让',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    邀请用户加入账本
// @route   POST /api/books/:id/invite
// @access  Private
exports.inviteUserToBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permission } = req.body;

    // 验证参数
    if (!email) {
      return res.status(400).json({
        success: false,
        message: '请提供用户邮箱',
      });
    }

    // 查找账本
    const book = await Book.findById(id);

    // 检查账本是否存在
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '账本不存在',
      });
    }

    // 检查当前用户是否是账本所有者或成员
    if (book.ownerId.toString() !== req.user.id && !book.members.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者或成员可以邀请其他用户',
      });
    }

    // 查找被邀请的用户
    const User = require('../models/User');
    const invitedUser = await User.findOne({ email });

    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: '未找到该邮箱对应的用户',
      });
    }

    // 检查用户是否已经是成员
    if (book.members.includes(invitedUser._id.toString())) {
      return res.status(400).json({
        success: false,
        message: '该用户已经是账本成员',
      });
    }

    // 添加用户到成员列表
    book.members.push(invitedUser._id);

    // 设置用户权限
    // 确保 memberPermissions 存在
    if (!book.memberPermissions) {
      book.memberPermissions = [];
    }

    // 检查用户是否已经有权限记录
    const permissionIndex = book.memberPermissions.findIndex(
      p => p.userId.toString() === invitedUser._id.toString()
    );

    // 使用前端传递的权限值，默认为 'viewer'
    const userPermission = permission || 'viewer';

    if (permissionIndex !== -1) {
      // 更新现有权限
      book.memberPermissions[permissionIndex].permission = userPermission;
    } else {
      // 添加新权限记录
      book.memberPermissions.push({
        userId: invitedUser._id,
        permission: userPermission,
        grantedAt: new Date(),
        grantedBy: req.user.id
      });
    }

    // 记录邀请历史
    book.inviteHistory = book.inviteHistory || [];
    book.inviteHistory.push({
      invitedBy: req.user.id,
      invitedUser: invitedUser._id,
      inviteDate: new Date(),
      permission: userPermission,
    });

    // 保存更改
    await book.save();

    res.status(200).json({
      success: true,
      data: book,
      message: '用户已成功邀请加入账本',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    获取账本成员
// @route   GET /api/books/:id/members
// @access  Private
exports.getBookMembers = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找账本
    const book = await Book.findById(id);

    // 检查账本是否存在
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '账本不存在',
      });
    }

    // 检查当前用户是否是账本所有者或成员
    if (book.ownerId.toString() !== req.user.id && !book.members.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: '您没有权限查看此账本的成员',
      });
    }

    // 查找所有成员的用户信息
    const User = require('../models/User');
    const members = await User.find({ _id: { $in: book.members } })
      .select('_id name email username avatar');

    // 为每个成员添加权限信息
    const membersWithPermissions = members.map(member => {
      const memberObj = member.toObject();
      
      // 查找成员的权限记录
      const permissionRecord = book.memberPermissions?.find(
        p => p.userId.toString() === member._id.toString()
      );
      
      // 设置权限，默认为 'viewer'
      memberObj.permission = permissionRecord?.permission || 'viewer';
      
      // 标记所有者
      if (book.ownerId.toString() === member._id.toString()) {
        memberObj.isOwner = true;
        memberObj.permission = 'owner';
      }
      
      return memberObj;
    });

    res.status(200).json({
      success: true,
      data: membersWithPermissions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    更新成员权限
// @route   PUT /api/books/:id/members/:userId
// @access  Private
exports.updateMemberPermission = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { permission } = req.body;

    // 验证参数
    if (!permission) {
      return res.status(400).json({
        success: false,
        message: '请提供权限值',
      });
    }

    // 查找账本
    const book = await Book.findById(id);

    // 检查账本是否存在
    if (!book) {
      return res.status(404).json({
        success: false,
        message: '账本不存在',
      });
    }

    // 检查当前用户是否是账本所有者
    if (book.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只有账本所有者可以修改成员权限',
      });
    }

    // 检查要修改的用户是否是账本成员
    const memberIndex = book.members.findIndex(m => m.toString() === userId);
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '该用户不是账本成员',
      });
    }

    // 更新成员权限
    // 如果没有 memberPermissions 字段，创建一个
    if (!book.memberPermissions) {
      book.memberPermissions = [];
    }

    // 查找该成员的权限记录
    const permissionIndex = book.memberPermissions.findIndex(
      p => p.userId.toString() === userId
    );

    if (permissionIndex !== -1) {
      // 更新现有权限
      book.memberPermissions[permissionIndex].permission = permission;
    } else {
      // 添加新权限记录
      book.memberPermissions.push({
        userId,
        permission,
      });
    }

    // 保存更改
    await book.save();

    res.status(200).json({
      success: true,
      data: book,
      message: '成员权限已成功更新',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}; 