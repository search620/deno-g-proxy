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
