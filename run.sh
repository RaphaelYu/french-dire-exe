#!/bin/bash

echo "🌐 Setting up frontend..."

cd "$(dirname "$0")"

# 安装依赖
npm install

# 启动开发服务器
npm run dev
