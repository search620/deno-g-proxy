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

    // ✅ SAFELY read the request body
    let body: string | undefined = undefined;
    if (req.method !== "GET" && req.body) {
      body = await req.text(); // convert stream to string
    }

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
      });

      const responseBody = await response.text(); // also safer

      return new Response(responseBody, {
        status: response.status,
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

// ✅ Call serve here directly for Deno Deploy
serve(handler);
