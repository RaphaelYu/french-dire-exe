#!/bin/bash

echo "🎉 Running full stack: backend + frontend"

(cd backend && ./run.sh) &

# 启动前端
./run.sh
