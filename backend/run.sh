#!/bin/bash

echo "🔧 Setting up backend..."

cd "$(dirname "$0")"

python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

which ffmpeg || sudo apt install ffmpeg -y

echo "🚀 Starting backend server at http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0
