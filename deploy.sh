#!/bin/bash

# 显示执行的命令
set -x

# 停止脚本，如果有任何命令失败
set -e

echo "开始部署记账软件..."

# 部署前端
echo "构建前端..."
cd frontend

# 安装依赖
npm install

# 创建前端生产环境配置
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env.production

# 构建前端
npm run build

# 部署后端
echo "部署后端..."
cd ../backend

# 安装依赖
npm install

# 启动后端服务
echo "启动后端服务..."
npm start 