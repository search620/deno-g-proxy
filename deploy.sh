#!/bin/bash

# Deno Deploy 部署脚本

echo "🚀 开始部署到 Deno Deploy..."

# 检查是否安装了 deployctl
if ! command -v deployctl &> /dev/null; then
    echo "📦 安装 deployctl..."
    deno install -A jsr:@deno/deployctl --global    
    # 添加到 PATH (如果需要)
    export PATH="$HOME/.deno/bin:$PATH"
fi

# 检查是否已登录
echo "🔐 检查登录状态..."
if ! deployctl projects list &> /dev/null; then
    echo "请先登录 Deno Deploy:"
    echo "运行: deployctl login"
    exit 1
fi

# 获取项目名称
read -p "请输入项目名称 (默认: gemini-proxy): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-gemini-proxy}

echo "📤 部署项目: $PROJECT_NAME"

# 部署
deployctl deploy --project="$PROJECT_NAME" main.ts

if [ $? -eq 0 ]; then
    echo "✅ 部署成功!"
    echo "🌐 您的服务地址: https://$PROJECT_NAME.deno.dev"
    echo "🔍 健康检查: https://$PROJECT_NAME.deno.dev/health"
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi
