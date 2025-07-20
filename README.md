# Deno Gemini Proxy

这是一个基于 Deno 的 Gemini API 代理服务，可以部署到 Deno Deploy 平台。

## 功能特性

- 转发 Gemini API 请求到 Google 官方 API
- 提供健康检查端点
- 支持所有 Gemini API 端点
- 错误处理和日志记录

## 本地开发

### 前置要求

确保已安装 Deno：

```bash
# 在 Linux/macOS 上安装 Deno
curl -fsSL https://deno.land/install.sh | sh

# 在 Windows 上安装 Deno (使用 PowerShell)
irm https://deno.land/install.ps1 | iex
```

### 运行服务

```bash
# 开发模式运行
deno task dev

# 或者直接运行
deno run --allow-net --allow-env main.ts
```

服务将在 http://localhost:8000 启动。

### 测试端点

```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试 API 转发（需要有效的 API Key）
curl -X POST http://localhost:8000/v1beta/models/gemini-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

## 部署到 Deno Deploy

### 方法 1: 使用 deployctl CLI

1. 安装 deployctl：
```bash
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
```

2. 登录 Deno Deploy：
```bash
deployctl login
```

3. 部署项目：
```bash
# 创建新项目并部署
deployctl deploy --project=your-project-name main.ts

# 或者使用配置的任务
deno task deploy
```

### 方法 2: 通过 GitHub 集成

1. 将代码推送到 GitHub 仓库
2. 访问 [Deno Deploy](https://dash.deno.com/)
3. 创建新项目并连接 GitHub 仓库
4. 设置入口文件为 `main.ts`
5. 部署完成

## 使用方法

部署完成后，您将获得一个类似 `https://your-project.deno.dev` 的 URL。

### 在应用中使用

将 Gemini API 的基础 URL 替换为您的代理 URL：

```javascript
// 原始 URL
const originalUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// 使用代理 URL
const proxyUrl = "https://your-project.deno.dev/v1beta/models/gemini-pro:generateContent";
```

### API Key 处理

API Key 通过请求头传递，代理服务会自动转发：

```javascript
fetch(proxyUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_GEMINI_API_KEY'
  },
  body: JSON.stringify(requestData)
});
```

## 监控和维护

### 健康检查

访问 `/health` 端点检查服务状态：

```bash
curl https://your-project.deno.dev/health
```

### 日志查看

在 Deno Deploy 控制台中查看实时日志和性能指标。

## 安全注意事项

1. **API Key 安全**：不要在代码中硬编码 API Key
2. **访问控制**：考虑添加访问控制机制
3. **速率限制**：根据需要实现速率限制
4. **CORS 配置**：根据客户端需求配置 CORS

## 故障排除

### 常见问题

1. **部署失败**：检查 Deno 版本和权限设置
2. **API 转发错误**：验证 API Key 和请求格式
3. **CORS 错误**：检查客户端域名配置

### 调试技巧

1. 查看 Deno Deploy 控制台日志
2. 使用 curl 测试各个端点
3. 检查网络连接和防火墙设置

## 许可证

MIT License
