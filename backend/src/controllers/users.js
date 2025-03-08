const User = require('../models/User');

// @desc    注册用户
// @route   POST /api/users/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const lowerEmail = email.toLowerCase();

    // 检查用户名是否已存在
    let existingUserByName = await User.findOne({ username });
    if (existingUserByName) {
      return res.status(400).json({ success: false, message: '用户名已被使用，请选择其他用户名' });
    }

    // 检查邮箱是否已存在
    let existingUserByEmail = await User.findOne({ email: lowerEmail });
    if (existingUserByEmail) {
      return res.status(400).json({ success: false, message: '邮箱已被注册' });
    }

    // 创建用户
    const user = await User.create({
      username,
      email: lowerEmail,
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    // 处理MongoDB唯一索引错误
    if (err.code === 11000) {
      // 检查是哪个字段导致了唯一性冲突
      if (err.keyPattern && err.keyPattern.username) {
        return res.status(400).json({ 
          success: false, 
          message: '用户名已被使用，请选择其他用户名' 
        });
      } else if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ 
          success: false, 
          message: '邮箱已被注册' 
        });
      }
    }
    
    // 其他错误
    res.status(500).json({ 
      success: false, 
      message: '注册失败，请稍后再试' 
    });
  }
};

// @desc    用户登录
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase();

    // 验证邮箱和密码
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '请提供邮箱和密码' });
    }

    // 检查用户是否存在
    const user = await User.findOne({ email: lowerEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: '无效的凭据' });
    }

    // 检查密码是否匹配
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '无效的凭据' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    获取当前登录用户
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    更新用户信息
// @route   PUT /api/users/me
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    // 获取用户ID
    const userId = req.user._id;
    
    // 获取要更新的字段
    const { name, email, avatar, language, theme, currency } = req.body;
    
    // 构建更新对象
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email.toLowerCase();
    if (avatar) updateFields.avatar = avatar;
    if (language) updateFields.settings = { ...req.user.settings, language };
    if (theme) updateFields.settings = { ...req.user.settings, theme };
    if (currency) updateFields.settings = { ...req.user.settings, currency };
    
    // 更新用户
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
      error: error.message
    });
  }
};

// @desc    更新密码
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 获取用户
    const user = await User.findById(req.user.id).select('+password');

    // 检查当前密码
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '当前密码不正确' });
    }

    // 设置新密码
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 生成token并发送响应
const sendTokenResponse = (user, statusCode, res) => {
  try {
    // 创建token
    const token = user.getSignedJwtToken();
    
    // 直接返回token，不设置cookie
    return res.status(statusCode).json({
      success: true,
      token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '生成认证令牌失败'
    });
  }
}; 