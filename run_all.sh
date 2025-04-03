#!/bin/bash

echo "🎉 Running full stack: backend + frontend"

# 启动后端（后台运行）
(cd backend && ./run.sh) &

# 启动前端
./run.sh
