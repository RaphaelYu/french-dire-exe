#!/bin/bash

echo "🔧 Setting up backend..."

# 进入 backend 目录
cd "$(dirname "$0")"

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install --upgrade pip
pip install -r requirements.txt

# 安装 whisperx 依赖的系统工具
which ffmpeg || sudo apt install ffmpeg -y

# 启动服务
echo "🚀 Starting backend server at http://localhost:8000"
uvicorn main:app --reload
