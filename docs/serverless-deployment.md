
# Serverless Deployment Guide

This guide helps you deploy a Gemini API proxy instance on various serverless platforms, enabling true multi-IP distribution.

## Overview

The serverless instance functions to:

1. Receive API requests from the VS Code extension
2. Forward requests to the Google Gemini API
3. Return responses to the extension
4. Provide a health check endpoint

## Supported Platforms

### 1. Deno Deploy

Deno Deploy is the recommended platform, easy to deploy and performant.

#### Deployment Steps

1. **Create the project file**

Create `main.ts`:

```typescript
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Health check endpoint
  if (url.pathname === "/health") {
    return new Response("OK", { status: 200 });
  }

  // Forward Gemini API requests
  if (url.pathname.startsWith("/v1beta/")) {
    const targetUrl = `${GEMINI_API_BASE}${url.pathname}${url.search}`;

    const headers = new Headers(req.headers);
    headers.set("User-Agent", "Gemini-Aggregator-Serverless/1.0");

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: req.body,
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Forwarding failed", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Not Found", { status: 404 });
}

// Listen on the port defined by Deno Deploy environment or default to 8000
const port = Number(Deno.env.get("PORT")) || 8000;
serve(handler, { port });
```

2. **Deploy to Deno Deploy**

```bash
# Install Deno CLI if needed
curl -fsSL https://deno.land/install.sh | sh

# Deploy with Deno task or deployctl CLI
deno task deploy

# Or use GitHub integration for automatic deployment
```

3. **Domain Setup**

Deno Deploy provides a default domain such as `https://your-project.deno.dev`

---

### 2. Vercel

Vercel supports multiple runtimes, Node.js is recommended.

#### Deployment Steps

1. **Create project file**

Create `api/proxy.js`:

```javascript
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";

export default async function handler(req, res) {
  // Health check
  if (req.url === "/health") {
    return res.status(200).send("OK");
  }

  // Forward Gemini API requests
  if (req.url.startsWith("/v1beta/")) {
    const targetUrl = `${GEMINI_API_BASE}${req.url}`;

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          ...req.headers,
          "User-Agent": "Gemini-Aggregator-Serverless/1.0",
        },
        body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
      });

      const data = await response.text();

      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      return res.send(data);
    } catch (error) {
      return res.status(500).json({
        error: "Forwarding failed",
        details: error.message,
      });
    }
  }

  return res.status(404).send("Not Found");
}
```

2. **Configure `vercel.json`**

```json
{
  "functions": {
    "api/proxy.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/proxy"
    }
  ]
}
```

3. **Deploy**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy production
vercel --prod
```

---

### 3. Netlify Functions

Netlify Functions run on AWS Lambda.

#### Deployment Steps

1. **Create function file**

Create `netlify/functions/proxy.js`:

```javascript
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";

exports.handler = async (event, context) => {
  // Health check
  if (event.path === "/health") {
    return {
      statusCode: 200,
      body: "OK",
    };
  }

  // Forward Gemini API requests
  if (event.path.startsWith("/v1beta/")) {
    const targetUrl = `${GEMINI_API_BASE}${event.path}`;

    try {
      const response = await fetch(targetUrl, {
        method: event.httpMethod,
        headers: {
          ...event.headers,
          "User-Agent": "Gemini-Aggregator-Serverless/1.0",
        },
        body: event.body,
      });

      const data = await response.text();

      return {
        statusCode: response.status,
        headers: Object.fromEntries(response.headers),
        body: data,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Forwarding failed",
          details: error.message,
        }),
      };
    }
  }

  return {
    statusCode: 404,
    body: "Not Found",
  };
};
```

2. **Configure `netlify.toml`**

```toml
[build]
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/proxy"
  status = 200
```

---

## Configuration Notes

### 1. Health Check Endpoint

All instances must provide a `/health` endpoint returning HTTP 200.

### 2. Request Forwarding

* Preserve original HTTP methods (GET, POST, etc.)
* Forward all relevant request headers
* Properly handle request bodies
* Maintain response format

### 3. Error Handling

* Network error handling
* Timeout handling
* Proper error response formatting

### 4. Performance Optimization

* Set reasonable timeouts
* Enable compression where supported
* Use connection pooling if possible

---

## Security Considerations

### 1. API Key Handling

* Do not store API keys in the serverless instance
* Pass API key via request headers
* Optionally validate request origins

```javascript
// Optional: Validate request origin
const allowedOrigins = ["your-allowed-domain.com"];
const origin = req.headers.origin;

if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
  return res.status(403).json({ error: "Forbidden" });
}
```

### 2. Access Control

Implement access control as needed.

### 3. Rate Limiting

```javascript
// Optional simple rate limiting
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const limit = rateLimitMap.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + windowMs;
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}
```

---

## Monitoring and Debugging

### 1. Logging

```javascript
console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
```

### 2. Performance Monitoring

```javascript
const startTime = Date.now();
// ... handle request
const duration = Date.now() - startTime;
console.log(`Request completed in ${duration}ms`);
```

### 3. Error Tracking

```javascript
try {
  // request handling
} catch (error) {
  console.error("Request failed:", error);
  // send error to monitoring service if applicable
}
```

---

## Troubleshooting

### Common Issues

1. **CORS errors**

   * Ensure correct CORS headers
   * Handle preflight requests

2. **Timeout errors**

   * Increase function timeout
   * Optimize request handling

3. **Memory limits**

   * Avoid caching large data
   * Release resources promptly

4. **Cold start delays**

   * Use warming strategies
   * Choose platforms supporting persistent connections

### Debugging Tips

1. **Local testing**

```bash
# Test health endpoint
curl https://your-instance.com/health

# Test API forwarding
curl -X POST https://your-instance.com/v1beta/models/gemini-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

2. **Log analysis**

   * Review platform logs
   * Analyze error patterns
   * Monitor performance metrics

---

## Best Practices

1. **Multi-region deployment**

   * Deploy instances in different geographic regions
   * Improve global access speed
   * Enhance fault tolerance

2. **Load balancing**

   * Configure multiple instances
   * Use health checks
   * Implement failover mechanisms

3. **Monitoring and alerts**

   * Setup availability monitoring
   * Configure error rate alerts
   * Monitor response times

4. **Version management**

   * Use version control
   * Implement blue-green deployments
   * Maintain rollback capabilities



