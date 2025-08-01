
# Deno Gemini Proxy

This is a Gemini API proxy service based on Deno that can be deployed to the Deno Deploy platform.

## Features

* Forwards Gemini API requests to Google's official API
* Provides a health check endpoint
* Supports all Gemini API endpoints
* Error handling and logging

## Local Development

### Prerequisites

Make sure Deno is installed:

```bash
# Install Deno on Linux/macOS
curl -fsSL https://deno.land/install.sh | sh

# Install Deno on Windows (using PowerShell)
irm https://deno.land/install.ps1 | iex
```

### Running the Service

```bash
# Run in development mode
deno task dev

# Or run directly
deno run --allow-net --allow-env main.ts
```

The service will start at [http://localhost:8000](http://localhost:8000).

### Testing Endpoints

```bash
# Test health check
curl http://localhost:8000/health

# Test API forwarding (requires a valid API Key)
curl -X POST http://localhost:8000/v1beta/models/gemini-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

## Deploy to Deno Deploy

### Method 1: Using deployctl CLI

1. Install deployctl:

```bash
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
```

2. Login to Deno Deploy:

```bash
deployctl login
```

3. Deploy the project:

```bash
# Create a new project and deploy
deployctl deploy --project=your-project-name main.ts

# Or use the configured task
deno task deploy
```

### Method 2: GitHub Integration

1. Push the code to a GitHub repository
2. Go to [Deno Deploy](https://dash.deno.com/)
3. Create a new project and connect your GitHub repository
4. Set the entry file to `main.ts`
5. Deployment is complete

## Usage

After deployment, you will get a URL like `https://your-project.deno.dev`.

### Using in your application

Replace the Gemini API base URL with your proxy URL:

```javascript
// Original URL
const originalUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Using proxy URL
const proxyUrl = "https://your-project.deno.dev/v1beta/models/gemini-pro:generateContent";
```

### API Key Handling

The API Key is passed via the request header, and the proxy will forward it automatically:

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

## Monitoring and Maintenance

### Health Check

Visit the `/health` endpoint to check the service status:

```bash
curl https://your-project.deno.dev/health
```

### Log Viewing

View real-time logs and performance metrics in the Deno Deploy console.

## Safety Precautions

1. **API Key Security:** Do not hardcode API keys in your code
2. **Access Control:** Consider adding access control mechanisms
3. **Rate Limiting:** Implement rate limiting as needed
4. **CORS Configuration:** Configure CORS according to client requirements

## Troubleshooting

### FAQ

1. **Deployment failed:** Check Deno version and permission settings
2. **API forwarding error:** Verify API Key and request format
3. **CORS error:** Check client domain configuration

### Debugging Tips

1. View the Deno Deploy console logs
2. Use curl to test each endpoint
3. Check network connection and firewall settings

## License

MIT License


If you want, I can help you prepare the markdown file or guide you through the next steps!
