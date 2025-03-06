# 记账软件部署方案总结

## 部署文件清单

1. **环境变量配置**
   - `frontend/.env` - 前端开发环境配置
   - `frontend/.env.production` - 前端生产环境配置
   - `backend/.env` - 后端环境配置

2. **部署脚本**
   - `deploy.sh` - 自动构建前端并启动后端的脚本

3. **Docker配置**
   - `Dockerfile.frontend` - 前端Docker镜像构建配置
   - `Dockerfile.backend` - 后端Docker镜像构建配置
   - `nginx.conf` - Nginx服务器配置
   - `docker-compose.yml` - Docker Compose配置

4. **文档**
   - `DEPLOYMENT.md` - 详细部署指南
   - `README.md` - 项目概述和快速部署说明

## 部署方案

### 方案一：手动部署

适用于开发环境或简单的生产环境。

1. 前端部署：
   - 安装依赖：`npm install`
   - 构建：`npm run build`
   - 将构建产物部署到静态文件服务器

2. 后端部署：
   - 安装依赖：`npm install`
   - 启动服务：`npm start`

### 方案二：使用部署脚本

适用于快速部署到单台服务器。

```bash
chmod +x deploy.sh
./deploy.sh
```

### 方案三：Docker部署

适用于容器化环境，提供更好的隔离性和可移植性。

```bash
docker-compose up -d
```

## 环境要求

- Node.js 14.x 或更高版本
- MongoDB 4.x 或更高版本
- npm 6.x 或更高版本
- Docker 19.x 或更高版本（如使用Docker部署）

## 访问应用

部署完成后，可通过以下URL访问应用：

- 前端：http://localhost:8080（Docker部署）
- 后端API：http://localhost:5001/api
- API文档：http://localhost:5001/api-docs

## 端口配置说明

本应用使用以下端口：

- MongoDB：27018（外部访问）-> 27017（容器内部）
- 后端服务：5001
- 前端服务：8080（外部访问）-> 80（容器内部）

如果这些端口已被占用，您可以在`docker-compose.yml`文件中修改端口映射。

## 后续优化建议

1. **CI/CD集成**：
   - 添加GitHub Actions或Jenkins配置，实现自动化测试和部署

2. **监控与日志**：
   - 集成ELK或Prometheus+Grafana进行监控
   - 添加日志收集和分析功能

3. **安全加固**：
   - 实施HTTPS
   - 添加API速率限制
   - 加强密码策略

4. **高可用部署**：
   - 使用Kubernetes进行容器编排
   - 实现数据库集群
   - 添加负载均衡 