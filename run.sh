#!/bin/bash

echo "🌐 Setting up frontend..."

cd "$(dirname "$0")"

npm install

npm run dev
