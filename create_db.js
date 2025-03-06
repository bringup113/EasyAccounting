// 使用MongoDB Node.js驱动程序创建数据库和用户
const { MongoClient } = require('mongodb');

// 连接URL（包含admin数据库）
const adminUrl = 'mongodb://localhost:27017/admin';
const dbUrl = 'mongodb://localhost:27017/finance-tracker';

async function setupDatabase() {
  let adminClient, dbClient;
  
  try {
    // 连接到admin数据库
    adminClient = new MongoClient(adminUrl);
    await adminClient.connect();
    console.log('已连接到admin数据库');
    
    // 创建finance-tracker数据库用户
    const adminDb = adminClient.db('admin');
    await adminDb.command({
      createUser: "finance_user",
      pwd: "finance_password",
      roles: [
        { role: "readWrite", db: "finance-tracker" }
      ]
    });
    console.log('已创建finance-tracker数据库用户');
    
    // 连接到finance-tracker数据库
    dbClient = new MongoClient(dbUrl);
    await dbClient.connect();
    console.log('已连接到finance-tracker数据库');
    
    // 创建一个测试集合，确保数据库被创建
    const db = dbClient.db('finance-tracker');
    await db.createCollection("test");
    console.log('已创建测试集合');
    
    console.log("数据库和用户创建成功！");
  } catch (err) {
    console.error('设置数据库时出错:', err);
  } finally {
    // 关闭连接
    if (adminClient) await adminClient.close();
    if (dbClient) await dbClient.close();
    console.log('数据库连接已关闭');
  }
}

// 执行设置
setupDatabase(); 