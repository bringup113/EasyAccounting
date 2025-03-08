# 多功能记账软件开发文档

## 项目概述

本项目旨在开发一个功能完善的Web版记账软件，支持多账本管理、多货币记录、人员设置和收支项设置等功能。软件采用现代化的UI设计，提供直观的用户体验，帮助用户有效管理个人或团队财务。

## 功能需求

### 核心功能

1. **多账本管理**
   - 创建、编辑、删除多个账本
   - 每个账本可设置独立的时区
   - 账本间数据隔离
   - 账本导入/导出功能
   - 每个账本设置本位币和管理多种货币

2. **记账功能**
   - 记录收入、支出、借支
   - 支持多货币记录（货币与账户绑定）
   - 每笔交易支持添加标签和关联人员
   - 软删除机制（除非整个账本删除，否则数据不会真正删除）

3. **用户界面**
   - 首页以日历格式展示收支情况
   - 悬浮"+"按钮，实现快速记账
   - 响应式设计，适配不同设备

4. **数据管理**
   - 人员设置（添加、编辑、删除）
   - 收支项类别设置
   - 标签管理
   - 货币管理（添加、设置汇率、删除）

5. **统计与报表**
   - 当日收支详情统计
   - 各账户余额实时查看
   - 收支趋势图表
   - 自定义时间段的收支报表
   - 支持按本位币统一计算的报表

## 技术架构

### 前端技术栈

- **框架**：React.js
- **UI库**：Ant Design
- **状态管理**：Redux
- **路由**：React Router
- **图表库**：Echarts
- **HTTP客户端**：Axios
- **日期处理**：Day.js（支持时区处理）

### 后端技术栈

- **框架**：Node.js + Express
- **数据库**：MongoDB（适合存储灵活的财务数据）
- **认证**：JWT (JSON Web Token)
- **API文档**：Swagger
- **文件处理**：Multer（用于导入/导出）

### 部署

- **容器化**：Docker
- **CI/CD**：GitHub Actions
- **服务器**：可部署在任何支持Node.js的服务器上

## 数据模型

### 用户(User)

```json
{
  "id": "String",
  "username": "String",
  "password": "String(加密)",
  "email": "String",
  "createdAt": "Date",
  "updatedAt": "Date",
  "isDeleted": "Boolean"
}
```

### 账本(Book)

```json
{
  "id": "String",
  "name": "String",
  "description": "String",
  "timezone": "String",
  "defaultCurrency": "String",
  "ownerId": "String(用户ID)",
  "members": ["String(用户ID)"],
  "createdAt": "Date",
  "updatedAt": "Date",
  "isDeleted": "Boolean",
  "currencies": [
    {
      "code": "CNY",
      "name": "人民币",
      "symbol": "¥",
      "exchangeRate": 1
    },
    {
      "code": "USD",
      "name": "美元",
      "symbol": "$",
      "exchangeRate": 1
    },
    {
      "code": "THB",
      "name": "泰铢",
      "symbol": "฿",
      "exchangeRate": 1
    }
  ]
}
```

### 人员(Person)

```json
{
  "id": "String",
  "name": "String",
  "bookId": "String(账本ID)",
  "description": "String",
  "createdAt": "Date",
  "updatedAt": "Date",
  "isDeleted": "Boolean"
}
```

### 标签(Tag)

```json
{
  "id": "String",
  "name": "String",
  "color": "String",
  "bookId": "String(账本ID)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "isDeleted": "Boolean"
}
```

### 收支类别(Category)

```json
{
  "id": "String",
  "name": "String",
  "type": "String(收入/支出/借支)",
  "bookId": "String(账本ID)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "isDeleted": "Boolean"
}
```

### 交易记录(Transaction)

```json
{
  "id": "String",
  "bookId": "String(账本ID)",
  "amount": "Number",
  "type": "String(收入/支出/借支)",
  "categoryId": "String(类别ID)",
  "date": "Date",
  "description": "String",
  "personIds": ["String(人员ID)"],
  "tagIds": ["String(标签ID)"],
  "accountId": "String(账户ID)",
  "createdBy": "String(用户ID)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "isDeleted": "Boolean"
}
```

### 账户(Account)

```json
{
  "id": "String",
  "name": "String",
  "bookId": "String(账本ID)",
  "currency": "String",
  "initialBalance": "Number",
  "createdAt": "Date",
  "updatedAt": "Date",
  "isDeleted": "Boolean"
}
```

## 页面设计

### 1. 登录/注册页面

- 用户登录表单
- 新用户注册表单
- 忘记密码功能

### 2. 账本管理页面

- 账本列表展示
- 创建新账本（包括选择本位币）
- 账本设置（时区、默认货币等）
- 账本导入/导出功能
- 货币管理（添加、编辑汇率、删除）

### 3. 首页（日历视图）

- 日历格式展示每日收支情况
- 日期快速切换
- 悬浮"+"按钮
- 账本切换下拉菜单
- 当日收支统计摘要
- 显示各账户余额及对应货币

### 4. 记账页面

- 交易类型选择（收入/支出/借支）
- 金额输入
- 账户选择（自动关联对应货币）
- 日期和时间选择（基于账本时区）
- 类别选择
- 标签选择
- 人员机构选择
- 备注信息

### 5. 交易记录列表页面

- 按日期分组展示交易记录
- 筛选功能（按类型、标签、人员、账户等）
- 搜索功能
- 编辑/删除操作
- 显示交易记录对应的货币符号

### 6. 统计报表页面

- 收支趋势图表
- 类别分布饼图
- 各账户余额展示（包含货币信息）
- 自定义时间段选择
- 导出报表功能
- 支持按本位币统一计算的汇总报表

### 7. 设置页面

- 人员管理
- 标签管理
- 收支类别管理
- 账户管理（包括账户货币设置）
- 货币管理（查看、添加、设置汇率）
- 用户偏好设置

## 实现计划

### 第一阶段：基础架构搭建（2周）

1. 项目初始化和环境配置
2. 数据库设计和实现
3. 用户认证系统开发
4. 基础API开发

### 第二阶段：核心功能开发（4周）

1. 账本管理功能
2. 记账功能实现
3. 交易记录管理
4. 标签和人员管理
5. 货币管理功能

### 第三阶段：UI开发和集成（3周）

1. 页面布局和组件开发
2. 日历视图实现
3. 表单和交互设计
4. 前后端集成

### 第四阶段：高级功能开发（3周）

1. 统计报表功能
2. 多货币支持和汇率管理
3. 导入/导出功能
4. 数据可视化

### 第五阶段：测试和优化（2周）

1. 单元测试和集成测试
2. 性能优化
3. 用户体验改进
4. 安全性测试

### 第六阶段：部署和上线（1周）

1. 部署配置
2. 文档完善
3. 上线准备
4. 监控系统配置

## 技术挑战与解决方案

1. **多货币支持**
   - 每个账户绑定一种货币
   - 在账本中管理货币列表和汇率
   - 交易记录使用账户的货币，无需单独选择
   - 统计时支持按本位币进行汇总计算

2. **时区处理**
   - 使用Day.js处理不同时区的日期和时间
   - 在服务器端统一使用UTC时间存储
   - 在客户端根据账本设置的时区进行显示

3. **数据导入导出**
   - 支持CSV和JSON格式
   - 实现数据验证和错误处理
   - 提供导入进度和结果反馈

4. **性能优化**
   - 实现数据分页加载
   - 使用缓存减少数据库查询
   - 优化前端渲染性能

## 安全考虑

1. 所有API请求使用HTTPS
2. 密码加密存储
3. 实现CSRF保护
4. 输入验证和清洁
5. 权限控制和访问限制
6. 敏感数据加密

## 未来扩展

1. 移动应用开发
2. 预算管理功能
3. 定期交易自动记录
4. 多语言支持
5. 第三方服务集成（如银行API）
6. AI辅助分析功能
7. 实时汇率更新功能

## 开发团队

- 前端开发工程师 x 2
- 后端开发工程师 x 2
- UI/UX设计师 x 1
- 测试工程师 x 1
- 项目经理 x 1

## 项目时间线

- 总开发周期：约15周
- 预计上线日期：项目启动后4个月

# 记账软件货币管理功能

## 功能概述

本次更新实现了记账软件的货币管理功能，主要包括以下特性：

1. 系统默认提供三种不可删除的货币：人民币(CNY)、美元(USD)和泰铢(THB)
2. 账本创建时需要选择本位币
3. 账本可以管理多种货币，并设置与本位币的汇率
4. 账户必须绑定一种货币，且一旦有交易记录后不可更改
5. 交易记录不需要单独选择货币，而是使用账户的货币

## 数据模型变更

### 账本模型 (Book)

- 添加了货币列表字段 `currencies`，包含货币代码、名称、符号和汇率
- 默认货币列表包含人民币、美元和泰铢
- 本位币字段 `defaultCurrency` 设为必填

### 交易记录模型 (Transaction)

- 移除了货币字段 `currency`，因为货币信息从账户获取

### 账户模型 (Account)

- 保持不变，但强制要求指定货币

## API 变更

### 账本相关 API

- 添加了货币管理相关的 API：
  - `POST /api/books/:id/currencies` - 添加货币到账本
  - `PUT /api/books/:id/currencies/:code` - 更新账本中的货币汇率
  - `DELETE /api/books/:id/currencies/:code` - 删除账本中的货币

### 交易记录相关 API

- 创建和更新交易记录时不再需要提供货币信息
- 获取交易记录时会包含账户的货币信息

### 账户相关 API

- 创建账户时必须指定货币，且货币必须在账本的货币列表中
- 更新账户时，如果已有交易记录，不允许更改货币
- 获取账户信息时会包含货币的详细信息

## 前端 Redux 变更

### 账本 Redux (bookSlice)

- 添加了系统默认货币列表
- 添加了货币管理相关的 action：添加货币、更新汇率、删除货币

### 交易记录 Redux (transactionSlice)

- 创建和更新交易记录时会自动过滤掉货币字段

### 账户 Redux (accountSlice)

- 添加了验证逻辑，确保创建和更新账户时必须指定货币

## 使用说明

1. 创建账本时，需要选择本位币（默认为人民币）
2. 在账本设置中可以管理货币，包括添加新货币、设置汇率等
3. 创建账户时，需要选择一种货币（必须是账本中已有的货币）
4. 创建交易记录时，只需选择账户，系统会自动使用该账户的货币

## 注意事项

1. 系统默认的三种货币（人民币、美元、泰铢）不可删除
2. 本位币不可删除，也不能修改其汇率（固定为1）
3. 已被账户使用的货币不可删除
4. 已有交易记录的账户不能更改货币

## 部署指南

本项目提供了多种部署方式，详细信息请参考 [DEPLOYMENT.md](DEPLOYMENT.md) 文件。

### 快速部署

1. 克隆代码库
2. 配置环境变量
3. 运行部署脚本

```bash
chmod +x deploy.sh
./deploy.sh
```

### Docker部署

使用Docker Compose一键部署整个应用：

```bash
docker-compose up -d
```

### 访问应用

部署完成后，您可以通过以下URL访问应用程序：

- 前端：http://localhost:8080
- 后端API：http://localhost:5001/api
- API文档：http://localhost:5001/api-docs

### 端口配置说明

本应用使用以下端口：

- MongoDB：27018（外部访问）-> 27017（容器内部）
- 后端服务：5001
- 前端服务：8080（外部访问）-> 80（容器内部）

如果这些端口已被占用，您可以在`docker-compose.yml`文件中修改端口映射。
