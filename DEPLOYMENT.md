# 记账软件部署指南

本文档提供了如何部署记账软件的详细说明。

## 系统要求

- Node.js 14.x 或更高版本
- MongoDB 4.x 或更高版本
- npm 6.x 或更高版本

## 部署步骤

### 1. 克隆代码库

```bash
git clone <repository-url>
cd 记账软件
```

### 2. 配置环境变量

#### 后端环境变量

编辑 `backend/.env` 文件：

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

请确保将 `JWT_SECRET` 更改为一个安全的随机字符串。

#### 前端环境变量

编辑 `frontend/.env.production` 文件：

```
REACT_APP_API_URL=http://localhost:5001/api
```

如果您的后端部署在不同的URL，请相应地更新此值。

### 3. 使用部署脚本

我们提供了一个部署脚本，可以自动构建前端并启动后端：

```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. 手动部署

如果您想手动部署，请按照以下步骤操作：

#### 部署前端

```bash
cd frontend
npm install
npm run build
```

构建完成后，您可以将 `build` 目录中的文件部署到任何静态文件服务器。

#### 部署后端

```bash
cd backend
npm install
npm start
```

### 5. 使用Docker部署（可选）

如果您想使用Docker部署，我们也提供了Docker配置：

```bash
docker-compose up -d
```

## 访问应用程序

部署完成后，您可以通过以下URL访问应用程序：

- 前端：http://localhost:8080
- 后端API：http://localhost:5001/api
- API文档：http://localhost:5001/api-docs

## 端口配置说明

本应用使用以下端口：

- MongoDB：27018（外部访问）-> 27017（容器内部）
- 后端服务：5001
- 前端服务：8080（外部访问）-> 80（容器内部）

如果这些端口已被占用，您可以在`docker-compose.yml`文件中修改端口映射。

## 故障排除

如果您在部署过程中遇到问题，请检查以下几点：

1. 确保MongoDB服务正在运行
2. 检查环境变量是否正确配置
3. 检查网络端口是否可用
4. 查看日志文件以获取更多信息

如果问题仍然存在，请提交一个issue到我们的代码库。 