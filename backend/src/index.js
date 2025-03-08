const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('./middlewares/auth');
const { initSystemAdmin } = require('./models/Admin');
const { initScheduledTasks } = require('./utils/scheduledTasks');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors({
  origin: '*', // 允许所有源
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 创建上传目录
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 限制2MB
  },
  fileFilter: function (req, file, cb) {
    // 只接受jpg和png
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('只支持JPG和PNG格式的图片!'), false);
    }
  }
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '记账软件 API',
      version: '1.0.0',
      description: '多功能记账软件的API文档',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5001}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 路由
app.use('/api/users', require('./routes/users'));
app.use('/api/books', require('./routes/books'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/persons', require('./routes/persons'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/admin-users', require('./routes/adminUsers'));
app.use('/api/admin-books', require('./routes/adminBooks'));
app.use('/api/admins', require('./routes/admins'));
// 预算功能尚未实现，计划在后续版本中添加
// app.use('/api/budgets', require('./routes/budgets'));

// 文件上传路由
app.post('/api/upload', protect, upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }
    
    // 返回文件URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    return res.status(200).json({
      success: true,
      url: fileUrl,
      message: '文件上传成功'
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    return res.status(500).json({
      success: false,
      message: '文件上传失败: ' + error.message
    });
  }
});

// 将预算路由挂载到账本路由下
const bookRouter = require('./routes/books');
// 预算功能尚未实现，计划在后续版本中添加
// bookRouter.use('/:bookId/budgets', require('./routes/budgets'));

// 根路由
app.get('/', (req, res) => {
  res.send('记账软件API正在运行');
});

// 错误处理中间件
const errorHandler = require('./middlewares/error');
app.use(errorHandler);

// 连接数据库
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finance-tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('MongoDB连接成功');
    
    // 初始化系统管理员
    await initSystemAdmin();
    
    // 初始化定时任务
    initScheduledTasks();
    
    // 启动服务器
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`服务器可通过 http://0.0.0.0:${PORT} 或局域网IP访问`);
    });
  })
  .catch((err) => {
    console.error('MongoDB连接失败:', err.message);
    process.exit(1);
  });

// 处理未捕获的异常
process.on('unhandledRejection', (err) => {
  console.error('未处理的Promise拒绝:', err);
  process.exit(1);
}); 