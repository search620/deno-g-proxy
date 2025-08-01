#!/bin/bash

# Deno Deploy deployment script

echo "🚀 Starting deployment to Deno Deploy..."

# Check if deployctl is installed
if ! command -v deployctl &> /dev/null; then
    echo "📦 Installing deployctl..."
    deno install -A jsr:@deno/deployctl --global    
    # Add to PATH (if needed)
    export PATH="$HOME/.deno/bin:$PATH"
fi

# Check if logged in
echo "🔐 Checking login status..."
if ! deployctl projects list &> /dev/null; then
    echo "Please log in to Deno Deploy first:"
    echo "Run: deployctl login"
    exit 1
fi

# Get project name
read -p "Enter the project name (default: gemini-proxy): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-gemini-proxy}

echo "📤 Deploying project: $PROJECT_NAME"

# Deploy
deployctl deploy --project="$PROJECT_NAME" main.ts

if [ $? -eq 0 ]; then
    echo "✅ Deployment succeeded!"
    echo "🌐 Your service URL: https://$PROJECT_NAME.deno.dev"
    echo "🔍 Health check: https://$PROJECT_NAME.deno.dev/health"
else
    echo "❌ Deployment failed, please check error messages"
    exit 1
fi
